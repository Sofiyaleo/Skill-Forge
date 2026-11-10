/**
 * middleware/authMiddleware.js
 * Protects Express routes by validating JSON Web Tokens (JWT).
 * Supports both HTTP-only cookies and Authorization headers.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes for logged-in users
const protect = async (req, res, next) => {
  let token;

  // 1. Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // 2. Or check for token in cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please login to access this resource.'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'skillforge_secret_key');

    // Attach user to request object (exclude password)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token is invalid or has expired. Please login again.'
    });
  }
};

// Admin authorization guard
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access forbidden. Administrator privileges are required.'
    });
  }
};

module.exports = { protect, adminOnly };
