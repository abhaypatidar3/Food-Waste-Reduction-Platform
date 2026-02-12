const mongoose = require('mongoose');
const Yup = require('yup');

const notificationYupSchema = Yup.object().shape({
  recipient: Yup.string().required('Recipient is required'),
  type: Yup.string().oneOf(['new_donation', 'urgent', 'reminder', 'completed', 'impact', 'accepted'], 'Invalid notification type').required('Notification type is required'),
  title: Yup.string().required('Title is required').trim(),
  message: Yup.string().required('Message is required').trim(),
  relatedDonation: Yup.string().matches(/^[0-9a-fA-F]{24}$/, 'Invalid donation ID format').nullable().optional(),
  read: Yup.boolean().default(false)
});

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation'
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

notificationSchema.pre('save', async function() {
  if (this.isNew) {
    try {
      const dataToValidate = {
        recipient: this.recipient.toString(),
        type: this.type,
        title: this.title,
        message: this.message,
        relatedDonation: this.relatedDonation ? this.relatedDonation.toString() : null,
        read: this.read
      };
      
      await notificationYupSchema.validate(dataToValidate, { abortEarly: false });
      
    } catch (error) {
      if (error.name === 'ValidationError') {
        const mongooseError = new Error('Validation failed');
        mongooseError.name = 'ValidationError';
        mongooseError.errors = {};
        
        error.inner.forEach(err => {
          mongooseError.errors[err.path] = {
            message: err.message,
            path: err.path,
            value: err.value
          };
        });
        
        throw mongooseError;
      }
      throw error;
    }
  }
});

// Index for faster queries
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
module.exports.notificationYupSchema = notificationYupSchema;
