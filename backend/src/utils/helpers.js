const jwt = require('jsonwebtoken');
const ActivityLog = require('../models/ActivityLog');

// Generate QR code data for employee
const generateQRData = (userId, username) => {
  return JSON.stringify({
    userId,
    username,
    timestamp: new Date().toISOString(),
  });
};

// Verify QR data
const verifyQRData = (qrData) => {
  try {
    const data = JSON.parse(qrData);
    return data;
  } catch (error) {
    return null;
  }
};

// Generate JWT token
const generateJWT = (userId, username, role) => {
  return jwt.sign({ userId, username, role }, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Log activity to database
const logActivity = async (userId, type, description, metadata = {}) => {
  try {
    return await ActivityLog.create({
      user_id: userId,
      activity_type: type,
      description,
      metadata
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

module.exports = {
  generateQRData,
  verifyQRData,
  generateJWT,
  logActivity,
};
