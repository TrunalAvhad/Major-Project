const { ROLES } = require('../permissions/roles');

/**
 * Middleware to enforce hospital isolation.
 * It expects the requested hospital_id to be available in req.params.hospital_id 
 * or req.body.hospital_id.
 */
const requireHospitalAccess = (req, res, next) => {
  const requested_hospital_id = req.params.hospital_id || req.body.hospital_id;

  if (!requested_hospital_id) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'hospital_id is required to check access'
      }
    });
  }

  // Admin can access all hospitals
  if (req.user.role === ROLES.ADMIN) {
    return next();
  }

  // Hospital Operator can ONLY access their own hospital
  if (req.user.role === ROLES.HOSPITAL_OPERATOR) {
    if (req.user.hospital_id !== requested_hospital_id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'HOSPITAL_ACCESS_DENIED',
          message: 'You do not have access to this hospital\'s resources'
        }
      });
    }
    return next();
  }

  // Researcher access to hospital resources must be controlled by 
  // participation rules in future modules, but basic isolation blocks them here
  // unless explicitly handled by other resource-specific middleware.
  // For basic endpoint isolation, researchers don't automatically get access.
  return res.status(403).json({
    success: false,
    error: {
      code: 'FORBIDDEN',
      message: 'Role not authorized for direct hospital resource access'
    }
  });
};

module.exports = { requireHospitalAccess };
