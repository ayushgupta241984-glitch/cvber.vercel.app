from typing import Optional, List
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Depends
from app.services.kill_switch import kill_switch
from app.services.event_log import event_log, EventType
from app.services.licensing import licensing_engine, LicenseType
from app.services.theft_monitor import theft_monitor
from app.services.enforcement import enforcement_engine, DMCARequest
from app.services.trust_score import trust_engine, TrustFactors
from app.dependencies import get_current_user
import logging

logger = logging.getLogger(__name__)

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
async def generate_dmca_notice(
    request: GenerateDMCARequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate a DMCA takedown notice"""
    try:
        # Security: Override owner_email with authenticated user's email to prevent spoofing
        request.owner_email = current_user["email"]
        dmca_request = DMCARequest(**request.dict())
        notice = enforcement_engine.generate_notice(dmca_request)

        # Log the event
        event_log.append_event(
            event_type=EventType.DMCA_GENERATED,
            actor_id=current_user["id"],
            asset_id=request.asset_hash,
            details={"notice_id": notice.notice_id, "platform": request.platform}
        )

        return {
            "success": True,
            "notice": notice.dict(),
            "instructions": enforcement_engine.get_submission_instructions(request.platform)
        }
    except Exception as e:
        logger.error(f"Failed to generate DMCA notice: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate DMCA notice")


@router.get("/dmca/platforms")
async def get_supported_platforms(current_user: dict = Depends(get_current_user)):
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
async def calculate_trust_score(
    request: CalculateTrustRequest,
    current_user: dict = Depends(get_current_user)
):
    """Calculate trust score for a creator"""
    try:
        factors = TrustFactors(**request.dict())
        score = trust_engine.calculate_score(factors)
        return score.dict()
    except Exception as e:
        logger.error(f"Failed to calculate trust score: {e}")
        raise HTTPException(status_code=500, detail="Failed to calculate trust score")


@router.post("/trust/certificate")
async def generate_trust_certificate(
    request: CalculateTrustRequest,
    creator_name: str,
    current_user: dict = Depends(get_current_user)
):
    """Generate a Proof of Authenticity certificate"""
    try:
        factors = TrustFactors(**request.dict())
        score = trust_engine.calculate_score(factors)
        certificate = trust_engine.generate_proof_of_authenticity(score, creator_name)
        return certificate
    except Exception as e:
        logger.error(f"Failed to generate trust certificate: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate trust certificate")


# ============== LICENSING ENDPOINTS ==============

class CreateLicenseRequest(BaseModel):
    asset_hash: str
    asset_name: str
    license_type: str
    licensee_name: str
    licensee_email: str
    licensor_name: str


@router.post("/license/create")
async def create_license(
    request: CreateLicenseRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create a new license"""
    try:
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
            actor_id=current_user["id"],
            asset_id=request.asset_hash,
            details={"license_id": license.license_id, "type": request.license_type}
        )

        return {
            "success": True,
            "license": license.dict(),
            "metadata": licensing_engine.generate_license_metadata(license)
        }
    except Exception as e:
        logger.error(f"Failed to create license: {e}")
        raise HTTPException(status_code=500, detail="Failed to create license")


@router.get("/license/verify/{license_id}")
async def verify_license(license_id: str, current_user: dict = Depends(get_current_user)):
    """Verify a license is valid"""
    return licensing_engine.verify_license(license_id)


@router.get("/license/types")
async def get_license_types(current_user: dict = Depends(get_current_user)):
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
async def register_for_monitoring(
    request: RegisterMonitorRequest,
    current_user: dict = Depends(get_current_user)
):
    """Register an asset for theft monitoring"""
    try:
        asset = theft_monitor.register_asset(
            asset_id=request.asset_id,
            asset_name=request.asset_name,
            asset_hash=request.asset_hash,
            priority=request.priority
        )
        return {"success": True, "asset": asset.dict()}
    except Exception as e:
        logger.error(f"Failed to register asset for monitoring: {e}")
        raise HTTPException(status_code=500, detail="Failed to register asset for monitoring")


@router.post("/monitor/report-theft")
async def report_theft(
    request: ReportTheftRequest,
    current_user: dict = Depends(get_current_user)
):
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
        logger.warning(f"Theft report validation failed: {e}")
        raise HTTPException(status_code=400, detail="Invalid request data")


@router.get("/monitor/loss-estimate/{asset_id}")
async def get_loss_estimate(asset_id: str, current_user: dict = Depends(get_current_user)):
    """Get estimated revenue loss from theft"""
    return theft_monitor.estimate_total_loss(asset_id)


@router.get("/monitor/infringer-report/{domain}")
async def get_infringer_report(domain: str, current_user: dict = Depends(get_current_user)):
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
async def activate_kill_switch(
    request: ActivateKillSwitchRequest,
    current_user: dict = Depends(get_current_user)
):
    """Activate kill switch for an asset"""
    try:
        # Security: Override owner_id with authenticated user's ID
        request.owner_id = current_user["id"]
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
            actor_id=current_user["id"],
            asset_id=request.asset_id,
            details={"dispute_id": dispute.dispute_id, "reason": request.reason}
        )

        return {"success": True, "dispute": dispute.dict()}
    except Exception as e:
        logger.error(f"Failed to activate kill switch: {e}")
        raise HTTPException(status_code=500, detail="Failed to activate kill switch")


@router.get("/killswitch/status/{asset_hash}")
async def check_kill_switch_status(asset_hash: str, current_user: dict = Depends(get_current_user)):
    """Check if an asset is under dispute"""
    return kill_switch.check_asset_status(asset_hash)


@router.get("/killswitch/banner/{asset_hash}")
async def get_dispute_banner(asset_hash: str, current_user: dict = Depends(get_current_user)):
    """Get dispute banner for display"""
    return kill_switch.get_dispute_banner(asset_hash)


class DeactivateKillSwitchRequest(BaseModel):
    resolution: str


@router.post("/killswitch/deactivate/{dispute_id}")
async def deactivate_kill_switch(
    dispute_id: str,
    request: DeactivateKillSwitchRequest,
    current_user: dict = Depends(get_current_user)
):
    """Deactivate kill switch and resolve dispute"""
    success = kill_switch.deactivate_kill_switch(dispute_id, request.resolution)

    if success:
        event_log.append_event(
            event_type=EventType.DISPUTE_RESOLVED,
            actor_id="system",
            actor_type="system",
            details={"dispute_id": dispute_id, "resolution": request.resolution}
        )

    return {"success": success}


# ============== EVENT LOG ENDPOINTS ==============

@router.get("/audit/verify-chain")
async def verify_chain_integrity(current_user: dict = Depends(get_current_user)):
    """Verify the integrity of the event log chain"""
    return event_log.verify_chain_integrity()


@router.get("/audit/asset-history/{asset_id}")
async def get_asset_history(asset_id: str, current_user: dict = Depends(get_current_user)):
    """Get event history for an asset"""
    events = event_log.get_asset_history(asset_id)
    return {"asset_id": asset_id, "events": [e.dict() for e in events]}


@router.get("/audit/evidence-packet/{asset_id}")
async def export_evidence_packet(asset_id: str, current_user: dict = Depends(get_current_user)):
    """Export evidence packet for legal proceedings"""
    return event_log.export_evidence_packet(asset_id)


# ============== BLOCKCHAIN TIMESTAMPS ==============

from app.services.blockchain import blockchain_service

class BlockchainTimestampRequest(BaseModel):
    asset_name: str
    file_hash: str  # Pre-computed SHA-256 hash of file


@router.post("/blockchain/timestamp")
async def create_blockchain_timestamp(
    request: BlockchainTimestampRequest,
    current_user: dict = Depends(get_current_user)
):
    """
        Create a FREE blockchain timestamp using OpenTimestamps.
        Anchors to Bitcoin blockchain at no cost.
    """
    try:
        # Validate hash format (SHA-256 hex string)
        if len(request.file_hash) != 64:
            raise HTTPException(status_code=400, detail="Invalid hash: must be 64 hex characters")
        bytes.fromhex(request.file_hash)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid hash format")

    try:
        proof = await blockchain_service.create_timestamp(
            request.file_hash,
            request.asset_name,
            current_user["id"]
        )

        return {
            "success": True,
            "proof": proof.dict(),
            "message": "Timestamp submitted to Bitcoin blockchain via OpenTimestamps",
            "note": "Proof will be confirmed after next Bitcoin block (~10 min to 2 hours)"
        }
    except Exception as e:
        logger.error(f"Failed to create blockchain timestamp: {e}")
        raise HTTPException(status_code=500, detail="Failed to create blockchain timestamp")


@router.get("/blockchain/verify/{proof_id}")
async def verify_blockchain_timestamp(proof_id: str, current_user: dict = Depends(get_current_user)):
    """Verify a blockchain timestamp"""
    return await blockchain_service.verify_timestamp(proof_id)


@router.post("/blockchain/hash-proof")
async def create_hash_proof(
    request: BlockchainTimestampRequest,
    current_user: dict = Depends(get_current_user)
):
    """
        Create an immediate hash proof document.
        Synchronous - no blockchain submission, but creates verifiable proof.
    """
    try:
        if len(request.file_hash) != 64:
            raise HTTPException(status_code=400, detail="Invalid hash: must be 64 hex characters")
        bytes.fromhex(request.file_hash)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid hash format")

    try:
        proof = blockchain_service.create_hash_proof(request.file_hash, request.asset_name)
        return proof
    except Exception as e:
        logger.error(f"Failed to create hash proof: {e}")
        raise HTTPException(status_code=500, detail="Failed to create hash proof")


@router.get("/blockchain/proofs")
async def get_user_blockchain_proofs(current_user: dict = Depends(get_current_user)):
    """Get all blockchain proofs for the current user"""
    try:
        proofs = await blockchain_service.get_user_proofs(current_user["id"])
        return {
            "success": True,
            "proofs": [proof.dict() for proof in proofs],
            "total": len(proofs),
            "pending": len([p for p in proofs if p.status == "pending"]),
            "confirmed": len([p for p in proofs if p.status == "confirmed"])
        }
    except Exception as e:
        logger.error(f"Failed to get user blockchain proofs: {e}")
        raise HTTPException(status_code=500, detail="Failed to get blockchain proofs")
