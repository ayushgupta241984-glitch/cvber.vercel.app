import os
import time
import json
import logging
from datetime import datetime, timezone

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.routers import scan, auth, mentor, enforcement, diagnostics, vault
from app.services.vertex_ai import vertex_ai_service
from app.services.storage import storage_service

logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="CVBER Free API",
    description="Cybersecurity platform with AI-powered threat detection and C2PA verification",
    version="1.0.1",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-Response-Time-Ms"] = str(int((time.time() - start_time) * 1000))
    return response

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=[
        "localhost", "127.0.0.1", "0.0.0.0",
        "*.cvber.app", "cvber.free.las.app", "*.onrender.com",
        "*.vercel.app",
    ]
)

cors_origins = settings.parsed_allowed_origins
cors_regex = None

if settings.allowed_origins == "*":
    cors_origins = ["*"]
else:
    cors_regex = r"https://.*\.vercel\.app"

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=cors_regex,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)


def validate_environment():
    """Validate critical environment variables at startup."""
    required = {
        "supabase_url": settings.supabase_url,
        "supabase_anon_key": settings.supabase_anon_key,
        "supabase_service_role_key": settings.supabase_service_role_key,
        "jwt_secret": settings.jwt_secret,
    }
    placeholders = ["placeholder", "your-", "key-here", "secret-here"]

    missing = []
    for name, value in required.items():
        if not value or any(p in str(value).lower() for p in placeholders):
            missing.append(name)

    if missing:
        logger.warning(f"Missing or placeholder values for: {', '.join(missing)}")

    if not settings.google_api_key and not settings.groq_api_key:
        logger.warning("No AI API keys configured. AI features will use mock data.")

    return len(missing) == 0


@app.on_event("startup")
async def startup():
    logger.info("Starting CVBER Free API...")
    validate_environment()

    gcp_json = os.getenv("GCP_SERVICE_ACCOUNT_JSON")
    if gcp_json:
        try:
            cred_path = settings.google_application_credentials
            os.makedirs(os.path.dirname(os.path.abspath(cred_path)), exist_ok=True)
            with open(cred_path, "w") as f:
                f.write(gcp_json)
            logger.info(f"GCP credentials initialized at {cred_path}")
        except Exception as e:
            logger.error(f"Failed to initialize GCP credentials: {e}")

    try:
        await storage_service.ensure_buckets_exist()
        logger.info("Storage buckets verified")
    except Exception as e:
        logger.warning(f"Could not verify storage buckets: {e}")

    provider_status = vertex_ai_service.get_provider_status()
    logger.info(f"AI provider status: {json.dumps(provider_status, default=str)}")


app.include_router(scan.router)
app.include_router(auth.router)
app.include_router(mentor.router)
app.include_router(enforcement.router)
app.include_router(diagnostics.router)
app.include_router(vault.router)


@app.get("/")
async def root():
    return {"status": "online", "service": "CVBER Free API", "version": "1.0.1"}


@app.get("/health")
async def health_check():
    ai_status = vertex_ai_service.get_provider_status()
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "uptime_seconds": time.time() - app.state.get("start_time", time.time()),
        "services": {
            "api": "operational",
            "vertex_ai": ai_status,
            "c2pa": "operational",
        }
    }


@app.get("/api/ai-status")
async def ai_status():
    provider_status = vertex_ai_service.get_provider_status()
    return {
        "ai_service": provider_status,
        "environment": {
            "groq_key_present": bool(settings.groq_api_key),
            "google_key_present": bool(settings.google_api_key),
        }
    }


@app.on_event("startup")
async def record_start_time():
    app.state.start_time = time.time()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
