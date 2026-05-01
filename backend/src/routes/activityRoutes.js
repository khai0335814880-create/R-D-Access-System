const express = require('express');
const activityController = require('../controllers/activityController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Managers and security can see all recent activity (Audit Trail)
router.get('/', requireRole('manager', 'security', 'admin'), activityController.getRecentActivity);

// Users can see their own activity
router.get('/me', activityController.getMyActivity);

module.exports = router;
