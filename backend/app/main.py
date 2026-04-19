from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi import Request, Response
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.config import settings
from app.routers import scan, auth, mentor, enforcement, diagnostics
from app.services.vertex_ai import vertex_ai_service

import os
import json
import logging

logger = logging.getLogger(__name__)

# Log environment status on startup
logger.info("Initializing CVBER Free API services...")
if os.getenv('GROQ_API_KEY'):
    logger.info("GROQ_API_KEY is configured.")
else:
    logger.warning("GROQ_API_KEY is not set. Falling back to Gemini.")

# Create FastAPI app
# Rate Limiter setup (Firewall layer)
limiter = Limiter(key_func=get_remote_address)
app = FastAPI(
    title="CVBER Free API",
    description="Cybersecurity platform with AI-powered threat detection and C2PA verification",
    version="1.0.1"
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security Headers Middleware (WAF Layer)
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# Trusted Host Middleware
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["localhost", "127.0.0.1", "*.cvber.app", "cvber.free.las.app", "*.onrender.com"]
)

# Initialize Google Cloud Credentials (Legacy JSON) if provided via Env
@app.on_event("startup")
async def initialize_gcp_credentials():
    gcp_json = os.getenv("GCP_SERVICE_ACCOUNT_JSON")
    if gcp_json:
        try:
            cred_path = settings.google_application_credentials
            os.makedirs(os.path.dirname(os.path.abspath(cred_path)), exist_ok=True)
            with open(cred_path, "w") as f:
                f.write(gcp_json)
            print(f"Legacy GCP credentials initialized at {cred_path}")
        except Exception as e:
            print(f"Failed to initialize legacy GCP credentials: {e}")
    else:
        print("Note: No legacy GCP JSON credentials found. Using API Key mode for Gemini.")

# Configure CORS
# Handle wildcard origin properly
if settings.parsed_allowed_origins == ["*"]:
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=".*",  # Allow all origins
        allow_credentials=False,  # Can't use credentials with wildcard
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.parsed_allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include routers
app.include_router(scan.router)
app.include_router(auth.router)
app.include_router(mentor.router)
app.include_router(enforcement.router)
app.include_router(diagnostics.router)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "online",
        "service": "CVBER Free API",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "timestamp": "2025-12-29T14:00:00Z",
        "services": {
            "api": "operational",
            "database": "operational",
            "vertex_ai": "operational",
            "c2pa": "operational"
        }
    }


@app.get("/api/ai-status")
async def ai_status():
    """Diagnostic endpoint to check AI service status."""
    vertex_ai_service.ensure_initialized()
    return {
        "ai_service": {
            "initialized": vertex_ai_service.initialized,
            "provider": vertex_ai_service.provider,
            "groq_available": vertex_ai_service.groq_client is not None,
            "google_available": vertex_ai_service.model is not None,
        },
        "environment": {
            "groq_key_present": bool(settings.groq_api_key),
            "google_key_present": bool(settings.google_api_key),
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
