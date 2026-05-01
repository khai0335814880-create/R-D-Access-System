const express = require('express');
const userController = require('../controllers/userController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole('manager', 'admin', 'security'));

router.get('/', userController.getAllUsers);
router.put('/:id', userController.updateUserStatus);
router.delete('/:id', userController.deleteUser);

module.exports = router;
