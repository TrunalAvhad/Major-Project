const mongoose = require('mongoose');

const participatingHospitalSchema = new mongoose.Schema({
  hospital_id: {
    type: String,
    required: true,
  },
  hospital_name: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['ACCEPTED', 'TRAINING', 'COMPLETED', 'WITHDRAWN'],
    default: 'ACCEPTED',
  },
  joined_at: {
    type: Date,
    default: Date.now,
  },
  withdrawn_at: {
    type: Date,
    default: null,
  },
  withdrawal_reason: {
    type: String,
    default: null,
  },
  training_metrics: {
    current_epoch: { type: Number, default: null },
    total_epochs: { type: Number, default: null },
    loss: { type: Number, default: null },
    accuracy: { type: Number, default: null },
    status: { type: String, default: 'Not available' },
  }
}, { _id: false });

const trainingRequestSchema = new mongoose.Schema({
  request_id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  researcher_id: {
    type: String,
    required: true,
    index: true,
  },
  researcher_name: {
    type: String,
    required: true,
  },
  disease: {
    type: String,
    required: true,
    index: true,
  },
  task: {
    type: String,
    required: true,
    default: 'Image Classification',
  },
  description: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['DRAFT', 'OPEN', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
    default: 'OPEN',
    index: true,
  },
  model_architecture: {
    type: String,
    default: 'ResNet-18',
  },
  model_version: {
    type: String,
    default: 'v1',
  },
  participating_hospitals: [participatingHospitalSchema],
  training_config: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const TrainingRequest = mongoose.model('TrainingRequest', trainingRequestSchema);
module.exports = TrainingRequest;
