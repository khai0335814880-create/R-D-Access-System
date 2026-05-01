# Frontend - R&D Room Access Management System

React frontend cho hệ thống quản lý ra vào phòng R&D.

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- npm hoặc yarn
- Backend server running (http://localhost:5000)

### Installation

```bash
# Install dependencies
npm install

# Configure API endpoint
# Check .env file - default is http://localhost:5000/api

# Start development server
npm start

# Build for production
npm run build
```

The app will open at `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Header.jsx           # Navigation header
│   │   ├── ProtectedRoute.jsx   # Route protection
│   │   ├── LoadingSpinner.jsx   # Loading indicator
│   │   └── Alert.jsx            # Alert notifications
│   ├── pages/
│   │   ├── LoginPage.jsx        # Authentication
│   │   ├── DeviceRegistrationPage.jsx  # Phase 1
│   │   ├── CheckInPage.jsx      # Phase 2
│   │   ├── ApprovalPage.jsx     # Manager approval
│   │   └── DashboardPage.jsx    # Security dashboard
│   ├── services/
│   │   ├── api.js               # Axios instance
│   │   ├── authService.js
│   │   ├── deviceService.js
│   │   └── accessService.js
│   ├── store/
│   │   ├── authStore.js         # Zustand auth state
│   │   └── deviceStore.js       # Zustand device state
│   ├── styles/
│   │   └── index.css            # Global styles
│   ├── utils/
│   ├── App.jsx                  # Main app component
│   └── index.jsx                # Entry point
├── public/
│   └── index.html
├── package.json
├── .env                         # Environment config
├── tailwind.config.js
├── postcss.config.js
└── .gitignore
```

## 🔧 Configuration

### Environment Variables

`.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## 🎨 UI Components

### Header Component
- Navigation
- User info display
- Logout button
- Role-based menu items

### ProtectedRoute Component
```jsx
<ProtectedRoute requiredRole="manager">
  <ApprovalPage />
</ProtectedRoute>
```

### Alert Component
```jsx
<Alert
  message="Success message"
  type="success"
  onClose={() => setMessage('')}
  duration={5000}
/>
```

## 📄 Pages

### LoginPage
- Username/Password authentication
- Demo credentials display
- Error handling
- Redirect to dashboard on success

### DeviceRegistrationPage (Phase 1 - Engineer)
- Register personal devices
- Track device approval status
- View all registered devices
- Edit/Delete pending devices
- Stats: Total, Approved, Pending

### CheckInPage (Phase 2 - Engineer)
- Select approved devices before entry
- Check-in to R&D room
- Check-out functionality
- Current status display

### ApprovalPage (Manager)
- View pending device requests
- Approve with optional comments
- Reject with feedback
- See request details

### DashboardPage (Security)
- Real-time occupancy count
- Current people in room
- Recent activity log
- Auto-refresh every 10 seconds
- Timestamp of last update

## 🔐 State Management (Zustand)

### Auth Store
```javascript
const { user, token, login, register, logout } = useAuthStore();
```

### Device Store
```javascript
const {
  devices,
  approvedDevices,
  pendingRequests,
  createDevice,
  fetchMyDevices,
  fetchPendingRequests,
  approveDevice,
  rejectDevice
} = useDeviceStore();
```

## 🌐 API Integration

### Auth Service
```javascript
authService.login({ username, password })
authService.register(userData)
authService.logout()
authService.getProfile()
authService.updateProfile(updateData)
```

### Device Service
```javascript
deviceService.createDevice(deviceData)
deviceService.getMyDevices()
deviceService.getApprovedDevices()
deviceService.getPendingRequests()
deviceService.approveDevice(requestId, comments)
deviceService.rejectDevice(requestId, comments)
```

### Access Service
```javascript
accessService.checkIn(deviceIds)
accessService.checkOut()
accessService.getCurrentStatus()
accessService.getAccessHistory()
accessService.getRecentActivity(limit)
accessService.getCurrentOccupancy()
```

## 🎯 User Flows

### Engineer Flow
1. Login → Device Registration → Approval → Check-in/out

### Manager Flow
1. Login → View Pending Approvals → Approve/Reject

### Security Flow
1. Login → View Real-time Dashboard → Monitor Access

## 🎨 Styling

Using **Tailwind CSS** for utility-first styling:
- Responsive design
- Dark mode support (can be added)
- Custom color theme
- Smooth transitions

### Color Scheme
```
Primary: Blue (#3B82F6)
Secondary: Green (#10B981)
Danger: Red (#EF4444)
```

## 🔄 Data Flow

```
User Input
    ↓
Component State
    ↓
Zustand Store
    ↓
API Service (axios)
    ↓
Backend API
    ↓
Database
    ↓
Response back through same chain
```

## 📱 Responsive Design

- Mobile: 100% responsive
- Tablet: Optimized layout
- Desktop: Full-featured layout
- Flexbox & Grid layout system

## 🚢 Production Build

```bash
# Create optimized production build
npm run build

# Output directory: build/
# Ready to deploy to any static host
```

### Deployment Options
- Vercel
- Netlify
- AWS S3 + CloudFront
- Docker
- Traditional web server (nginx, Apache)

### Building Docker Image
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

## 🔍 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## ⚙️ Performance Optimization

- Code splitting with React Router
- Lazy loading components
- Memoization with React.memo
- Zustand for lightweight state management
- Axios request/response interceptors

## 🐛 Common Issues & Solutions

### CORS Issues
- Ensure backend has correct CORS configuration
- Check `REACT_APP_API_URL` in .env

### Token Expiration
- Token automatically cleared on 401 response
- Redirect to login page
- Implement refresh token if needed

### API Connection Failed
- Check backend is running
- Verify API URL in .env
- Check network tab in DevTools

## 📚 Dependencies

- **react**: UI library
- **react-router-dom**: Routing
- **axios**: HTTP client
- **zustand**: State management
- **tailwindcss**: CSS framework
- **react-icons**: Icon library
- **html5-qrcode**: QR code scanning
- **socket.io-client**: Real-time communication

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit PR

## 📞 Support

For issues, contact development team.

---

**Version**: 1.0.0
**Last Updated**: April 2026
