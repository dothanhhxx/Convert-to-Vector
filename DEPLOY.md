# Hướng Dẫn Deploy Miễn Phí (Free Hosting Guide) - Vector Studio

Dự án **Vector Studio** đã được đóng gói hoàn chỉnh bằng **Multi-Stage Dockerfile** kết hợp cả Frontend (React/Vite) và Backend (FastAPI/VTracer/Potrace) thành **1 dịch vụ duy nhất**. Bạn không cần thuê 2 server riêng biệt.

Dưới đây là 2 phương án deploy lên web **100% miễn phí**, có HTTPS và hỗ trợ domain riêng:

---

## Cách 1: Deploy lên Render.com (Khuyên dùng - Phổ biến & Dễ nhất)

Render cung cấp gói **Free Web Service** với 750 giờ/tháng miễn phí, tự động build từ GitHub mỗi khi bạn push code mới.

### Bước 1: Đẩy mã nguồn lên GitHub
Nếu bạn chưa đưa code lên GitHub cá nhân:
```powershell
# Tại thư mục dự án
git add .
git commit -m "feat: prepare production deployment files"
git push origin main
```

### Bước 2: Tạo Web Service trên Render
1. Truy cập [render.com](https://render.com) và đăng nhập bằng tài khoản GitHub của bạn.
2. Tại Dashboard, bấm nút **New +** -> Chọn **Web Service**.
3. Chọn repository của bạn: `Convert-to-Vector` (hoặc tên bạn đặt).
4. Cấu hình các thông số:
   - **Name:** `vector-studio` (hoặc tên bạn thích)
   - **Region:** `Singapore` (để tốc độ tải từ Việt Nam nhanh nhất)
   - **Language:** Chọn **Docker** (Render sẽ tự động dùng `Dockerfile` có sẵn trong repo)
   - **Instance Type:** Chọn **Free** ($0/month)
5. Bấm **Create Web Service**.

### Bước 3: Hoàn tất
- Render sẽ tự động tải các dependencies, build frontend và khởi động FastAPI.
- Sau khoảng 2 - 3 phút, bạn sẽ nhận được một địa chỉ web công khai miễn phí dạng:
  `https://vector-studio-xxxx.onrender.com`
- Mở link trên bất kỳ máy tính hay điện thoại nào để sử dụng ngay!

*(Lưu ý gói Free của Render sẽ tự "ngủ" nếu không có truy cập sau 15 phút và tự khởi động lại trong khoảng 30s khi có người vào trang web).*

---

## Cách 2: Deploy lên Hugging Face Spaces (Tài nguyên mạnh nhất - 16GB RAM Free)

Hugging Face Spaces cung cấp hạ tầng máy ảo miễn phí với **2 vCPU và 16GB RAM** (rất thích hợp cho tác vụ vector hóa ảnh dung lượng lớn).

### Bước 1: Tạo Space trên Hugging Face
1. Đăng ký/Đăng nhập tại [huggingface.co](https://huggingface.co).
2. Vào [huggingface.co/spaces](https://huggingface.co/spaces) -> Bấm **Create new Space**.
3. Điền thông tin:
   - **Space name:** `vector-studio`
   - **License:** `mit`
   - **Select the Space SDK:** Chọn **Docker** -> **Blank**
   - **Space hardware:** Chọn **Free (2 vCPU - 16GB RAM)**
4. Bấm **Create Space**.

### Bước 2: Push code lên Space
Hugging Face sẽ cung cấp cho bạn một đường dẫn git (ví dụ: `https://huggingface.co/spaces/YOUR_USERNAME/vector-studio`).
Chỉ cần thêm remote và push:
```powershell
git remote add hf https://huggingface.co/spaces/YOUR_USERNAME/vector-studio
git push hf main --force
```
Sau 2 phút, Space sẽ build xong và chạy trực tiếp tại:
`https://YOUR_USERNAME-vector-studio.hf.space`

---

## Cách 3: Deploy trên Vercel (Frontend) + Render (Backend) nếu muốn tách riêng

Nếu bạn muốn frontend load siêu nhanh qua CDN toàn cầu của Vercel:
1. **Backend:** Deploy thư mục `backend` lên Render (Web Service). Lấy URL backend (ví dụ: `https://vector-api.onrender.com`).
2. **Frontend:** Deploy thư mục `frontend` lên [vercel.com](https://vercel.com).
   - Thiết lập biến môi trường `VITE_API_URL=https://vector-api.onrender.com`
   - Vercel sẽ tự động build và cấp domain `https://vector-studio.vercel.app`.

---

## 💡 Khuyến nghị
Bạn nên chọn **Cách 1 (Render.com)** hoặc **Cách 2 (Hugging Face Spaces)** vì đã tích hợp sẵn trọn gói qua Docker, không cần cấu hình CORS hay quản lý 2 domain riêng biệt!
