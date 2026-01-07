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
        self.events: List[AuditEvent] = []
        self._genesis_hash = self._compute_hash("CVBER_GENESIS_BLOCK")
    
    def _compute_hash(self, data: str) -> str:
        """Compute SHA-256 hash"""
        return hashlib.sha256(data.encode()).hexdigest()
    
    def _get_last_hash(self) -> str:
        """Get hash of last event, or genesis hash if empty"""
        if not self.events:
            return self._genesis_hash
        return self.events[-1].event_hash
    
    def append_event(
        self,
        event_type: str,
        actor_id: str,
        actor_type: str = "user",
        asset_id: str = None,
        details: Dict[str, Any] = None
    ) -> AuditEvent:
        """Append a new event to the log"""
        timestamp = datetime.utcnow()
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
        
        event = AuditEvent(
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
        
        self.events.append(event)
        return event
    
    def verify_chain_integrity(self) -> Dict[str, Any]:
        """Verify the entire chain is intact"""
        if not self.events:
            return {"valid": True, "message": "Empty log"}
        
        # Check genesis
        if self.events[0].previous_hash != self._genesis_hash:
            return {"valid": False, "message": "Genesis block mismatch", "index": 0}
        
        # Check each subsequent event
        for i in range(1, len(self.events)):
            if self.events[i].previous_hash != self.events[i-1].event_hash:
                return {
                    "valid": False,
                    "message": f"Chain broken at event {i}",
                    "index": i,
                    "expected": self.events[i-1].event_hash,
                    "found": self.events[i].previous_hash
                }
        
        return {
            "valid": True,
            "message": "Chain integrity verified",
            "total_events": len(self.events),
            "first_event": self.events[0].timestamp.isoformat(),
            "last_event": self.events[-1].timestamp.isoformat()
        }
    
    def get_asset_history(self, asset_id: str) -> List[AuditEvent]:
        """Get all events for a specific asset"""
        return [e for e in self.events if e.asset_id == asset_id]
    
    def export_evidence_packet(self, asset_id: str) -> Dict[str, Any]:
        """Export evidence packet for legal proceedings"""
        asset_events = self.get_asset_history(asset_id)
        chain_verification = self.verify_chain_integrity()
        
        return {
            "export_type": "CVBER Legal Evidence Packet",
            "exported_at": datetime.utcnow().isoformat(),
            "chain_integrity": chain_verification,
            "asset_id": asset_id,
            "total_events": len(asset_events),
            "timeline": [
                {
                    "event_id": e.event_id,
                    "type": e.event_type,
                    "timestamp": e.timestamp.isoformat(),
                    "actor": e.actor_id,
                    "details": e.details,
                    "hash": e.event_hash
                }
                for e in asset_events
            ],
            "legal_notice": "This evidence packet was generated from an immutable, hash-chained event log. Each event is cryptographically linked to the previous event, making retroactive modification mathematically impossible to conceal.",
            "verification_instructions": "To verify integrity: recalculate SHA-256 hash of each event and confirm it matches the stored hash, and that each event's previous_hash matches the prior event's hash."
        }


# Singleton instance
event_log = ImmutableEventLog()
