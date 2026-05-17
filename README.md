# 🛡️ R&D Access Management System (Innovation Nexus)

Hệ thống quản lý ra vào khu vực R&D (Nghiên cứu & Phát triển) độ phân giải cao, được thiết kế theo tiêu chuẩn an ninh cấp doanh nghiệp (Enterprise-grade Security). Hệ thống tự động hóa toàn bộ quy trình từ khai báo tài sản, phê duyệt, đến kiểm soát ra vào theo thời gian thực tại các trạm Kiosk.

![R&D Access Banner](https://via.placeholder.com/1200x400/0F2C59/FFFFFF?text=R%26D+Access+Management+System)

## ✨ Tính năng nổi bật

### 1. Trạm Kiosk An ninh (Lối vào R&D)
- **Xác thực Đa lớp (MFA):** Hỗ trợ quét mã QR thẻ nhân viên hoặc Đăng nhập thủ công qua tài khoản Active Directory.
- **Quét Mã vạch/QR Tốc độ cao:** Tích hợp engine `html5-qrcode` độc quyền được tinh chỉnh chỉ nhận diện mã QR (tránh nhiễu loạn môi trường), cho tốc độ quét cực nhanh.
- **Xác thực Tài sản (Asset Verification):** Quét mã QR thiết bị cá nhân để đối chiếu với danh sách đã được phê duyệt.
- **Đăng ký Nhanh (Quick Register):** Tích hợp Camera độ nét cao (`react-webcam`) cho phép chụp ảnh thiết bị lạ và gửi yêu cầu phê duyệt tức thì đến bảo vệ.
- **Giao diện Cao cấp:** Thiết kế UI/UX hiện đại với hiệu ứng Glassmorphism, Animations mượt mà và Hỗ trợ Đa ngôn ngữ (Anh/Việt) tự động.

### 2. Trung tâm Giám sát Thời gian thực (Dashboard Bảo vệ)
- **Live Kiosk Monitor:** Giám sát luồng người ra vào Kiosk theo thời gian thực thông qua kết nối `Socket.IO` tốc độ cao.
- **Cảnh báo Thông minh:** Khi có thiết bị lạ xâm nhập, hệ thống tự động đẩy cảnh báo thẻ đỏ kèm hình ảnh chân dung (hỗ trợ truyền tải băng thông lớn lên đến 100MB) và phát âm thanh báo động.
- **Thống kê Lưu lượng:** Biểu đồ lượng người ra vào và số lượng thiết bị đang nằm trong khu vực R&D.

### 3. Cổng thông tin Cán bộ / Kỹ sư
- Khai báo thiết bị, laptop cá nhân.
- Xem lịch sử ra vào và phiên làm việc hiện tại.
- Quản lý mã QR cá nhân và thiết bị.

---

## 🛠️ Ngăn xếp Công nghệ (Tech Stack)

### 💻 Frontend
- **Core:** React 18, Vite
- **State Management:** Zustand
- **Styling:** Tailwind CSS (với bộ màu tuỳ chỉnh chuyên nghiệp `bloom`, `ink`, `paper`)
- **Quốc tế hóa (i18n):** `react-i18next` (Anh / Việt)
- **Tương tác phần cứng:** `html5-qrcode` (Quét mã), `react-webcam` (Chụp ảnh)
- **Giao tiếp:** Axios, Socket.IO-Client

### ⚙️ Backend
- **Core:** Node.js, Express.js
- **Database:** PostgreSQL v12+
- **Real-time Engine:** Socket.IO (Cấu hình `maxHttpBufferSize` 100MB cho truyền tải hình ảnh HD)
- **Authentication:** JWT (JSON Web Tokens), bcryptjs
- **Logging & Security:** Helmet, CORS, Custom Access Logs

---

## 🚀 Hướng dẫn Cài đặt & Vận hành

### Yêu cầu môi trường
- Node.js v18+
- PostgreSQL v12+
- Trình duyệt hiện đại có cấp quyền truy cập Camera.

### 1. Cài đặt Backend
```bash
cd backend

# Copy file cấu hình môi trường và chỉnh sửa thông tin Database
cp .env.example .env

# Cài đặt thư viện
npm install

# Khởi tạo CSDL và Data mẫu
npm run migrate
npm run seed

# Khởi động Server (Port mặc định: 5000)
npm run dev
```

### 2. Cài đặt Frontend
```bash
cd frontend

# Cài đặt thư viện
npm install

# Khởi động Frontend Server (Port mặc định: 3000)
npm start
```

---

## 🔐 Tài khoản Demo

| Vai trò (Role) | Username | Password |
|------|----------|----------|
| **Kỹ sư / Nhân viên** | `engineer1` | `engineer123` |
| **Bảo vệ / An ninh** | `admin` | `admin123` |
| **Quản lý** | `project_manager` | `manager123` |

---

## 📂 Cấu trúc Thư mục Chính

```text
RD_Access/
├── backend/
│   ├── src/
│   │   ├── config/          # Kết nối DB, Cấu hình môi trường
│   │   ├── controllers/     # Xử lý Logic nghiệp vụ (Access, Auth, Devices)
│   │   ├── database/        # Schema PostgreSQL (V2)
│   │   ├── routes/          # Express Routes
│   │   └── index.js         # Khởi tạo Express & Socket.IO
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/      # UI Components (QRScanner, LanguageSwitcher...)
    │   ├── locales/         # JSON Đa ngôn ngữ (en.json, vi.json)
    │   ├── pages/           # Kiosk, Dashboard, Login...
    │   ├── services/        # Gọi API Backend
    │   ├── store/           # Zustand Stores (authStore, languageStore)
    │   └── styles/          # Cấu hình TailwindCSS Token
    └── package.json
```

---

## 🚧 Lưu ý Vận hành (Troubleshooting)

1. **Không nhận Camera trên Kiosk:**
   - Trình duyệt sẽ tự động chặn Camera nếu chạy qua `http://` thay vì `https://` (ngoại trừ `localhost`). Đảm bảo hệ thống được deploy với chứng chỉ SSL/HTTPS.
   
2. **Cảnh báo lỗi QR liên tục (False Alarms):**
   - Đảm bảo `components/QRScanner.jsx` luôn giữ cấu hình `formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]`. Việc gỡ bỏ dòng này có thể khiến Camera nhận diện nhầm các họa tiết sọc ngang/dọc trong môi trường thành mã vạch 1D, dẫn đến rác dữ liệu.

3. **Mất tín hiệu Cảnh báo Real-time:**
   - Đảm bảo Socket.io trên Backend (`index.js`) giữ nguyên giá trị `maxHttpBufferSize: 1e8`. Hình ảnh truyền tải từ Kiosk dưới dạng Base64 thường lớn hơn 1MB, nếu không có cấu hình này, Server sẽ tự động ngắt kết nối.

---
*Phát triển bởi Đội ngũ R&D Node - 2026*
