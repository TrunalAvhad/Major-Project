const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * authService.js
 * 
 * Utility service for token generation and user ID generation.
 * Keeps this logic centralized so it can be updated in one place.
 */

/**
 * Generates a JWT token for a given user.
 * 
 * JWT Payload:
 *   sub        - unique identifier (same as user_id)
 *   user_id    - frozen project identifier
 *   role       - user role (researcher | hospital_operator | admin)
 *   hospital_id - null for researcher/admin; hospital identifier for hospital_operator
 * 
 * Expiry: Controlled via JWT_EXPIRES_IN env var (default 1h).
 * 
 * Security notes:
 *   - JWT_SECRET must NEVER be hardcoded. Always loaded from environment.
 *   - Short expiry is intentional. Logout is stateless (client-side deletion).
 *   - Stateless JWT cannot be forcibly invalidated before expiry.
 *   - A stronger refresh-token/revocation mechanism may be added in a future
 *     security enhancement but is OUT OF SCOPE for Module 1.
 * 
 * @param {Object} user - Mongoose user document
 * @returns {string} Signed JWT access token
 */
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  return jwt.sign(
    {
      sub: user.user_id,
      user_id: user.user_id,
      account_id: user.account_id || null,
      role: user.role,
      hospital_id: user.hospital_id || null,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    }
  );
};

/**
 * Generates a unique user_id with the USR_ prefix.
 * Uses 6 random bytes (12 hex chars) for uniqueness.
 * 
 * @returns {string} e.g. "USR_a3b4c5d6e7f8"
 */
const generateUserId = () => {
  return `USR_${crypto.randomBytes(6).toString('hex')}`;
};

/**
 * Generates a clean human-readable account identifier based on role:
 * Researcher: RES-XXXX
 * Hospital:   HOS-XXXX
 * Admin:      ADM-XXXX
 * 
 * @param {string} role
 * @returns {string} e.g. "RES-001" or "RES-A1B2"
 */
const generateAccountId = (role) => {
  const hex = crypto.randomBytes(3).toString('hex').toUpperCase();
  if (role === 'researcher') return `RES-${hex}`;
  if (role === 'hospital_operator') return `HOS-${hex}`;
  if (role === 'admin') return `ADM-${hex}`;
  return `ACC-${hex}`;
};

/**
 * Validates email format for normal real-world email providers:
 * Gmail, Outlook, Hotmail, Yahoo, University/College (.edu),
 * Hospital (.org, .health), Company, and international domains.
 * Does NOT restrict to Gmail or hardcode specific providers.
 * 
 * @param {string} email
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length < 5 || trimmed.length > 254) return false;
  // RFC 5322 compliant general email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(trimmed);
};

module.exports = {
  generateToken,
  generateUserId,
  generateAccountId,
  isValidEmail,
};
