import httpx
import logging
from typing import Dict, Any, Optional
from app.config import settings
from app.models.schemas import RiskReport, C2PASignature, C2PAManifest
from app.services.storage import storage_service, StorageError
from datetime import datetime
from uuid import uuid4, UUID

logger = logging.getLogger(__name__)


class C2PAService:
    """Service to interact with the C2PA Node.js microservice."""
    
    def __init__(self):
        self.c2pa_url = settings.c2pa_service_url
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def sign_file(
        self,
        file_buffer: bytes,
        file_name: str,
        scan_results: RiskReport,
        user_id: str
    ) -> Dict[str, Any]:
        """
        Send file to C2PA service for digital signing.
        
        Args:
            file_buffer: File content as bytes
            file_name: Name of the file
            scan_results: Risk report from AI analysis
            user_id: User ID for provenance tracking
            
        Returns:
            Dictionary with signed file and manifest data
        """
        try:
            # Prepare metadata for C2PA manifest
            metadata = {
                "author": user_id,
                "timestamp": datetime.utcnow().isoformat(),
                "file_name": file_name,
                "scan_results": {
                    "overall_risk_score": scan_results.overall_risk_score,
                    "confidence_level": scan_results.confidence_level,
                    "threat_categories": [
                        {
                            "name": cat.name,
                            "severity": cat.severity,
                            "confidence": cat.confidence
                        }
                        for cat in scan_results.threat_categories
                    ],
                    "scan_timestamp": scan_results.scan_timestamp.isoformat()
                }
            }
            
            # Prepare multipart form data
            files = {
                "file": (file_name, file_buffer)
            }
            
            import json
            data = {
                "metadata": json.dumps(metadata)
            }
            
            # Send request to C2PA service
            response = await self.client.post(
                f"{self.c2pa_url}/sign",
                files=files,
                data=data
            )
            
            response.raise_for_status()
            
            result = response.json()
            
            return {
                "signed_file": result.get("signed_file_url"),
                "manifest": result.get("manifest"),
                "signature": result.get("signature"),
                "kms_key_version": result.get("kms_key_version")
            }
            
        except httpx.HTTPError as e:
            raise Exception(f"C2PA service error: {str(e)}")
        except Exception as e:
            raise Exception(f"Failed to sign file: {str(e)}")
    
    async def verify_signature(self, file_buffer: bytes) -> Dict[str, Any]:
        """
        Verify C2PA signature on a file.
        
        Args:
            file_buffer: File content as bytes
            
        Returns:
            Verification result with manifest data
        """
        try:
            files = {"file": file_buffer}
            
            response = await self.client.post(
                f"{self.c2pa_url}/verify",
                files=files
            )
            
            response.raise_for_status()
            
            return response.json()
            
        except httpx.HTTPError as e:
            raise Exception(f"C2PA verification error: {str(e)}")
        except Exception as e:
            raise Exception(f"Failed to verify signature: {str(e)}")
    
    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()


# Singleton instance
c2pa_service = C2PAService()


async def embed_and_store_after_signing(
    user_id: str,
    asset_id: str,
    file_bytes: bytes,
    file_name: str,
    supabase_client
):
    """
    Background task: generate CLIP embedding + thumbnail after C2PA signing.
    Always runs non-blocking — never fails the parent signing request.
    """
    try:
        from app.services.clip_service import generate_embedding_from_bytes
        from app.services.thumbnail_service import generate_thumbnail

        # Only process image files
        img_exts = ('.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff')
        if not any(file_name.lower().endswith(ext) for ext in img_exts):
            logger.info(f"Skipping embedding for non-image file: {file_name}")
            return

        # 1. Generate CLIP embedding
        embedding = generate_embedding_from_bytes(file_bytes)
        if embedding is None:
            logger.warning(f"Could not generate embedding for {file_name}")
            return

        # 2. Generate thumbnail (200x200 center-cropped JPEG)
        thumbnail_bytes = generate_thumbnail(file_bytes, size=(200, 200))

        # 3. Upload thumbnail to Supabase Storage via storage_service
        thumbnail_path = f"thumbnails/{user_id}/{asset_id}_thumb.jpg"
        thumbnail_url = None
        try:
            thumb_path = await storage_service.upload_file(
                file_buffer=thumbnail_bytes,
                file_name=f"{asset_id}_thumb.jpg",
                user_id=UUID(user_id),
                bucket=storage_service.thumbnails_bucket,
                content_type="image/jpeg"
            )
            thumbnail_url = storage_service.supabase.storage.from_("thumbnails").get_public_url(thumb_path)
        except StorageError as storage_err:
            logger.warning(f"Thumbnail upload failed (non-critical): {storage_err}")

        # 4. Get artist profile info
        artist_name = "Anonymous Artist"
        artist_username = None
        artist_avatar_url = None
        try:
            profile_resp = supabase_client.table("profiles").select("*").eq("id", user_id).limit(1).execute()
            if profile_resp.data:
                p = profile_resp.data[0]
                artist_name = p.get("full_name") or p.get("username") or p.get("email", "").split("@")[0] or "Anonymous Artist"
                artist_username = p.get("username")
                artist_avatar_url = p.get("avatar_url")
        except Exception as profile_err:
            logger.warning(f"Could not fetch profile for user {user_id}: {profile_err}")

        # 5. Insert embedding into style_embeddings
        supabase_client.table("style_embeddings").insert({
            "user_id": user_id,
            "asset_id": asset_id if asset_id else None,
            "artist_name": artist_name,
            "artist_username": artist_username,
            "artist_avatar_url": artist_avatar_url,
            "file_name": file_name,
            "thumbnail_url": thumbnail_url,
            "embedding": embedding,
            "is_active": True,
        }).execute()

        logger.info(f"Style embedding stored for '{file_name}' by '{artist_name}'")

    except Exception as e:
        # Never propagate — embedding is non-critical
        logger.error(f"embed_and_store_after_signing failed for {file_name}: {e}")
