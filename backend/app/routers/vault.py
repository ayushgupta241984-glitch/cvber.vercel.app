from fastapi import APIRouter, HTTPException, Depends, Query
from uuid import UUID
from datetime import datetime
from supabase import create_client
from app.config import settings
from app.dependencies import get_current_user
from app.services.storage import storage_service
from app.models.schemas import VaultFile, VaultFileList
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/vault", tags=["vault"])

supabase = create_client(settings.supabase_url, settings.supabase_service_role_key)


@router.get("/files", response_model=VaultFileList)
async def list_vault_files(
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: dict = Depends(get_current_user)
):
    try:
        response = supabase.table("vault_files")\
            .select("*", count="exact")\
            .eq("user_id", current_user["id"])\
            .order("created_at", desc=True)\
            .limit(limit)\
            .offset(offset)\
            .execute()

        files = []
        for item in response.data or []:
            signed_url = None
            try:
                signed_url = await storage_service.get_file_url(
                    file_path=item["storage_path"],
                    bucket=item.get("bucket", "safe-vault")
                )
            except Exception as url_err:
                logger.debug(f"Failed to generate signed URL for {item.get('storage_path')}: {url_err}")

            files.append(VaultFile(
                id=item["id"],
                scan_id=item["scan_id"],
                file_name=item["file_name"],
                file_size=item.get("file_size", 0),
                storage_path=item["storage_path"],
                bucket=item.get("bucket", "safe-vault"),
                content_type=item.get("content_type", "application/octet-stream"),
                original_hash=item.get("original_hash"),
                risk_score=item.get("risk_score"),
                originality_score=item.get("originality_score"),
                is_screenshot=item.get("is_screenshot", False),
                storage_url=signed_url,
                created_at=item.get("created_at", datetime.utcnow())
            ))

        return VaultFileList(files=files, total=response.count or len(files))
    except Exception as e:
        logger.error(f"Failed to list vault files: {e}")
        raise HTTPException(status_code=500, detail="Failed to list vault files")


@router.get("/files/{scan_id}/url")
async def get_vault_file_url(
    scan_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    try:
        response = supabase.table("vault_files")\
            .select("storage_path, bucket, file_name")\
            .eq("scan_id", str(scan_id))\
            .eq("user_id", current_user["id"])\
            .single()\
            .execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="File not found in vault")

        signed_url = await storage_service.get_file_url(
            file_path=response.data["storage_path"],
            bucket=response.data.get("bucket", "safe-vault")
        )

        return {
            "url": signed_url,
            "file_name": response.data["file_name"],
            "scan_id": str(scan_id)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get file URL: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate file URL")


@router.get("/files/{scan_id}/download")
async def download_vault_file(
    scan_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    try:
        response = supabase.table("vault_files")\
            .select("storage_path, bucket, file_name, content_type")\
            .eq("scan_id", str(scan_id))\
            .eq("user_id", current_user["id"])\
            .single()\
            .execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="File not found in vault")

        file_bytes = await storage_service.download_file(
            file_path=response.data["storage_path"],
            bucket=response.data.get("bucket", "safe-vault")
        )

        from fastapi.responses import Response
        return Response(
            content=file_bytes,
            media_type=response.data.get("content_type", "application/octet-stream"),
            headers={
                "Content-Disposition": f'attachment; filename="{response.data["file_name"]}"'
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to download file: {e}")
        raise HTTPException(status_code=500, detail="Failed to download file")


@router.delete("/files/{scan_id}")
async def delete_vault_file(
    scan_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    try:
        response = supabase.table("vault_files")\
            .select("storage_path, bucket")\
            .eq("scan_id", str(scan_id))\
            .eq("user_id", current_user["id"])\
            .single()\
            .execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="File not found in vault")

        deleted = await storage_service.delete_file(
            file_path=response.data["storage_path"],
            bucket=response.data.get("bucket", "safe-vault")
        )

        supabase.table("vault_files")\
            .delete()\
            .eq("scan_id", str(scan_id))\
            .eq("user_id", current_user["id"])\
            .execute()

        return {"deleted": True, "scan_id": str(scan_id)}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete file: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete file")
