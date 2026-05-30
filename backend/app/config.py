from pydantic_settings import BaseSettings
from typing import List, Optional, Union
from pydantic import field_validator, Field
import os
import logging
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# Try loading .env from a couple of likely locations (project root and current dir)
root_env = os.path.abspath(os.path.join(os.path.dirname(__file__), "../..", ".env"))
if os.path.exists(root_env):
    logger.info(f"Loading .env from {root_env}")
    load_dotenv(root_env)
else:
    logger.info("No .env file found at project root, using environment variables")
    load_dotenv()  # fallback to default behavior


class Settings(BaseSettings):
    # Supabase
    supabase_url: str = "https://placeholder.supabase.co"
    supabase_anon_key: str = "placeholder-anon-key"
    supabase_service_role_key: str = "placeholder-service-role-key"
    
    # Backend
    backend_url: str = "http://localhost:8000"
    
    # JWT
    jwt_secret: str = "dev-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Google Cloud
    gcp_project_id: str = "placeholder-project-id"
    google_application_credentials: str = "./service-account.json"
    google_api_key: Optional[str] = None
    """Gemini API key — set via GOOGLE_API_KEY or GEMINI_API_KEY in .env. Get one free at https://aistudio.google.com/apikey"""

    @field_validator("google_api_key", mode="before")
    @classmethod
    def resolve_google_api_key(cls, v):
        if v:
            return v
        return os.getenv("GEMINI_API_KEY") or os.getenv("gemini_api_key")

    # NOTE: Do NOT commit real API keys. Provide your Groq API key via environment or .env.
    groq_api_key: Optional[str] = None

    # NVIDIA NIM (OpenAI-compatible API)
    nvidia_nim_api_key: Optional[str] = None
    nvidia_nim_base_url: str = "https://integrate.api.nvidia.com/v1"
    nvidia_nim_model: str = "google/gemma-3n-e4b-it"

    # Hugging Face
    hf_token: Optional[str] = None
    hf_vision_model: str = "Salesforce/blip-image-captioning-large"

    # AI Model Configuration
    vertex_ai_location: str = "us-central1"
    vertex_ai_model: str = "gemini-1.5-flash-002"
    google_model: str = "gemini-1.5-flash"
    groq_model: str = "llama-3.3-70b-versatile"
    groq_vision_model: str = "llama-3.2-90b-vision-preview"
    local_storage_path: str = "uploads"
    
    # Cloud KMS
    kms_keyring: str = "cvber-free-keyring"
    kms_key: str = "c2pa-signing-key"
    kms_location: str = "us-central1"
    
    # C2PA Service
    c2pa_service_url: str = "http://localhost:3001"
    
    # CORS - stored as comma-separated string
    allowed_origins: str = "http://localhost:3000,http://localhost:3002,https://cvber.vercel.app,https://cvber.app,https://cvber.free.las.app,https://cvber-free-las-app.vercel.app"
    
    @property
    def parsed_allowed_origins(self) -> list:
        """Parse ALLOWED_ORIGINS from comma-separated string."""
        if self.allowed_origins == "*":
            return ["*"]
        return [origin.strip() for origin in self.allowed_origins.split(',') if origin.strip()]
    
    model_config = {
        # pydantic-settings will still attempt to read .env, but we've pre-loaded it
        # above using python-dotenv from the repository root, so the working
        # directory no longer matters.
        "env_file": ".env",
        "case_sensitive": False,
        "env_file_encoding": "utf-8",
        "extra": "ignore"
    }
    # Deployment Trigger: 2026-02-18-01:10


settings = Settings()

# Log minimal configuration on startup (never log keys or secrets)
logger.info("=" * 60)
logger.info("CONFIG LOADED:")
logger.info(f"  AI providers configured: {sum(1 for k in ['groq_api_key', 'google_api_key', 'hf_token', 'nvidia_nim_api_key'] if getattr(settings, k, None))}/4")
provider_status = "configured" if settings.supabase_url and "placeholder" not in settings.supabase_url else "using defaults"
logger.info(f"  Supabase: {provider_status}")
logger.info("  (keys and secrets never logged)")
logger.info("=" * 60)
