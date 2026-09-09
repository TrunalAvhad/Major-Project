const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  audit_id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  user_id: {
    type: String,
    index: true,
  },
  action: {
    type: String,
    required: true,
  },
  resource_type: {
    type: String,
  },
  resource_id: {
    type: String,
  },
  hospital_id: {
    type: String,
    index: true,
  },
  ip_address: {
    type: String,
  },
  user_agent: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  success: {
    type: Boolean,
    required: true,
  },
  metadata: {
    type: Object,
    default: {},
  }
}, {
  timestamps: false // Immutable, append-only
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
