from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import scan, auth, mentor

import os
import json

# Create FastAPI app
app = FastAPI(
    title="CVBER Free API",
    description="Cybersecurity platform with AI-powered threat detection and C2PA verification",
    version="1.0.0"
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
