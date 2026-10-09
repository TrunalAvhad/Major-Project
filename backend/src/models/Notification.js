const mongoose = require('mongoose');

// Module 18: a notification addressed to one hospital (e.g. a federation round opened or closed).
const notificationSchema = new mongoose.Schema({
  notification_id: { type: String, required: true, unique: true },
  hospital_id: { type: String, required: true, index: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  sender: { type: String, default: 'Federation server (Module 9)' },
  job_id: { type: String, default: null },
  round_id: { type: String, default: null },
  read: { type: Boolean, default: false },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Notification', notificationSchema);
