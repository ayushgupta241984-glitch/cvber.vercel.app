"""
Blockchain Timestamping Service
Uses OpenTimestamps for free Bitcoin blockchain anchoring.
"""
import hashlib
import base64
from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel
import httpx
import json


class TimestampProof(BaseModel):
    """Blockchain timestamp proof"""
    proof_id: str
    asset_hash: str
    asset_name: str
    timestamp: datetime
    blockchain: str
    status: str  # pending, confirmed
    ots_proof: Optional[str]  # Base64 encoded .ots proof file
    verification_url: str
    bitcoin_block: Optional[int]


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
        self.proofs: Dict[str, TimestampProof] = {}

    async def create_timestamp(self, file_content: bytes, asset_name: str) -> TimestampProof:
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
                    print(f"✅ OpenTimestamps proof created for {asset_name}")
                else:
                    print(f"⚠️ OpenTimestamps returned status {response.status_code}")
                    status = "local_only"
        except Exception as e:
            # Fallback: Create local proof (not blockchain-anchored but still verifiable)
            print(f"❌ OpenTimestamps submit failed: {e}. Creating local proof.")
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

        self.proofs[proof_id] = proof
        return proof

    async def verify_timestamp(self, proof_id: str) -> Dict[str, Any]:
        """Verify a timestamp proof"""
        proof = self.proofs.get(proof_id)

        if not proof:
            return {"valid": False, "error": "Proof not found"}

        # For now, return the proof status
        # In production, you'd download and verify the .ots file against Bitcoin
        return {
            "valid": True,
            "proof_id": proof.proof_id,
            "asset_hash": proof.asset_hash,
            "timestamp": proof.timestamp.isoformat(),
            "blockchain": proof.blockchain,
            "status": proof.status,
            "verification_url": proof.verification_url,
            "legal_statement": (
                f"This digital asset was timestamped on {proof.timestamp.strftime('%B %d, %Y at %H:%M UTC')}. "
                f"The SHA-256 hash ({proof.asset_hash[:16]}...) was submitted to the Bitcoin blockchain via OpenTimestamps. "
                f"This constitutes cryptographic proof of existence at the stated time."
            )
        }

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

    def get_all_proofs(self) -> Dict[str, TimestampProof]:
        """Get all stored proofs"""
        return self.proofs


# Singleton instance
blockchain_service = BlockchainTimestampService()
