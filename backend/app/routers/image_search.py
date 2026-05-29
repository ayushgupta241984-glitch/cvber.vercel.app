from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.dependencies import get_current_user
from app.services.image_search import search_image
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/search", tags=["image_search"])


@router.post("/reverse")
async def reverse_image_search(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")
    try:
        result = await search_image(image_bytes)
        return result
    except Exception as e:
        logger.error(f"Image search failed: {e}")
        raise HTTPException(status_code=500, detail="Image search failed")
