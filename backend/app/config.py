from pydantic_settings import BaseSettings
from typing import List, Optional, Union
from pydantic import field_validator
import os


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
    groq_api_key: Optional[str] = None
    
    # Vertex AI
    vertex_ai_location: str = "us-central1"
    vertex_ai_model: str = "gemini-1.5-flash-002"
    
    # Cloud KMS
    kms_keyring: str = "cvber-free-keyring"
    kms_key: str = "c2pa-signing-key"
    kms_location: str = "us-central1"
    
    # C2PA Service
    c2pa_service_url: str = "http://localhost:3001"
    
    # CORS - stored as comma-separated string
    allowed_origins: str = "http://localhost:3000,http://localhost:3002"
    
    @property
    def parsed_allowed_origins(self) -> list:
        """Parse ALLOWED_ORIGINS from comma-separated string."""
        if self.allowed_origins == "*":
            return ["*"]
        return [origin.strip() for origin in self.allowed_origins.split(',') if origin.strip()]
    
    model_config = {
        "env_file": ".env",
        "case_sensitive": False,
        "env_file_encoding": "utf-8",
        "extra": "ignore"
    }
    # Deployment Trigger: 2026-02-18-01:10


settings = Settings()
