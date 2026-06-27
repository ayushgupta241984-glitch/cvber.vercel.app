"""
Kill Switch Engine
Instant content revocation and dispute management.
"""
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import hashlib

logger = logging.getLogger(__name__)


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
        from supabase import create_client, Client
        from app.config import settings
        self.supabase: Client = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key
        )
    
    def activate_kill_switch(
        self,
        asset_id: str,
        asset_hash: str,
        owner_id: str,
        reason: str,
        affected_urls: List[str] = None
    ) -> ContentDispute:
        """Activate kill switch for an asset and store in DB"""
        dispute_id = self._generate_dispute_id(asset_id, owner_id)
        
        dispute = ContentDispute(
            dispute_id=dispute_id,
            asset_id=asset_id,
            asset_hash=asset_hash,
            owner_id=owner_id,
            claimant_id=None,
            reason=reason,
            status=DisputeStatus.PENDING,
            created_at=datetime.now(timezone.utc),
            resolved_at=None,
            kill_switch_active=True,
            affected_urls=affected_urls or []
        )
        
        # Store in Supabase
        try:
            db_data = {
                "dispute_id": dispute_id,
                "asset_id": asset_id,
                "asset_hash": asset_hash,
                "owner_id": owner_id,
                "reason": reason,
                "status": DisputeStatus.PENDING,
                "kill_switch_active": True,
                "affected_urls": affected_urls or [],
                "created_at": dispute.created_at.isoformat()
            }
            self.supabase.table("disputes").insert(db_data).execute()
        except Exception as e:
            logger.error(f"Database error activating kill switch: {e}")
            
        return dispute
    
    def _generate_dispute_id(self, asset_id: str, owner_id: str) -> str:
        """Generate unique dispute ID"""
        data = f"{asset_id}{owner_id}{datetime.now(timezone.utc).isoformat()}"
        return f"DISPUTE-{hashlib.sha256(data.encode()).hexdigest()[:10].upper()}"
    
    def check_asset_status(self, asset_hash: str) -> Dict[str, Any]:
        """Check if an asset is under dispute using DB"""
        try:
            response = self.supabase.table("disputes")\
                .select("*")\
                .eq("asset_hash", asset_hash)\
                .eq("kill_switch_active", True)\
                .execute()
            
            if response.data:
                dispute = response.data[0]
                return {
                    "status": "revoked",
                    "display": True,
                    "message": "Content Under Dispute",
                    "dispute_id": dispute["dispute_id"],
                    "blur_content": True,
                    "show_warning": True
                }
        except Exception as e:
            logger.error(f"Error checking asset status: {e}")
        
        return {
            "status": "active",
            "display": False,
            "message": None,
            "blur_content": False,
            "show_warning": False
        }
    
    def deactivate_kill_switch(self, dispute_id: str, resolution: str) -> bool:
        """Deactivate kill switch and resolve dispute in DB"""
        try:
            self.supabase.table("disputes")\
                .update({
                    "kill_switch_active": False,
                    "status": resolution,
                    "resolved_at": datetime.now(timezone.utc).isoformat()
                })\
                .eq("dispute_id", dispute_id)\
                .execute()
            return True
        except Exception as e:
            logger.error(f"Error deactivating kill switch: {e}")
            return False
    
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
            "generated_at": datetime.now(timezone.utc).isoformat(),
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
