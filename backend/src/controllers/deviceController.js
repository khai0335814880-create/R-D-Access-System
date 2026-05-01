const Device = require('../models/Device');
const DeviceRequest = require('../models/DeviceRequest');
const Notification = require('../models/Notification');
const { logActivity } = require('../utils/helpers');
const qrcode = require('qrcode');

exports.createDevice = async (req, res) => {
  try {
    const { device_type, brand, model, serial_number, mac_address, description, device_photo } = req.body;

    if (!device_photo) {
      return res.status(400).json({ message: 'Bạn bắt buộc phải chụp ảnh thiết bị!' });
    }

    // Check if device already exists
    const existing = await Device.findBySerialNumber(serial_number);
    if (existing) {
      return res.status(400).json({ message: 'Device with this serial number already exists' });
    }

    // Create device with approved status
    const device = await Device.create({
      owner_id: req.user.id,
      device_type,
      brand,
      model,
      serial_number,
      mac_address,
      description,
      status: 'approved',
      device_photo
    });

    res.status(201).json({
      message: 'Device created and automatically approved',
      device,
    });

    // Log device registration
    await logActivity(req.user.id, 'device_registration', `Registered new device: ${brand} ${model} (SN: ${serial_number})`);
    
    // Notify managers via socket
    req.io.emit('new_device_request', { 
      id: device.id, 
      user: req.user.full_name,
      device: `${brand} ${model}`
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create device', error: error.message });
  }
};

exports.getMyDevices = async (req, res) => {
  try {
    const devices = await Device.findByOwner(req.user.id);
    res.json({ devices });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch devices', error: error.message });
  }
};

exports.getApprovedDevices = async (req, res) => {
  try {
    const devices = await Device.findAll({ owner_id: req.user.id, status: 'approved' });
    res.json({ devices });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch approved devices', error: error.message });
  }
};

exports.getAllDevices = async (req, res) => {
  try {
    const devices = await Device.findAll();
    res.json({ devices });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch devices', error: error.message });
  }
};

exports.updateDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verify device ownership
    const device = await Device.findById(id);
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    if (device.owner_id !== req.user.id && req.user.role !== 'manager' && req.user.role !== 'security') {
      return res.status(403).json({ message: 'Forbidden: Cannot update this device' });
    }

    const updated = await Device.update(id, updateData);
    await logActivity(req.user.id, 'device_update', `Cập nhật thiết bị ID: ${id} (${device.brand} ${device.model})`);
    res.json({ message: 'Device updated successfully', device: updated });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update device', error: error.message });
  }
};

exports.deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify device ownership
    const device = await Device.findById(id);
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    if (device.owner_id !== req.user.id && req.user.role !== 'manager' && req.user.role !== 'admin' && req.user.role !== 'security') {
      return res.status(403).json({ message: 'Forbidden: Cannot delete this device' });
    }

    await Device.delete(id);
    await logActivity(req.user.id, 'device_deletion', `Xóa thiết bị ID: ${id} (${device.brand} ${device.model})`);
    res.json({ message: 'Device deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete device', error: error.message });
  }
};

// Approval requests
exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await DeviceRequest.findPending();
    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pending requests', error: error.message });
  }
};

exports.approveDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    // Only managers, admins or security managers can approve
    if (req.user.role !== 'manager' && req.user.role !== 'admin' && req.user.role !== 'security') {
      return res.status(403).json({ message: 'Forbidden: Unauthorized access' });
    }

    const approved = await DeviceRequest.approve(id, comments);
    res.json({ message: 'Device approved successfully', request: approved });

    // Log approval
    await logActivity(req.user.id, 'device_approval', `Approved device request ID: ${id}`, { comments });

    // Create Notification for the requester
    try {
      const device = await Device.findById(approved.device_id);
      await Notification.create({
        user_id: approved.requester_id,
        title: 'Thiết bị đã được phê duyệt',
        message: `Thiết bị ${device.brand} ${device.model} của bạn đã được phê duyệt. Bạn có thể sử dụng mã QR để ra vào phòng.`,
        type: 'success'
      });

      // Emit socket notification event to the specific user's room
      req.io.to(`user_${approved.requester_id}`).emit('notification', {
        title: 'Thiết bị đã được phê duyệt',
        message: `Thiết bị ${device.brand} ${device.model} của bạn đã được phê duyệt.`,
        type: 'success',
        created_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to send notification for approval', err);
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve device', error: error.message });
  }
};

exports.rejectDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    // Only managers, admins or security managers can reject
    if (req.user.role !== 'manager' && req.user.role !== 'admin' && req.user.role !== 'security') {
      return res.status(403).json({ message: 'Forbidden: Unauthorized access' });
    }

    const rejected = await DeviceRequest.reject(id, comments);
    res.json({ message: 'Device rejected successfully', request: rejected });

    // Log rejection
    await logActivity(req.user.id, 'device_rejection', `Rejected device request ID: ${id}`, { comments });

    // Create Notification for the requester
    try {
      const device = await Device.findById(rejected.device_id);
      await Notification.create({
        user_id: rejected.requester_id,
        title: 'Thiết bị bị từ chối',
        message: `Thiết bị ${device.brand} ${device.model} của bạn đã bị từ chối. Lý do: ${comments || 'Không có'}`,
        type: 'error'
      });

      // Emit socket notification
      req.io.to(`user_${rejected.requester_id}`).emit('notification', {
        title: 'Thiết bị bị từ chối',
        message: `Yêu cầu cho thiết bị ${device.brand} ${device.model} của bạn đã bị từ chối.`,
        type: 'warning',
        created_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to send notification for rejection', err);
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject device', error: error.message });
  }
};

exports.getDeviceQR = async (req, res) => {
  try {
    const { id } = req.params;
    const device = await Device.findById(id);
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    if (device.owner_id !== req.user.id && req.user.role !== 'manager' && req.user.role !== 'security') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const qrData = JSON.stringify({ deviceId: device.id });
    const qrImage = await qrcode.toDataURL(qrData);

    res.json({ qrImage, message: 'Device QR generated' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate device QR', error: error.message });
  }
};
exports.confirmQuickRegister = async (req, res) => {
  try {
    const { user_id, device_type, brand, model, serial_number, mac_address, description, device_photo } = req.body;

    if (!device_photo) {
      return res.status(400).json({ message: 'Bạn bắt buộc phải chụp ảnh thiết bị!' });
    }

    const existing = await Device.findBySerialNumber(serial_number);
    if (existing) {
      return res.status(400).json({ message: 'Thiết bị với số Serial này đã tồn tại!' });
    }

    const device = await Device.create({
      owner_id: user_id,
      device_type,
      brand,
      model,
      serial_number,
      mac_address,
      description,
      status: 'approved',
      device_photo
    });

    res.status(201).json({
      message: 'Đăng ký nhanh thiết bị thành công!',
      device
    });

    await logActivity(req.user.id, 'quick_device_registration', `Xác nhận đăng ký nhanh thiết bị: ${brand} ${model} (SN: ${serial_number})`);
  } catch (error) {
    res.status(500).json({ message: 'Xác nhận đăng ký nhanh thất bại', error: error.message });
  }
};
