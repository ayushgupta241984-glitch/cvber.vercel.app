from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, BackgroundTasks
from uuid import uuid4, UUID
from datetime import datetime
from typing import Optional
from app.models.schemas import ScanResponse, VerifyResponse, VerifyRequest
from app.services.vertex_ai import vertex_ai_service
from app.services.c2pa_service import c2pa_service, embed_and_store_after_signing
from app.services.storage import storage_service
from app.services.metadata_engine import metadata_engine
from supabase import create_client
from app.config import settings
from app.dependencies import get_current_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/scan", tags=["scan"])

supabase = create_client(settings.supabase_url, settings.supabase_service_role_key)

MAX_FILE_SIZE = 50 * 1024 * 1024
ALLOWED_CONTENT_TYPES = {
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/tiff',
    'video/mp4', 'video/webm', 'video/ogg',
    'application/pdf', 'text/plain',
}


def validate_file(file: UploadFile):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    if file.content_type and file.content_type not in ALLOWED_CONTENT_TYPES:
        logger.warning(f"Unexpected content type: {file.content_type}")


async def read_file_safe(file: UploadFile) -> bytes:
    try:
        data = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {str(e)}")
    if len(data) == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded")
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail=f"File size exceeds {MAX_FILE_SIZE // (1024*1024)}MB")
    return data


@router.post("", response_model=ScanResponse)
@router.post("/", response_model=ScanResponse)
async def scan_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    try:
        scan_id = uuid4()
        validate_file(file)
        file_buffer = await read_file_safe(file)
        file_size = len(file_buffer)

        user_email = current_user.get("email") or "Cvber User"
        creator_info = {
            "name": user_email.split('@')[0] if '@' in user_email else "Cvber User",
            "copyright_notice": f"\u00a9 {datetime.now().year} {user_email}. All rights reserved."
        }

        try:
            file_buffer = metadata_engine.inject_metadata_in_memory(
                file_buffer=file_buffer,
                file_name=file.filename,
                creator_info=creator_info
            )
            file_size = len(file_buffer)
        except Exception as e:
            logger.warning(f"Metadata injection warning: {e}")

        file_type = file.content_type or "application/octet-stream"

        has_c2pa = False
        try:
            if "image" in file_type or "video" in file_type:
                v_res = await c2pa_service.verify_signature(file_buffer)
                manifests = v_res.get("manifests")
                has_c2pa = v_res.get("active_manifest") is not None or (manifests and len(manifests) > 0)
        except Exception as v_err:
            logger.warning(f"C2PA verify failed: {v_err}")

        risk_report = await vertex_ai_service.analyze_file_threat(
            file_buffer=file_buffer,
            file_name=file.filename,
            file_type=file_type,
            has_c2pa=has_c2pa
        )

        try:
            audit_log = {
                "id": str(uuid4()),
                "user_id": current_user["id"],
                "event_type": "scan",
                "file_name": file.filename,
                "risk_score": risk_report.overall_risk_score,
                "metadata": {
                    "scan_id": str(scan_id),
                    "file_size": file_size,
                    "file_type": file_type,
                    "confidence_level": risk_report.confidence_level,
                    "threat_count": len(risk_report.threat_categories)
                },
                "created_at": datetime.utcnow().isoformat()
            }
            supabase.table("audit_logs").insert(audit_log).execute()
        except Exception as db_err:
            logger.warning(f"Failed to log to Supabase: {db_err}")

        storage_path = None
        storage_url = None
        try:
            storage_path = await storage_service.upload_file(
                file_buffer=file_buffer,
                file_name=file.filename,
                user_id=UUID(current_user["id"]),
                content_type=file_type
            )
            try:
                vault_record = {
                    "user_id": current_user["id"],
                    "scan_id": str(scan_id),
                    "file_name": file.filename,
                    "file_size": file_size,
                    "storage_path": storage_path,
                    "bucket": storage_service.safe_vault_bucket,
                    "content_type": file_type,
                    "original_hash": storage_service.calculate_hash(file_buffer),
                    "risk_score": risk_report.overall_risk_score,
                    "originality_score": risk_report.originality_score,
                    "is_screenshot": risk_report.is_screenshot,
                }
                supabase.table("vault_files").insert(vault_record).execute()
            except Exception as vault_err:
                logger.warning(f"Failed to record vault file: {vault_err}")

            try:
                storage_url = await storage_service.get_file_url(storage_path)
            except Exception as url_err:
                logger.debug(f"Failed to generate signed URL: {url_err}")
        except Exception as storage_err:
            logger.warning(f"Failed to upload to Storage: {storage_err}")

        return ScanResponse(
            scan_id=scan_id,
            status="completed",
            risk_report=risk_report,
            message="Scan completed successfully",
            storage_url=storage_url,
            storage_path=storage_path
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Scan error: {e}")
        try:
            error_log = {
                "id": str(uuid4()),
                "user_id": current_user["id"],
                "event_type": "scan",
                "file_name": file.filename,
                "risk_score": None,
                "metadata": {"error": str(e), "status": "failed"},
                "created_at": datetime.utcnow().isoformat()
            }
            supabase.table("audit_logs").insert(error_log).execute()
        except Exception as log_error:
            logger.warning(f"Failed to log scan error: {log_error}")
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")


@router.post("/verify", response_model=VerifyResponse)
async def verify_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    try:
        validate_file(file)
        file_buffer = await read_file_safe(file)

        risk_report = await vertex_ai_service.analyze_file_threat(
            file_buffer=file_buffer,
            file_name=file.filename,
            file_type=file.content_type or "application/octet-stream"
        )

        original_hash = storage_service.calculate_hash(file_buffer)

        c2pa_result = await c2pa_service.sign_file(
            file_buffer=file_buffer,
            file_name=file.filename,
            scan_results=risk_report,
            user_id=current_user["id"]
        )

        verification_id = uuid4()
        file_id = uuid4()

        verification_meta = {
            "id": str(verification_id),
            "user_id": current_user["id"],
            "file_id": str(file_id),
            "original_hash": original_hash,
            "signed_hash": c2pa_result.get("signature", ""),
            "c2pa_manifest": c2pa_result.get("manifest", {}),
            "kms_key_version": c2pa_result.get("kms_key_version", ""),
            "verified_at": datetime.utcnow().isoformat(),
            "created_at": datetime.utcnow().isoformat()
        }

        try:
            supabase.table("verification_meta").insert(verification_meta).execute()
        except Exception as db_err:
            logger.warning(f"Failed to store verification meta: {db_err}")

        try:
            audit_log = {
                "id": str(uuid4()),
                "user_id": current_user["id"],
                "event_type": "verify",
                "file_name": file.filename,
                "risk_score": risk_report.overall_risk_score,
                "metadata": {"verification_id": str(verification_id), "file_id": str(file_id)},
                "created_at": datetime.utcnow().isoformat()
            }
            supabase.table("audit_logs").insert(audit_log).execute()
        except Exception as db_err:
            logger.warning(f"Failed to log verification: {db_err}")

        background_tasks.add_task(
            embed_and_store_after_signing,
            user_id=current_user["id"],
            asset_id=str(verification_id),
            file_bytes=file_buffer,
            file_name=file.filename,
            supabase_client=supabase
        )

        return VerifyResponse(
            verification_id=verification_id,
            signed_file_url=c2pa_result.get("signed_file_url", ""),
            c2pa_signature={
                "file_id": file_id,
                "original_hash": original_hash,
                "signed_hash": c2pa_result.get("signature", ""),
                "manifest": c2pa_result.get("manifest", {}),
                "kms_key_version": c2pa_result.get("kms_key_version", ""),
                "verified_at": datetime.utcnow()
            },
            status="verified"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Verification failed: {e}")
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")


@router.get("/history")
async def get_scan_history(
    limit: int = 10,
    current_user: dict = Depends(get_current_user)
):
    try:
        limit = min(max(limit, 1), 100)
        response = supabase.table("audit_logs")\
            .select("*")\
            .eq("user_id", current_user["id"])\
            .order("created_at", desc=True)\
            .limit(limit)\
            .execute()
        return {"scans": response.data}
    except Exception as e:
        logger.error(f"Failed to fetch history: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch history")
