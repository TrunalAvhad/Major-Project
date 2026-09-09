const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Not authorized, no token provided'
      }
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user without password hash
    const user = await User.findOne({ user_id: decoded.user_id });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User belonging to this token no longer exists'
        }
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: {
          code: `ACCOUNT_${user.status.toUpperCase()}`,
          message: `Account is ${user.status}`
        }
      });
    }

    req.user = user;
    next();
  } catch (error) {
    let errorCode = 'INVALID_TOKEN';
    if (error.name === 'TokenExpiredError') {
      errorCode = 'TOKEN_EXPIRED';
    }

    return res.status(401).json({
      success: false,
      error: {
        code: errorCode,
        message: 'Not authorized, token failed'
      }
    });
  }
};

module.exports = { requireAuth };
