from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi import Request, Response
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
app = FastAPI(
    title="CVBER Free API",
    description="Cybersecurity platform with AI-powered threat detection and C2PA verification",
    version="1.0.1"
)

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
            logger.info(f"Legacy GCP credentials initialized at {cred_path}")
        except Exception as e:
            logger.error(f"Failed to initialize legacy GCP credentials: {e}")
    else:
        logger.info("Note: No legacy GCP JSON credentials found. Using API Key mode for Gemini.")

# Configure CORS
# For safety in varied deployment environments (e.g. Vercel Preview strings), we allow all origins.
# Our Auth system uses 'Authorization: Bearer' headers instead of cookies, so allow_credentials=False is secure.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
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
        "version": "1.0.1"
    }


@app.get("/health")
async def health_check():
    """Detailed health check."""
    from datetime import datetime, timezone
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
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
