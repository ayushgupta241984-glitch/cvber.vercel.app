from fastapi import APIRouter, HTTPException, Depends
from app.config import settings
from app.services.vertex_ai import vertex_ai_service
from app.services.storage import storage_service
from supabase import create_client
import os
import platform
import time
from app.dependencies import get_current_user

router = APIRouter(prefix="/diagnostics", tags=["diagnostics"], dependencies=[Depends(get_current_user)])


@router.get("/all")
async def full_diagnostics():
    return {
        "system": {
            "python_version": platform.python_version(),
            "platform": platform.platform(),
            "hostname": platform.node(),
        },
        "environment": {
            "supabase_url_configured": bool(settings.supabase_url and "placeholder" not in settings.supabase_url.lower()),
            "supabase_key_configured": bool(settings.supabase_service_role_key and "placeholder" not in settings.supabase_service_role_key.lower()),
            "jwt_secret_configured": bool(settings.jwt_secret and "dev-secret" not in settings.jwt_secret.lower()),
            "groq_key_configured": bool(settings.groq_api_key),
            "google_key_configured": bool(settings.google_api_key),
        },
        "ai_providers": vertex_ai_service.get_provider_status(),
        "allowed_origins": settings.parsed_allowed_origins,
    }


@router.get("/supabase")
async def check_supabase():
    status = {
        "url": settings.supabase_url,
        "key_configured": "placeholder" not in settings.supabase_service_role_key.lower(),
        "connectivity": "unknown"
    }

    try:
        supabase = create_client(settings.supabase_url, settings.supabase_service_role_key)
        resp = supabase.auth.admin.list_users()
        status["connectivity"] = "ok"
        status["user_count"] = len(resp.users) if hasattr(resp, 'users') else "unknown"
    except Exception as e:
        status["connectivity"] = f"failed: {str(e)}"

    return status


@router.get("/storage")
async def check_storage():
    status = {
        "buckets": list(storage_service.BUCKET_NAMES),
        "configured": True,
    }
    try:
        buckets = storage_service.supabase.storage.list_buckets()
        status["existing_buckets"] = [b.name for b in buckets]
        status["all_buckets_exist"] = storage_service.BUCKET_NAMES.issubset(b.name for b in buckets)
    except Exception as e:
        status["error"] = str(e)
    return status
