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
    provider_status = vertex_ai_service.get_provider_status()
    safe_status = {k: {"available": v.get("available", False)} for k, v in provider_status.items() if isinstance(v, dict)}
    return {
        "system": {
            "python_version": platform.python_version(),
        },
        "ai_providers": safe_status,
    }


@router.get("/supabase")
async def check_supabase():
    status = {
        "connectivity": "unknown"
    }

    try:
        from app.supabase_client import get_supabase
        supabase = get_supabase()
        resp = supabase.auth.admin.list_users()
        status["connectivity"] = "ok"
    except Exception as e:
        status["connectivity"] = "failed"

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
