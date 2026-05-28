from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.supabase_client import get_supabase
from app.dependencies import get_current_user
import logging
import uuid

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/feedback", tags=["feedback"])
supabase = get_supabase()

class FeedbackSubmit(BaseModel):
    rating: int
    message: str
    category: str = "general"
    email: Optional[str] = None

class ReferralCreate(BaseModel):
    code: Optional[str] = None

@router.post("/submit")
async def submit_feedback(feedback: FeedbackSubmit, user: dict = Depends(get_current_user)):
    if feedback.rating < 1 or feedback.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    if len(feedback.message) > 5000:
        raise HTTPException(status_code=400, detail="Message too long (max 5000 characters)")
    try:
        record = {
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "rating": feedback.rating,
            "message": feedback.message[:5000],
            "category": feedback.category,
            "email": feedback.email or user.get("email", ""),
            "created_at": datetime.utcnow().isoformat(),
        }
        supabase.table("feedback").insert(record).execute()
        return {"status": "ok", "message": "Feedback received. Thank you!"}
    except Exception as e:
        logger.error(f"Feedback save failed: {e}")
        return {"status": "ok", "message": "Feedback received!"}

@router.get("/referral/generate")
async def generate_referral(user: dict = Depends(get_current_user)):
    try:
        user_id = user["id"]
        existing = supabase.table("referrals").select("*").eq("user_id", user_id).execute()
        if existing.data:
            return {"code": existing.data[0]["code"], "url": f"https://cvber.vercel.app/register?ref={existing.data[0]['code']}", "count": existing.data[0].get("count", 0)}

        code = user_id[:8]
        supabase.table("referrals").insert({
            "user_id": user_id,
            "code": code,
            "count": 0,
            "created_at": datetime.utcnow().isoformat(),
        }).execute()
        return {"code": code, "url": f"https://cvber.vercel.app/register?ref={code}", "count": 0}
    except Exception as e:
        logger.error(f"Referral gen failed: {e}")
        return {"code": "cvber", "url": "https://cvber.vercel.app", "count": 0}

@router.get("/analytics/total")
async def total_feedback(user: dict = Depends(get_current_user)):
    try:
        result = supabase.table("feedback").select("id", count="exact").eq("user_id", user["id"]).execute()
        count = result.count if hasattr(result, 'count') else len(result.data or [])
        return {"total_feedback": count}
    except Exception:
        return {"total_feedback": 0}
