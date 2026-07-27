"""Theft Prediction Engine — predicts likelihood of art theft based on image features."""
import logging
from datetime import datetime, timezone
from typing import Optional

logger = logging.getLogger(__name__)


def predict_theft_risk(
    image_width: int,
    image_height: int,
    file_format: str,
    originality_score: Optional[float],
    is_screenshot: bool,
    has_c2pa: bool,
    has_watermark: bool,
    theft_history_count: int = 0,
) -> dict:
    risk_score = 0.0
    factors = []

    ratio = min(image_width, image_height) / max(image_width, image_height) if max(image_width, image_height) > 0 else 1.0
    if 0.8 < ratio < 1.0:
        risk_score += 5
        factors.append("Square-like composition (high reuse potential)")

    if file_format.lower() in ("png", "webp"):
        risk_score += 3
        factors.append(f"{file_format.upper()} format (easy to edit/repost)")

    if originality_score is not None:
        if originality_score < 30:
            risk_score += 10
            factors.append(f"Low originality score ({originality_score}/100)")
        elif originality_score < 60:
            risk_score += 5
            factors.append(f"Medium originality score ({originality_score}/100)")

    if is_screenshot:
        risk_score += 8
        factors.append("Screenshot detected (already reposted)")

    if not has_c2pa:
        risk_score += 7
        factors.append("No C2PA certificate (easy to claim as own)")

    if not has_watermark:
        risk_score += 5
        factors.append("No watermark (no attribution trail)")

    if theft_history_count > 0:
        risk_score += min(theft_history_count * 3, 15)
        factors.append(f"Previously stolen {theft_history_count} time(s)")

    risk_score = min(risk_score, 100)

    if risk_score >= 45:
        risk_level = "critical"
        recommendation = "Immediate action: Add C2PA certificate, enable watermarking, activate monitoring."
    elif risk_score >= 30:
        risk_level = "high"
        recommendation = "Strongly recommended: Add C2PA certificate and enable monitoring."
    elif risk_score >= 15:
        risk_level = "medium"
        recommendation = "Consider: Add C2PA certificate for legal protection."
    else:
        risk_level = "low"
        recommendation = "Good protection level. Consider enabling monitoring for peace of mind."

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "factors": factors,
        "recommendation": recommendation,
        "predicted_at": datetime.now(timezone.utc).isoformat(),
    }
