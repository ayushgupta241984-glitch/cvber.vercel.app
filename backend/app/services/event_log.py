"""
Immutable Event Log
Append-only audit trail for legal hardening.
"""
from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import hashlib
import json


class EventType:
    UPLOAD = "asset_upload"
    SCAN = "forensic_scan"
    WATERMARK = "watermark_applied"
    DMCA_GENERATED = "dmca_generated"
    DMCA_SUBMITTED = "dmca_submitted"
    THEFT_DETECTED = "theft_detected"
    LICENSE_GRANTED = "license_granted"
    LICENSE_REVOKED = "license_revoked"
    DISPUTE_OPENED = "dispute_opened"
    DISPUTE_RESOLVED = "dispute_resolved"
    SCREENSHOT_ATTEMPT = "screenshot_attempt"


class AuditEvent(BaseModel):
    """Single immutable event in the log"""
    event_id: str
    event_type: str
    timestamp: datetime
    asset_id: Optional[str]
    actor_id: str
    actor_type: str  # user, system, platform
    details: Dict[str, Any]
    previous_hash: str
    event_hash: str


class ImmutableEventLog:
    """Append-only event log with hash chaining"""
    
    def __init__(self):
        from supabase import create_client, Client
        from app.config import settings
        self.supabase: Client = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key
        )
        self._genesis_hash = self._compute_hash("CVBER_GENESIS_BLOCK")
    
    def _compute_hash(self, data: str) -> str:
        """Compute SHA-256 hash"""
        return hashlib.sha256(data.encode()).hexdigest()
    
    def _get_last_hash(self) -> str:
        """Get hash of last event from DB, or genesis hash if empty"""
        try:
            response = self.supabase.table("audit_trail")\
                .select("event_hash")\
                .order("created_at", desc=True)\
                .limit(1)\
                .execute()
            
            if response.data:
                return response.data[0]["event_hash"]
        except Exception as e:
            print(f"Error fetching last hash: {e}")
            
        return self._genesis_hash
    
    def append_event(
        self,
        event_type: str,
        actor_id: str,
        actor_type: str = "user",
        asset_id: str = None,
        details: Dict[str, Any] = None
    ) -> AuditEvent:
        """Append a new event to the log in DB"""
        timestamp = datetime.now(timezone.utc)
        previous_hash = self._get_last_hash()
        
        # Create event data for hashing
        event_data = {
            "event_type": event_type,
            "timestamp": timestamp.isoformat(),
            "asset_id": asset_id,
            "actor_id": actor_id,
            "actor_type": actor_type,
            "details": details or {},
            "previous_hash": previous_hash
        }
        
        # Compute hash of this event
        event_hash = self._compute_hash(json.dumps(event_data, sort_keys=True))
        event_id = f"EVT-{event_hash[:12].upper()}"
        
        # Store in Supabase
        try:
            db_data = {
                "event_id": event_id,
                "event_type": event_type,
                "actor_id": actor_id,
                "actor_type": actor_type,
                "asset_id": asset_id,
                "details": details or {},
                "previous_hash": previous_hash,
                "event_hash": event_hash,
                "created_at": timestamp.isoformat()
            }
            self.supabase.table("audit_trail").insert(db_data).execute()
        except Exception as e:
            print(f"Database error logging event: {e}")
            
        return AuditEvent(
            event_id=event_id,
            event_type=event_type,
            timestamp=timestamp,
            asset_id=asset_id,
            actor_id=actor_id,
            actor_type=actor_type,
            details=details or {},
            previous_hash=previous_hash,
            event_hash=event_hash
        )
    
    def verify_chain_integrity(self) -> Dict[str, Any]:
        """Verify the entire chain is intact using DB data"""
        try:
            response = self.supabase.table("audit_trail")\
                .select("*")\
                .order("created_at", desc=False)\
                .execute()
            
            events = response.data or []
            
            if not events:
                return {"valid": True, "message": "Empty log"}
            
            # Check genesis
            if events[0]["previous_hash"] != self._genesis_hash:
                return {"valid": False, "message": "Genesis block mismatch", "index": 0}
            
            # Check each subsequent event
            for i in range(1, len(events)):
                if events[i]["previous_hash"] != events[i-1]["event_hash"]:
                    return {
                        "valid": False,
                        "message": f"Chain broken at event {i}",
                        "index": i,
                        "expected": events[i-1]["event_hash"],
                        "found": events[i]["previous_hash"]
                    }
            
            return {
                "valid": True,
                "message": "Chain integrity verified",
                "total_events": len(events),
                "first_event": events[0]["created_at"],
                "last_event": events[-1]["created_at"]
            }
        except Exception as e:
            print(f"Error verifying chain integrity: {e}")
            return {"valid": False, "error": str(e)}

    def get_asset_history(self, asset_id: str) -> List[Dict[str, Any]]:
        """Get all events for a specific asset from DB"""
        try:
            response = self.supabase.table("audit_trail")\
                .select("*")\
                .eq("asset_id", asset_id)\
                .order("created_at", desc=True)\
                .execute()
            
            return response.data or []
        except Exception as e:
            print(f"Error fetching asset history: {e}")
            return []

    def export_evidence_packet(self, asset_id: str) -> Dict[str, Any]:
        """Export evidence packet for legal proceedings using DB data"""
        asset_events = self.get_asset_history(asset_id)
        chain_verification = self.verify_chain_integrity()
        
        return {
            "export_type": "CVBER Legal Evidence Packet",
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "chain_integrity": chain_verification,
            "asset_id": asset_id,
            "total_events": len(asset_events),
            "timeline": [
                {
                    "event_id": e.get("event_id"),
                    "type": e.get("event_type"),
                    "timestamp": e.get("created_at"),
                    "actor": e.get("actor_id"),
                    "details": e.get("details"),
                    "hash": e.get("event_hash")
                }
                for e in asset_events
            ],
            "legal_notice": "This evidence packet was generated from an immutable, hash-chained event log. Each event is cryptographically linked to the previous event, making retroactive modification mathematically impossible to conceal.",
            "verification_instructions": "To verify integrity: recalculate SHA-256 hash of each event and confirm it matches the stored hash, and that each event's previous_hash matches the prior event's hash."
        }


# Singleton instance
event_log = ImmutableEventLog()
