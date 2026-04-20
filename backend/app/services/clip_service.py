import torch
import numpy as np
from PIL import Image
from sentence_transformers import SentenceTransformer
from functools import lru_cache
import httpx
import io
import logging

logger = logging.getLogger(__name__)

@lru_cache(maxsize=1)
def get_clip_model():
    """
    Load CLIP model once and cache it.
    Attempts INT8 quantization (via torchao) to reduce RAM from ~700MB to ~280MB.
    Falls back to unquantized model if torchao is unavailable.
    Called at app startup so first request isn't slow.
    """
    logger.info("Loading CLIP model...")
    try:
        model = SentenceTransformer('clip-ViT-B-32')
        
        # Try modern torchao quantization first, fall back to legacy, then unquantized
        try:
            from torchao.quantization import quantize_, int8_dynamic_activation_int8_weight
            quantize_(model, int8_dynamic_activation_int8_weight())
            logger.info("CLIP model quantized with torchao INT8 (~280MB RAM)")
        except ImportError:
            try:
                # Legacy approach (torch 2.x) — deprecated but still functional
                model = torch.quantization.quantize_dynamic(  # noqa: deprecated
                    model, {torch.nn.Linear}, dtype=torch.qint8
                )
                logger.info("CLIP model quantized with legacy torch.quantization (~280MB RAM)")
            except Exception:
                logger.info("CLIP model loaded without quantization (~700MB RAM)")
        
        return model
    except Exception as e:
        logger.error(f"Failed to load CLIP model: {e}")
        return None


def normalize_embedding(embedding: np.ndarray) -> list[float]:
    """Normalize vector to unit length for cosine similarity."""
    norm = np.linalg.norm(embedding)
    if norm == 0:
        return embedding.tolist()
    return (embedding / norm).tolist()

def generate_embedding_from_pil(image: Image.Image) -> list[float] | None:
    """Generate normalized CLIP embedding from a PIL Image."""
    try:
        model = get_clip_model()
        if not model:
            return None
        # sentence-transformers CLIP accepts PIL images directly
        embedding = model.encode(image)
        return normalize_embedding(np.array(embedding))
    except Exception as e:
        logger.error(f"Failed to generate CLIP embedding: {e}")
        return None

def generate_embedding_from_bytes(image_bytes: bytes) -> list[float] | None:
    """Generate CLIP embedding from raw image bytes."""
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        return generate_embedding_from_pil(image)
    except Exception as e:
        logger.error(f"Failed to process image bytes: {e}")
        return None

async def generate_embedding_from_url(url: str) -> list[float] | None:
    """Download image from URL and generate CLIP embedding."""
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            content_type = response.headers.get("content-type", "")
            if not content_type.startswith("image/"):
                logger.warning(f"URL {url} is not an image: {content_type}")
                return None
            return generate_embedding_from_bytes(response.content)
    except Exception as e:
        logger.error(f"Failed to generate embedding from URL {url}: {e}")
        return None
