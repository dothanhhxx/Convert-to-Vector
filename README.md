# Vector Studio - Chuyển đổi ảnh sang Vector SVG, AI, EPS, PDF

Ứng dụng web chuyên nghiệp chuyển đổi hình ảnh raster (PNG, JPG, JPEG, WEBP, BMP) sang định dạng vector toán học thực thụ (SVG, PDF, EPS, AI), hỗ trợ mở và chỉnh sửa trực tiếp trong **Adobe Illustrator**, Figma, CorelDRAW và Inkscape.

---

## 🌟 Tính Năng Nổi Bật & Luồng Hoạt Động (8 Bước)

1. **Upload Image (Tải ảnh):**
   - Hỗ trợ kéo thả (drag & drop) hoặc chọn file từ máy tính.
   - Nhận diện định dạng (PNG, JPG, WEBP, BMP) dung lượng lên đến 50MB.
   - Trích xuất thông tin ảnh gốc: độ phân giải (width × height), tỷ lệ khung hình, dung lượng, color space, kênh alpha.
   - Tích hợp sẵn bộ sample graphics (Shield Logo, Robot Mascot, Vintage Crest) để dùng thử tức thì chỉ với 1 click.

2. **Image Preview (Xem trước & Kiểm tra chất lượng):**
   - Bộ điều khiển Zoom mượt mà (25% - 400%), phóng to chi tiết pixel trước khi chuyển đổi.
   - Nút Reset 100% và Fit to Viewport.

3. **Vectorization Settings (Tùy biến tham số chuyên sâu):**
   - **Algorithm Engine:**
     - *VisionCortex VTracer:* Thuật toán vector đa màu, đa lớp (stacked/cutout), đường cong Bézier spline mượt mà.
     - *Peter Selinger Potrace:* Thuật toán kinh điển tạo vector silhouette đen trắng độ sắc nét cực cao.
   - **Color Mode:** Color (đa màu), Grayscale (thang xám), Black & White (đen trắng nhị phân).
   - **Number of Colors:** Giới hạn số lượng màu vector (2 đến 48 màu) bằng bộ lượng tử hóa k-means / median-cut.
   - **Detail Level:** 4 cấp độ (Low, Medium, High, Ultra) điều chỉnh mật độ anchor nodes.
   - **Curve Smoothing:** Tùy chỉnh góc mượt (`corner_threshold`) từ 10° đến 150°.
   - **Noise Reduction:** Lọc nhiễu đốm hạt (`filter_speckle`) và làm mịn scan artifacts.
   - **Background Removal:** Tự động phát hiện màu nền và tách nền trong suốt (RGBA) với thanh trượt Tolerance.
   - **B&W Threshold:** Điều chỉnh ngưỡng nhận diện tương phản sáng/tối (0 - 255) cho chế độ đen trắng.
   - **Advanced Curve Geometry:** Tùy chọn đường cong Spline hoặc đa giác sắc nét Polygon.

4. **Convert to Vector (Thuật toán Vectorization Thực thụ):**
   - Sinh ra các thẻ `<path d="M... C... L... Z">` toán học thực sự.
   - **Không giả lập** đổi đuôi file; bảo toàn độ sắc nét vô hạn khi phóng to.
   - Phân tích topology: đếm số lượng đường Path, số lượng Anchor Nodes, dung lượng SVG và thời gian xử lý theo milliseconds.

5. **Compare Results (So sánh trước và sau):**
   - **Thanh kéo so sánh (Split Slider):** Kéo thanh chia đôi màn hình qua lại mượt mà để đối chiếu từng nét giữa ảnh raster gốc và vector SVG.
   - **Side-by-Side Mode:** Đặt ảnh gốc và vector cạnh nhau trên 2 khung đối xứng.
   - **Vector Only & Original Only:** Xem toàn màn hình từng chế độ.
   - Điều chỉnh tham số và bấm *Convert to Vector* lại bất cứ lúc nào mà không cần upload lại ảnh.

6. **Preview Vector (Kiểm tra đường nét & Độ trong suốt):**
   - **Canvas Background:** Chuyển đổi linh hoạt giữa nền Caro (Checkerboard transparency), Dark (#090D16), Light (#FFFFFF) và Gray (#334155).
   - **Outline / Wireframe Mode:** Bật chế độ Outline (tương đương `Ctrl+Y` trong Illustrator) để kiểm tra cấu trúc đường path, node và khung xương vector mà không có màu tô (fill).

7. **Export File (Xuất file đa định dạng chuẩn đồ họa):**
   - **SVG (`.svg`):** Định dạng vector tiêu chuẩn W3C, tương thích Illustrator, Figma, trình duyệt web.
   - **PDF (`.pdf`):** Định dạng PDF vector chất lượng cao (PyMuPDF vector engine), sẵn sàng in ấn và mở trực tiếp trong Illustrator.
   - **EPS (`.eps`):** Encapsulated PostScript Level 3.0 với DSC comments, tương thích rộng rãi trên mọi phần mềm đồ họa.
   - **AI (`.ai`):** File tương thích Adobe Illustrator kèm metadata container chuẩn Illustrator, mở trực tiếp bằng Illustrator với đầy đủ layers.
   - **Download All (.ZIP):** Đóng gói toàn bộ 4 file vector kèm tài liệu hướng dẫn quy trình chỉnh sửa trong Illustrator.

8. **Adobe Illustrator Workflow Guide:**
   - Hướng dẫn mở file, Ungroup (`Ctrl+Shift+G` / `Cmd+Shift+G`), dùng công cụ Direct Selection Tool (`A`) để chỉnh anchor points, đổi màu Swatches và bảng phím tắt thông dụng.

---

## 🎨 Quy Chuẩn Thiết Kế (Design Rules)

Dự án tuân thủ nghiêm ngặt tài liệu [`DESIGN_RULES.md`](file:///d:/Github/Convert%20to%20Vector/DESIGN_RULES.md):
- **Nguyên tắc cốt lõi:** *"Prefer global UI consistency over local optimizations."*
- **Component Library:** Sử dụng toàn diện **Ant Design v5** (`antd`) với Dark Theme token system.
- **Typography:** Đúng **2 font weights** trong toàn bộ UI:
  - `400` (Regular): Nội dung, mô tả, nhãn slider, bảng thông số.
  - `600` (SemiBold): Tiêu đề, trạng thái active, nhãn nút bấm, chỉ số metric.
- **Màu chữ:** Đúng **2 màu chữ chuẩn**:
  - `#F1F5F9` (Primary / High Contrast)
  - `#94A3B8` (Secondary / Muted)

---

## 🏗️ Cấu Trúc Dự Án

```
Convert to Vector/
├── DESIGN_RULES.md              # Quy chuẩn thiết kế nhất quán toàn dự án
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI server, endpoints & router
│   │   ├── samples/             # Ảnh mẫu tích hợp sẵn (Shield, Robot, Crest)
│   │   └── modules/
│   │       ├── upload.py        # Module kiểm tra và trích xuất metadata ảnh
│   │       ├── image_processor.py # Module tiền xử lý, khử nhiễu, tách nền
│   │       ├── vectorizer.py    # Module VTracer & Potrace vectorization
│   │       └── exporter.py      # Module xuất SVG, PDF, EPS, AI & ZIP
│   ├── generate_samples.py      # Script tạo ảnh mẫu chất lượng cao
│   └── test_api.py              # Bộ test tự động toàn diện cho backend
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Header.tsx       # Thanh tiêu đề, sample selector, action buttons
    │   │   ├── Sidebar.tsx      # Bảng điều khiển tham số vectorization
    │   │   ├── CanvasPreview.tsx # Khu vực xem trước, split slider, outline mode
    │   │   ├── ExportBar.tsx    # Thanh xuất file và thống kê topology
    │   │   └── IllustratorModal.tsx # Hướng dẫn quy trình Adobe Illustrator
    │   ├── services/
    │   │   └── api.ts           # Client gọi API backend
    │   ├── types/
    │   │   └── vector.ts        # TypeScript interfaces
    │   ├── App.tsx              # Component gốc và state management
    │   ├── App.css              # Styling chuẩn Dark Studio
    │   └── index.css            # Biến màu và typography reset
    ├── index.html
    └── vite.config.ts           # Cấu hình Vite & API reverse proxy
```

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Khởi động Backend (FastAPI + Python 3.13)
```powershell
cd "d:\Github\Convert to Vector\backend"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
Backend API sẽ lắng nghe tại: `http://127.0.0.1:8000` (Swagger docs tại `http://127.0.0.1:8000/docs`).

### 2. Khởi động Frontend (React + Vite + TypeScript)
```powershell
cd "d:\Github\Convert to Vector\frontend"
npm run dev
```
Truy cập giao diện tại: `http://127.0.0.1:5173`.
*(Lưu ý: Khi build bằng `npm run build`, bản static được nhúng tự động vào FastAPI, có thể chạy trực tiếp tại `http://127.0.0.1:8000`).*

### 3. Chạy kiểm thử tự động Backend
```powershell
cd "d:\Github\Convert to Vector\backend"
python test_api.py
```
Toàn bộ quy trình từ tải ảnh, xử lý đa màu, đen trắng Potrace và xuất SVG/PDF/EPS/AI/ZIP đều được kiểm tra đạt 100%.
