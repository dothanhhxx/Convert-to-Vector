"""
Vector Studio - Vectorizer Engine Module
Supports both VTracer (VisionCortex Multi-Color/Multi-Layer) and
Potrace (Peter Selinger High-Precision Silhouette/B&W) algorithms.
Extracts path topology, anchor node statistics, and formatting.
"""
import re
import time
from typing import Dict, Any, Tuple, Optional
import numpy as np
from PIL import Image
import vtracer
import potrace

def vectorize_image(
    image: Image.Image,
    png_bytes: bytes,
    algorithm: str = "vtracer",          # 'vtracer' or 'potrace'
    color_mode: str = "color",           # 'color', 'grayscale', 'binary'
    hierarchical: str = "stacked",       # 'stacked' or 'cutout'
    curve_mode: str = "spline",          # 'spline' or 'polygon'
    filter_speckle: int = 4,             # 1 to 32
    color_precision: int = 6,            # 1 to 8
    layer_difference: int = 16,          # 1 to 64
    corner_threshold: int = 60,          # 10 to 180 degrees
    length_threshold: float = 4.0,       # 1.0 to 10.0
    max_iterations: int = 10,            # 1 to 20
    splice_threshold: int = 45,          # 10 to 90 degrees
    path_precision: int = 3,             # 1 to 5
    threshold: int = 128,                # for potrace binary cutoff
    potrace_turdsize: int = 2,           # potrace speckle filter
    potrace_alphamax: float = 1.0        # potrace corner threshold
) -> Tuple[str, Dict[str, Any]]:
    """
    Executes vectorization using the selected engine and parameters.
    Returns:
      (svg_string, performance_and_path_statistics_dict)
    """
    start_time = time.perf_counter()
    w, h = image.size

    # Validate algorithm choice
    if color_mode in ("color", "grayscale") and algorithm == "potrace":
        # Potrace is inherently 1-bit binary. If potrace selected for color,
        # we can either run potrace on luminance or fallback to vtracer.
        # Here we run potrace on binary threshold of the image.
        pass

    if algorithm == "potrace" or color_mode == "binary" and algorithm == "potrace":
        svg_content = _run_potrace(
            image=image,
            threshold=threshold,
            turdsize=max(1, potrace_turdsize),
            alphamax=potrace_alphamax
        )
        engine_name = "Potrace B&W Engine"
    else:
        # VTracer engine
        vt_colormode = "binary" if color_mode == "binary" else "color"
        svg_content = vtracer.convert_raw_image_to_svg(
            png_bytes,
            img_format="png",
            colormode=vt_colormode,
            hierarchical=hierarchical,
            mode=curve_mode,
            filter_speckle=max(1, min(64, filter_speckle)),
            color_precision=max(1, min(8, color_precision)),
            layer_difference=max(1, min(64, layer_difference)),
            corner_threshold=max(10, min(180, corner_threshold)),
            length_threshold=max(1.0, min(20.0, float(length_threshold))),
            max_iterations=max(1, min(30, max_iterations)),
            splice_threshold=max(10, min(90, splice_threshold)),
            path_precision=max(1, min(6, path_precision))
        )
        engine_name = "VisionCortex VTracer Engine"

    elapsed_ms = round((time.perf_counter() - start_time) * 1000, 1)

    # Post-process SVG for Adobe Illustrator compatibility & clean structure
    svg_clean = _format_svg_for_illustrator(svg_content, w, h)
    stats = _analyze_svg_topology(svg_clean, len(png_bytes))
    stats["elapsedMs"] = elapsed_ms
    stats["engine"] = engine_name
    stats["dimensions"] = f"{w} × {h} px"

    return svg_clean, stats


def _run_potrace(
    image: Image.Image,
    threshold: int = 128,
    turdsize: int = 2,
    alphamax: float = 1.0
) -> str:
    """
    Traces a PIL image into standard SVG vector paths using Potrace.
    """
    w, h = image.size
    
    # Extract luminance
    if image.mode in ("RGBA", "LA"):
        r, g, b, a = image.convert("RGBA").split()
        gray = image.convert("L")
        gray_arr = np.array(gray)
        a_arr = np.array(a)
        # Black foreground: pixel is dark and not transparent
        binary = (gray_arr < threshold) & (a_arr > 32)
    else:
        gray = image.convert("L")
        gray_arr = np.array(gray)
        binary = gray_arr < threshold

    bitmap = potrace.Bitmap(binary)
    path = bitmap.trace(
        turdsize=turdsize,
        turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY,
        alphamax=alphamax,
        opticurve=1,
        opttolerance=0.2
    )

    path_parts = []
    for curve in path.curves:
        fs = curve.start_point
        path_parts.append(f"M {fs.x:.2f} {fs.y:.2f}")
        for seg in curve.segments:
            if seg.is_corner:
                c = seg.c
                end = seg.end_point
                path_parts.append(f"L {c.x:.2f} {c.y:.2f} L {end.x:.2f} {end.y:.2f}")
            else:
                c1 = seg.c1
                c2 = seg.c2
                end = seg.end_point
                path_parts.append(f"C {c1.x:.2f} {c1.y:.2f} {c2.x:.2f} {c2.y:.2f} {end.x:.2f} {end.y:.2f}")
        path_parts.append("Z")

    d_attr = " ".join(path_parts) if path_parts else "M 0 0"

    svg = f"""<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated by Vector Studio with Potrace Engine -->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="{w}" height="{h}" viewBox="0 0 {w} {h}" version="1.1" xml:space="preserve">
  <g id="Layer_1" fill-rule="evenodd">
    <path d="{d_attr}" fill="#111827"/>
  </g>
</svg>"""
    return svg


def _format_svg_for_illustrator(svg_str: str, width: int, height: int) -> str:
    """
    Ensures standard SVG dimensions, viewBox, and clean namespaces for Adobe Illustrator.
    """
    # If width/height or viewBox missing, patch them
    if 'viewBox="' not in svg_str and f'viewBox="0 0 {width} {height}"' not in svg_str:
        svg_str = re.sub(
            r'<svg([^>]*)>',
            rf'<svg\1 viewBox="0 0 {width} {height}" xml:space="preserve">',
            svg_str,
            count=1
        )
    return svg_str


def _analyze_svg_topology(svg_content: str, original_bytes_len: int) -> Dict[str, Any]:
    """
    Parses path count, anchor points/control nodes, and compression statistics.
    """
    svg_bytes_len = len(svg_content.encode("utf-8"))

    # Count paths and polygons
    path_matches = re.findall(r'<path[^>]*>', svg_content, re.IGNORECASE)
    polygon_matches = re.findall(r'<polygon[^>]*>', svg_content, re.IGNORECASE)
    total_paths = len(path_matches) + len(polygon_matches)

    # Count anchor nodes (M, C, S, Q, L commands in d attributes)
    d_contents = re.findall(r'd="([^"]*)"', svg_content, re.IGNORECASE)
    total_nodes = 0
    for d in d_contents:
        # Match curve and line command letters
        total_nodes += len(re.findall(r'[MmLlCcSsQqZz]', d))

    compression_ratio = round((svg_bytes_len / original_bytes_len) * 100, 1) if original_bytes_len > 0 else 100.0

    return {
        "pathCount": max(1, total_paths),
        "nodeCount": max(total_paths * 4, total_nodes),
        "svgSizeBytes": svg_bytes_len,
        "svgSizeFormatted": f"{svg_bytes_len / 1024:.1f} KB" if svg_bytes_len >= 1024 else f"{svg_bytes_len} B",
        "compressionRatio": f"{compression_ratio}%",
    }
