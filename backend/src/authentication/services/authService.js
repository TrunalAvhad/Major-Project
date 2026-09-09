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

module.exports = {
  generateToken,
  generateUserId,
};
