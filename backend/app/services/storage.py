from supabase import create_client, Client
from app.config import settings
from typing import Optional, BinaryIO
from uuid import UUID
import hashlib


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
        """
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
            
            return file_path
            
        except Exception as e:
            raise Exception(f"Failed to upload file: {str(e)}")
    
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
        """
        bucket_name = bucket or self.safe_vault_bucket
        
        try:
            response = self.supabase.storage.from_(bucket_name).download(file_path)
            return response
            
        except Exception as e:
            raise Exception(f"Failed to download file: {str(e)}")
    
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
        """
        bucket_name = bucket or self.safe_vault_bucket
        
        try:
            self.supabase.storage.from_(bucket_name).remove([file_path])
            return True
            
        except Exception as e:
            raise Exception(f"Failed to delete file: {str(e)}")
    
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
        """
        bucket_name = bucket or self.safe_vault_bucket
        
        try:
            response = self.supabase.storage.from_(bucket_name).create_signed_url(
                file_path,
                expires_in
            )
            return response.get("signedURL")
            
        except Exception as e:
            raise Exception(f"Failed to generate signed URL: {str(e)}")
    
    @staticmethod
    def calculate_hash(file_buffer: bytes) -> str:
        """Calculate SHA-256 hash of file content."""
        return hashlib.sha256(file_buffer).hexdigest()


# Singleton instance
storage_service = StorageService()
