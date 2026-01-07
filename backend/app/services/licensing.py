"""
Licensing Engine
One-click license generation and verification.
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from pydantic import BaseModel
import hashlib
import json


class LicenseType:
    PERSONAL = "personal"
    COMMERCIAL = "commercial"
    EXCLUSIVE = "exclusive"
    EDITORIAL = "editorial"


class License(BaseModel):
    """Digital license for an asset"""
    license_id: str
    asset_hash: str
    asset_name: str
    license_type: str
    licensee_name: str
    licensee_email: str
    licensor_name: str
    granted_at: datetime
    expires_at: Optional[datetime]
    terms: Dict[str, Any]
    verification_url: str
    is_active: bool


class LicensingEngine:
    """License generation and verification"""
    
    LICENSE_TERMS = {
        LicenseType.PERSONAL: {
            "commercial_use": False,
            "modification": True,
            "distribution": False,
            "attribution_required": True,
            "max_copies": 1,
            "duration_days": None,  # Perpetual
            "price_tier": "free"
        },
        LicenseType.COMMERCIAL: {
            "commercial_use": True,
            "modification": True,
            "distribution": True,
            "attribution_required": True,
            "max_copies": None,  # Unlimited
            "duration_days": 365,
            "price_tier": "standard"
        },
        LicenseType.EXCLUSIVE: {
            "commercial_use": True,
            "modification": True,
            "distribution": True,
            "attribution_required": False,
            "max_copies": None,
            "duration_days": None,  # Perpetual
            "price_tier": "premium",
            "exclusive": True
        },
        LicenseType.EDITORIAL: {
            "commercial_use": False,
            "modification": False,
            "distribution": True,
            "attribution_required": True,
            "max_copies": None,
            "duration_days": 30,
            "price_tier": "editorial"
        }
    }
    
    def __init__(self):
        self.licenses: Dict[str, License] = {}
    
    def generate_license(
        self,
        asset_hash: str,
        asset_name: str,
        license_type: str,
        licensee_name: str,
        licensee_email: str,
        licensor_name: str
    ) -> License:
        """Generate a new license"""
        terms = self.LICENSE_TERMS.get(license_type, self.LICENSE_TERMS[LicenseType.PERSONAL])
        
        # Generate license ID
        license_id = self._generate_license_id(asset_hash, licensee_email)
        
        # Calculate expiry
        expires_at = None
        if terms.get("duration_days"):
            expires_at = datetime.utcnow() + timedelta(days=terms["duration_days"])
        
        # Generate verification URL
        verification_url = f"https://cvber.app/license/{license_id}"
        
        license = License(
            license_id=license_id,
            asset_hash=asset_hash,
            asset_name=asset_name,
            license_type=license_type,
            licensee_name=licensee_name,
            licensee_email=licensee_email,
            licensor_name=licensor_name,
            granted_at=datetime.utcnow(),
            expires_at=expires_at,
            terms=terms,
            verification_url=verification_url,
            is_active=True
        )
        
        self.licenses[license_id] = license
        return license
    
    def _generate_license_id(self, asset_hash: str, licensee_email: str) -> str:
        """Generate unique license ID"""
        data = f"{asset_hash}{licensee_email}{datetime.utcnow().isoformat()}"
        return f"LIC-{hashlib.sha256(data.encode()).hexdigest()[:16].upper()}"
    
    def verify_license(self, license_id: str) -> Dict[str, Any]:
        """Verify a license is valid"""
        license = self.licenses.get(license_id)
        
        if not license:
            return {"valid": False, "reason": "License not found"}
        
        if not license.is_active:
            return {"valid": False, "reason": "License has been revoked"}
        
        if license.expires_at and license.expires_at < datetime.utcnow():
            return {"valid": False, "reason": "License has expired"}
        
        return {
            "valid": True,
            "license_id": license.license_id,
            "asset_name": license.asset_name,
            "license_type": license.license_type,
            "licensee": license.licensee_name,
            "licensor": license.licensor_name,
            "granted_at": license.granted_at.isoformat(),
            "expires_at": license.expires_at.isoformat() if license.expires_at else "Never",
            "terms": license.terms
        }
    
    def revoke_license(self, license_id: str) -> bool:
        """Revoke an active license"""
        license = self.licenses.get(license_id)
        if license:
            license.is_active = False
            return True
        return False
    
    def generate_license_metadata(self, license: License) -> str:
        """Generate embeddable license metadata (JSON-LD format)"""
        metadata = {
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            "license": {
                "@type": "License",
                "identifier": license.license_id,
                "name": f"CVBER {license.license_type.title()} License",
                "url": license.verification_url,
                "dateCreated": license.granted_at.isoformat(),
                "expires": license.expires_at.isoformat() if license.expires_at else None,
                "additionalProperty": [
                    {"@type": "PropertyValue", "name": "commercialUse", "value": license.terms.get("commercial_use")},
                    {"@type": "PropertyValue", "name": "modification", "value": license.terms.get("modification")},
                    {"@type": "PropertyValue", "name": "attribution", "value": license.terms.get("attribution_required")}
                ]
            }
        }
        return json.dumps(metadata, indent=2)


# Singleton instance
licensing_engine = LicensingEngine()
