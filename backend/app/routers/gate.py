from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timezone, timedelta
import logging
import random
import hashlib
import time

logger = logging.getLogger(__name__)
router = APIRouter()

# In-memory store (resets on restart — fine for MVP)
_applications: dict = {}  # email -> application data
_POSITION_COUNTER = 0


class GateApplication(BaseModel):
    email: EmailStr
    who_are_you: str
    why_want: str
    why_give: str


class GateClaimRequest(BaseModel):
    email: EmailStr
    password: str


class QuickRegisterRequest(BaseModel):
    email: EmailStr
    password: str


def _get_position():
    global _POSITION_COUNTER
    _POSITION_COUNTER += 1
    return _POSITION_COUNTER


@router.post("/api/gate")
async def apply_to_gate(app: GateApplication):
    global _POSITION_COUNTER

    email_lower = app.email.lower().strip()

    # Rate limit: 1 application per email
    if email_lower in _applications:
        existing = _applications[email_lower]
        if existing.get("status") == "accepted":
            return {
                "status": "accepted",
                "position": existing["position"],
                "message": "You already have access! Check your email for login details.",
                "accepted_at": existing.get("accepted_at"),
            }
        return {
            "status": "pending",
            "position": existing["position"],
            "message": f"You're #{existing['position']} in line. Check back in 2 minutes.",
        }

    position = _get_position()
    now = datetime.now(timezone.utc)

    _applications[email_lower] = {
        "email": email_lower,
        "who_are_you": app.who_are_you,
        "why_want": app.why_want,
        "why_give": app.why_give,
        "status": "pending",
        "position": position,
        "created_at": now.isoformat(),
        "reviewed_at": None,
        "accepted_at": None,
    }

    logger.info(f"Gate application #{position}: {email_lower}")

    # Auto-accept after 2 minutes via background check
    # For MVP, we auto-accept immediately after a simulated "review"
    return {
        "status": "pending",
        "position": position,
        "message": f"You're #{position} in line. Applications are reviewed automatically. Check back in 2 minutes.",
    }


@router.get("/api/gate/remaining")
async def get_remaining_spots():
    """Return how many spots are available."""
    total_capacity = 10000
    return {
        "remaining": max(0, total_capacity - len(_applications)),
        "total": total_capacity,
        "applied": len(_applications),
    }


@router.get("/api/gate/status")
async def get_gate_status(email: str):
    """Check the status of a gate application."""
    email_lower = email.lower().strip()

    if email_lower not in _applications:
        return {"status": "not_found", "message": "No application found for this email."}

    app_data = _applications[email_lower]
    created = datetime.fromisoformat(app_data["created_at"])
    now = datetime.now(timezone.utc)
    elapsed = (now - created).total_seconds()

    # Auto-accept after 2 minutes
    if app_data["status"] == "pending" and elapsed >= 120:
        app_data["status"] = "accepted"
        app_data["reviewed_at"] = now.isoformat()
        app_data["accepted_at"] = now.isoformat()
        logger.info(f"Gate auto-accepted: {email_lower}")

    remaining_seconds = max(0, 120 - elapsed)

    return {
        "status": app_data["status"],
        "position": app_data["position"],
        "remaining_seconds": remaining_seconds if app_data["status"] == "pending" else 0,
        "accepted_at": app_data.get("accepted_at"),
    }


@router.post("/api/gate/claim")
async def claim_access(req: GateClaimRequest):
    """Claim access after being accepted. Creates account."""
    email_lower = req.email.lower().strip()

    if email_lower not in _applications:
        raise HTTPException(status_code=404, detail="No application found. Apply at /gate first.")

    app_data = _applications[email_lower]

    if app_data["status"] != "accepted":
        raise HTTPException(status_code=400, detail=f"Application is still {app_data['status']}. Please wait.")

    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    # In production, this would create the user in Supabase
    # For MVP, return success with a mock token
    token_hash = hashlib.sha256(f"{email_lower}:{time.time()}".encode()).hexdigest()[:32]

    return {
        "status": "claimed",
        "message": "Account created! Welcome to CVBER.",
        "access_token": f"gate_{token_hash}",
        "token_type": "bearer",
    }


@router.post("/api/gate/sweep")
async def sweep_old_applications():
    """Sweep and auto-accept pending applications older than 2 minutes."""
    now = datetime.now(timezone.utc)
    accepted_count = 0

    for email, app_data in _applications.items():
        if app_data["status"] == "pending":
            created = datetime.fromisoformat(app_data["created_at"])
            if (now - created).total_seconds() >= 120:
                app_data["status"] = "accepted"
                app_data["reviewed_at"] = now.isoformat()
                app_data["accepted_at"] = now.isoformat()
                accepted_count += 1

    return {"accepted": accepted_count, "total": len(_applications)}
