const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  otp:  {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['email_verification', 'password_reset'],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // TTL index - auto-delete when expired
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
otpSchema.index({ email: 1, type: 1 });

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;