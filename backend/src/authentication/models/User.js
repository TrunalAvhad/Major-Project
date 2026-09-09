const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  password_hash: {
    type: String,
    required: true,
    select: false,
  },
  role: {
    type: String,
    enum: ['researcher', 'hospital_operator', 'admin'],
    required: true,
  },
  hospital_id: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'rejected', 'deactivated'],
    default: 'pending',
  },
  last_login_at: {
    type: Date,
    default: null,
  },
  failed_login_attempts: {
    type: Number,
    default: 0,
  },
  lock_until: {
    type: Date,
    default: null,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Mongoose v7+ async pre-hooks do not use the next() callback.
// Simply return early or let the async function resolve.
userSchema.pre('save', async function () {
  if (!this.isModified('password_hash')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password_hash = await bcrypt.hash(this.password_hash, salt);
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password_hash);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
