const express = require('express');
const deviceController = require('../controllers/deviceController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// All device routes require authentication
router.use(authMiddleware);

// Engineer routes
router.post('/', deviceController.createDevice);
router.get('/my-devices', deviceController.getMyDevices);
router.get('/approved', deviceController.getApprovedDevices);
router.get('/:id/qr', deviceController.getDeviceQR);
router.put('/:id', deviceController.updateDevice);
router.delete('/:id', deviceController.deleteDevice);

// Manager/Admin/Security routes
router.get('/all', requireRole('manager', 'admin', 'security'), deviceController.getAllDevices);
router.get('/requests/pending', requireRole('manager', 'admin', 'security'), deviceController.getPendingRequests);
router.post('/quick-confirm', requireRole('security', 'admin'), deviceController.confirmQuickRegister);
router.post('/requests/:id/approve', requireRole('manager', 'admin', 'security'), deviceController.approveDevice);
router.post('/requests/:id/reject', requireRole('manager', 'admin', 'security'), deviceController.rejectDevice);

module.exports = router;
