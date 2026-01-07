"""
Kill Switch Engine
Instant content revocation and dispute management.
"""
from datetime import datetime
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import hashlib


class DisputeStatus:
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    RESOLVED_OWNER = "resolved_owner_wins"
    RESOLVED_CLAIMANT = "resolved_claimant_wins"
    DISMISSED = "dismissed"


class ContentDispute(BaseModel):
    """Active content dispute"""
    dispute_id: str
    asset_id: str
    asset_hash: str
    owner_id: str
    claimant_id: Optional[str]
    reason: str
    status: str
    created_at: datetime
    resolved_at: Optional[datetime]
    kill_switch_active: bool
    affected_urls: List[str]


class KillSwitchEngine:
    """Content revocation and dispute management"""
    
    def __init__(self):
        self.active_disputes: Dict[str, ContentDispute] = {}
        self.revoked_assets: Dict[str, Dict[str, Any]] = {}
    
    def activate_kill_switch(
        self,
        asset_id: str,
        asset_hash: str,
        owner_id: str,
        reason: str,
        affected_urls: List[str] = None
    ) -> ContentDispute:
        """Activate kill switch for an asset"""
        dispute_id = self._generate_dispute_id(asset_id, owner_id)
        
        dispute = ContentDispute(
            dispute_id=dispute_id,
            asset_id=asset_id,
            asset_hash=asset_hash,
            owner_id=owner_id,
            claimant_id=None,
            reason=reason,
            status=DisputeStatus.PENDING,
            created_at=datetime.utcnow(),
            resolved_at=None,
            kill_switch_active=True,
            affected_urls=affected_urls or []
        )
        
        self.active_disputes[dispute_id] = dispute
        
        # Mark asset as revoked
        self.revoked_assets[asset_hash] = {
            "dispute_id": dispute_id,
            "revoked_at": datetime.utcnow().isoformat(),
            "reason": reason,
            "message": "Content Under Dispute"
        }
        
        return dispute
    
    def _generate_dispute_id(self, asset_id: str, owner_id: str) -> str:
        """Generate unique dispute ID"""
        data = f"{asset_id}{owner_id}{datetime.utcnow().isoformat()}"
        return f"DISPUTE-{hashlib.sha256(data.encode()).hexdigest()[:10].upper()}"
    
    def check_asset_status(self, asset_hash: str) -> Dict[str, Any]:
        """Check if an asset is under dispute"""
        if asset_hash in self.revoked_assets:
            revocation = self.revoked_assets[asset_hash]
            return {
                "status": "revoked",
                "display": True,
                "message": revocation["message"],
                "dispute_id": revocation["dispute_id"],
                "blur_content": True,
                "show_warning": True
            }
        
        return {
            "status": "active",
            "display": False,
            "message": None,
            "blur_content": False,
            "show_warning": False
        }
    
    def deactivate_kill_switch(self, dispute_id: str, resolution: str) -> bool:
        """Deactivate kill switch and resolve dispute"""
        dispute = self.active_disputes.get(dispute_id)
        if not dispute:
            return False
        
        dispute.kill_switch_active = False
        dispute.status = resolution
        dispute.resolved_at = datetime.utcnow()
        
        # Remove from revoked assets
        if dispute.asset_hash in self.revoked_assets:
            del self.revoked_assets[dispute.asset_hash]
        
        return True
    
    def get_dispute_banner(self, asset_hash: str) -> Dict[str, Any]:
        """Get the dispute banner to display on content"""
        status = self.check_asset_status(asset_hash)
        
        if status["status"] == "revoked":
            return {
                "show": True,
                "type": "dispute",
                "background": "#1a1a1a",
                "text_color": "#ff4444",
                "title": "⚠️ CONTENT UNDER DISPUTE",
                "message": "This content has been flagged by the original creator. Viewing is restricted pending investigation.",
                "actions": [
                    {"label": "Learn More", "url": f"https://cvber.app/dispute/{status['dispute_id']}"},
                    {"label": "Report Error", "url": "https://cvber.app/support"}
                ]
            }
        
        return {"show": False}
    
    def generate_infringer_report(self, disputes: List[ContentDispute]) -> Dict[str, Any]:
        """Generate a report on repeat infringers"""
        infringer_counts: Dict[str, int] = {}
        
        for dispute in disputes:
            for url in dispute.affected_urls:
                # Extract domain
                from urllib.parse import urlparse
                domain = urlparse(url).netloc
                infringer_counts[domain] = infringer_counts.get(domain, 0) + 1
        
        # Sort by count
        sorted_infringers = sorted(infringer_counts.items(), key=lambda x: x[1], reverse=True)
        
        return {
            "report_type": "CVBER Infringer Report",
            "generated_at": datetime.utcnow().isoformat(),
            "total_disputes": len(disputes),
            "top_infringers": [
                {
                    "domain": domain,
                    "violation_count": count,
                    "risk_level": "critical" if count > 10 else "high" if count > 5 else "medium"
                }
                for domain, count in sorted_infringers[:20]
            ],
            "recommendation": "Share this report with platform trust & safety teams to expedite enforcement."
        }


# Singleton instance
kill_switch = KillSwitchEngine()
