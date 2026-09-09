const crypto = require('crypto');
const AuditLog = require('../models/AuditLog');

class AuditService {
  /**
   * Logs an audit event ensuring it is append-only.
   * @param {Object} params
   * @param {string} params.user_id
   * @param {string} params.action e.g. LOGIN_SUCCESS, ACCESS_DENIED
   * @param {string} [params.resource_type]
   * @param {string} [params.resource_id]
   * @param {string} [params.hospital_id]
   * @param {string} [params.ip_address]
   * @param {string} [params.user_agent]
   * @param {boolean} params.success
   * @param {Object} [params.metadata]
   */
  static async logEvent(params) {
    try {
      // Clean metadata of any sensitive keys if accidentally passed
      const cleanMetadata = { ...params.metadata };
      const sensitiveKeys = ['password', 'password_hash', 'token', 'jwt', 'secret'];
      for (const key of sensitiveKeys) {
        if (cleanMetadata[key]) {
          delete cleanMetadata[key];
        }
      }

      const auditLog = new AuditLog({
        audit_id: `AUD_${crypto.randomBytes(12).toString('hex')}`,
        user_id: params.user_id,
        action: params.action,
        resource_type: params.resource_type,
        resource_id: params.resource_id,
        hospital_id: params.hospital_id,
        ip_address: params.ip_address,
        user_agent: params.user_agent,
        success: params.success,
        metadata: cleanMetadata,
      });

      await auditLog.save();
    } catch (error) {
      console.error('Audit Log Error:', error);
      // Depending on strictness, we might want to fail the whole request if audit logging fails.
      // Usually, we just log it to console so the main action isn't blocked by telemetry failure.
    }
  }
}

module.exports = AuditService;
