import io
import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import Response
from PIL import Image, ImageDraw, ImageFont
from app.dependencies import get_current_user
from app.services.event_log import event_log, EventType

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/watermark", tags=["watermark"])

_FONT_SIZE_RATIO = 0.04
_MAX_TEXT_LENGTH = 30


def _draw_watermark(
    img: Image.Image,
    text: str,
    style: str = "grid",
    opacity: int = 30,
    color: str = "white",
) -> Image.Image:
    if img.mode == "RGBA":
        img = img.convert("RGBA")
    else:
        img = img.convert("RGBA")

    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    alpha = int(255 * opacity / 100)
    rgba = (255, 255, 255, alpha) if color == "white" else (0, 0, 0, alpha)

    base_size = max(20, int(img.width * _FONT_SIZE_RATIO))
    try:
        font = ImageFont.truetype("arial.ttf", base_size)
    except (IOError, OSError):
        font = ImageFont.load_default()

    if style == "grid":
        spacing = base_size * 6
        import math
        diagonal = int(math.sqrt(img.width ** 2 + img.height ** 2))
        for y in range(-diagonal, diagonal, spacing):
            for x in range(-diagonal, diagonal, spacing * 2):
                draw.text((x + (0 if (y // spacing) % 2 == 0 else spacing), y),
                          text, font=font, fill=rgba)

    elif style == "center":
        center_size = max(40, int(img.width * 0.15))
        try:
            font = ImageFont.truetype("arial.ttf", center_size)
        except (IOError, OSError):
            font = ImageFont.load_default()
        bbox = draw.textbbox((0, 0), text, font=font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        cx, cy = img.width // 2, img.height // 2
        draw.text((cx - tw // 2, cy - th // 2), text, font=font, fill=rgba)

    elif style == "badge":
        badge_w = int(img.width * 0.3)
        badge_h = int(badge_w * 0.25)
        margin = int(img.width * 0.05)
        x = img.width - badge_w - margin
        y = img.height - badge_h - margin
        bg_color = (0, 0, 0, 217) if color == "white" else (255, 255, 255, 242)
        draw.rounded_rectangle([x, y, x + badge_w, y + badge_h], radius=10, fill=bg_color)
        text_color = "white" if color == "white" else "black"
        try:
            font_b = ImageFont.truetype("arial.ttf", int(badge_h * 0.35))
            font_s = ImageFont.truetype("arial.ttf", int(badge_h * 0.18))
        except (IOError, OSError):
            font_b = ImageFont.load_default()
            font_s = ImageFont.load_default()
        bbox = draw.textbbox((0, 0), text, font=font_b)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        draw.text((x + (badge_w - tw) // 2, y + (badge_h - th) // 2 - int(badge_h * 0.1)),
                  text, font=font_b, fill=text_color)
        bbox2 = draw.textbbox((0, 0), "CVBER VERIFIED AUTHENTIC", font=font_s)
        tw2 = bbox2[2] - bbox2[0]
        draw.text((x + (badge_w - tw2) // 2, y + badge_h - int(badge_h * 0.3)),
                  "CVBER VERIFIED AUTHENTIC", font=font_s, fill=(128, 128, 128, 200))

    img = Image.alpha_composite(img, overlay)
    return img


@router.post("")
async def apply_watermark(
    file: UploadFile = File(...),
    text: str = Form("Cvber Protected"),
    style: str = Form("grid"),
    opacity: int = Form(30),
    color: str = Form("white"),
    current_user: dict = Depends(get_current_user),
):
    if len(text) > _MAX_TEXT_LENGTH:
        raise HTTPException(status_code=400, detail=f"Text too long (max {_MAX_TEXT_LENGTH} chars)")
    if style not in ("grid", "center", "badge"):
        raise HTTPException(status_code=400, detail="Style must be grid, center, or badge")
    if opacity < 5 or opacity > 100:
        raise HTTPException(status_code=400, detail="Opacity must be 5-100")
    if color not in ("white", "black"):
        raise HTTPException(status_code=400, detail="Color must be white or black")

    try:
        image_bytes = await file.read()
        img = Image.open(io.BytesIO(image_bytes))
        result = _draw_watermark(img, text, style, opacity, color)

        buf = io.BytesIO()
        result.save(buf, format="PNG")
        buf.seek(0)

        try:
            event_log.append_event(
                event_type=EventType.WATERMARK,
                actor_id=current_user["id"],
                actor_type="user",
                asset_id=file.filename or "unknown",
                details={"style": style, "opacity": opacity, "text": text},
            )
        except Exception:
            pass

        return Response(content=buf.getvalue(), media_type="image/png")
    except Exception as e:
        logger.error(f"Watermark failed: {e}")
        raise HTTPException(status_code=500, detail=f"Watermark failed: {str(e)}")
