const User = require('../models/User');
const Hospital = require('../models/Hospital');
const AuditService = require('../services/auditService');
const { generateToken, generateUserId, generateAccountId, isValidEmail } = require('../services/authService');
const { ROLES } = require('../permissions/roles');


const registerUser = async (req, res) => {
  const { name, email, password, role, hospital_id } = req.body;

  try {
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Please provide all required fields' }
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid email address format' }
      });
    }

    if (role === ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Admin accounts cannot be created via public registration' }
      });
    }

    if (![ROLES.RESEARCHER, ROLES.HOSPITAL_OPERATOR].includes(role)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ROLE', message: 'Invalid role provided' }
      });
    }

    if (role === ROLES.HOSPITAL_OPERATOR) {
      if (!hospital_id) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'hospital_id is required for hospital_operator' }
        });
      }
      const hospitalExists = await Hospital.findOne({ hospital_id });
      if (!hospitalExists) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Provided hospital_id does not exist' }
        });
      }
    }

    if (role === ROLES.RESEARCHER && hospital_id) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Researcher should not have a hospital_id during registration' }
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if an account already exists for this SAME email + role
    const userExists = await User.findOne({ email: normalizedEmail, role });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: { code: 'EMAIL_ALREADY_EXISTS', message: 'An account with this email and role already exists' }
      });
    }

    const user_id = generateUserId();
    const account_id = generateAccountId(role);

    // Researchers start as 'pending' (requires Admin approval); hospital operators start as 'active'
    const initialStatus = role === ROLES.RESEARCHER ? 'pending' : 'active';

    const user = await User.create({
      user_id,
      account_id,
      name: name.trim(),
      email: normalizedEmail,
      password_hash: password, // Will be hashed by pre-save middleware
      role,
      hospital_id: role === ROLES.HOSPITAL_OPERATOR ? hospital_id : null,
      status: initialStatus
    });

    await AuditService.logEvent({
      user_id: user.user_id,
      action: 'REGISTER_SUCCESS',
      resource_type: 'User',
      resource_id: user.user_id,
      hospital_id: user.hospital_id,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      success: true,
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          user_id: user.user_id,
          account_id: user.account_id,
          name: user.name,
          email: user.email,
          role: user.role,
          hospital_id: user.hospital_id,
          status: user.status
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Please provide email and password' }
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = null;

    if (role) {
      // Direct role-specific query
      user = await User.findOne({ email: normalizedEmail, role }).select('+password_hash');
    } else {
      // Find all accounts matching this email across roles
      const matchingUsers = await User.find({ email: normalizedEmail }).select('+password_hash');
      if (matchingUsers.length === 1) {
        user = matchingUsers[0];
      } else if (matchingUsers.length > 1) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ROLE_SELECTION_REQUIRED',
            message: 'Multiple accounts exist for this email. Please select your account role to proceed.',
            available_roles: matchingUsers.map(u => ({ role: u.role, account_id: u.account_id }))
          }
        });
      }
    }
    
    // We don't expose if the email exists or not on failure
    if (!user) {
      await AuditService.logEvent({
        user_id: 'UNKNOWN',
        action: 'LOGIN_FAILED',
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        success: false,
        metadata: { email_attempt: normalizedEmail, role_attempt: role || null }
      });
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' }
      });
    }

    // Check lock_until
    if (user.lock_until && user.lock_until > Date.now()) {
      await AuditService.logEvent({
        user_id: user.user_id,
        action: 'LOGIN_FAILED',
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        success: false,
        metadata: { reason: 'account_locked' }
      });
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' }
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      user.failed_login_attempts += 1;
      const MAX_ATTEMPTS = parseInt(process.env.MAX_FAILED_LOGIN_ATTEMPTS, 10) || 5;
      
      if (user.failed_login_attempts >= MAX_ATTEMPTS) {
        user.lock_until = new Date(Date.now() + 15 * 60 * 1000); // lock for 15 mins
      }
      await user.save();

      await AuditService.logEvent({
        user_id: user.user_id,
        action: 'LOGIN_FAILED',
        hospital_id: user.hospital_id,
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        success: false,
        metadata: { reason: 'wrong_password', attempts: user.failed_login_attempts }
      });

      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' }
      });
    }

    if (user.status !== 'active') {
      await AuditService.logEvent({
        user_id: user.user_id,
        action: 'LOGIN_FAILED',
        hospital_id: user.hospital_id,
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        success: false,
        metadata: { reason: `account_${user.status}` }
      });

      return res.status(403).json({
        success: false,
        error: { code: `ACCOUNT_${user.status.toUpperCase()}`, message: `Account is ${user.status}` }
      });
    }

    // Reset failed logins on success
    user.failed_login_attempts = 0;
    user.lock_until = null;
    user.last_login_at = Date.now();
    await user.save();

    await AuditService.logEvent({
      user_id: user.user_id,
      action: 'LOGIN_SUCCESS',
      hospital_id: user.hospital_id,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      success: true,
    });

    const access_token = generateToken(user);

    res.status(200).json({
      success: true,
      data: {
        user: {
          user_id: user.user_id,
          account_id: user.account_id || null,
          name: user.name,
          email: user.email,
          role: user.role,
          hospital_id: user.hospital_id,
          status: user.status
        },
        access_token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
};

const logoutUser = async (req, res) => {
  // Stateless JWT logout is handled client-side. We just log the event.
  await AuditService.logEvent({
    user_id: req.user.user_id,
    action: 'LOGOUT',
    hospital_id: req.user.hospital_id,
    ip_address: req.ip,
    user_agent: req.get('User-Agent'),
    success: true,
  });

  res.status(200).json({
    success: true,
    data: { message: 'Logged out successfully' }
  });
};

const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: {
        user_id: req.user.user_id,
        account_id: req.user.account_id || null,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        hospital_id: req.user.hospital_id,
        status: req.user.status
      }
    }
  });
};

const getRolesByEmail = async (req, res) => {
  const email = req.query.email || req.body?.email;
  if (!email) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Email query parameter is required' }
    });
  }

  try {
    const normalizedEmail = String(email).toLowerCase().trim();
    const users = await User.find({ email: normalizedEmail }).select('role account_id status');
    return res.status(200).json({
      success: true,
      data: {
        email: normalizedEmail,
        roles: users.map(u => ({
          role: u.role,
          account_id: u.account_id || null,
          status: u.status
        }))
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};

  try {
    // Validate required password fields before accessing the database
    if (
      typeof currentPassword !== 'string' ||
      currentPassword.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Current password is required'
        }
      });
    }

    if (
      typeof newPassword !== 'string' ||
      newPassword.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'New password is required'
        }
      });
    }

    const user = await User.findOne({
      user_id: req.user.user_id
    }).select('+password_hash');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.matchPassword(currentPassword);

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Current password is incorrect'
        }
      });
    }

    // Prevent changing to the same password
    const isSamePassword = await user.matchPassword(newPassword);

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'New password must be different from the current password'
        }
      });
    }

    // Pre-save middleware will hash the password
    user.password_hash = newPassword;
    await user.save();

    await AuditService.logEvent({
      user_id: user.user_id,
      action: 'PASSWORD_CHANGED',
      hospital_id: user.hospital_id,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      success: true,
    });

    return res.status(200).json({
      success: true,
      data: {
        message: 'Password changed successfully'
      }
    });

  } catch (error) {
    console.error('Change password error:', error);

    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An internal server error occurred'
      }
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  getRolesByEmail,
  changePassword
};
