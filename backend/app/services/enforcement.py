"""
DMCA Enforcement Engine
Generates legally compliant takedown notices for major platforms.
"""
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from pydantic import BaseModel
import hashlib

class DMCARequest(BaseModel):
    """Request model for DMCA generation"""
    asset_name: str
    asset_hash: str
    originality_score: float
    forensic_summary: str
    infringement_url: str
    platform: str  # youtube, instagram, tiktok, x, generic
    owner_name: str
    owner_email: str
    owner_address: Optional[str] = None

class DMCANotice(BaseModel):
    """Generated DMCA notice"""
    notice_id: str
    platform: str
    status: str  # draft, submitted, acknowledged, removed, escalated
    created_at: datetime
    subject_line: str
    body: str
    evidence_bundle: Dict[str, Any]

class EnforcementEngine:
    """Automated DMCA generation and tracking"""
    
    PLATFORM_CONTACTS = {
        "youtube": {
            "name": "YouTube Copyright Team",
            "url": "https://www.youtube.com/copyright_complaint_form",
            "email": "copyright@youtube.com"
        },
        "instagram": {
            "name": "Instagram IP Team",
            "url": "https://help.instagram.com/contact/372592039493026",
            "email": "ip@instagram.com"
        },
        "tiktok": {
            "name": "TikTok IP Team",
            "url": "https://www.tiktok.com/legal/report/Copyright",
            "email": "copyright@tiktok.com"
        },
        "x": {
            "name": "X Legal",
            "url": "https://help.twitter.com/forms/dmca",
            "email": "copyright@x.com"
        },
        "generic": {
            "name": "Hosting Provider",
            "url": "",
            "email": ""
        }
    }
    
    def generate_notice(self, request: DMCARequest) -> DMCANotice:
        """Generate a DMCA takedown notice"""
        notice_id = self._generate_notice_id(request)
        platform_info = self.PLATFORM_CONTACTS.get(request.platform, self.PLATFORM_CONTACTS["generic"])
        
        # Build evidence bundle
        evidence = {
            "asset_name": request.asset_name,
            "asset_hash": request.asset_hash,
            "originality_score": request.originality_score,
            "forensic_summary": request.forensic_summary,
            "cvber_verification_url": f"https://cvber.app/verify/{request.asset_hash[:16]}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "notice_id": notice_id
        }
        
        # Generate notice body
        body = self._generate_notice_body(request, platform_info, notice_id)
        subject = f"DMCA Takedown Notice - {request.asset_name} [{notice_id}]"
        
        return DMCANotice(
            notice_id=notice_id,
            platform=request.platform,
            status="draft",
            created_at=datetime.now(timezone.utc),
            subject_line=subject,
            body=body,
            evidence_bundle=evidence
        )
    
    def _generate_notice_id(self, request: DMCARequest) -> str:
        """Generate unique notice ID"""
        data = f"{request.asset_hash}{request.infringement_url}{datetime.now(timezone.utc).isoformat()}"
        return f"CVBER-DMCA-{hashlib.sha256(data.encode()).hexdigest()[:12].upper()}"
    
    def _generate_notice_body(self, request: DMCARequest, platform_info: Dict, notice_id: str) -> str:
        """Generate the full DMCA notice text"""
        return f"""
DIGITAL MILLENNIUM COPYRIGHT ACT (DMCA) TAKEDOWN NOTICE
Notice ID: {notice_id}
Date: {datetime.now(timezone.utc).strftime("%B %d, %Y")}

To: {platform_info['name']}

I, {request.owner_name}, am the copyright owner of the original work described below. I have a good faith belief that the use of the material in the manner complained of is not authorized by me, my agent, or the law.

═══════════════════════════════════════════════════════════════
1. IDENTIFICATION OF COPYRIGHTED WORK
═══════════════════════════════════════════════════════════════

Original Work: {request.asset_name}
Digital Fingerprint (SHA-256): {request.asset_hash}
CVBER Verification Score: {request.originality_score:.1f}/100
Forensic Analysis: {request.forensic_summary}

Verification URL: https://cvber.app/verify/{request.asset_hash[:16]}

═══════════════════════════════════════════════════════════════
2. IDENTIFICATION OF INFRINGING MATERIAL
═══════════════════════════════════════════════════════════════

Infringing URL: {request.infringement_url}

I request that you remove or disable access to this material immediately.

═══════════════════════════════════════════════════════════════
3. SWORN STATEMENTS
═══════════════════════════════════════════════════════════════

I hereby state UNDER PENALTY OF PERJURY that:

(a) I am the owner, or authorized to act on behalf of the owner, of the exclusive copyright that is allegedly being infringed.

(b) The use of the material in question is not authorized by the copyright owner, its agent, or the law.

(c) The information in this notice is accurate.

═══════════════════════════════════════════════════════════════
4. CONTACT INFORMATION
═══════════════════════════════════════════════════════════════

Name: {request.owner_name}
Email: {request.owner_email}
Address: {request.owner_address or "[Address on file with CVBER]"}

═══════════════════════════════════════════════════════════════
5. SIGNATURE
═══════════════════════════════════════════════════════════════

/s/ {request.owner_name}
Date: {datetime.now(timezone.utc).strftime("%B %d, %Y")}

---
This notice was generated by CVBER.FREE Enforcement Engine
Evidence Bundle ID: {notice_id}
Blockchain Anchor: PENDING
"""

    def get_submission_instructions(self, platform: str) -> Dict[str, str]:
        """Get platform-specific submission instructions"""
        instructions = {
            "youtube": {
                "method": "Web Form",
                "url": "https://www.youtube.com/copyright_complaint_form",
                "notes": "Sign in with Google account. Paste notice content. Attach evidence."
            },
            "instagram": {
                "method": "Web Form",
                "url": "https://help.instagram.com/contact/372592039493026",
                "notes": "Requires Facebook/Meta account. Upload evidence as attachments."
            },
            "tiktok": {
                "method": "Web Form",
                "url": "https://www.tiktok.com/legal/report/Copyright",
                "notes": "Create TikTok account if needed. Submit with evidence links."
            },
            "x": {
                "method": "Web Form",
                "url": "https://help.twitter.com/forms/dmca",
                "notes": "X account required. Include notice ID in description."
            },
            "generic": {
                "method": "Email",
                "url": "",
                "notes": "Send to hosting provider's abuse contact. Use WHOIS to find."
            }
        }
        return instructions.get(platform, instructions["generic"])


# Singleton instance
enforcement_engine = EnforcementEngine()
