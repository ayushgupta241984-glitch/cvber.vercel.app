import io
import os
import json
import asyncio
from uuid import uuid4
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Request
from fastapi.responses import Response, StreamingResponse
from PIL import Image
from app.dependencies import get_current_user
from app.config import settings
from app.supabase_client import get_supabase
from app.rate_limiter import limiter
from app.services.image_search import search_image, get_temp_image, dhash, compute_hashes, store_temp_image, verify_image_structure
from app.services.hash_db import register_hash, find_similar_multi, get_hashes_for_scan
from app.services.deep_search import deep_search_stream
import logging
import httpx

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/search", tags=["image_search"])


@router.post("/reverse")
@limiter.limit("10/minute")
async def reverse_image_search(
    request: Request,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")
    try:
        user_id = current_user.get("sub") or current_user.get("id") if current_user else None
        result = await search_image(image_bytes, user_id=user_id)
        return result
    except Exception as e:
        logger.error(f"Image search failed: {e}")
        raise HTTPException(status_code=500, detail="Image search failed")


@router.get("/temp/{scan_id}")
async def serve_temp_image(scan_id: str, current_user: dict = Depends(get_current_user)):
    image_bytes = get_temp_image(scan_id)
    if image_bytes is None:
        raise HTTPException(status_code=404, detail="Image not found or expired")
    return Response(content=image_bytes, media_type="image/jpeg")


@router.post("/hashes/register")
@limiter.limit("10/minute")
async def register_image_hash(
    request: Request,
    file: UploadFile = File(...),
    scan_id: str = "",
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user.get("sub") or current_user.get("id") if current_user else None
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")
    if not scan_id:
        raise HTTPException(status_code=400, detail="scan_id is required")

    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file")

    try:
        hashes = compute_hashes(image_bytes)
        register_hash(scan_id, hashes, file.filename or scan_id, user_id)
        return {"status": "registered", "scan_id": scan_id, "hashes": hashes}
    except Exception as e:
        logger.error(f"Hash registration failed: {e}")
        raise HTTPException(status_code=500, detail="Hash registration failed")


@router.post("/hashes/index-vault")
@limiter.limit("2/minute")
async def index_vault_for_copies(
    request: Request,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user.get("sub") or current_user.get("id") if current_user else None
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")

    try:
        supabase = get_supabase()
        resp = supabase.table("vault_files") \
            .select("scan_id, file_name, storage_path, content_type") \
            .eq("user_id", user_id) \
            .limit(100) \
            .execute()

        files = resp.data if resp and resp.data else []
        registered = 0
        errors = 0

        for vf in files:
            scan_id = vf.get("scan_id")
            file_name = vf.get("file_name", "unknown")
            storage_path = vf.get("storage_path", "")
            if not scan_id or not storage_path:
                continue

            existing = get_hashes_for_scan(str(scan_id), user_id)
            if existing:
                continue

            try:
                signed = supabase.storage.from_("safe-vault").create_signed_url(storage_path, 60)
                download_url = signed.get("signedURL") or signed.get("url")
                if not download_url:
                    continue

                async with httpx.AsyncClient(timeout=30) as client:
                    dl_resp = await client.get(download_url)
                    if dl_resp.status_code != 200:
                        continue
                    image_bytes = dl_resp.content

                hashes = compute_hashes(image_bytes)
                register_hash(str(scan_id), hashes, file_name, user_id)
                registered += 1
            except Exception as e:
                logger.warning(f"Failed to index {file_name}: {e}")
                errors += 1

        return {
            "status": "completed",
            "registered": registered,
            "errors": errors,
            "total_processed": len(files),
        }
    except Exception as e:
        logger.error(f"Vault indexing failed: {e}")
        raise HTTPException(status_code=500, detail="Vault indexing failed")


@router.post("/deep")
@limiter.limit("6/minute")
async def deep_image_search(
    request: Request,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    api_key = settings.nvidia_nim_api_key or os.getenv("NVIDIA_NIM_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="NVIDIA NIM API key not configured")

    try:
        from app.services.deep_search import deep_search
        result = await deep_search(image_bytes, api_key)
        return result
    except Exception as e:
        logger.error(f"Deep search failed: {e}")
        raise HTTPException(status_code=500, detail="Deep search failed")


@router.post("/deep/tv")
@limiter.limit("6/minute")
async def deep_image_search_tv(
    request: Request,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    api_key = settings.nvidia_nim_api_key or os.getenv("NVIDIA_NIM_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="NVIDIA NIM API key not configured")

    async def event_stream():
        try:
            async for event in deep_search_stream(image_bytes, api_key):
                sse_event = event.get("event", "")
                sse_data = json.dumps(event.get("data", {}))
                yield f"event: {sse_event}\ndata: {sse_data}\n\n"
        except Exception as e:
            logger.error(f"Deep search TV error: {e}")
            yield f"event: error\ndata: {json.dumps({'message': str(e)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


@router.post("/hashes/find-copies")
@limiter.limit("10/minute")
async def find_copies(
    request: Request,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user.get("sub") or current_user.get("id") if current_user else None
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")

    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file")

    try:
        hashes = compute_hashes(image_bytes)
        similar = find_similar_multi(hashes, user_id, min_confidence=50.0)
        register_hash(str(uuid4()), hashes, file.filename or "unknown", user_id)
        return {
            "query_hashes": hashes,
            "similar_files": similar,
            "total_found": len(similar),
            "hash_methods": ["dhash", "ahash", "color_hist"],
        }
    except Exception as e:
        logger.error(f"Find copies failed: {e}")
        raise HTTPException(status_code=500, detail="Find copies failed")
