"""
Storage Service
Manages file storage in Supabase with proper error handling and logging.
"""
from supabase import create_client, Client
from app.config import settings
from typing import Optional, BinaryIO
from uuid import UUID
import hashlib
import logging

logger = logging.getLogger(__name__)


class StorageService:
    """Service for managing file storage in Supabase."""

    def __init__(self):
        self.supabase: Client = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key
        )
        self.safe_vault_bucket = "safe-vault"
        self.scan_results_bucket = "scan-results"

    async def upload_file(
        self,
        file_buffer: bytes,
        file_name: str,
        user_id: UUID,
        bucket: str = None
    ) -> str:
        """
        Upload file to Supabase storage.

        Args:
            file_buffer: File content as bytes
            file_name: Name of the file
            user_id: User ID for organizing files
            bucket: Storage bucket name (defaults to safe-vault)

        Returns:
            File path in storage

        Raises:
            ValueError: If file_buffer is empty
            StorageError: If upload fails
        """
        if not file_buffer:
            raise ValueError("File buffer cannot be empty")

        if not file_name:
            raise ValueError("File name cannot be empty")

        bucket_name = bucket or self.safe_vault_bucket

        # Create user-specific path
        file_path = f"{user_id}/{file_name}"

        try:
            # Upload to Supabase storage
            response = self.supabase.storage.from_(bucket_name).upload(
                file_path,
                file_buffer,
                file_options={"content-type": "application/octet-stream"}
            )

            logger.info(f"Successfully uploaded file: {file_path} to bucket: {bucket_name}")
            return file_path

        except Exception as e:
            logger.error(f"Failed to upload file {file_name} to bucket {bucket_name}: {e}")
            raise StorageError(f"Failed to upload file: {str(e)}")

    async def download_file(
        self,
        file_path: str,
        bucket: str = None
    ) -> bytes:
        """
        Download file from Supabase storage.

        Args:
            file_path: Path to file in storage
            bucket: Storage bucket name

        Returns:
            File content as bytes

        Raises:
            ValueError: If file_path is empty
            StorageError: If download fails
        """
        if not file_path:
            raise ValueError("File path cannot be empty")

        bucket_name = bucket or self.safe_vault_bucket

        try:
            response = self.supabase.storage.from_(bucket_name).download(file_path)
            logger.info(f"Successfully downloaded file: {file_path} from bucket: {bucket_name}")
            return response

        except Exception as e:
            logger.error(f"Failed to download file {file_path} from bucket {bucket_name}: {e}")
            raise StorageError(f"Failed to download file: {str(e)}")

    async def delete_file(
        self,
        file_path: str,
        bucket: str = None
    ) -> bool:
        """
        Delete file from Supabase storage.

        Args:
            file_path: Path to file in storage
            bucket: Storage bucket name

        Returns:
            True if successful

        Raises:
            ValueError: If file_path is empty
            StorageError: If deletion fails
        """
        if not file_path:
            raise ValueError("File path cannot be empty")

        bucket_name = bucket or self.safe_vault_bucket

        try:
            self.supabase.storage.from_(bucket_name).remove([file_path])
            logger.info(f"Successfully deleted file: {file_path} from bucket: {bucket_name}")
            return True

        except Exception as e:
            logger.error(f"Failed to delete file {file_path} from bucket {bucket_name}: {e}")
            raise StorageError(f"Failed to delete file: {str(e)}")

    async def get_file_url(
        self,
        file_path: str,
        bucket: str = None,
        expires_in: int = 3600
    ) -> str:
        """
        Get signed URL for file access.

        Args:
            file_path: Path to file in storage
            bucket: Storage bucket name
            expires_in: URL expiration time in seconds

        Returns:
            Signed URL

        Raises:
            ValueError: If file_path is empty or expires_in is invalid
            StorageError: If URL generation fails
        """
        if not file_path:
            raise ValueError("File path cannot be empty")

        if expires_in <= 0:
            raise ValueError("expires_in must be positive")

        bucket_name = bucket or self.safe_vault_bucket

        try:
            response = self.supabase.storage.from_(bucket_name).create_signed_url(
                file_path,
                expires_in
            )
            signed_url = response.get("signedURL")

            if not signed_url:
                raise StorageError("Failed to generate signed URL: No URL returned")

            logger.info(f"Generated signed URL for file: {file_path} in bucket: {bucket_name}")
            return signed_url

        except Exception as e:
            logger.error(f"Failed to generate signed URL for {file_path} in bucket {bucket_name}: {e}")
            raise StorageError(f"Failed to generate signed URL: {str(e)}")

    @staticmethod
    def calculate_hash(file_buffer: bytes) -> str:
        """
        Calculate SHA-256 hash of file content.

        Args:
            file_buffer: File content as bytes

        Returns:
            Hexadecimal hash string

        Raises:
            ValueError: If file_buffer is empty
        """
        if not file_buffer:
            raise ValueError("File buffer cannot be empty")

        try:
            return hashlib.sha256(file_buffer).hexdigest()
        except Exception as e:
            logger.error(f"Failed to calculate hash: {e}")
            raise StorageError(f"Failed to calculate hash: {str(e)}")

    async def file_exists(
        self,
        file_path: str,
        bucket: str = None
    ) -> bool:
        """
        Check if a file exists in storage.

        Args:
            file_path: Path to file in storage
            bucket: Storage bucket name

        Returns:
            True if file exists, False otherwise
        """
        if not file_path:
            return False

        bucket_name = bucket or self.safe_vault_bucket

        try:
            self.supabase.storage.from_(bucket_name).get_public_url(file_path)
            return True
        except Exception:
            return False

    async def get_file_info(
        self,
        file_path: str,
        bucket: str = None
    ) -> dict:
        """
        Get file metadata from storage.

        Args:
            file_path: Path to file in storage
            bucket: Storage bucket name

        Returns:
            Dictionary with file metadata

        Raises:
            ValueError: If file_path is empty
            StorageError: If metadata retrieval fails
        """
        if not file_path:
            raise ValueError("File path cannot be empty")

        bucket_name = bucket or self.safe_vault_bucket

        try:
            # Get public URL as a proxy for file existence
            public_url = self.supabase.storage.from_(bucket_name).get_public_url(file_path)

            return {
                "path": file_path,
                "bucket": bucket_name,
                "public_url": public_url,
                "exists": True
            }
        except Exception as e:
            logger.error(f"Failed to get file info for {file_path} in bucket {bucket_name}: {e}")
            raise StorageError(f"Failed to get file info: {str(e)}")


class StorageError(Exception):
    """Custom exception for storage-related errors."""
    pass


# Singleton instance
storage_service = StorageService()
