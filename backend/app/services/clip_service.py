import os

_CLIP_ENABLED = os.getenv("CLIP_ENABLED", "true").lower() in ("1", "true", "yes")

try:
    if _CLIP_ENABLED:
        import torch
        import numpy as np
        from sentence_transformers import SentenceTransformer
        _CLIP_AVAILABLE = True
    else:
        torch = None; np = None; SentenceTransformer = None
        _CLIP_AVAILABLE = False
except ImportError:
    torch = None
    np = None
    SentenceTransformer = None
    _CLIP_AVAILABLE = False

from PIL import Image
from functools import lru_cache
import httpx
import io
import logging

logger = logging.getLogger(__name__)

@lru_cache(maxsize=1)
def get_clip_model():
    if not _CLIP_AVAILABLE:
        logger.warning("CLIP dependencies not installed. Install torch, numpy, sentence-transformers.")
        return None
    logger.info("Loading CLIP model...")
    try:
        model = SentenceTransformer('clip-ViT-B-32')

        try:
            from torchao.quantization import quantize_, int8_dynamic_activation_int8_weight
            quantize_(model, int8_dynamic_activation_int8_weight())
            logger.info("CLIP model quantized with torchao INT8 (~280MB RAM)")
        except ImportError:
            try:
                model = torch.quantization.quantize_dynamic(
                    model, {torch.nn.Linear}, dtype=torch.qint8
                )
                logger.info("CLIP model quantized with legacy torch.quantization (~280MB RAM)")
            except Exception:
                logger.info("CLIP model loaded without quantization (~700MB RAM)")

        return model
    except Exception as e:
        logger.error(f"Failed to load CLIP model: {e}")
        return None


def normalize_embedding(embedding) -> list[float]:
    norm = np.linalg.norm(embedding)
    if norm == 0:
        return embedding.tolist()
    return (embedding / norm).tolist()

def generate_embedding_from_pil(image: Image.Image) -> list[float] | None:
    if not _CLIP_AVAILABLE:
        logger.warning("CLIP not available: missing torch/numpy/sentence-transformers")
        return None
    try:
        model = get_clip_model()
        if not model:
            return None
        embedding = model.encode(image)
        return normalize_embedding(np.array(embedding))
    except Exception as e:
        logger.error(f"Failed to generate CLIP embedding: {e}")
        return None

def generate_embedding_from_bytes(image_bytes: bytes) -> list[float] | None:
    if not _CLIP_AVAILABLE:
        return None
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        return generate_embedding_from_pil(image)
    except Exception as e:
        logger.error(f"Failed to process image bytes: {e}")
        return None

async def generate_embedding_from_url(url: str) -> list[float] | None:
    if not _CLIP_AVAILABLE:
        return None
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
