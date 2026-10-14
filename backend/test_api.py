import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from fastapi.testclient import TestClient
from app.main import app
import base64

client = TestClient(app)

def test_endpoints():
    print("Testing /api/health...")
    res = client.get("/api/health")
    assert res.status_code == 200, res.text
    print("Health response:", res.json())

    print("Testing /api/samples...")
    res = client.get("/api/samples")
    assert res.status_code == 200, res.text
    samples = res.json()["samples"]
    print(f"Loaded {len(samples)} samples:")
    for s in samples:
        print(f" - {s['title']} ({s['width']}x{s['height']}, {s['sizeFormatted']})")

    first_sample = samples[0]
    sample_b64 = first_sample["preview"]

    print("\nTesting /api/vectorize with VTracer (Color mode)...")
    payload_vtracer = {
        "image_base64": sample_b64,
        "filename": "shield.png",
        "algorithm": "vtracer",
        "color_mode": "color",
        "num_colors": 16,
        "detail_level": "medium",
        "hierarchical": "stacked",
        "curve_mode": "spline"
    }
    res = client.post("/api/vectorize", json=payload_vtracer)
    assert res.status_code == 200, res.text
    data = res.json()
    svg = data["svg"]
    stats = data["stats"]
    print(f"VTracer Success! Paths: {stats['pathCount']}, Nodes: {stats['nodeCount']}, Time: {stats['elapsedMs']}ms, Size: {stats['svgSizeFormatted']}")
    assert "<path" in svg or "<polygon" in svg

    print("\nTesting /api/vectorize with Potrace (B&W mode)...")
    payload_potrace = {
        "image_base64": sample_b64,
        "filename": "shield.png",
        "algorithm": "potrace",
        "color_mode": "binary",
        "threshold": 128
    }
    res = client.post("/api/vectorize", json=payload_potrace)
    assert res.status_code == 200, res.text
    data_potrace = res.json()
    svg_potrace = data_potrace["svg"]
    stats_p = data_potrace["stats"]
    print(f"Potrace Success! Paths: {stats_p['pathCount']}, Nodes: {stats_p['nodeCount']}, Time: {stats_p['elapsedMs']}ms")
    assert "<path" in svg_potrace

    print("\nTesting /api/export for all formats with ASCII filenames...")
    for fmt in ["svg", "pdf", "eps", "ai", "zip"]:
        res_exp = client.post("/api/export", json={"svg": svg, "format": fmt, "filename": "shield"})
        assert res_exp.status_code == 200, f"Export {fmt} failed: {res_exp.text}"
        print(f" - Export {fmt.upper()}: {len(res_exp.content)} bytes, Content-Type: {res_exp.headers.get('content-type')}")

    print("\nTesting /api/export with Vietnamese Unicode filenames (containing diacritics)...")
    vn_filenames = ["ảnh_đẹp_guitar", "bản_vẽ_thiết_kế_2026", "cây_đàn_vintage"]
    for vn_name in vn_filenames:
        for fmt in ["svg", "pdf", "eps", "ai", "zip"]:
            res_vn = client.post("/api/export", json={"svg": svg, "format": fmt, "filename": vn_name})
            assert res_vn.status_code == 200, f"Export with '{vn_name}.{fmt}' failed: {res_vn.text}"
            disp = res_vn.headers.get("content-disposition", "")
            # Ensure header encodes cleanly in latin-1 without crash
            disp.encode("latin-1")
            assert "filename*=" in disp, f"Missing RFC 5987 filename* in header: {disp}"
        print(f" - Successfully exported all formats for Vietnamese filename: '{vn_name}'")

    print("\nALL BACKEND TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_endpoints()
