from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from uuid import uuid4, UUID
from datetime import datetime
from app.models.schemas import ScanResponse, RiskReport, VerifyRequest, VerifyResponse
from app.services.vertex_ai import vertex_ai_service
from app.services.c2pa_service import c2pa_service
from app.services.storage import storage_service
from supabase import create_client
from app.config import settings

router = APIRouter(prefix="/scan", tags=["scan"])

# Supabase client for database operations
supabase = create_client(settings.supabase_url, settings.supabase_service_role_key)


def get_current_user():
    """Dependency to get current authenticated user. 
    TODO: Implement JWT token validation."""
    # Placeholder - will be implemented with auth
    return {"id": "00000000-0000-0000-0000-000000000000", "email": "user@example.com"}


@router.post("", response_model=ScanResponse)
@router.post("/", response_model=ScanResponse)
async def scan_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Scan uploaded file for security threats using AI analysis.
    """
    try:
        # Generate scan ID
        scan_id = uuid4()
        
        # Read file content
        file_buffer = await file.read()
        file_size = len(file_buffer)
        
        # Validate file size (max 50MB)
        if file_size > 50 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size exceeds 50MB limit")
        
        # Get file type
        file_type = file.content_type or "application/octet-stream"
        
        # Perform AI threat analysis
        risk_report = await vertex_ai_service.analyze_file_threat(
            file_buffer=file_buffer,
            file_name=file.filename,
            file_type=file_type
        )
        
        # Store in audit logs (OPTIONAL - Don't crash if table doesn't exist)
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
            print(f"Warning: Failed to log to Supabase: {db_err}")
        
        # Upload file to storage (OPTIONAL - Don't crash if bucket doesn't exist)
        try:
            file_path = await storage_service.upload_file(
                file_buffer=file_buffer,
                file_name=file.filename,
                user_id=UUID(current_user["id"])
            )
        except Exception as storage_err:
            print(f"Warning: Failed to upload to Storage: {storage_err}")
        
        return ScanResponse(
            scan_id=scan_id,
            status="completed",
            risk_report=risk_report,
            message="Scan completed successfully"
        )
        
    except Exception as e:
        print(f"Scan Error: {e}")
        # Final attempt to log error, but don't re-raise if it fails
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
        except:
            pass
            
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")


@router.post("/verify", response_model=VerifyResponse)
async def verify_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Apply C2PA digital signature to file with scan results.
    
    - Accepts file upload
    - Scans file for threats
    - Applies C2PA digital signature
    - Stores verification metadata
    - Returns signed file URL
    """
    try:
        # Read file content
        file_buffer = await file.read()
        
        # First, scan the file
        risk_report = await vertex_ai_service.analyze_file_threat(
            file_buffer=file_buffer,
            file_name=file.filename,
            file_type=file.content_type or "application/octet-stream"
        )
        
        # Calculate original hash
        original_hash = storage_service.calculate_hash(file_buffer)
        
        # Sign file with C2PA
        c2pa_result = await c2pa_service.sign_file(
            file_buffer=file_buffer,
            file_name=file.filename,
            scan_results=risk_report,
            user_id=current_user["id"]
        )
        
        # Generate verification ID
        verification_id = uuid4()
        file_id = uuid4()
        
        # Store verification metadata
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
        
        supabase.table("verification_meta").insert(verification_meta).execute()
        
        # Log verification event
        audit_log = {
            "id": str(uuid4()),
            "user_id": current_user["id"],
            "event_type": "verify",
            "file_name": file.filename,
            "risk_score": risk_report.overall_risk_score,
            "metadata": {
                "verification_id": str(verification_id),
                "file_id": str(file_id)
            },
            "created_at": datetime.utcnow().isoformat()
        }
        
        supabase.table("audit_logs").insert(audit_log).execute()
        
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
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")


@router.get("/history")
async def get_scan_history(
    limit: int = 10,
    current_user: dict = Depends(get_current_user)
):
    """Get user's scan history from audit logs."""
    try:
        response = supabase.table("audit_logs")\
            .select("*")\
            .eq("user_id", current_user["id"])\
            .order("created_at", desc=True)\
            .limit(limit)\
            .execute()
        
        return {"scans": response.data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")
