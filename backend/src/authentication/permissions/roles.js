const ROLES = {
  ADMIN: 'admin',
  RESEARCHER: 'researcher',
  HOSPITAL_OPERATOR: 'hospital_operator',
};

// We don't define resource-specific permissions here (like "can_view_model_123")
// as that is out of scope for Module 1. This is just for role presence checking.
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    'manage_users',
    'approve_researchers',
    'manage_hospitals',
    'manage_hospital_users',
    'view_audit_logs',
    'view_security_events',
  ],
  [ROLES.RESEARCHER]: [
    'login',
    'view_authorized_hospitals',
  ],
  [ROLES.HOSPITAL_OPERATOR]: [
    'login',
    'manage_local_client',
    'view_hospital_status',
  ],
};

module.exports = {
  ROLES,
  ROLE_PERMISSIONS,
};
