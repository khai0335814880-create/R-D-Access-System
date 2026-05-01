const AccessLog = require('../models/AccessLog');
const Device = require('../models/Device');
const User = require('../models/User');
const { logActivity } = require('../utils/helpers');

exports.checkIn = async (req, res) => {
  try {
    const { device_ids, entry_photo } = req.body;

    // Check if user already has active check-in
    const activeLog = await AccessLog.findActiveByUser(req.user.id);
    if (activeLog) {
      return res.status(400).json({ message: 'User already checked in' });
    }

    // Create access log
    const log = await AccessLog.create({
      user_id: req.user.id,
      device_ids: device_ids || [],
      status: 'checked_in',
      entry_photo: entry_photo || null
    });

    res.status(201).json({
      message: 'Check-in successful',
      log,
    });

    // Log check-in
    await logActivity(req.user.id, 'check_in', `User checked in with ${device_ids?.length || 0} devices`, { device_ids });
    
    // Broadcast real-time update
    req.io.emit('occupancy_update');
    req.io.emit('activity_update', {
      type: 'check_in',
      user: req.user.full_name
    });
  } catch (error) {
    res.status(500).json({ message: 'Check-in failed', error: error.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const activeLog = await AccessLog.findActiveByUser(req.user.id);
    if (!activeLog) {
      return res.status(400).json({ message: 'User is not checked in' });
    }

    const log = await AccessLog.checkOut(activeLog.id);
    res.json({ message: 'Check-out successful', log });

    // Log check-out
    await logActivity(req.user.id, 'check_out', `User checked out`);
    
    // Broadcast real-time update
    req.io.emit('occupancy_update');
    req.io.emit('activity_update', {
      type: 'check_out',
      user: req.user.full_name
    });
  } catch (error) {
    res.status(500).json({ message: 'Check-out failed', error: error.message });
  }
};

exports.getCurrentStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const activeLog = await AccessLog.findActiveByUser(req.user.id);

    if (!activeLog) {
      return res.json({
        status: 'checked_out',
        user,
        log: null,
      });
    }

    // Get device details
    const devices = activeLog.device_ids
      ? await Promise.all(
          activeLog.device_ids.map(id => Device.findById(id))
        )
      : [];

    res.json({
      status: 'checked_in',
      user,
      log: activeLog,
      devices,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch status', error: error.message });
  }
};

// Dashboard / Monitoring endpoints
exports.getRecentActivity = async (req, res) => {
  try {
    // Only security staff can view recent activity
    if (req.user.role !== 'security' && req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Unauthorized access' });
    }

    const limit = req.query.limit || 50;
    const activity = await AccessLog.getRecentActivity(limit);

    res.json({
      activity,
      count: activity.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch activity', error: error.message });
  }
};

exports.getCurrentOccupancy = async (req, res) => {
  try {
    // Only security staff can view occupancy
    if (req.user.role !== 'security' && req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Unauthorized access' });
    }

    const logs = await AccessLog.findAll({ status: 'checked_in' });

    res.json({
      occupancy: logs.length,
      logs,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch occupancy', error: error.message });
  }
};

const pool = require('../config/database');

exports.getAccessHistory = async (req, res) => {
  try {
    const { user_id, limit } = req.query;

    // Users can only view their own history, managers and security can view all
    let query_user_id = req.user.id;
    if (req.user.role === 'manager' || req.user.role === 'security') {
      query_user_id = user_id || req.user.id;
    }

    const history = await AccessLog.findAll({ user_id: query_user_id });

    res.json({
      history: history.slice(0, limit || 100),
      count: history.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch access history', error: error.message });
  }
};

exports.getPersonalStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get total stays count
    const totalStaysResult = await pool.query(
      'SELECT COUNT(*) FROM access_logs WHERE user_id = $1 AND status = \'checked_out\'',
      [userId]
    );

    // Get stay durations
    const durationsResult = await pool.query(
      `SELECT 
        EXTRACT(EPOCH FROM (check_out_time - check_in_time))/3600 as duration_hours,
        check_in_time
       FROM access_logs 
       WHERE user_id = $1 AND status = 'checked_out'
       ORDER BY check_in_time DESC`,
      [userId]
    );

    // Get recent activity
    const recentActivity = await pool.query(
      `SELECT * FROM access_logs 
       WHERE user_id = $1 
       ORDER BY created_at DESC LIMIT 10`,
      [userId]
    );

    const durations = durationsResult.rows.map(r => r.duration_hours);
    const avgDuration = durations.length > 0 ? (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(2) : 0;

    res.json({
      totalStays: parseInt(totalStaysResult.rows[0].count),
      avgDurationHours: parseFloat(avgDuration),
      durations: durationsResult.rows.slice(0, 7), // Last 7 stays for chart
      recentActivity: recentActivity.rows
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch personal stats', error: error.message });
  }
};

exports.verifyCheckIn = async (req, res) => {
  try {
    const { identifier } = req.params;
    let user = null;
    let device = null;

    // Determine what we're scanning
    try {
      if (identifier.startsWith('{')) {
        const qrData = JSON.parse(identifier);
        if (qrData.deviceId) {
          device = await Device.findById(qrData.deviceId);
          if (device) {
            user = await User.findById(device.owner_id);
          }
        }
      }
    } catch (e) {
      // Not JSON, treat as username or employee_id
    }

    if (!user) {
      // Try to find by username
      user = await User.findByUsername(identifier);
      if (!user) {
        // Try to find by employee_id or qr_code_id
        const userById = await pool.query(
          'SELECT * FROM users WHERE employee_id = $1 OR qr_code_id = $1',
          [identifier]
        );
        user = userById.rows[0];
      }
    }

    if (!user) {
      return res.status(404).json({ message: 'User or device not found in system' });
    }

    // Find active check-in session
    const activeLog = await AccessLog.findActiveByUser(user.id);
    
    // Get all approved devices for this user
    const userDevices = await Device.findByOwner(user.id);
    const approvedDevices = userDevices.filter(d => d.status === 'approved');

    res.json({
      user,
      session: activeLog || null,
      approvedDevices,
      verificationResult: {
        isInside: !!activeLog,
        deviceMatch: device ? approvedDevices.some(d => d.id === device.id) : null,
        scannedDevice: device
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
};
