const mongoose = require('mongoose');

const donationSchema = new mongoose. Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required:  true
  },
  foodName: {
    type: String,
    required: [true, 'Please provide food name'],
    trim: true
  },
  quantity: {
    type: String,
    required: [true, 'Please provide quantity (e.g., "5 kg", "20 plates", "10 liters")'],
    trim: true
  },
  category: {
    type: String,
    enum: ['Cooked Food', 'Raw Ingredients', 'Packaged Food', 'Bakery', 'Fruits & Vegetables', 'Other'],
    required: true
  },
  expiryTime:  {
    type: Date,
    required: [true, 'Please provide expiry time']
  },
  pickupAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates:  {
      lat: Number,
      lng: Number
    }
  },
  pickupInstructions: {
    type: String,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Picked Up', 'Expired', 'Cancelled'],
    default: 'Pending'
  },
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  acceptedAt: {
    type:  Date
  },
  pickedUpAt: {
    type:  Date
  },
  images:  [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for location-based queries
donationSchema. index({ 'pickupAddress.coordinates': '2dsphere' });

// Auto-expire donations
donationSchema.methods.checkExpiry = function() {
  if (this.expiryTime < new Date() && this.status === 'Pending') {
    this.status = 'Expired';
    this.isActive = false;
    return this.save();
  }
};

module.exports = mongoose. model('Donation', donationSchema);