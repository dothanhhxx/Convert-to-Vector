"""
Vector Studio - Image Upload Module
Handles validation, metadata extraction, format verification, and safe buffering.
"""
from io import BytesIO
from typing import Dict, Any, Tuple
from PIL import Image

ALLOWED_MIME_TYPES = {
    "image/png": "PNG",
    "image/jpeg": "JPEG",
    "image/jpg": "JPEG",
    "image/webp": "WEBP",
    "image/bmp": "BMP",
}

MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB
MAX_RECOMMENDED_DIMENSION = 3000  # Recommend downscaling if larger for speed

def validate_and_inspect_image(file_bytes: bytes, filename: str) -> Tuple[Dict[str, Any], Image.Image]:
    """
    Validates uploaded file bytes and extracts rich metadata.
    Returns metadata dict and opened PIL Image.
    """
    if len(file_bytes) == 0:
        raise ValueError("Uploaded file is empty.")
    
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise ValueError(f"File size exceeds maximum allowed size of {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB.")

    try:
        image = Image.open(BytesIO(file_bytes))
        image.load()  # Verify image integrity
    except Exception as e:
        raise ValueError(f"Invalid or corrupted image file: {str(e)}")

    img_format = (image.format or "PNG").upper()
    width, height = image.size
    aspect_ratio = round(width / height, 3) if height > 0 else 1.0
    mode = image.mode
    has_alpha = mode in ("RGBA", "LA") or (mode == "P" and "transparency" in image.info)

    # Estimate unique colors
    color_count_note = "N/A"
    try:
        # Sample for quick color estimation if large
        small = image.copy()
        small.thumbnail((150, 150))
        unique_colors = len(set(small.getdata()))
        color_count_note = f"~{unique_colors} estimated"
    except Exception:
        pass

    metadata = {
        "filename": filename,
        "format": img_format,
        "width": width,
        "height": height,
        "aspectRatio": aspect_ratio,
        "mode": mode,
        "hasAlpha": has_alpha,
        "sizeBytes": len(file_bytes),
        "sizeFormatted": format_bytes(len(file_bytes)),
        "colorCountEstimate": color_count_note,
        "isHighResolution": width > 2000 or height > 2000,
    }

    return metadata, image

def format_bytes(num_bytes: int) -> str:
    """Formats byte counts into human-readable string."""
    if num_bytes < 1024:
        return f"{num_bytes} B"
    elif num_bytes < 1024 * 1024:
        return f"{num_bytes / 1024:.1f} KB"
    else:
        return f"{num_bytes / (1024 * 1024):.2f} MB"
