const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose. Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type:  String,
    enum: ['new_donation', 'urgent', 'reminder', 'completed', 'impact', 'accepted'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedDonation: {
    type:  mongoose.Schema.Types.ObjectId,
    ref: 'Donation'
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type:  Date,
    default: Date. now
  }
});

// Index for faster queries
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);