const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token', error: error.message });
  }
};

const requireRole = (...roles) => {
  // Ensure we have a flat array of roles
  const allowedRoles = roles.flat();
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: No user found' });
    }

    const hasRole = allowedRoles.includes(req.user.role);
    
    if (!hasRole) {
      console.warn(`Access denied for role: ${req.user.role}. Allowed: ${allowedRoles.join(', ')}`);
      return res.status(403).json({ message: `Forbidden: Access restricted for ${req.user.role}` });
    }

    next();
  };
};

module.exports = { authMiddleware, requireRole };
