const mongoose = require('mongoose');

const storedModelSchema = new mongoose.Schema({
  model_id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  request_id: {
    type: String,
    default: null,
    index: true,
  },
  disease: {
    type: String,
    required: true,
    index: true,
  },
  task: {
    type: String,
    default: 'Image Classification',
  },
  architecture: {
    type: String,
    required: true,
  },
  version: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['APPROVED', 'TRAINING', 'ARCHIVED', 'DEPRECATED'],
    default: 'APPROVED',
  },
  metadata_path: {
    type: String,
    default: null,
  },
  sha256: {
    type: String,
    default: null,
  },
  metrics: {
    accuracy: { type: Number, default: null },
    loss: { type: Number, default: null },
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const StoredModel = mongoose.model('StoredModel', storedModelSchema);
module.exports = StoredModel;
