# Backend - R&D Room Access Management System

Node.js/Express backend cho hệ thống quản lý ra vào phòng R&D.

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- PostgreSQL v12+
- npm hoặc yarn

### Installation

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Configure .env file with your database credentials
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=rnd_access_db
# DB_USER=postgres
# DB_PASSWORD=your_password

# Create database tables
npm run migrate

# Seed sample data
npm run seed

# Start development server
npm run dev
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Database connection
│   ├── database/
│   │   ├── schema.js            # Database schema definition
│   │   ├── migrate.js           # Migration script
│   │   └── seed.js              # Sample data seeding
│   ├── controllers/
│   │   ├── authController.js    # Auth logic
│   │   ├── deviceController.js  # Device management
│   │   └── accessController.js  # Access control
│   ├── middleware/
│   │   └── auth.js              # JWT verification, role-based access
│   ├── models/
│   │   ├── User.js
│   │   ├── Device.js
│   │   ├── DeviceRequest.js
│   │   └── AccessLog.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── deviceRoutes.js
│   │   └── accessRoutes.js
│   ├── utils/
│   │   └── helpers.js           # Utility functions
│   └── index.js                 # Server entry point
├── package.json
├── .env.example
└── .gitignore
```

## 🔧 Configuration

### Environment Variables

Create `.env` file with:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rnd_access_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=http://localhost:3000
```

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'engineer',
  department VARCHAR(100),
  employee_id VARCHAR(50) UNIQUE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Devices Table
```sql
CREATE TABLE devices (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER REFERENCES users(id),
  device_type VARCHAR(100),
  brand VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(100) UNIQUE,
  mac_address VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending',
  approval_date TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Device Requests Table
```sql
CREATE TABLE device_requests (
  id SERIAL PRIMARY KEY,
  device_id INTEGER REFERENCES devices(id),
  requester_id INTEGER REFERENCES users(id),
  approver_id INTEGER REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending',
  comments TEXT,
  requested_at TIMESTAMP,
  approved_at TIMESTAMP
);
```

### Access Logs Table
```sql
CREATE TABLE access_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  device_ids INTEGER[],
  check_in_time TIMESTAMP,
  check_out_time TIMESTAMP,
  status VARCHAR(20) DEFAULT 'checked_in',
  location VARCHAR(100),
  created_at TIMESTAMP
);
```

## 📡 API Endpoints

### Authentication

#### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "engineer1",
  "email": "engineer1@rnd.com",
  "password": "password123",
  "full_name": "Engineer One",
  "role": "engineer",
  "department": "R&D",
  "employee_id": "EMP001"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "engineer1",
  "password": "password123"
}

Response:
{
  "message": "Login successful",
  "user": {...},
  "token": "eyJhbGc..."
}
```

#### Get Profile
```
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Update Profile
```
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "Updated Name",
  "department": "New Department"
}
```

### Devices

#### Create Device
```
POST /api/devices
Authorization: Bearer <token>
Content-Type: application/json

{
  "device_type": "Laptop",
  "brand": "Apple",
  "model": "MacBook Pro",
  "serial_number": "SN12345",
  "mac_address": "00:1A:2B:3C:4D:5E",
  "description": "My work laptop"
}
```

#### Get My Devices
```
GET /api/devices/my-devices
Authorization: Bearer <token>
```

#### Get Approved Devices
```
GET /api/devices/approved
Authorization: Bearer <token>
```

#### Pending Requests (Manager Only)
```
GET /api/devices/requests/pending
Authorization: Bearer <token>
```

#### Approve Device (Manager Only)
```
POST /api/devices/requests/:requestId/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "comments": "Approved - safe device"
}
```

#### Reject Device (Manager Only)
```
POST /api/devices/requests/:requestId/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "comments": "Device not allowed in R&D"
}
```

### Access Control

#### Check-in
```
POST /api/access/check-in
Authorization: Bearer <token>
Content-Type: application/json

{
  "device_ids": [1, 2, 3]
}
```

#### Check-out
```
POST /api/access/check-out
Authorization: Bearer <token>
```

#### Get Status
```
GET /api/access/status
Authorization: Bearer <token>
```

#### Get History
```
GET /api/access/history?limit=50
Authorization: Bearer <token>
```

### Dashboard (Security Staff)

#### Recent Activity
```
GET /api/access/dashboard/activity?limit=50
Authorization: Bearer <token>
```

#### Current Occupancy
```
GET /api/access/dashboard/occupancy
Authorization: Bearer <token>
```

## 🔐 Authentication & Authorization

### JWT Token
- Issued on login
- Valid for 7 days (configurable)
- Included in Authorization header: `Bearer <token>`

### Role-Based Access Control
```
engineer   - Can register devices, check-in/out
manager    - Can approve/reject devices, view dashboard
security   - Can view real-time dashboard
```

### Middleware
```javascript
// Protected route example
router.get('/profile', authMiddleware, controller);

// Role-based protection
router.post(
  '/approve',
  authMiddleware,
  requireRole('manager'),
  controller
);
```

## 📝 Models

### User Model
```javascript
await User.findById(id);
await User.findByUsername(username);
await User.create(userData);
await User.update(id, updateData);
await User.delete(id);
```

### Device Model
```javascript
await Device.findById(id);
await Device.findByOwner(ownerId);
await Device.create(deviceData);
await Device.findAll(filters);
await Device.update(id, updateData);
await Device.delete(id);
```

### AccessLog Model
```javascript
await AccessLog.create(logData);
await AccessLog.checkOut(logId);
await AccessLog.findActiveByUser(userId);
await AccessLog.getRecentActivity(limit);
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# With coverage
npm run test:coverage
```

## 🚢 Production Deployment

### Using PM2
```bash
npm install -g pm2

# Start server
pm2 start src/index.js --name "rnd-backend"

# Monitor
pm2 monit

# Logs
pm2 logs rnd-backend
```

### Using Docker
```bash
docker build -t rnd-backend .
docker run -p 5000:5000 --env-file .env rnd-backend
```

### Using Heroku
```bash
heroku create rnd-backend
heroku config:set DATABASE_URL=<your_postgres_url>
git push heroku main
```

## 🔍 Logging & Monitoring

Logs are output to console in development. In production, integrate with:
- Winston
- Sentry
- DataDog
- New Relic

## 🤝 Contributing

1. Follow ESLint rules
2. Write meaningful commit messages
3. Test all changes
4. Update API documentation

## 📞 Support

For issues, contact the dev team.

---

**Version**: 1.0.0
**Last Updated**: April 2026
