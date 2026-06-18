"""
Theft Monitoring Engine
Reverse image scanning and theft detection.
"""
from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import hashlib


class TheftAlert(BaseModel):
    """Alert for detected theft"""
    alert_id: str
    asset_name: str
    asset_hash: str
    found_url: str
    platform: str
    confidence: float
    estimated_views: Optional[int]
    estimated_revenue_loss: Optional[float]
    detected_at: datetime
    status: str  # new, reviewed, actioned, dismissed


class MonitoredAsset(BaseModel):
    """Asset marked for monitoring"""
    asset_id: str
    asset_name: str
    asset_hash: str
    priority: str  # high, medium, low
    last_scanned: Optional[datetime]
    scan_frequency_hours: int
    alerts: List[TheftAlert]


class TheftMonitor:
    """Post-theft intelligence and monitoring"""
    
    # Average CPM rates for revenue estimation
    PLATFORM_CPM = {
        "youtube": 3.50,
        "instagram": 1.50,
        "tiktok": 0.50,
        "x": 0.25,
        "facebook": 2.00,
        "unknown": 0.50
    }
    
    def __init__(self):
        from supabase import create_client, Client
        from app.config import settings
        self.supabase: Client = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key
        )
    
    def register_asset(self, asset_id: str, asset_name: str, asset_hash: str, priority: str = "medium") -> MonitoredAsset:
        """Register an asset for monitoring in DB"""
        frequency = {"high": 24, "medium": 72, "low": 168}.get(priority, 72)
        
        asset = MonitoredAsset(
            asset_id=asset_id,
            asset_name=asset_name,
            asset_hash=asset_hash,
            priority=priority,
            last_scanned=None,
            scan_frequency_hours=frequency,
            alerts=[]
        )
        
        # Store in Supabase
        try:
            db_data = {
                "asset_id": asset_id,
                "asset_name": asset_name,
                "asset_hash": asset_hash,
                "priority": priority,
                "scan_frequency_hours": frequency
            }
            self.supabase.table("monitored_assets").insert(db_data).execute()
        except Exception as e:
            print(f"Database error registering asset: {e}")
            
        return asset
    
    def report_theft(self, asset_id: str, found_url: str, platform: str, estimated_views: int = None) -> TheftAlert:
        """Report a theft detection and store in DB"""
        # Generate alert ID
        alert_id = f"THEFT-{hashlib.sha256(f'{asset_id}{found_url}{datetime.now(timezone.utc)}'.encode()).hexdigest()[:10].upper()}"
        
        # Estimate revenue loss
        revenue_loss = None
        if estimated_views:
            cpm = self.PLATFORM_CPM.get(platform, self.PLATFORM_CPM["unknown"])
            revenue_loss = (estimated_views / 1000) * cpm
        
        alert = TheftAlert(
            alert_id=alert_id,
            asset_name="", # Will be filled from DB or join
            asset_hash="", 
            found_url=found_url,
            platform=platform,
            confidence=0.85,
            estimated_views=estimated_views,
            estimated_revenue_loss=revenue_loss,
            detected_at=datetime.now(timezone.utc),
            status="new"
        )
        
        # Store in Supabase
        try:
            db_data = {
                "alert_id": alert_id,
                "asset_id": asset_id,
                "found_url": found_url,
                "platform": platform,
                "confidence": 0.85,
                "estimated_views": estimated_views,
                "estimated_revenue_loss": revenue_loss,
                "status": "new",
                "detected_at": alert.detected_at.isoformat()
            }
            self.supabase.table("theft_alerts").insert(db_data).execute()
        except Exception as e:
            print(f"Database error reporting theft: {e}")
            
        return alert
    
    def _track_infringer(self, url: str, alert: TheftAlert):
        """
        Track repeat infringers. 
        Note: The hardening migration already added a theft_alerts table.
        We filter this table by domain to find repeat offenders.
        """
        pass # Functionality moved to get_infringer_report using dynamic DB queries

    def get_infringer_report(self, domain: str) -> Dict[str, Any]:
        """Generate infringer report for a domain using DB queries"""
        try:
            # Query theft_alerts for URLs matching the domain
            response = self.supabase.table("theft_alerts")\
                .select("*")\
                .ilike("found_url", f"%{domain}%")\
                .execute()
            
            records = response.data or []
            
            # Get unique asset IDs impacted
            asset_ids = list(set(r["asset_id"] for r in records))
            
            return {
                "domain": domain,
                "total_violations": len(records),
                "first_violation": records[0]["detected_at"] if records else None,
                "last_violation": records[-1]["detected_at"] if records else None,
                "affected_assets_count": len(asset_ids),
                "risk_level": "high" if len(records) > 5 else "medium" if len(records) > 2 else "low",
                "violations": records
            }
        except Exception as e:
            print(f"Error generating infringer report: {e}")
            return {"error": str(e)}

    def estimate_total_loss(self, asset_id: str) -> Dict[str, Any]:
        """Estimate total revenue loss from theft using DB queries"""
        try:
            # Get asset details
            asset_resp = self.supabase.table("monitored_assets")\
                .select("*")\
                .eq("asset_id", asset_id)\
                .single()\
                .execute()
            
            if not asset_resp.data:
                return {"error": "Asset not found"}
            
            asset_data = asset_resp.data
            
            # Get alerts for this asset
            alerts_resp = self.supabase.table("theft_alerts")\
                .select("*")\
                .eq("asset_id", asset_id)\
                .execute()
            
            alerts = alerts_resp.data or []
            
            total_views = sum(a.get("estimated_views") or 0 for a in alerts)
            total_loss = sum(a.get("estimated_revenue_loss") or 0 for a in alerts)
            
            return {
                "asset_name": asset_data.get("asset_name"),
                "total_theft_instances": len(alerts),
                "estimated_total_views": total_views,
                "estimated_total_loss_usd": round(total_loss, 2),
                "platforms_affected": list(set(a.get("platform") for a in alerts)),
                "legal_statement": f"This theft has resulted in an estimated ${total_loss:.2f} in lost revenue across {len(alerts)} unauthorized uses."
            }
        except Exception as e:
            print(f"Error estimating total loss: {e}")
            return {"error": str(e)}


# Singleton instance
theft_monitor = TheftMonitor()
