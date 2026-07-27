"""
Storage Service
Manages file storage in Supabase with proper error handling, path sanitization, and retry logic.
"""
from supabase import create_client, Client
from app.config import settings
from typing import Optional, BinaryIO
from uuid import UUID
import hashlib
import re
import asyncio
import logging

logger = logging.getLogger(__name__)

ALLOWED_MIME_TYPES = {
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/tiff',
    'image/bmp', 'image/svg+xml',
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
    'application/pdf', 'application/zip', 'application/gzip',
    'text/plain',
}

MAX_FILE_SIZE_MB = 100
MAX_STORAGE_PER_USER_MB = 500


def sanitize_path_component(component: str) -> str:
    """Remove path traversal and dangerous characters from a path component."""
    s = component.replace('\\', '/')
    s = re.sub(r'\.\./', '', s)
    s = re.sub(r'\.\.$', '', s)
    s = re.sub(r'[<>:"|?*]', '_', s)
    s = s.strip('/')
    return s


def validate_mime_type(mime_type: str) -> bool:
    """Validate that the MIME type is in the allowed list."""
    return mime_type.lower() in ALLOWED_MIME_TYPES


class StorageService:
    """Service for managing file storage in Supabase with production hardening."""

    MAX_RETRIES = 3
    RETRY_DELAY_SECONDS = 1.0
    BUCKET_NAMES = {"safe-vault", "scan-results", "thumbnails"}

    def __init__(self):
        self.supabase: Client = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key
        )
        self.safe_vault_bucket = "safe-vault"
        self.scan_results_bucket = "scan-results"
        self.thumbnails_bucket = "thumbnails"

    async def ensure_buckets_exist(self):
        """Create required storage buckets if they don't already exist."""
        for bucket_name in self.BUCKET_NAMES:
            try:
                existing = self.supabase.storage.get_bucket(bucket_name)
                if existing:
                    logger.info(f"Bucket '{bucket_name}' already exists.")
                    continue
            except Exception:
                pass
            try:
                self.supabase.storage.create_bucket(
                    bucket_name,
                    options={"public": False, "allowed_mime_types": list(ALLOWED_MIME_TYPES)}
                )
                logger.info(f"Created bucket '{bucket_name}'.")
            except Exception as e:
                logger.warning(f"Could not create bucket '{bucket_name}': {e}")

    async def _retry_operation(self, operation, *args, **kwargs):
        """Retry a storage operation up to MAX_RETRIES times with exponential backoff."""
        last_exception = None
        for attempt in range(1, self.MAX_RETRIES + 1):
            try:
                result = operation(*args, **kwargs)
                import inspect
                if inspect.isawaitable(result):
                    result = await result
                return result
            except Exception as e:
                last_exception = e
                if attempt < self.MAX_RETRIES:
                    wait = self.RETRY_DELAY_SECONDS * (2 ** (attempt - 1))
                    logger.warning(f"Storage operation failed (attempt {attempt}/{self.MAX_RETRIES}), retrying in {wait:.1f}s: {e}")
                    await asyncio.sleep(wait)
        raise StorageError(f"Operation failed after {self.MAX_RETRIES} retries: {last_exception}")

    async def upload_file(
        self,
        file_buffer: bytes,
        file_name: str,
        user_id: UUID,
        bucket: str = None,
        content_type: str = None
    ) -> str:
        if not file_buffer:
            raise ValueError("File buffer cannot be empty")
        if not file_name:
            raise ValueError("File name cannot be empty")
        if len(file_buffer) > MAX_FILE_SIZE_MB * 1024 * 1024:
            raise ValueError(f"File size exceeds {MAX_FILE_SIZE_MB}MB limit")

        safe_name = sanitize_path_component(file_name)
        safe_user_id = sanitize_path_component(str(user_id))
        if not safe_user_id:
            raise ValueError("Invalid user ID after sanitization")
        if not safe_name:
            raise ValueError("Invalid file name after sanitization")

        bucket_name = bucket or self.safe_vault_bucket
        file_path = f"{safe_user_id}/{safe_name}"

        final_content_type = content_type or "application/octet-stream"

        try:
            await self._retry_operation(
                self.supabase.storage.from_(bucket_name).upload,
                file_path,
                file_buffer,
                file_options={"content-type": final_content_type, "upsert": "true"}
            )
            logger.info(f"Uploaded file: {file_path} to bucket: {bucket_name}")
            return file_path
        except Exception as e:
            logger.error(f"Failed to upload {file_name} to {bucket_name}: {e}")
            raise StorageError(f"Failed to upload file: {str(e)}")

    async def download_file(
        self,
        file_path: str,
        bucket: str = None
    ) -> bytes:
        if not file_path:
            raise ValueError("File path cannot be empty")
        bucket_name = bucket or self.safe_vault_bucket
        safe_path = sanitize_path_component(file_path)
        try:
            response = await self._retry_operation(
                self.supabase.storage.from_(bucket_name).download,
                safe_path
            )
            return response
        except Exception as e:
            logger.error(f"Failed to download {safe_path} from {bucket_name}: {e}")
            raise StorageError(f"Failed to download file: {str(e)}")

    async def delete_file(
        self,
        file_path: str,
        bucket: str = None
    ) -> bool:
        if not file_path:
            raise ValueError("File path cannot be empty")
        bucket_name = bucket or self.safe_vault_bucket
        safe_path = sanitize_path_component(file_path)
        try:
            await self._retry_operation(
                self.supabase.storage.from_(bucket_name).remove,
                [safe_path]
            )
            logger.info(f"Deleted file: {safe_path} from {bucket_name}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete {safe_path} from {bucket_name}: {e}")
            raise StorageError(f"Failed to delete file: {str(e)}")

    async def get_file_url(
        self,
        file_path: str,
        bucket: str = None,
        expires_in: int = 3600
    ) -> str:
        if not file_path:
            raise ValueError("File path cannot be empty")
        if expires_in <= 0:
            raise ValueError("expires_in must be positive")
        bucket_name = bucket or self.safe_vault_bucket
        safe_path = sanitize_path_component(file_path)
        try:
            response = await self._retry_operation(
                self.supabase.storage.from_(bucket_name).create_signed_url,
                safe_path,
                expires_in
            )
            logger.info(f"create_signed_url response type: {type(response)}, value: {response}")
            signed_url = (response or {}).get("signedURL") or (response or {}).get("signedUrl")
            if not signed_url and isinstance(response, str):
                signed_url = response
            if not signed_url:
                raise StorageError("Failed to generate signed URL: No URL returned")
            return signed_url
        except Exception as e:
            logger.error(f"Failed to generate signed URL for {safe_path} in {bucket_name}: {e}")
            raise StorageError(f"Failed to generate signed URL: {str(e)}")

    @staticmethod
    def calculate_hash(file_buffer: bytes, algorithm: str = "sha256") -> str:
        if not file_buffer:
            raise ValueError("File buffer cannot be empty")
        try:
            h = hashlib.new(algorithm)
            h.update(file_buffer)
            return h.hexdigest()
        except Exception as e:
            logger.error(f"Failed to calculate hash ({algorithm}): {e}")
            raise StorageError(f"Failed to calculate hash: {str(e)}")

    async def file_exists(
        self,
        file_path: str,
        bucket: str = None
    ) -> bool:
        if not file_path:
            return False
        bucket_name = bucket or self.safe_vault_bucket
        safe_path = sanitize_path_component(file_path)
        try:
            self.supabase.storage.from_(bucket_name).get_public_url(safe_path)
            return True
        except Exception:
            return False

    async def get_file_info(
        self,
        file_path: str,
        bucket: str = None
    ) -> dict:
        if not file_path:
            raise ValueError("File path cannot be empty")
        bucket_name = bucket or self.safe_vault_bucket
        safe_path = sanitize_path_component(file_path)
        try:
            public_url = self.supabase.storage.from_(bucket_name).get_public_url(safe_path)
            return {"path": safe_path, "bucket": bucket_name, "public_url": public_url, "exists": True}
        except Exception as e:
            logger.error(f"Failed to get file info for {safe_path} in {bucket_name}: {e}")
            raise StorageError(f"Failed to get file info: {str(e)}")


class StorageError(Exception):
    """Custom exception for storage-related errors."""
    pass


# Singleton instance
storage_service = StorageService()
