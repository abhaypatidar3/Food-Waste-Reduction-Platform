const mongoose = require('mongoose');
const User = require('./User');

const restaurantSchema = new mongoose.Schema({
  organizationName: {
    type:  String,
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
    required:  [true, 'Address is required'],
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
  operatingHours:{
    type: String
  },
  description: {
    type: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  certificateUrl: {
    type: String,
    default: null
  },
  totalDonations: {
    type: Number,
    default: 0
  },
  mealsProvided: {
    type: Number,
    default: 0
  }
});

// Create geospatial index
restaurantSchema.index({ location: '2dsphere' });

const Restaurant = User.discriminator('restaurant', restaurantSchema);

module.exports = Restaurant;