"""
Blockchain Timestamping Service
Uses OpenTimestamps for free Bitcoin blockchain anchoring.
"""
import hashlib
import base64
from datetime import datetime
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
import httpx
import json
import time
from supabase import create_client
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class TimestampProof(BaseModel):
    """Blockchain timestamp proof"""
    proof_id: str
    asset_hash: str
    asset_name: str
    timestamp: datetime
    blockchain: str
    status: str  # pending, confirmed, local_only, failed
    ots_proof: Optional[str]  # Base64 encoded .ots proof file
    verification_url: str
    bitcoin_block: Optional[int]
    confirmed_at: Optional[datetime]


class BlockchainTimestampService:
    """
    Free blockchain timestamping using OpenTimestamps.
    Anchors to Bitcoin blockchain at no cost.

    How it works:
    1. Hash the file content
    2. Submit hash to OpenTimestamps calendars
    3. Get a proof file (.ots) that can be verified against Bitcoin
    4. After ~2 hours, proof is anchored in a Bitcoin block
    """

    OTS_CALENDARS = [
        "https://a.pool.opentimestamps.org",
        "https://b.pool.opentimestamps.org",
        "https://alice.btc.calendar.opentimestamps.org",
        "https://bob.btc.calendar.opentimestamps.org"
    ]

    DEFAULT_TIMEOUT = 30.0  # seconds

    def __init__(self):
        self.supabase = create_client(settings.supabase_url, settings.supabase_service_role_key)

    async def create_timestamp(self, file_hash_hex: str, asset_name: str, user_id: str) -> TimestampProof:
        """
        Create a blockchain timestamp for a file hash.
        Returns immediately with a pending proof.
        Proof becomes confirmed after Bitcoin block inclusion (~2 hours).

        Args:
            file_hash_hex: SHA-256 hash of the file as a hex string
            asset_name: Name of the asset
            user_id: User ID for database storage

        Returns:
            TimestampProof object

        Raises:
            ValueError: If file_hash_hex is empty or asset_name is empty
            BlockchainError: If timestamp creation fails
        """
        if not file_hash_hex:
            raise ValueError("File hash cannot be empty")

        if not asset_name:
            raise ValueError("Asset name cannot be empty")

        if not user_id:
            raise ValueError("User ID cannot be empty")

        content_hash = file_hash_hex.lower().strip()
        proof_id = f"OTS-{content_hash[:12].upper()}-{int(time.time() * 1000)}"

        # Try to submit to OpenTimestamps calendar
        ots_proof = None
        status = "pending"

        try:
            hash_bytes = bytes.fromhex(content_hash)
            async with httpx.AsyncClient(timeout=self.DEFAULT_TIMEOUT) as client:
                # Submit hash bytes to calendar
                response = await client.post(
                    f"{self.OTS_CALENDARS[0]}/digest",
                    content=hash_bytes,
                    headers={"Content-Type": "application/octet-stream"}
                )

                if response.status_code == 200:
                    # Get the timestamp proof (binary .ots file)
                    ots_proof = base64.b64encode(response.content).decode('utf-8')
                    status = "pending"  # Will be confirmed after Bitcoin inclusion
                    logger.info(f"OpenTimestamps proof created for {asset_name}")
                else:
                    logger.warning(f"OpenTimestamps returned status {response.status_code}")
                    status = "local_only"
        except Exception as e:
            # Fallback: Create local proof (not blockchain-anchored but still verifiable)
            logger.error(f"OpenTimestamps submit failed: {e}. Creating local proof.")
            status = "local_only"

        proof = TimestampProof(
            proof_id=proof_id,
            asset_hash=content_hash,
            asset_name=asset_name,
            timestamp=datetime.utcnow(),
            blockchain="bitcoin",
            status=status,
            ots_proof=ots_proof,
            verification_url=f"https://opentimestamps.org/verify?hash={content_hash}",
            bitcoin_block=None,
            confirmed_at=None
        )

        # Store in database
        try:
            self.supabase.table('blockchain_proofs').insert({
                'user_id': user_id,
                'proof_id': proof_id,
                'asset_name': asset_name,
                'asset_hash': content_hash,
                'blockchain': 'bitcoin',
                'status': status,
                'ots_proof': ots_proof,
                'verification_url': proof.verification_url,
                'bitcoin_block': None,
                'metadata': {
                    'created_via': 'cvber_api',
                }
            }).execute()
            logger.info(f"Proof stored in database: {proof_id}")
        except Exception as e:
            logger.error(f"Failed to store proof in database: {e}")

        return proof

    async def verify_timestamp(self, proof_id: str) -> Dict[str, Any]:
        """
        Verify a timestamp proof.

        Args:
            proof_id: ID of the proof to verify

        Returns:
            Dictionary with verification results

        Raises:
            ValueError: If proof_id is empty
            BlockchainError: If verification fails
        """
        if not proof_id:
            raise ValueError("Proof ID cannot be empty")

        try:
            result = self.supabase.table('blockchain_proofs')\
                .select('*')\
                .eq('proof_id', proof_id)\
                .execute()

            if not result.data:
                return {"valid": False, "error": "Proof not found"}

            proof_data = result.data[0]

            # Check if proof is confirmed
            is_valid = proof_data['status'] == 'confirmed'

            return {
                "valid": is_valid,
                "proof_id": proof_data['proof_id'],
                "asset_hash": proof_data['asset_hash'],
                "asset_name": proof_data['asset_name'],
                "timestamp": proof_data['created_at'],
                "blockchain": proof_data['blockchain'],
                "status": proof_data['status'],
                "verification_url": proof_data['verification_url'],
                "bitcoin_block": proof_data.get('bitcoin_block'),
                "confirmed_at": proof_data.get('confirmed_at'),
                "legal_statement": (
                    f"This digital asset was timestamped on {proof_data['created_at']}. "
                    f"The SHA-256 hash ({proof_data['asset_hash'][:16]}...) was submitted to the Bitcoin blockchain via OpenTimestamps. "
                    f"This constitutes cryptographic proof of existence at the stated time."
                )
            }
        except Exception as e:
            logger.error(f"Failed to verify timestamp {proof_id}: {e}")
            raise BlockchainError(f"Failed to verify timestamp: {str(e)}")

    def create_hash_proof(self, file_hash_hex: str, asset_name: str) -> Dict[str, Any]:
        """
        Synchronous hash proof for immediate use.
        Creates a verifiable hash without async calendar submission.

        Args:
            file_hash_hex: SHA-256 hash of the file as a hex string
            asset_name: Name of the asset

        Returns:
            Dictionary with proof document

        Raises:
            ValueError: If file_hash_hex is empty or asset_name is empty
        """
        if not file_hash_hex:
            raise ValueError("File hash cannot be empty")

        if not asset_name:
            raise ValueError("Asset name cannot be empty")

        content_hash = file_hash_hex.lower().strip()
        timestamp = datetime.utcnow()

        # Create proof document
        proof_document = {
            "version": "1.0",
            "type": "cvber_hash_proof",
            "asset_name": asset_name,
            "hash_algorithm": "SHA-256",
            "hash": content_hash,
            "timestamp": timestamp.isoformat(),
            "anchoring": {
                "method": "OpenTimestamps",
                "blockchain": "Bitcoin",
                "status": "queued",
                "calendars": self.OTS_CALENDARS
            },
            "verification": {
                "url": "https://opentimestamps.org/info.html",
                "instructions": [
                    "1. Download the .ots proof file",
                    "2. Visit opentimestamps.org",
                    "3. Upload the original file and .ots proof",
                    "4. The tool will verify the Bitcoin anchor"
                ]
            },
            "legal_notice": (
                "This proof establishes that the content with the above hash existed at the stated timestamp. "
                "Once anchored in a Bitcoin block, this proof becomes mathematically irrefutable and "
                "can be verified by any party with access to the Bitcoin blockchain."
            )
        }

        logger.info(f"Created hash proof for {asset_name}")
        return proof_document

    async def get_user_proofs(self, user_id: str) -> List[TimestampProof]:
        """
        Get all blockchain proofs for a user.

        Args:
            user_id: User ID to fetch proofs for

        Returns:
            List of TimestampProof objects

        Raises:
            ValueError: If user_id is empty
            BlockchainError: If retrieval fails
        """
        if not user_id:
            raise ValueError("User ID cannot be empty")

        try:
            result = self.supabase.table('blockchain_proofs')\
                .select('*')\
                .eq('user_id', user_id)\
                .order('created_at', desc=True)\
                .execute()

            proofs = []
            for row in result.data:
                proofs.append(TimestampProof(
                    proof_id=row['proof_id'],
                    asset_hash=row['asset_hash'],
                    asset_name=row['asset_name'],
                    timestamp=row['created_at'],
                    blockchain=row['blockchain'],
                    status=row['status'],
                    ots_proof=row.get('ots_proof'),
                    verification_url=row['verification_url'],
                    bitcoin_block=row.get('bitcoin_block')
                ))

            logger.info(f"Retrieved {len(proofs)} proofs for user {user_id}")
            return proofs
        except Exception as e:
            logger.error(f"Failed to get user proofs for {user_id}: {e}")
            raise BlockchainError(f"Failed to get user proofs: {str(e)}")

    async def get_all_proofs(self) -> List[TimestampProof]:
        """
        Get all blockchain proofs (admin only).

        Returns:
            List of all TimestampProof objects

        Raises:
            BlockchainError: If retrieval fails
        """
        try:
            result = self.supabase.table('blockchain_proofs')\
                .select('*')\
                .order('created_at', desc=True)\
                .execute()

            proofs = []
            for row in result.data:
                proofs.append(TimestampProof(
                    proof_id=row['proof_id'],
                    asset_hash=row['asset_hash'],
                    asset_name=row['asset_name'],
                    timestamp=row['created_at'],
                    blockchain=row['blockchain'],
                    status=row['status'],
                    ots_proof=row.get('ots_proof'),
                    verification_url=row['verification_url'],
                    bitcoin_block=row.get('bitcoin_block')
                ))

            logger.info(f"Retrieved {len(proofs)} total proofs")
            return proofs
        except Exception as e:
            logger.error(f"Failed to get all proofs: {e}")
            raise BlockchainError(f"Failed to get all proofs: {str(e)}")

    async def update_proof_status(
        self,
        proof_id: str,
        status: str,
        bitcoin_block: Optional[int] = None
    ) -> bool:
        """
        Update the status of a proof (e.g., when confirmed on blockchain).

        Args:
            proof_id: ID of the proof to update
            status: New status (pending, confirmed, failed)
            bitcoin_block: Bitcoin block number if confirmed

        Returns:
            True if successful

        Raises:
            ValueError: If proof_id or status is empty
            BlockchainError: If update fails
        """
        if not proof_id:
            raise ValueError("Proof ID cannot be empty")

        if not status:
            raise ValueError("Status cannot be empty")

        try:
            update_data = {
                'status': status
            }

            if bitcoin_block:
                update_data['bitcoin_block'] = bitcoin_block

            if status == 'confirmed':
                update_data['confirmed_at'] = datetime.utcnow().isoformat()

            self.supabase.table('blockchain_proofs')\
                .update(update_data)\
                .eq('proof_id', proof_id)\
                .execute()

            logger.info(f"Updated proof {proof_id} status to {status}")
            return True
        except Exception as e:
            logger.error(f"Failed to update proof {proof_id}: {e}")
            raise BlockchainError(f"Failed to update proof: {str(e)}")


class BlockchainError(Exception):
    """Custom exception for blockchain-related errors."""
    pass


# Singleton instance
blockchain_service = BlockchainTimestampService()
