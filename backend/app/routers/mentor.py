from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import ChatRequest, ChatResponse
from app.services.vertex_ai import vertex_ai_service
from app.dependencies import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/mentor", tags=["mentor"])

@router.post("/chat", response_model=ChatResponse)
async def mentor_chat(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Chat with the AI Security Mentor.
    """
    try:
        # Convert history objects to dictionaries for the service
        history_dicts = [{"role": msg.role, "content": msg.content} for msg in request.history]

        response_text = await vertex_ai_service.get_mentor_response(
            message=request.message,
            history=history_dicts
        )

        return ChatResponse(
            response=response_text,
            context_used=["general_knowledge", "cvber_free_specs"]
        )
    except Exception as e:
        logger.error(f"Mentor Chat Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get AI response")
