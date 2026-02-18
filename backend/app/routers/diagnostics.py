from fastapi import APIRouter, HTTPException
from app.config import settings
from supabase import create_client
import os

router = APIRouter(prefix="/diagnostics", tags=["diagnostics"])

@router.get("/supabase")
async def check_supabase():
    """Verify Supabase configuration and connectivity."""
    status = {
        "url": settings.supabase_url,
        "url_match": settings.supabase_url == os.getenv("SUPABASE_URL"),
        "service_key_status": "present" if settings.supabase_service_role_key and len(settings.supabase_service_role_key) > 50 else "invalid/missing",
        "service_key_placeholder": "placeholder" in settings.supabase_service_role_key.lower(),
        "env_file_exists": os.path.exists(".env"),
        "connectivity": "unknown"
    }
    
    try:
        supabase = create_client(settings.supabase_url, settings.supabase_service_role_key)
        # Try a simple admin check
        resp = supabase.auth.admin.list_users()
        status["connectivity"] = "admin_ok"
        status["user_count_hint"] = len(resp.users) if hasattr(resp, 'users') else "ok"
    except Exception as e:
        status["connectivity"] = f"failed: {str(e)}"
        
    return status
