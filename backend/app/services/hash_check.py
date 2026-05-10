"""
SHA-256 Hash Check Service
Checks for exact duplicate files in the CVBER registry.
"""
import hashlib
import logging
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
from supabase import create_client
from app.config import settings

logger = logging.getLogger(__name__)


class HashMatch(BaseModel):
    """Result of hash comparison"""
    is_match: bool
    existing_asset_id: Optional[str]
    existing_asset_name: Optional[str]
    existing_owner_id: Optional[str]
    match_timestamp: Optional[str]
    similarity_score: float  # 1.0 for exact match


class HashCheckService:
    """
    SHA-256 hash checking service.
    Detects exact duplicate files in the CVBER registry.
    """

    def __init__(self):
        self.supabase = create_client(settings.supabase_url, settings.supabase_service_role_key)

    def calculate_hash(self, file_content: bytes) -> str:
        """
        Calculate SHA-256 hash of file content.

        Args:
            file_content: File content as bytes

        Returns:
            Hexadecimal hash string

        Raises:
            ValueError: If file_content is empty
        """
        if not file_content:
            raise ValueError("File content cannot be empty")

        try:
            return hashlib.sha256(file_content).hexdigest()
        except Exception as e:
            logger.error(f"Failed to calculate SHA-256 hash: {e}")
            raise HashCheckError(f"Failed to calculate hash: {str(e)}")

    async def check_for_duplicate(
        self,
        file_hash: str,
        exclude_asset_id: Optional[str] = None
    ) -> HashMatch:
        """
        Check if a file with this hash already exists in the registry.

        Args:
            file_hash: SHA-256 hash to check
            exclude_asset_id: Asset ID to exclude (for updates)

        Returns:
            HashMatch object with match results

        Raises:
            ValueError: If file_hash is empty
            HashCheckError: If check fails
        """
        if not file_hash:
            raise ValueError("File hash cannot be empty")

        try:
            # Query database for matching hash
            query = self.supabase.table('registered_assets').select('*').eq('file_hash', file_hash)

            if exclude_asset_id:
                query = query.neq('id', exclude_asset_id)

            result = query.execute()

            if result.data and len(result.data) > 0:
                # Found a match
                existing = result.data[0]
                return HashMatch(
                    is_match=True,
                    existing_asset_id=existing.get('id'),
                    existing_asset_name=existing.get('asset_name'),
                    existing_owner_id=existing.get('user_id'),
                    match_timestamp=existing.get('created_at'),
                    similarity_score=1.0  # Exact match = 100% similarity
                )

            # No match found
            return HashMatch(
                is_match=False,
                existing_asset_id=None,
                existing_asset_name=None,
                existing_owner_id=None,
                match_timestamp=None,
                similarity_score=0.0
            )

        except Exception as e:
            logger.error(f"Failed to check for duplicate hash {file_hash}: {e}")
            raise HashCheckError(f"Failed to check for duplicate: {str(e)}")

    async def get_hash_history(
        self,
        asset_id: str
    ) -> List[Dict[str, Any]]:
        """
        Get hash history for an asset (useful for tracking).

        Args:
            asset_id: Asset ID to get history for

        Returns:
            List of hash history records

        Raises:
            ValueError: If asset_id is empty
            HashCheckError: If retrieval fails
        """
        if not asset_id:
            raise ValueError("Asset ID cannot be empty")

        try:
            result = self.supabase.table('hash_history')\
                .select('*')\
                .eq('asset_id', asset_id)\
                .order('created_at', desc=True)\
                .execute()

            return result.data or []

        except Exception as e:
            logger.error(f"Failed to get hash history for {asset_id}: {e}")
            raise HashCheckError(f"Failed to get hash history: {str(e)}")

    async def record_hash(
        self,
        asset_id: str,
        file_hash: str,
        file_size: int,
        user_id: str
    ) -> bool:
        """
        Record a hash in the hash history.

        Args:
            asset_id: Asset ID
            file_hash: SHA-256 hash
            file_size: File size in bytes
            user_id: User ID

        Returns:
            True if successful

        Raises:
            ValueError: If any required parameter is empty
            HashCheckError: If recording fails
        """
        if not asset_id or not file_hash or not user_id:
            raise ValueError("All parameters are required")

        try:
            self.supabase.table('hash_history').insert({
                'asset_id': asset_id,
                'file_hash': file_hash,
                'file_size': file_size,
                'user_id': user_id,
                'created_at': 'now()'
            }).execute()

            logger.info(f"Recorded hash for asset {asset_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to record hash for asset {asset_id}: {e}")
            raise HashCheckError(f"Failed to record hash: {str(e)}")


class HashCheckError(Exception):
    """Custom exception for hash check errors."""
    pass


# Singleton instance
hash_check_service = HashCheckService()
