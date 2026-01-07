"""
Enforcement API Router
Endpoints for DMCA, Trust Score, Licensing, Monitoring, and Kill Switch.
"""
from fastapi import APIRouter, HTTPException
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

from app.services.enforcement import enforcement_engine, DMCARequest
from app.services.trust_score import trust_engine, TrustFactors
from app.services.licensing import licensing_engine, LicenseType
from app.services.theft_monitor import theft_monitor
from app.services.kill_switch import kill_switch
from app.services.event_log import event_log, EventType

router = APIRouter(prefix="/api/enforcement", tags=["Enforcement"])


# ============== DMCA ENDPOINTS ==============

class GenerateDMCARequest(BaseModel):
    asset_name: str
    asset_hash: str
    originality_score: float
    forensic_summary: str
    infringement_url: str
    platform: str
    owner_name: str
    owner_email: str
    owner_address: Optional[str] = None


@router.post("/dmca/generate")
async def generate_dmca_notice(request: GenerateDMCARequest):
    """Generate a DMCA takedown notice"""
    dmca_request = DMCARequest(**request.dict())
    notice = enforcement_engine.generate_notice(dmca_request)
    
    # Log the event
    event_log.append_event(
        event_type=EventType.DMCA_GENERATED,
        actor_id=request.owner_email,
        asset_id=request.asset_hash,
        details={"notice_id": notice.notice_id, "platform": request.platform}
    )
    
    return {
        "success": True,
        "notice": notice.dict(),
        "instructions": enforcement_engine.get_submission_instructions(request.platform)
    }


@router.get("/dmca/platforms")
async def get_supported_platforms():
    """Get supported platforms for DMCA submission"""
    return {
        "platforms": list(enforcement_engine.PLATFORM_CONTACTS.keys()),
        "details": enforcement_engine.PLATFORM_CONTACTS
    }


# ============== TRUST SCORE ENDPOINTS ==============

class CalculateTrustRequest(BaseModel):
    originality_average: float
    upload_count: int
    verified_originals: int
    disputes_won: int = 0
    disputes_lost: int = 0
    account_age_days: int = 0
    verification_level: str = "basic"


@router.post("/trust/calculate")
async def calculate_trust_score(request: CalculateTrustRequest):
    """Calculate trust score for a creator"""
    factors = TrustFactors(**request.dict())
    score = trust_engine.calculate_score(factors)
    return score.dict()


@router.post("/trust/certificate")
async def generate_trust_certificate(request: CalculateTrustRequest, creator_name: str):
    """Generate a Proof of Authenticity certificate"""
    factors = TrustFactors(**request.dict())
    score = trust_engine.calculate_score(factors)
    certificate = trust_engine.generate_proof_of_authenticity(score, creator_name)
    return certificate


# ============== LICENSING ENDPOINTS ==============

class CreateLicenseRequest(BaseModel):
    asset_hash: str
    asset_name: str
    license_type: str
    licensee_name: str
    licensee_email: str
    licensor_name: str


@router.post("/license/create")
async def create_license(request: CreateLicenseRequest):
    """Create a new license"""
    license = licensing_engine.generate_license(
        asset_hash=request.asset_hash,
        asset_name=request.asset_name,
        license_type=request.license_type,
        licensee_name=request.licensee_name,
        licensee_email=request.licensee_email,
        licensor_name=request.licensor_name
    )
    
    # Log the event
    event_log.append_event(
        event_type=EventType.LICENSE_GRANTED,
        actor_id=request.licensor_name,
        asset_id=request.asset_hash,
        details={"license_id": license.license_id, "type": request.license_type}
    )
    
    return {
        "success": True,
        "license": license.dict(),
        "metadata": licensing_engine.generate_license_metadata(license)
    }


@router.get("/license/verify/{license_id}")
async def verify_license(license_id: str):
    """Verify a license is valid"""
    return licensing_engine.verify_license(license_id)


@router.get("/license/types")
async def get_license_types():
    """Get available license types"""
    return {
        "types": [LicenseType.PERSONAL, LicenseType.COMMERCIAL, LicenseType.EXCLUSIVE, LicenseType.EDITORIAL],
        "terms": licensing_engine.LICENSE_TERMS
    }


# ============== THEFT MONITORING ENDPOINTS ==============

class RegisterMonitorRequest(BaseModel):
    asset_id: str
    asset_name: str
    asset_hash: str
    priority: str = "medium"


class ReportTheftRequest(BaseModel):
    asset_id: str
    found_url: str
    platform: str
    estimated_views: Optional[int] = None


@router.post("/monitor/register")
async def register_for_monitoring(request: RegisterMonitorRequest):
    """Register an asset for theft monitoring"""
    asset = theft_monitor.register_asset(
        asset_id=request.asset_id,
        asset_name=request.asset_name,
        asset_hash=request.asset_hash,
        priority=request.priority
    )
    return {"success": True, "asset": asset.dict()}


@router.post("/monitor/report-theft")
async def report_theft(request: ReportTheftRequest):
    """Report a theft detection"""
    try:
        alert = theft_monitor.report_theft(
            asset_id=request.asset_id,
            found_url=request.found_url,
            platform=request.platform,
            estimated_views=request.estimated_views
        )
        
        # Log the event
        event_log.append_event(
            event_type=EventType.THEFT_DETECTED,
            actor_id="system",
            actor_type="system",
            asset_id=request.asset_id,
            details={"alert_id": alert.alert_id, "url": request.found_url}
        )
        
        return {"success": True, "alert": alert.dict()}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/monitor/loss-estimate/{asset_id}")
async def get_loss_estimate(asset_id: str):
    """Get estimated revenue loss from theft"""
    return theft_monitor.estimate_total_loss(asset_id)


@router.get("/monitor/infringer-report/{domain}")
async def get_infringer_report(domain: str):
    """Get report on a specific infringer"""
    return theft_monitor.get_infringer_report(domain)


# ============== KILL SWITCH ENDPOINTS ==============

class ActivateKillSwitchRequest(BaseModel):
    asset_id: str
    asset_hash: str
    owner_id: str
    reason: str
    affected_urls: Optional[List[str]] = None


@router.post("/killswitch/activate")
async def activate_kill_switch(request: ActivateKillSwitchRequest):
    """Activate kill switch for an asset"""
    dispute = kill_switch.activate_kill_switch(
        asset_id=request.asset_id,
        asset_hash=request.asset_hash,
        owner_id=request.owner_id,
        reason=request.reason,
        affected_urls=request.affected_urls
    )
    
    # Log the event
    event_log.append_event(
        event_type=EventType.DISPUTE_OPENED,
        actor_id=request.owner_id,
        asset_id=request.asset_id,
        details={"dispute_id": dispute.dispute_id, "reason": request.reason}
    )
    
    return {"success": True, "dispute": dispute.dict()}


@router.get("/killswitch/status/{asset_hash}")
async def check_kill_switch_status(asset_hash: str):
    """Check if an asset is under dispute"""
    return kill_switch.check_asset_status(asset_hash)


@router.get("/killswitch/banner/{asset_hash}")
async def get_dispute_banner(asset_hash: str):
    """Get dispute banner for display"""
    return kill_switch.get_dispute_banner(asset_hash)


@router.post("/killswitch/deactivate/{dispute_id}")
async def deactivate_kill_switch(dispute_id: str, resolution: str):
    """Deactivate kill switch and resolve dispute"""
    success = kill_switch.deactivate_kill_switch(dispute_id, resolution)
    
    if success:
        event_log.append_event(
            event_type=EventType.DISPUTE_RESOLVED,
            actor_id="system",
            actor_type="system",
            details={"dispute_id": dispute_id, "resolution": resolution}
        )
    
    return {"success": success}


# ============== EVENT LOG ENDPOINTS ==============

@router.get("/audit/verify-chain")
async def verify_chain_integrity():
    """Verify the integrity of the event log chain"""
    return event_log.verify_chain_integrity()


@router.get("/audit/asset-history/{asset_id}")
async def get_asset_history(asset_id: str):
    """Get event history for an asset"""
    events = event_log.get_asset_history(asset_id)
    return {"asset_id": asset_id, "events": [e.dict() for e in events]}


@router.get("/audit/evidence-packet/{asset_id}")
async def export_evidence_packet(asset_id: str):
    """Export evidence packet for legal proceedings"""
    return event_log.export_evidence_packet(asset_id)
