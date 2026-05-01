const User = require('../models/User');
const { logActivity } = require('../utils/helpers');

exports.getAllUsers = async (req, res) => {
  try {
    const filters = {
      role: req.query.role,
      status: req.query.status
    };
    const users = await User.findAll(filters);
    console.log(`[UserManagement] Found ${users.length} users`);
    
    // Remove password hashes from response
    const sanitizedUsers = users.map(user => {
      const { password_hash, ...sanitized } = user;
      return sanitized;
    });

    res.json(sanitizedUsers);
  } catch (error) {
    console.error('[UserManagement Error] getAllUsers:', error);
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, role } = req.body;

    const user = await User.update(id, { status, role });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log the change
    await logActivity(req.user.id, 'user_update', `Updated user ${user.username}: status=${status}, role=${role}`);

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.delete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log the deletion
    await logActivity(req.user.id, 'user_deletion', `Deleted user: ${user.username}`);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};
