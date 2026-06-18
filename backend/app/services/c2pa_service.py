import httpx
import io
import os
import logging
import json
from typing import Dict, Any, Optional
from uuid import UUID
from app.config import settings
from app.models.schemas import RiskReport, C2PASignature, C2PAManifest
from app.supabase_client import get_supabase
from app.services.storage import storage_service
from datetime import datetime

logger = logging.getLogger(__name__)


class C2PAService:
    def __init__(self):
        self.c2pa_url = settings.c2pa_service_url
        transport = httpx.HTTPTransport(verify=True, retries=1)
        self.client = httpx.AsyncClient(timeout=30.0, transport=transport)

    async def sign_file(
        self,
        file_buffer: bytes,
        file_name: str,
        scan_results: RiskReport,
        user_id: str,
        scan_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        metadata = {
            "author": user_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "file_name": file_name,
            "scan_results": {
                "overall_risk_score": scan_results.overall_risk_score,
                "confidence_level": scan_results.confidence_level,
                "threat_categories": [
                    {"name": cat.name, "severity": cat.severity, "confidence": cat.confidence}
                    for cat in scan_results.threat_categories
                ],
                "scan_timestamp": scan_results.scan_timestamp.isoformat()
            }
        }

        files = {"file": (file_name, file_buffer)}
        data = {"metadata": json.dumps(metadata)}

        response = await self.client.post(f"{self.c2pa_url}/sign", files=files, data=data)
        response.raise_for_status()
        result = response.json()

        signed_path = result.get("signed_file_url", "")
        manifest = result.get("manifest")
        signature = result.get("signature")
        kms_key_version = result.get("kms_key_version")

        signed_bytes = None
        signed_url_value = None
        manifest_id = None

        filename = os.path.basename(signed_path)
        if filename:
            dl_url = f"{self.c2pa_url}/signed-files/{filename}"
            try:
                dl_resp = await self.client.get(dl_url)
                if dl_resp.status_code == 200:
                    signed_bytes = dl_resp.content
                    signed_path_storage = await storage_service.upload_file(
                        file_buffer=signed_bytes,
                        file_name=f"c2pa_{filename}",
                        user_id=UUID(user_id),
                        bucket="safe-vault",
                        content_type="application/octet-stream"
                    )
                    signed_url_value = await storage_service.get_file_url(signed_path_storage)
            except Exception as dl_err:
                logger.warning(f"Failed to retrieve signed file from C2PA service: {dl_err}")

        if manifest and scan_id:
            manifest_id = manifest.get("claim_id") or manifest.get("signature")
            try:
                supabase = get_supabase()
                supabase.table("vault_files")\
                    .update({
                        "c2pa_manifest": json.dumps(manifest) if isinstance(manifest, dict) else manifest,
                        "c2pa_signed_url": signed_url_value,
                        "c2pa_signature": signature,
                    })\
                    .eq("scan_id", scan_id)\
                    .execute()
            except Exception as db_err:
                logger.warning(f"Failed to store C2PA manifest in vault: {db_err}")

        return {
            "signed_file": signed_url_value,
            "signed_bytes": signed_bytes,
            "manifest": manifest,
            "manifest_id": manifest_id,
            "signature": signature,
            "kms_key_version": kms_key_version,
        }

    async def verify_signature(self, file_buffer: bytes) -> Dict[str, Any]:
        files = {"file": file_buffer}
        response = await self.client.post(f"{self.c2pa_url}/verify", files=files)
        response.raise_for_status()
        return response.json()

    async def close(self):
        await self.client.aclose()


c2pa_service = C2PAService()


async def embed_and_store_after_signing(
    user_id: str,
    asset_id: str,
    file_bytes: bytes,
    file_name: str,
    supabase_client
):
    try:
        from app.services.clip_service import generate_embedding_from_bytes
        from app.services.thumbnail_service import generate_thumbnail

        img_exts = ('.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff')
        if not any(file_name.lower().endswith(ext) for ext in img_exts):
            logger.info(f"Skipping embedding for non-image file: {file_name}")
            return

        embedding = generate_embedding_from_bytes(file_bytes)
        if embedding is None:
            logger.warning(f"Could not generate embedding for {file_name}")
            return

        thumbnail_bytes = generate_thumbnail(file_bytes, size=(200, 200))

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
        except Exception as storage_err:
            logger.warning(f"Thumbnail upload failed (non-critical): {storage_err}")

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
        logger.error(f"embed_and_store_after_signing failed for {file_name}: {e}")
