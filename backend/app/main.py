"""
Vector Studio - Backend Application Entrypoint
FastAPI server powering high-fidelity vector conversion and multi-format export.
"""
import os
import base64
import uuid
import re
import unicodedata
import urllib.parse
from io import BytesIO
from typing import Optional, Dict, Any
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from PIL import Image

from app.modules.upload import validate_and_inspect_image, format_bytes
from app.modules.image_processor import preprocess_image
from app.modules.vectorizer import vectorize_image
from app.modules.exporter import (
    generate_pdf_vector,
    generate_eps_vector,
    generate_ai_vector,
    generate_bundle_zip,
    ILLUSTRATOR_GUIDE_TEXT
)

app = FastAPI(
    title="Vector Studio API",
    description="Professional PNG/JPG to Vector SVG & Adobe Illustrator Exporter API",
    version="1.0.0"
)

# Enable CORS for Vite dev server (localhost:5173 / localhost:3000 / localhost:8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for active session images
# {image_id: {"bytes": bytes, "metadata": dict, "image": PIL.Image}}
IMAGE_STORE: Dict[str, Dict[str, Any]] = {}
SAMPLES_DIR = Path(__file__).parent / "samples"


class VectorizeRequest(BaseModel):
    image_id: Optional[str] = None
    image_base64: Optional[str] = None
    filename: Optional[str] = "image"
    algorithm: str = "vtracer"              # 'vtracer' or 'potrace'
    color_mode: str = "color"               # 'color', 'grayscale', 'binary'
    num_colors: Optional[int] = 16          # 2 to 64
    detail_level: str = "high"             # 'low', 'medium', 'high', 'ultra'
    filter_speckle: int = 4                # 1 to 32
    color_precision: int = 6               # 1 to 8
    layer_difference: int = 16             # 1 to 64
    corner_threshold: int = 60             # 10 to 180 degrees
    length_threshold: float = 4.0          # 1.0 to 10.0
    max_iterations: int = 10               # 1 to 20
    splice_threshold: int = 45             # 10 to 90 degrees
    path_precision: int = 3                # 1 to 5
    noise_reduction: int = 0               # 0 to 10
    remove_background: bool = False
    bg_tolerance: int = 25                 # 0 to 100
    threshold: int = 128                   # 0 to 255 for B&W
    hierarchical: str = "stacked"          # 'stacked' or 'cutout'
    curve_mode: str = "spline"             # 'spline' or 'polygon'


class ExportRequest(BaseModel):
    svg: str
    format: str = "svg"                    # 'svg', 'pdf', 'eps', 'ai', 'zip'
    filename: str = "vector_artwork"


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "engines": ["VisionCortex VTracer", "Peter Selinger Potrace", "PyMuPDF Vector Engine"],
        "version": "1.0.0"
    }


@app.get("/api/samples")
def get_sample_images():
    """Lists preloaded sample images with metadata and base64 previews."""
    samples = []
    if SAMPLES_DIR.exists():
        for f in SAMPLES_DIR.glob("*.png"):
            try:
                data = f.read_bytes()
                img = Image.open(BytesIO(data))
                b64 = base64.b64encode(data).decode("utf-8")
                
                # Friendly display labels
                names_map = {
                    "logo_shield.png": ("Shield Crest Logo", "Modern multi-color badge with sharp geometry"),
                    "mascot_robot.png": ("Friendly Robot Mascot", "Multi-layered cute illustration with facial features"),
                    "vintage_crest.png": ("Monochrome Vintage Crest", "High-contrast emblem ideal for B&W and Potrace"),
                }
                title, desc = names_map.get(f.name, (f.stem.replace("_", " ").title(), "Sample graphic"))
                
                samples.append({
                    "id": f.stem,
                    "filename": f.name,
                    "title": title,
                    "description": desc,
                    "width": img.width,
                    "height": img.height,
                    "sizeFormatted": format_bytes(len(data)),
                    "preview": f"data:image/png;base64,{b64}"
                })
            except Exception as e:
                continue
    return {"samples": samples}


@app.post("/api/upload")
async def upload_image(file: UploadFile = File(...)):
    """Handles image upload, validates file type & size, and returns inspection metadata."""
    try:
        content = await file.read()
        metadata, img = validate_and_inspect_image(content, file.filename or "uploaded_image.png")
        
        image_id = str(uuid.uuid4())
        IMAGE_STORE[image_id] = {
            "bytes": content,
            "metadata": metadata,
            "image": img
        }
        
        # Cleanup old items if store exceeds 30
        if len(IMAGE_STORE) > 30:
            first_key = next(iter(IMAGE_STORE))
            del IMAGE_STORE[first_key]
            
        b64_data = base64.b64encode(content).decode("utf-8")
        mime = f"image/{metadata['format'].lower()}"
        preview_data_url = f"data:{mime};base64,{b64_data}"
        
        return {
            "success": True,
            "imageId": image_id,
            "metadata": metadata,
            "previewUrl": preview_data_url
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process image: {str(e)}")


@app.post("/api/vectorize")
def vectorize_endpoint(req: VectorizeRequest):
    """
    Executes full vectorization pipeline:
    1. Retrieve or decode image
    2. Image Preprocessor (Color quantization, noise filter, background removal, threshold)
    3. Vectorizer Engine (VTracer or Potrace)
    4. Topology analysis and stats extraction
    """
    try:
        # Obtain source PIL image
        if req.image_id and req.image_id in IMAGE_STORE:
            source_img = IMAGE_STORE[req.image_id]["image"]
            orig_bytes = IMAGE_STORE[req.image_id]["bytes"]
        elif req.image_base64:
            # Strip data URL header if present
            b64_str = req.image_base64
            if "," in b64_str:
                b64_str = b64_str.split(",", 1)[1]
            raw_bytes = base64.b64decode(b64_str)
            _, source_img = validate_and_inspect_image(raw_bytes, req.filename or "image.png")
            orig_bytes = raw_bytes
        else:
            raise HTTPException(status_code=400, detail="Missing image_id or image_base64.")

        # Preset tuning based on detail level
        filter_speckle = req.filter_speckle
        color_precision = req.color_precision
        max_iterations = req.max_iterations
        if req.detail_level == "low":
            filter_speckle = max(filter_speckle, 10)
            color_precision = min(color_precision, 4)
            max_iterations = 6
        elif req.detail_level == "medium":
            filter_speckle = max(filter_speckle, 4)
            color_precision = min(color_precision, 6)
            max_iterations = 10
        elif req.detail_level == "ultra":
            filter_speckle = 1
            color_precision = 8
            max_iterations = 18

        # 1. Preprocessing stage
        processed_img, prep_bytes, prep_stats = preprocess_image(
            image=source_img,
            color_mode=req.color_mode,
            num_colors=req.num_colors,
            noise_reduction=req.noise_reduction,
            remove_background=req.remove_background,
            bg_tolerance=req.bg_tolerance,
            threshold=req.threshold,
            max_dimension=2800  # Safeguard against browser-crashing dimensions
        )

        # 2. Vectorization stage
        svg_content, vector_stats = vectorize_image(
            image=processed_img,
            png_bytes=prep_bytes,
            algorithm=req.algorithm,
            color_mode=req.color_mode,
            hierarchical=req.hierarchical,
            curve_mode=req.curve_mode,
            filter_speckle=filter_speckle,
            color_precision=color_precision,
            layer_difference=req.layer_difference,
            corner_threshold=req.corner_threshold,
            length_threshold=req.length_threshold,
            max_iterations=max_iterations,
            splice_threshold=req.splice_threshold,
            path_precision=req.path_precision,
            threshold=req.threshold
        )

        # Combine stats
        combined_stats = {
            **prep_stats,
            **vector_stats,
            "originalSizeFormatted": format_bytes(len(orig_bytes)),
            "processedDimensions": f"{processed_img.width} × {processed_img.height} px"
        }

        # Encode preprocessed image for split preview if background was removed or quantized
        prep_b64 = base64.b64encode(prep_bytes).decode("utf-8")
        preprocessed_preview = f"data:image/png;base64,{prep_b64}"

        return {
            "success": True,
            "svg": svg_content,
            "stats": combined_stats,
            "preprocessedPreview": preprocessed_preview
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vectorization failed: {str(e)}")


def make_content_disposition(filename: str) -> str:
    """
    Constructs an RFC 6266 / RFC 5987 compliant Content-Disposition header.
    Prevents 'latin-1' codec encoding crashes while preserving full UTF-8 Unicode
    filenames (such as Vietnamese characters with diacritics) for all modern browsers.
    """
    ext = Path(filename).suffix
    base = Path(filename).stem

    # 1. Transliterate to clean ASCII for legacy fallback
    nfkd = unicodedata.normalize('NFKD', base)
    ascii_base = nfkd.encode('ascii', 'ignore').decode('ascii')
    clean_ascii_base = re.sub(r'[^\w\-]', '_', ascii_base).strip('_')
    if not clean_ascii_base:
        clean_ascii_base = "vector_artwork"
    ascii_filename = f"{clean_ascii_base}{ext}"

    # 2. RFC 5987 percent-encode original Unicode filename (supports full Vietnamese characters)
    encoded_filename = urllib.parse.quote(filename)

    return f'attachment; filename="{ascii_filename}"; filename*=UTF-8\'\'{encoded_filename}'


@app.post("/api/export")
def export_endpoint(req: ExportRequest):
    """
    Exports SVG vector into requested format:
    - svg: raw SVG document
    - pdf: true vector PDF
    - eps: Encapsulated PostScript 3.0
    - ai: Adobe Illustrator compatible vector file
    - zip: complete bundle of all formats + workflow guide
    """
    if not req.svg or not req.svg.strip():
        raise HTTPException(status_code=400, detail="Empty SVG content provided.")

    base_title = Path(req.filename).stem or "vector_artwork"
    fmt = req.format.lower().strip()

    try:
        if fmt == "svg":
            content_bytes = req.svg.encode("utf-8")
            media_type = "image/svg+xml"
            ext = "svg"
        elif fmt == "pdf":
            content_bytes = generate_pdf_vector(req.svg)
            media_type = "application/pdf"
            ext = "pdf"
        elif fmt == "eps":
            content_bytes = generate_eps_vector(req.svg, title=base_title)
            media_type = "application/postscript"
            ext = "eps"
        elif fmt == "ai":
            content_bytes = generate_ai_vector(req.svg, title=base_title)
            media_type = "application/illustrator"
            ext = "ai"
        elif fmt == "zip":
            content_bytes = generate_bundle_zip(req.svg, base_name=base_title)
            media_type = "application/zip"
            ext = "zip"
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported format: {fmt}")

        out_filename = f"{base_title}.{ext}"
        content_disposition = make_content_disposition(out_filename)
        return Response(
            content=content_bytes,
            media_type=media_type,
            headers={
                "Content-Disposition": content_disposition,
                "Content-Length": str(len(content_bytes)),
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")


@app.get("/api/guide")
def get_illustrator_guide():
    """Returns the Adobe Illustrator editing guide text."""
    return {"guide": ILLUSTRATOR_GUIDE_TEXT}


# Mount built frontend if dist directory exists (supports local, Render, Docker, HF Spaces)
candidate_paths = [
    Path(__file__).resolve().parent.parent.parent / "frontend" / "dist",
    Path(__file__).resolve().parent.parent / "frontend" / "dist",
    Path(__file__).resolve().parent / "dist",
    Path("/app/frontend/dist"),
    Path("/app/dist"),
]

for p in candidate_paths:
    if p.exists() and (p / "index.html").exists():
        app.mount("/", StaticFiles(directory=str(p), html=True), name="frontend")
        break
