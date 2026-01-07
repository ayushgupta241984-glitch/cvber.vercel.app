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
        self.monitored_assets: Dict[str, MonitoredAsset] = {}
        self.infringer_database: Dict[str, List[Dict]] = {}  # Track repeat offenders
    
    def register_asset(self, asset_id: str, asset_name: str, asset_hash: str, priority: str = "medium") -> MonitoredAsset:
        """Register an asset for monitoring"""
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
        self.monitored_assets[asset_id] = asset
        return asset
    
    def report_theft(self, asset_id: str, found_url: str, platform: str, estimated_views: int = None) -> TheftAlert:
        """Report a theft detection"""
        asset = self.monitored_assets.get(asset_id)
        if not asset:
            raise ValueError(f"Asset {asset_id} not registered for monitoring")
        
        # Generate alert
        alert_id = f"THEFT-{hashlib.sha256(f'{asset_id}{found_url}{datetime.utcnow()}'.encode()).hexdigest()[:10].upper()}"
        
        # Estimate revenue loss
        revenue_loss = None
        if estimated_views:
            cpm = self.PLATFORM_CPM.get(platform, self.PLATFORM_CPM["unknown"])
            revenue_loss = (estimated_views / 1000) * cpm
        
        alert = TheftAlert(
            alert_id=alert_id,
            asset_name=asset.asset_name,
            asset_hash=asset.asset_hash,
            found_url=found_url,
            platform=platform,
            confidence=0.85,  # Default confidence
            estimated_views=estimated_views,
            estimated_revenue_loss=revenue_loss,
            detected_at=datetime.utcnow(),
            status="new"
        )
        
        asset.alerts.append(alert)
        
        # Track infringer
        self._track_infringer(found_url, alert)
        
        return alert
    
    def _track_infringer(self, url: str, alert: TheftAlert):
        """Track repeat infringers"""
        # Extract domain from URL
        from urllib.parse import urlparse
        domain = urlparse(url).netloc
        
        if domain not in self.infringer_database:
            self.infringer_database[domain] = []
        
        self.infringer_database[domain].append({
            "alert_id": alert.alert_id,
            "asset_name": alert.asset_name,
            "detected_at": alert.detected_at.isoformat(),
            "platform": alert.platform
        })
    
    def get_infringer_report(self, domain: str) -> Dict[str, Any]:
        """Generate infringer report for a domain"""
        records = self.infringer_database.get(domain, [])
        
        return {
            "domain": domain,
            "total_violations": len(records),
            "first_violation": records[0]["detected_at"] if records else None,
            "last_violation": records[-1]["detected_at"] if records else None,
            "affected_assets": list(set(r["asset_name"] for r in records)),
            "risk_level": "high" if len(records) > 5 else "medium" if len(records) > 2 else "low",
            "violations": records
        }
    
    def estimate_total_loss(self, asset_id: str) -> Dict[str, Any]:
        """Estimate total revenue loss from theft"""
        asset = self.monitored_assets.get(asset_id)
        if not asset:
            return {"error": "Asset not found"}
        
        total_views = sum(a.estimated_views or 0 for a in asset.alerts)
        total_loss = sum(a.estimated_revenue_loss or 0 for a in asset.alerts)
        
        return {
            "asset_name": asset.asset_name,
            "total_theft_instances": len(asset.alerts),
            "estimated_total_views": total_views,
            "estimated_total_loss_usd": round(total_loss, 2),
            "platforms_affected": list(set(a.platform for a in asset.alerts)),
            "legal_statement": f"This theft has resulted in an estimated ${total_loss:.2f} in lost revenue across {len(asset.alerts)} unauthorized uses."
        }


# Singleton instance
theft_monitor = TheftMonitor()
