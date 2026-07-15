"""AI-powered endpoints — Style DNA, Theft Prediction, Art Authentication."""
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.dependencies import get_current_user, is_mock_mode
from app.supabase_client import get_supabase
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai", tags=["ai"])
supabase = get_supabase()


# ── Style DNA ──────────────────────────────────────────────

class StyleMatchResponse(BaseModel):
    matches: list[dict]
    query_style_profile: Optional[list[float]] = None
    total_compared: int
    threshold: float


@router.post("/style-match", response_model=StyleMatchResponse)
async def match_style(
    file: UploadFile = File(...),
    threshold: float = 0.75,
    limit: int = 10,
    current_user: dict = Depends(get_current_user),
):
    if is_mock_mode():
        return StyleMatchResponse(matches=[], total_compared=0, threshold=threshold)

    from app.services.style_dna import find_style_matches, compute_style_profile

    image_bytes = await file.read()
    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    resp = supabase.table("style_embeddings") \
        .select("scan_id, file_name, embedding, created_at") \
        .eq("user_id", current_user["id"]) \
        .execute()
    user_embeddings = resp.data or []

    matches = await find_style_matches(image_bytes, user_embeddings, threshold, limit)

    from app.services.clip_service import generate_embedding_from_bytes
    query_emb = generate_embedding_from_bytes(image_bytes)

    return StyleMatchResponse(
        matches=matches,
        query_style_profile=query_emb[:10] if query_emb else None,
        total_compared=len(user_embeddings),
        threshold=threshold,
    )


# ── Theft Prediction ───────────────────────────────────────

class TheftPredictionRequest(BaseModel):
    scan_id: str


class TheftPredictionResponse(BaseModel):
    risk_score: float
    risk_level: str
    factors: list[str]
    recommendation: str
    predicted_at: str


@router.post("/predict-theft", response_model=TheftPredictionResponse)
async def predict_theft(
    request: TheftPredictionRequest,
    current_user: dict = Depends(get_current_user),
):
    if is_mock_mode():
        return TheftPredictionResponse(
            risk_score=0, risk_level="low", factors=[], recommendation="Mock mode",
            predicted_at="",
        )

    from app.services.theft_prediction import predict_theft_risk

    resp = supabase.table("vault_files") \
        .select("*") \
        .eq("id", request.scan_id) \
        .eq("user_id", current_user["id"]) \
        .single() \
        .execute()
    file_data = resp.data

    if not file_data:
        raise HTTPException(status_code=404, detail="File not found")

    theft_resp = supabase.table("theft_alerts") \
        .select("id", count="exact") \
        .eq("asset_id", request.scan_id) \
        .execute()
    theft_count = theft_resp.count or 0

    result = predict_theft_risk(
        image_width=file_data.get("width", 0),
        image_height=file_data.get("height", 0),
        file_format=file_data.get("file_format", "png"),
        originality_score=file_data.get("originality_score"),
        is_screenshot=file_data.get("is_screenshot", False),
        has_c2pa=bool(file_data.get("c2pa_manifest")),
        has_watermark=bool(file_data.get("watermarked")),
        theft_history_count=theft_count,
    )

    return TheftPredictionResponse(**result)


# ── Art Authentication ─────────────────────────────────────

class AuthRequest(BaseModel):
    scan_id: str
    claimed_owner_id: str


class AuthResponse(BaseModel):
    is_authentic: bool
    confidence: float
    evidence: list[str]
    style_profile_exists: bool


@router.post("/authenticate", response_model=AuthResponse)
async def authenticate_art(
    request: AuthRequest,
    current_user: dict = Depends(get_current_user),
):
    if is_mock_mode():
        return AuthResponse(is_authentic=True, confidence=0.0, evidence=[], style_profile_exists=False)

    from app.services.clip_service import generate_embedding_from_bytes
    from app.services.style_dna import compute_style_profile, _get_cosine

    file_resp = supabase.table("vault_files") \
        .select("*") \
        .eq("id", request.scan_id) \
        .single() \
        .execute()
    file_data = file_resp.data

    if not file_data:
        raise HTTPException(status_code=404, detail="File not found")

    embeddings_resp = supabase.table("style_embeddings") \
        .select("embedding") \
        .eq("user_id", request.claimed_owner_id) \
        .execute()
    embeddings = [e["embedding"] for e in (embeddings_resp.data or []) if e.get("embedding")]

    if len(embeddings) < 3:
        return AuthResponse(
            is_authentic=True,
            confidence=0.0,
            evidence=["Insufficient style data (need 3+ uploads for authentication)"],
            style_profile_exists=False,
        )

    profile = compute_style_profile(embeddings)
    if profile is None:
        return AuthResponse(is_authentic=True, confidence=0.0, evidence=["Could not compute style profile"], style_profile_exists=True)

    file_emb_resp = supabase.table("style_embeddings") \
        .select("embedding") \
        .eq("scan_id", request.scan_id) \
        .single() \
        .execute()
    file_emb = file_emb_resp.data.get("embedding") if file_emb_resp.data else None

    if not file_emb:
        return AuthResponse(is_authentic=True, confidence=0.0, evidence=["No embedding for this file"], style_profile_exists=True)

    cosine = _get_cosine()
    similarity = cosine(file_emb, profile)

    evidence = [
        f"Style similarity to owner's portfolio: {similarity:.1%}",
        f"Based on {len(embeddings)} reference artworks",
    ]

    return AuthResponse(
        is_authentic=similarity > 0.6,
        confidence=round(similarity, 4),
        evidence=evidence,
        style_profile_exists=True,
    )
