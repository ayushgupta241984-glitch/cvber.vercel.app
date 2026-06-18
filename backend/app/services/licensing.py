"""
Licensing Engine
One-click license generation and verification.
"""
from datetime import datetime, timedelta, timezone
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
        from supabase import create_client, Client
        from app.config import settings
        self.supabase: Client = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key
        )
    
    def generate_license(
        self,
        asset_hash: str,
        asset_name: str,
        license_type: str,
        licensee_name: str,
        licensee_email: str,
        licensor_name: str
    ) -> License:
        """Generate a new license and store in DB"""
        terms = self.LICENSE_TERMS.get(license_type, self.LICENSE_TERMS[LicenseType.PERSONAL])
        
        # Generate license ID
        license_id = self._generate_license_id(asset_hash, licensee_email)
        
        # Calculate expiry
        expires_at = None
        if terms.get("duration_days"):
            expires_at = datetime.now(timezone.utc) + timedelta(days=terms["duration_days"])
        
        # Generate verification URL
        verification_url = f"https://cvber.app/license/{license_id}"
        
        license_obj = License(
            license_id=license_id,
            asset_hash=asset_hash,
            asset_name=asset_name,
            license_type=license_type,
            licensee_name=licensee_name,
            licensee_email=licensee_email,
            licensor_name=licensor_name,
            granted_at=datetime.now(timezone.utc),
            expires_at=expires_at,
            terms=terms,
            verification_url=verification_url,
            is_active=True
        )
        
        # Store in Supabase
        try:
            db_data = {
                "license_id": license_id,
                "asset_hash": asset_hash,
                "asset_name": asset_name,
                "license_type": license_type,
                "licensee_name": licensee_name,
                "licensee_email": licensee_email,
                "licensor_name": licensor_name,
                "issued_at": license_obj.granted_at.isoformat(),
                "expires_at": expires_at.isoformat() if expires_at else None,
                "status": "active",
                "metadata": terms
            }
            self.supabase.table("licenses").insert(db_data).execute()
        except Exception as e:
            print(f"Database error storing license: {e}")
            # We still return the license object for the response, 
            # but log the failure to persist
            
        return license_obj
    
    def _generate_license_id(self, asset_hash: str, licensee_email: str) -> str:
        """Generate unique license ID"""
        data = f"{asset_hash}{licensee_email}{datetime.now(timezone.utc).isoformat()}"
        return f"LIC-{hashlib.sha256(data.encode()).hexdigest()[:16].upper()}"
    
    def verify_license(self, license_id: str) -> Dict[str, Any]:
        """Verify a license is valid from DB"""
        try:
            response = self.supabase.table("licenses")\
                .select("*")\
                .eq("license_id", license_id)\
                .single()\
                .execute()
            
            if not response.data:
                return {"valid": False, "reason": "License not found"}
            
            data = response.data
            is_active = data.get("status") == "active"
            expires_at_str = data.get("expires_at")
            expires_at = datetime.fromisoformat(expires_at_str) if expires_at_str else None
            
            if not is_active:
                return {"valid": False, "reason": "License has been revoked"}
            
            if expires_at and expires_at < datetime.now(timezone.utc):
                return {"valid": False, "reason": "License has expired"}
            
            return {
                "valid": True,
                "license_id": data["license_id"],
                "asset_name": data["asset_name"],
                "license_type": data["license_type"],
                "licensee": data["licensee_name"],
                "licensor": data["licensor_name"],
                "granted_at": data["issued_at"],
                "expires_at": data["expires_at"] or "Never",
                "terms": data["metadata"]
            }
        except Exception as e:
            return {"valid": False, "reason": f"Verification error: {str(e)}"}
    
    def revoke_license(self, license_id: str) -> bool:
        """Revoke an active license in DB"""
        try:
            self.supabase.table("licenses")\
                .update({"status": "revoked"})\
                .eq("license_id", license_id)\
                .execute()
            return True
        except Exception as e:
            print(f"Error revoking license: {e}")
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
