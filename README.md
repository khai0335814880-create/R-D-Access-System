# R&D Room Access Management System

Hệ thống quản lý ra vào phòng R&D được tái cấu trúc dựa trên nền tảng Web tập trung, giúp tự động hóa dòng chảy dữ liệu giữa kỹ sư, cấp quản lý và bộ phận an ninh.

## 🎯 Tổng quan Hệ thống

Hệ thống được thiết kế theo hai giai đoạn tương tác mật thiết:

### **Giai đoạn 1: Thiết lập và Phê duyệt danh mục tài sản**

- Kỹ sư truy cập Web thông qua mạng nội bộ
- Khai báo các thiết bị cá nhân dự kiến mang vào khu vực R&D
- Thông tin: loại thiết bị, dòng máy, số serial vật lý được số hóa
- Hệ thống tự động thông báo đến quản lý dự án
- Quản lý thẩm định và phê duyệt trực tuyến

### **Giai đoạn 2: Vận hành kiểm soát tại cửa phòng**

- Hệ thống vận hành trên thiết bị máy tính bảng cố định tại lối vào
- Kỹ sư quét mã QR trên thẻ nhân viên
- Hệ thống xác thực danh tính và quyền truy cập
- Hiển thị danh sách thiết bị được phê duyệt
- Kỹ sư lựa chọn thiết bị qua quét QR để đối soát tự động
- Ghi log dấu thời gian và thông tin tài sản
- Dashboard giám sát thời gian thực cho nhân viên bảo vệ

## 📋 Yêu cầu Hệ thống

### Backend
- Node.js v16+
- PostgreSQL v12+
- npm hoặc yarn

### Frontend
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js v16+ (for development)

## 🚀 Cài đặt

### 1. Clone Repository
```bash
cd Web_Kientap
```

### 2. Setup Backend

```bash
cd backend
cp .env.example .env
# Update .env with your configuration
npm install
npm run migrate  # Create database tables
npm run seed     # Insert sample data
npm run dev      # Start development server
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm start        # Start development server
```

## 📁 Cấu trúc Dự án

```
Web_Kientap/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & config
│   │   ├── database/        # Schema, migration, seed
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Auth, validation
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Helper functions
│   │   └── index.js         # Main server file
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/      # Reusable components
    │   ├── pages/          # Page components
    │   ├── services/       # API services
    │   ├── store/          # Zustand state management
    │   ├── styles/         # CSS & Tailwind
    │   ├── utils/          # Helper functions
    │   ├── App.jsx
    │   └── index.jsx
    ├── public/
    ├── package.json
    └── .env
```

## 🔐 Chứng thực

Hệ thống sử dụng JWT (JSON Web Tokens) để xác thực:

### Demo Accounts

| Role | Username | Password |
|------|----------|----------|
| Manager | project_manager | manager123 |
| Engineer | engineer1 | engineer123 |
| Security | admin | admin123 |

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy thông tin người dùng
- `PUT /api/auth/profile` - Cập nhật thông tin

### Devices (Phase 1)
- `POST /api/devices` - Tạo thiết bị mới
- `GET /api/devices/my-devices` - Lấy thiết bị của tôi
- `GET /api/devices/approved` - Lấy thiết bị đã phê duyệt
- `PUT /api/devices/:id` - Cập nhật thiết bị
- `DELETE /api/devices/:id` - Xóa thiết bị

### Device Requests (Manager)
- `GET /api/devices/requests/pending` - Lấy danh sách chờ phê duyệt
- `POST /api/devices/requests/:id/approve` - Phê duyệt
- `POST /api/devices/requests/:id/reject` - Từ chối

### Access Control (Phase 2)
- `POST /api/access/check-in` - Check-in vào phòng
- `POST /api/access/check-out` - Check-out khỏi phòng
- `GET /api/access/status` - Lấy trạng thái hiện tại
- `GET /api/access/history` - Lịch sử truy cập

### Dashboard (Security)
- `GET /api/access/dashboard/activity` - Hoạt động gần đây
- `GET /api/access/dashboard/occupancy` - Số người hiện tại

## 🗄️ Database Schema

### Users Table
- id, username, email, password_hash
- full_name, role (engineer/manager/security)
- department, employee_id, qr_code_id
- status, created_at, updated_at

### Devices Table
- id, owner_id, device_type, brand, model
- serial_number, mac_address, description
- status (pending/approved/rejected), approval_date
- created_at, updated_at

### Device Requests Table
- id, device_id, requester_id, approver_id
- status, comments, requested_at, approved_at

### Access Logs Table
- id, user_id, device_ids (array)
- check_in_time, check_out_time
- status, location, created_at

### Activity Logs Table
- id, user_id, activity_type
- description, metadata (JSON)
- created_at

## 🛠️ Công Nghệ Sử Dụng

### Backend
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Hashing**: bcryptjs
- **Validation**: express-validator
- **Real-time**: Socket.io

### Frontend
- **Library**: React 18
- **Routing**: React Router v6
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **UI Components**: Custom components
- **QR Scanning**: html5-qrcode
- **Icons**: React Icons

## 📚 Feature Roadmap

### Phase 1 (Current - MVP)
- [x] User authentication & authorization
- [x] Device registration form
- [x] Manager approval workflow
- [x] Check-in/out system
- [x] Basic dashboard

### Phase 2 (Enhancement)
- [ ] QR code generation & scanning
- [ ] Real-time WebSocket updates
- [ ] Advanced reporting & analytics
- [ ] Email notifications
- [ ] Two-factor authentication (2FA)
- [ ] Mobile app (React Native)
- [ ] Integration with existing LDAP/AD

### Phase 3 (Advanced)
- [ ] AI-based anomaly detection
- [ ] Automated compliance reports
- [ ] Multi-location support
- [ ] API for third-party integrations
- [ ] Audit trail and compliance logs

## 🔍 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📦 Deployment

### Backend Deployment
```bash
cd backend
npm install --production
npm run build
npm start
```

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy the 'build' folder to your hosting
```

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to the branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 📞 Support

For issues and questions, please contact the development team.

## 🎓 Documentation

See individual README files:
- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)

---

**Last Updated**: April 2026
**Version**: 1.0.0
