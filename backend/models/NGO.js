const mongoose = require('mongoose');
const User = require('./User');

const ngoSchema = new mongoose.Schema({
  organizationName: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
    minlength: [3, 'Organization name must be at least 3 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\d{10}$/, 'Please provide a valid 10-digit phone number']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  certificateUrl: {
    type: String,
    default: null
  },
  totalReceived: {
    type: Number,
    default: 0
  },
  mealsReceived: {
    type: Number,
    default: 0
  },
  capacity: {
    type: Number,
    default: 50 // Number of people they can serve
  }
});

// Create geospatial index
ngoSchema.index({ location: '2dsphere' });

const NGO = User. discriminator('ngo', ngoSchema);

module.exports = NGO;