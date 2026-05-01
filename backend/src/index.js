require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const { Server } = require('socket.io');
const pool = require('./config/database');
const { createTables } = require('./database/schema');

// Routes
const authRoutes = require('./routes/authRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const accessRoutes = require('./routes/accessRoutes');
const activityRoutes = require('./routes/activityRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: true, // Allow all origins in local dev to ensure real-time works
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false, // For local dev images if any
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('⚡ New client connected:', socket.id);
  
  // Join a personal room if user ID is provided in auth
  const userId = socket.handshake.auth?.token ? JSON.parse(Buffer.from(socket.handshake.auth.token.split('.')[1], 'base64').toString()).id : null;
  if (userId) {
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined their personal room`);
  }

  socket.on('kiosk_scan', (data) => {
    console.log('📢 Kiosk Scan Event:', data.status, data.user);
    io.emit('kiosk_scan_update', data);
  });

  socket.on('quick_register_request', (data) => {
    console.log('📢 Quick Register Request Event:', data.serial_number);
    io.emit('quick_register_request_update', data);
  });

  socket.on('quick_register_confirm', (data) => {
    console.log('📢 Quick Register Confirm Event:', data.serial_number);
    io.emit('quick_register_confirm_update', data);
  });

  socket.on('quick_register_reject', (data) => {
    console.log('📢 Quick Register Reject Event:', data.serial_number);
    io.emit('quick_register_reject_update', data);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected');
  });
});

// Attach io to request object for use in controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} [${res.statusCode}] - ${duration}ms`);
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Initialize database and start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test database connection
    const result = await pool.query('SELECT NOW()');
    console.log('✓ Database connection successful');

    // Create tables if they don't exist
    await createTables();

    // Start server
    server.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = { app, server, io };
