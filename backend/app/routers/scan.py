from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, BackgroundTasks
from uuid import uuid4, UUID
from datetime import datetime
from typing import Optional
from app.models.schemas import ScanResponse, VerifyResponse, VerifyRequest
from app.services.vertex_ai import vertex_ai_service
from app.services.c2pa_service import c2pa_service, embed_and_store_after_signing
from app.services.storage import storage_service
from app.services.metadata_engine import metadata_engine
import os
from app.services.web_search import web_search_service
from app.supabase_client import get_supabase
from app.config import settings
from app.dependencies import get_current_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/scan", tags=["scan"])

supabase = get_supabase()


def detect_screenshot_from_image(file_buffer: bytes, filename: str) -> dict:
    """
    Actually analyze image content to detect screenshots, not just filename.
    Returns dict with 'is_screenshot' and 'detection_method'.
    """
    try:
        from PIL import Image
        import io
        
        img = Image.open(io.BytesIO(file_buffer))
        width, height = img.size
        aspect_ratio = width / height if height > 0 else 0
        
        detection_reasons = []
        is_screenshot = False
        
        # Check 1: Known screenshot aspect ratios (iPhone, iPad, Android)
        screenshot_ratios = [
            (19.5, 9),   # iPhone (19.5:9)
            (18, 9),     # iPhone older (18:9)  
            (18.5, 9),   # Android
            (4, 3),      # iPad portrait
            (3, 4),      # iPad landscape
            (16, 10),    # Android tablets
            (16, 9),     # Old smartphones
        ]
        
        for ratio in screenshot_ratios:
            if 0.95 <= aspect_ratio <= 1.05:  # Exact ratio
                if ratio[0] / ratio[1] - 0.1 <= aspect_ratio <= ratio[0] / ratio[1] + 0.1:
                    detection_reasons.append(f"aspect_ratio_{ratio[0]}x{ratio[1]}")
                    is_screenshot = True
                    break
        
        # Check 2: Uniform colored edges (screenshot borders)
        if not is_screenshot and img.mode in ('RGB', 'RGBA'):
            try:
                pixels = img.load()
                edge_samples = []
                
                # Sample top 10 rows
                for x in range(0, width, max(1, width // 20)):
                    edge_samples.append(pixels[x, 0])
                    edge_samples.append(pixels[x, height - 1])
                
                # Sample left 10 columns  
                for y in range(0, height, max(1, height // 20)):
                    edge_samples.append(pixels[0, y])
                    edge_samples.append(pixels[width - 1, y])
                
                if edge_samples:
                    # Check if edges are mostly the same color (common in screenshots)
                    first_color = edge_samples[0]
                    similar_count = sum(1 for c in edge_samples if c == first_color)
                    if similar_count / len(edge_samples) > 0.7:
                        detection_reasons.append("uniform_edges")
                        is_screenshot = True
            except Exception:
                pass
        
        # Check 3: Look for notch/cutout areas (black bars at top)
        if not is_screenshot and img.mode in ('RGB', 'RGBA'):
            try:
                pixels = img.load()
                top_row_colors = [pixels[x, 0] for x in range(0, width, max(1, width // 10))]
                black_top = sum(1 for c in top_row_colors if sum(c[:3]) < 30)
                if black_top / len(top_row_colors) > 0.5:
                    detection_reasons.append("notch_bar")
                    is_screenshot = True
            except Exception:
                pass
        
        # Check 4: Very low detail images (often screenshots of text/documents)
        if not is_screenshot and img.mode in ('RGB', 'RGBA'):
            try:
                # Resize to small to check entropy
                small = img.resize((50, 50))
                pixels = list(small.getdata())
                unique_colors = len(set(pixels))
                if unique_colors < 100:  # Very few colors = likely screenshot of simple content
                    detection_reasons.append("low_detail")
                    is_screenshot = True
            except Exception:
                pass
        
        return {
            "is_screenshot": is_screenshot,
            "detection_method": "pixel_analysis" if detection_reasons else "none",
            "reasons": detection_reasons,
            "aspect_ratio": round(aspect_ratio, 2)
        }
    except Exception as e:
        logger.warning(f"Screenshot detection failed: {e}")
        return {"is_screenshot": False, "detection_method": "error", "reasons": [], "aspect_ratio": 0}

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

        # Calculate hash FIRST
        original_hash = storage_service.calculate_hash(file_buffer)

        # Check for existing vault duplicates for originality scoring
        existing_vault_matches = None
        try:
            existing_vault_matches = await web_search_service.find_similar_uploads(
                user_id=current_user["id"],
                file_hash=original_hash
            )
        except Exception as e:
            logger.warning(f"User prior check failed: {e}")

        # === MULTI-FACTOR ORIGINALITY ENGINE ===
        threat_reasons = []
        finding_details = []

        try:
            from app.services.originality_engine import originality_engine
            orig_result = await originality_engine.compute_originality(
                file_bytes=file_buffer,
                file_name=file.filename,
                file_hash=original_hash,
                user_id=current_user["id"],
                has_c2pa=has_c2pa,
                has_blockchain_proof=False,
                existing_vault_matches=existing_vault_matches,
            )
            originality_score = orig_result["originality_score"]
            logger.info(f"Originality score: {originality_score} (confidence: {orig_result['confidence']})")

            for factor_name, factor_data in orig_result.get("factors", {}).items():
                score = factor_data.get("score", 50)
                if score < 60:
                    severity = "high" if score < 20 else "medium"
                else:
                    severity = "low"
                threat_reasons.append({
                    "name": factor_name.replace("_", " ").title(),
                    "severity": severity,
                    "confidence": max(0.5, (100 - score) / 100),
                    "description": factor_data.get("details", ""),
                })
                finding_details.append({
                    "category": factor_name.replace("_", " ").title(),
                    "description": factor_data.get("details", ""),
                    "evidence": f"score: {score}/100 (weight: {factor_data.get('weight', 0)})",
                })

            # Run reverse search in background for full originality (non-blocking)
            if orig_result.get("reverse_search_needed"):
                asyncio.create_task(
                    originality_engine.compute_full_originality_with_search(
                        file_bytes=file_buffer,
                        file_name=file.filename,
                        file_hash=original_hash,
                        user_id=current_user["id"],
                        has_c2pa=has_c2pa,
                        has_blockchain_proof=False,
                        existing_vault_matches=existing_vault_matches,
                    )
                )
        except Exception as e:
            logger.warning(f"Originality engine failed, falling back to basic: {e}")
            originality_score = 50.0

        # Now get basic AI risk report
        risk_report = await vertex_ai_service.analyze_file_threat(
            file_buffer=file_buffer,
            file_name=file.filename,
            file_type=file_type,
            has_c2pa=has_c2pa
        )

        # Use the multi-factor originality score
        risk_report.originality_score = originality_score

        # Add our threat reasons and findings
        for tr in threat_reasons:
            risk_report.threat_categories.append(
                type('ThreatCategory', (), tr)()
            )
        for fd in finding_details:
            risk_report.detailed_findings.append(
                type('DetailedFinding', (), fd)()
            )

        storage_path = None
        storage_url = None
        original_hash = storage_service.calculate_hash(file_buffer)
        try:
            storage_path = await storage_service.upload_file(
                file_buffer=file_buffer,
                file_name=file.filename,
                user_id=UUID(current_user["id"]),
                content_type=file_type
            )
        except Exception as store_err:
            logger.warning(f"Supabase storage failed, saving locally: {store_err}")
            local_dir = os.path.join(settings.local_storage_path or "uploads", str(current_user["id"]))
            os.makedirs(local_dir, exist_ok=True)
            local_path = os.path.join(local_dir, f"{scan_id}_{file.filename}")
            with open(local_path, "wb") as f:
                f.write(file_buffer)
            storage_path = local_path
            logger.info(f"Saved locally: {local_path}")

        try:
            try:
                # Require proof if screenshot or low originality
                proof_required = risk_report.is_screenshot or risk_report.originality_score < 50
                
                vault_record = {
                    "user_id": current_user["id"],
                    "scan_id": str(scan_id),
                    "file_name": file.filename,
                    "file_size": file_size,
                    "storage_path": storage_path,
                    "bucket": storage_service.safe_vault_bucket,
                    "content_type": file_type,
                    "original_hash": original_hash,
                    "risk_score": risk_report.overall_risk_score,
                    "originality_score": risk_report.originality_score,
                    "is_screenshot": risk_report.is_screenshot,
                    "proof_required": proof_required,
                    "ownership_proof_status": "pending" if proof_required else None,
                }
                vault_insert = supabase.table("vault_files").insert(vault_record).execute()
                if not vault_insert.data:
                    raise HTTPException(status_code=500, detail="Failed to save to vault")
            except HTTPException:
                raise
            except Exception as vault_err:
                logger.error(f"Failed to record vault file: {vault_err}")
                raise HTTPException(status_code=500, detail=f"Vault save failed: {vault_err}")

            try:
                storage_url = await storage_service.get_file_url(storage_path)
            except Exception as url_err:
                logger.debug(f"Failed to generate signed URL: {url_err}")

            # C2PA auto-signing on upload
            try:
                if "image" in file_type or "video" in file_type:
                    await c2pa_service.sign_file(
                        file_buffer=file_buffer,
                        file_name=file.filename,
                        scan_results=risk_report,
                        user_id=current_user["id"]
                    )
            except Exception as c2pa_err:
                logger.warning(f"C2PA signing failed (non-critical): {c2pa_err}")
        except Exception as storage_err:
            logger.warning(f"Failed to upload to Storage: {storage_err}")

        # Write audit log with storage path populated
        try:
            audit_log = {
                "id": str(uuid4()),
                "user_id": current_user["id"],
                "event_type": "scan",
                "file_name": file.filename,
                "risk_score": risk_report.overall_risk_score,
                "storage_path": storage_path,
                "bucket": "safe-vault",
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

        return ScanResponse(
            scan_id=scan_id,
            status="completed",
            risk_report=risk_report,
            message="Scan completed successfully",
            storage_url=storage_url,
            storage_path=storage_path,
            original_hash=original_hash
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
