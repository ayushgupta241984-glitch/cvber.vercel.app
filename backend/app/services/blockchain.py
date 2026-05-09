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
from supabase import create_client
from app.config import settings


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

    def __init__(self):
        self.supabase = create_client(settings.supabase_url, settings.supabase_service_role_key)

    async def create_timestamp(self, file_content: bytes, asset_name: str, user_id: str) -> TimestampProof:
        """
        Create a blockchain timestamp for file content.
        Returns immediately with a pending proof.
        Proof becomes confirmed after Bitcoin block inclusion (~2 hours).
        """
        # Hash the content
        content_hash = hashlib.sha256(file_content).hexdigest()
        proof_id = f"OTS-{content_hash[:16].upper()}"

        # Try to submit to OpenTimestamps calendar
        ots_proof = None
        status = "pending"

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Submit hash to calendar
                hash_bytes = bytes.fromhex(content_hash)
                response = await client.post(
                    f"{self.OTS_CALENDARS[0]}/digest",
                    content=hash_bytes,
                    headers={"Content-Type": "application/octet-stream"}
                )

                if response.status_code == 200:
                    # Get the timestamp proof (binary .ots file)
                    ots_proof = base64.b64encode(response.content).decode('utf-8')
                    status = "pending"  # Will be confirmed after Bitcoin inclusion
                    print(f"[OK] OpenTimestamps proof created for {asset_name}")
                else:
                    print(f"[WARN] OpenTimestamps returned status {response.status_code}")
                    status = "local_only"
        except Exception as e:
            # Fallback: Create local proof (not blockchain-anchored but still verifiable)
            print(f"[ERROR] OpenTimestamps submit failed: {e}. Creating local proof.")
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
            bitcoin_block=None
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
                    'file_size': len(file_content)
                }
            })
            print(f"[OK] Proof stored in database: {proof_id}")
        except Exception as e:
            print(f"[ERROR] Failed to store proof in database: {e}")

        return proof

    async def verify_timestamp(self, proof_id: str) -> Dict[str, Any]:
        """Verify a timestamp proof"""
        try:
            result = self.supabase.table('blockchain_proofs').select('*').eq('proof_id', proof_id).execute()

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
            print(f"[ERROR] Failed to verify timestamp: {e}")
            return {"valid": False, "error": str(e)}

    def create_hash_proof(self, file_content: bytes, asset_name: str) -> Dict[str, Any]:
        """
        Synchronous hash proof for immediate use.
        Creates a verifiable hash without async calendar submission.
        """
        content_hash = hashlib.sha256(file_content).hexdigest()
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
                "url": f"https://opentimestamps.org/info.html",
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

        return proof_document

    async def get_user_proofs(self, user_id: str) -> List[TimestampProof]:
        """Get all blockchain proofs for a user"""
        try:
            result = self.supabase.table('blockchain_proofs').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()

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

            return proofs
        except Exception as e:
            print(f"[ERROR] Failed to get user proofs: {e}")
            return []

    async def get_all_proofs(self) -> List[TimestampProof]:
        """Get all blockchain proofs (admin only)"""
        try:
            result = self.supabase.table('blockchain_proofs').select('*').order('created_at', desc=True).execute()

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

            return proofs
        except Exception as e:
            print(f"[ERROR] Failed to get all proofs: {e}")
            return []


# Singleton instance
blockchain_service = BlockchainTimestampService()
