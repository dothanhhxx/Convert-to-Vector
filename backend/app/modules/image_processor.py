"""
Vector Studio - Image Preprocessor Module
Handles color quantization, color mode conversions, noise filtering,
thresholding, and background removal/transparency extraction.
"""
from io import BytesIO
from typing import Dict, Any, Optional, Tuple
import numpy as np
from PIL import Image, ImageFilter, ImageOps

def preprocess_image(
    image: Image.Image,
    color_mode: str = "color",           # 'color', 'grayscale', 'binary'
    num_colors: Optional[int] = 16,      # 2 to 64, or None for unlimited
    noise_reduction: int = 0,            # 0 to 10
    remove_background: bool = False,     # True to remove solid/white background
    bg_tolerance: int = 25,              # 0 to 100 tolerance for bg removal
    threshold: int = 128,                # 0 to 255 for binary / B&W mode
    max_dimension: Optional[int] = None  # Optional resize for huge images
) -> Tuple[Image.Image, bytes, Dict[str, Any]]:
    """
    Applies the full preprocessing pipeline on the input image.
    Returns:
      (processed_PIL_image, png_bytes, stats_dict)
    """
    img = image.copy()
    stats = {}

    # 1. Resize if image is excessively large and max_dimension is provided
    orig_w, orig_h = img.size
    if max_dimension and (orig_w > max_dimension or orig_h > max_dimension):
        img.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
        stats["downscaled"] = f"{orig_w}x{orig_h} -> {img.width}x{img.height}"
    else:
        stats["downscaled"] = "original"

    # Ensure working in RGBA or RGB
    if img.mode != "RGBA" and img.mode != "RGB":
        img = img.convert("RGBA" if "transparency" in img.info else "RGB")

    # 2. Noise Reduction (if requested)
    if noise_reduction > 0:
        if noise_reduction == 1:
            img = img.filter(ImageFilter.SMOOTH)
        elif noise_reduction <= 4:
            img = img.filter(ImageFilter.MedianFilter(size=3))
        else:
            radius = min(2.5, 0.3 * noise_reduction)
            img = img.filter(ImageFilter.GaussianBlur(radius=radius))
        stats["noiseReductionApplied"] = f"level {noise_reduction}"

    # 3. Background Removal (make background transparent)
    if remove_background:
        img = remove_solid_background(img, tolerance=bg_tolerance)
        stats["backgroundRemoved"] = True

    # 4. Color Mode Processing
    if color_mode == "grayscale":
        # Preserve alpha if present
        if img.mode == "RGBA":
            r, g, b, a = img.split()
            gray = ImageOps.grayscale(Image.merge("RGB", (r, g, b)))
            # Recombine with alpha
            gray_rgb = Image.merge("RGB", (gray, gray, gray))
            img = Image.merge("RGBA", (*gray_rgb.split(), a))
        else:
            gray = ImageOps.grayscale(img)
            img = Image.merge("RGB", (gray, gray, gray))
        stats["colorMode"] = "grayscale"

    elif color_mode == "binary":
        # Pure Black & White with threshold
        if img.mode == "RGBA":
            r, g, b, a = img.split()
            gray = ImageOps.grayscale(Image.merge("RGB", (r, g, b)))
            # Mask pixels darker than threshold as black, lighter as white
            gray_arr = np.array(gray)
            binary_arr = np.where(gray_arr < threshold, 0, 255).astype(np.uint8)
            bin_img = Image.fromarray(binary_arr, mode="L")
            # Preserve original alpha mask
            a_arr = np.array(a)
            final_a = np.where(a_arr > 10, 255, 0).astype(np.uint8)
            img = Image.merge("RGBA", (bin_img, bin_img, bin_img, Image.fromarray(final_a, mode="L")))
        else:
            gray = ImageOps.grayscale(img)
            gray_arr = np.array(gray)
            binary_arr = np.where(gray_arr < threshold, 0, 255).astype(np.uint8)
            bin_img = Image.fromarray(binary_arr, mode="L")
            img = Image.merge("RGB", (bin_img, bin_img, bin_img))
        stats["colorMode"] = f"binary (threshold={threshold})"

    else:
        # Full Color Mode
        stats["colorMode"] = "color"

    # 5. Color Quantization (Number of Colors)
    if color_mode != "binary" and num_colors and num_colors > 0:
        actual_colors = max(2, min(64, num_colors))
        if img.mode == "RGBA":
            # Quantize RGB channels while preserving alpha
            r, g, b, a = img.split()
            rgb = Image.merge("RGB", (r, g, b))
            quantized = rgb.quantize(colors=actual_colors, method=Image.Quantize.MEDIANCUT).convert("RGB")
            img = Image.merge("RGBA", (*quantized.split(), a))
        else:
            img = img.quantize(colors=actual_colors, method=Image.Quantize.MEDIANCUT).convert("RGB")
        stats["quantizedColors"] = actual_colors

    # Encode to PNG bytes
    buf = BytesIO()
    img.save(buf, format="PNG", optimize=True)
    png_bytes = buf.getvalue()

    return img, png_bytes, stats


def remove_solid_background(img: Image.Image, tolerance: int = 25) -> Image.Image:
    """
    Detects solid background from corner pixels and replaces matching pixels with alpha = 0.
    """
    img_rgba = img.convert("RGBA")
    arr = np.array(img_rgba)
    h, w, _ = arr.shape

    # Sample corners (top-left, top-right, bottom-left, bottom-right)
    corners = [
        arr[0, 0, :3],
        arr[0, w - 1, :3],
        arr[h - 1, 0, :3],
        arr[h - 1, w - 1, :3]
    ]
    # Pick the most frequent corner color as the candidate background
    bg_color = np.median(corners, axis=0)

    # Calculate Euclidean distance of every pixel to the background color
    rgb = arr[:, :, :3].astype(np.float32)
    dist = np.sqrt(np.sum((rgb - bg_color) ** 2, axis=2))

    # Tolerance scaling: scale 0-100 to color distance 0-150
    tol_dist = (tolerance / 100.0) * 150.0

    # Pixels close to background color become transparent
    is_bg = dist <= tol_dist
    arr[is_bg, 3] = 0

    return Image.fromarray(arr, mode="RGBA")
