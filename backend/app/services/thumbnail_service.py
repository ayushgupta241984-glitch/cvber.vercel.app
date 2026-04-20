from PIL import Image
import io

def generate_thumbnail(image_bytes: bytes, size: tuple = (200, 200)) -> bytes:
    """Generate a square thumbnail from image bytes."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    
    # Crop to square (center crop)
    width, height = img.size
    min_dim = min(width, height)
    left = (width - min_dim) // 2
    top = (height - min_dim) // 2
    img = img.crop((left, top, left + min_dim, top + min_dim))
    
    # Resize to target size
    img = img.resize(size, Image.LANCZOS)
    
    # Convert to JPEG bytes
    output = io.BytesIO()
    img.save(output, format="JPEG", quality=85)
    return output.getvalue()
