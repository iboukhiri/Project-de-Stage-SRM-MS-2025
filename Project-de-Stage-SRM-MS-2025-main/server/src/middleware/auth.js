const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

module.exports = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    // Add user to request - ensure id is available as a string for consistent comparisons
    req.user = {
      ...user.toObject(),
      id: user._id.toString() // Add id as string for easier comparison
    };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}; 