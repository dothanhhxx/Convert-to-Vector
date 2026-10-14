"""
Vector Studio - Multi-Format Vector Exporter Module
Exports SVG, PDF, EPS, and AI (Adobe Illustrator Compatible) files.
Extracts vector drawing commands to produce 100% genuine vector geometry.
"""
import io
import re
import zipfile
from typing import Dict, Any, Tuple
import fitz

ILLUSTRATOR_GUIDE_TEXT = """===============================================================
Vector Studio - Adobe Illustrator Workflow & Editing Guide
===============================================================

Your vector export contains 100% genuine vector paths and Bézier curves.
Follow these steps to open and edit in Adobe Illustrator:

1. OPENING THE FILE:
   - Method A (Direct): Launch Adobe Illustrator -> File -> Open (Ctrl+O / Cmd+O)
     and select your .svg, .pdf, .eps, or .ai file.
   - Method B (Place into Artboard): In an existing project, choose
     File -> Place (Ctrl+Shift+P / Cmd+Shift+P) and click to embed.

2. UNGROUPING & ISOLATING PATHS:
   - Upon opening, all traced shapes are grouped together on Layer 1.
   - Select the artwork with Selection Tool (V).
   - Press Ctrl+Shift+G (Cmd+Shift+G) repeatedly or right-click -> "Ungroup"
     until individual shapes are accessible.

3. INSPECTING & EDITING ANCHOR POINTS:
   - Press 'A' to switch to Direct Selection Tool.
   - Click any path to view its anchor points and smooth Bézier curve handles.
   - Use the Pen Tool (P) or Anchor Point Tool (Shift+C) to adjust curve curvature.

4. RECOLORING & STYLING:
   - Use Window -> Swatches or Color (F6) to recolor individual vector shapes.
   - Use the Recolor Artwork dialog (Edit -> Edit Colors -> Recolor Artwork)
     to harmonize your vector palette instantly.

5. SAVING AS NATIVE AI / CLOUD DOCUMENT:
   - Choose File -> Save As... (Ctrl+Shift+S / Cmd+Shift+S).
   - Select "Adobe Illustrator (*.AI)" as the format.
   - Check "Create PDF Compatible File" for maximum cross-application support.
===============================================================
"""

def generate_pdf_vector(svg_content: str) -> bytes:
    """
    Converts SVG into a high-fidelity vector PDF using PyMuPDF.
    Preserves all paths, Bézier curves, and fills.
    """
    svg_doc = fitz.open(stream=svg_content.encode("utf-8"), filetype="svg")
    pdf_bytes = svg_doc.convert_to_pdf()
    return pdf_bytes


def generate_eps_vector(svg_content: str, title: str = "Vector Studio Export") -> bytes:
    """
    Generates standard PostScript Level 3 Encapsulated PostScript (EPS).
    Extracts vector drawing instructions from PyMuPDF and translates them into PostScript.
    """
    svg_doc = fitz.open(stream=svg_content.encode("utf-8"), filetype="svg")
    pdf_bytes = svg_doc.convert_to_pdf()
    pdf_doc = fitz.open("pdf", pdf_bytes)
    page = pdf_doc[0]
    rect = page.rect
    width = float(rect.width)
    height = float(rect.height)

    eps_lines = [
        "%!PS-Adobe-3.0 EPSF-3.0",
        f"%%BoundingBox: 0 0 {int(width + 0.999)} {int(height + 0.999)}",
        f"%%HiResBoundingBox: 0.0 0.0 {width:.4f} {height:.4f}",
        f"%%Title: {title}",
        "%%Creator: Vector Studio - Adobe Illustrator Exporter",
        "%%Pages: 1",
        "%%EndComments",
        "%%BeginProlog",
        "/m {moveto} bind def",
        "/l {lineto} bind def",
        "/c {curveto} bind def",
        "/cp {closepath} bind def",
        "/rgb {setrgbcolor} bind def",
        "/f {fill} bind def",
        "/s {stroke} bind def",
        "/w {setlinewidth} bind def",
        "%%EndProlog",
        "%%Page: 1 1",
        "gsave"
    ]

    drawings = page.get_drawings()
    for d in drawings:
        fill = d.get("fill")
        stroke_color = d.get("color")
        stroke_width = d.get("width", 1.0)
        items = d.get("items", [])
        if not items:
            continue

        eps_lines.append("newpath")
        for item in items:
            cmd = item[0]
            if cmd == "l":  # line
                p1, p2 = item[1], item[2]
                eps_lines.append(f"{p1.x:.3f} {height - p1.y:.3f} m")
                eps_lines.append(f"{p2.x:.3f} {height - p2.y:.3f} l")
            elif cmd == "c":  # cubic Bezier curve
                p1, p2, p3, p4 = item[1], item[2], item[3], item[4]
                eps_lines.append(f"{p1.x:.3f} {height - p1.y:.3f} m")
                eps_lines.append(f"{p2.x:.3f} {height - p2.y:.3f} {p3.x:.3f} {height - p3.y:.3f} {p4.x:.3f} {height - p4.y:.3f} c")
            elif cmd == "re":  # rectangle
                r = item[1]
                eps_lines.append(f"{r.x0:.3f} {height - r.y1:.3f} m")
                eps_lines.append(f"{r.x1:.3f} {height - r.y1:.3f} l")
                eps_lines.append(f"{r.x1:.3f} {height - r.y0:.3f} l")
                eps_lines.append(f"{r.x0:.3f} {height - r.y0:.3f} l")
                eps_lines.append("cp")

        if d.get("closePath", False):
            eps_lines.append("cp")

        if fill is not None:
            r, g, b = fill[0], fill[1], fill[2]
            eps_lines.append(f"{r:.4f} {g:.4f} {b:.4f} rgb")
            if stroke_color is not None:
                eps_lines.append("gsave f grestore")
            else:
                eps_lines.append("f")

        if stroke_color is not None:
            r, g, b = stroke_color[0], stroke_color[1], stroke_color[2]
            eps_lines.append(f"{r:.4f} {g:.4f} {b:.4f} rgb")
            eps_lines.append(f"{stroke_width:.2f} w s")

    eps_lines.append("grestore")
    eps_lines.append("%%EOF")
    return "\n".join(eps_lines).encode("utf-8")


def generate_ai_vector(svg_content: str, title: str = "Vector Studio Export") -> bytes:
    """
    Generates Adobe Illustrator compatible vector file (.ai).
    Modern Adobe Illustrator files (.ai) use PDF-based vector encoding with
    Adobe Illustrator Creator and XMP metadata dictionaries.
    """
    svg_doc = fitz.open(stream=svg_content.encode("utf-8"), filetype="svg")
    pdf_bytes = svg_doc.convert_to_pdf()
    
    # Open PDF document to inject Adobe Illustrator metadata
    doc = fitz.open("pdf", pdf_bytes)
    doc.set_metadata({
        "title": title,
        "author": "Vector Studio",
        "creator": "Adobe Illustrator Compatible (Vector Studio Engine)",
        "producer": "Adobe PDF library (Vector Studio)",
        "subject": "Vectorized Artwork for Adobe Illustrator",
        "keywords": "vector, illustration, adobe illustrator, svg, eps"
    })
    
    # Save optimized AI/PDF container
    ai_bytes = doc.tobytes(deflate=True, garbage=3)
    return ai_bytes


def generate_bundle_zip(
    svg_content: str,
    base_name: str = "vector_artwork"
) -> bytes:
    """
    Bundles SVG, PDF, EPS, AI, and the Illustrator Workflow Guide into a single ZIP archive.
    """
    clean_name = re.sub(r'[^a-zA-Z0-9_\-]', '_', base_name) or "vector_artwork"
    
    svg_bytes = svg_content.encode("utf-8")
    pdf_bytes = generate_pdf_vector(svg_content)
    eps_bytes = generate_eps_vector(svg_content, title=clean_name)
    ai_bytes = generate_ai_vector(svg_content, title=clean_name)

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr(f"{clean_name}.svg", svg_bytes)
        zf.writestr(f"{clean_name}.pdf", pdf_bytes)
        zf.writestr(f"{clean_name}.eps", eps_bytes)
        zf.writestr(f"{clean_name}.ai", ai_bytes)
        zf.writestr("README_ILLUSTRATOR.txt", ILLUSTRATOR_GUIDE_TEXT.encode("utf-8"))

    return zip_buffer.getvalue()
