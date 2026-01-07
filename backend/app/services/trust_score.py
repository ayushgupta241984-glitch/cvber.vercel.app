"""
Trust Score Engine
Calculates creator reputation based on history, originality, and verification.
"""
from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import hashlib


class TrustFactors(BaseModel):
    """Individual factors contributing to trust score"""
    originality_average: float  # 0-100
    upload_count: int
    verified_originals: int
    disputes_won: int
    disputes_lost: int
    account_age_days: int
    verification_level: str  # basic, email, identity, enterprise


class TrustScore(BaseModel):
    """Complete trust score with breakdown"""
    score: int  # 0-1000
    grade: str  # S, A, B, C, D, F
    badge_color: str  # gold, silver, bronze, none
    factors: TrustFactors
    breakdown: Dict[str, int]
    exportable_badge_url: str
    last_updated: datetime


class TrustScoreEngine:
    """Calculate and manage creator trust scores"""
    
    GRADE_THRESHOLDS = {
        900: ("S", "gold", "Elite Creator"),
        750: ("A", "gold", "Trusted Creator"),
        600: ("B", "silver", "Verified Creator"),
        400: ("C", "bronze", "Active Creator"),
        200: ("D", "none", "New Creator"),
        0: ("F", "none", "Unverified")
    }
    
    VERIFICATION_MULTIPLIERS = {
        "basic": 1.0,
        "email": 1.1,
        "identity": 1.3,
        "enterprise": 1.5
    }
    
    def calculate_score(self, factors: TrustFactors) -> TrustScore:
        """Calculate trust score from factors"""
        breakdown = {}
        
        # Originality component (max 300 points)
        originality_points = int((factors.originality_average / 100) * 300)
        breakdown["originality"] = originality_points
        
        # Upload history (max 200 points, logarithmic)
        import math
        upload_points = min(200, int(math.log10(max(1, factors.upload_count)) * 100))
        breakdown["upload_history"] = upload_points
        
        # Verified originals bonus (max 150 points)
        verified_ratio = factors.verified_originals / max(1, factors.upload_count)
        verified_points = int(verified_ratio * 150)
        breakdown["verified_originals"] = verified_points
        
        # Dispute record (max 150 points, can go negative)
        total_disputes = factors.disputes_won + factors.disputes_lost
        if total_disputes > 0:
            win_ratio = factors.disputes_won / total_disputes
            dispute_points = int((win_ratio - 0.5) * 300)  # -150 to +150
        else:
            dispute_points = 50  # Neutral for no disputes
        breakdown["dispute_record"] = dispute_points
        
        # Account age (max 100 points)
        age_points = min(100, int(factors.account_age_days / 3.65))  # 1 year = 100 points
        breakdown["account_age"] = age_points
        
        # Base score
        base_score = sum(breakdown.values())
        
        # Apply verification multiplier
        multiplier = self.VERIFICATION_MULTIPLIERS.get(factors.verification_level, 1.0)
        final_score = int(base_score * multiplier)
        
        # Clamp to 0-1000
        final_score = max(0, min(1000, final_score))
        
        # Determine grade
        grade, badge_color, _ = self._get_grade(final_score)
        
        # Generate badge URL
        badge_hash = hashlib.sha256(f"{final_score}{datetime.utcnow().isoformat()}".encode()).hexdigest()[:8]
        badge_url = f"https://cvber.app/badge/{badge_hash}"
        
        return TrustScore(
            score=final_score,
            grade=grade,
            badge_color=badge_color,
            factors=factors,
            breakdown=breakdown,
            exportable_badge_url=badge_url,
            last_updated=datetime.utcnow()
        )
    
    def _get_grade(self, score: int) -> tuple:
        """Get grade, badge color, and description from score"""
        for threshold, (grade, color, desc) in sorted(self.GRADE_THRESHOLDS.items(), reverse=True):
            if score >= threshold:
                return (grade, color, desc)
        return ("F", "none", "Unverified")
    
    def generate_proof_of_authenticity(self, score: TrustScore, creator_name: str) -> Dict[str, Any]:
        """Generate exportable proof certificate"""
        return {
            "certificate_type": "CVBER Proof of Authenticity",
            "creator_name": creator_name,
            "trust_score": score.score,
            "grade": score.grade,
            "verified_originals": score.factors.verified_originals,
            "verification_level": score.factors.verification_level,
            "issued_at": datetime.utcnow().isoformat(),
            "valid_until": "Perpetual",
            "verification_url": score.exportable_badge_url,
            "statement": f"{creator_name} is a {self._get_grade(score.score)[2]} with a CVBER Trust Score of {score.score}/1000."
        }


# Singleton instance
trust_engine = TrustScoreEngine()
