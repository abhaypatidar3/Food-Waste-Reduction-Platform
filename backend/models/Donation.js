const mongoose = require('mongoose');

const Yup = require('yup');
const { restaurantYupSchema } = require('./Restaurant');

const donationYupSchema = Yup.object().shape({
  restaurant: Yup.string().matches(/^[0-9a-fA-F]{24}$/, 'Invalid restaurant ID format').required('Restaurant ID is required'),
  foodName: Yup.string().required('Food name is required').trim(),
  quantity: Yup.string().required('Quantity is required').trim(),
  category: Yup.string().oneOf(['Cooked Food', 'Raw Ingredients', 'Packaged Food', 'Bakery', 'Fruits & Vegetables', 'Other'], 'Invalid category').required('Category is required'),
  expiryTime: Yup.date().required('Expiry time is required').min(new Date(), 'Already expired food not allowed'),
  pickupAddress: Yup.object().shape({
    street: Yup.string().required('Street is required').trim(),
    city: Yup.string().required('City is required').trim(),
    state: Yup.string().required('State is required').trim(),
    zipCode: Yup.string().required('Zip code is required').trim()
  }),
  pickupInstructions: Yup.string().max(500, 'Pickup instructions must not exceed 500 characters').optional(),
  status: Yup.string().oneOf(['Pending', 'Accepted', 'Picked Up', 'Expired', 'Cancelled'], 'Invalid status').default('Pending'),
  isActive: Yup.boolean().default(true),
  acceptedBy: Yup.string().matches(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format').nullable().optional(),
  acceptedAt: Yup.date().nullable().optional(),
  pickedUpAt: Yup.date().nullable().optional(),
});  

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
donationSchema.index({ 'pickupAddress.coordinates': '2dsphere' });

donationSchema.pre('save', async function(next){
    if(this.isNew){
      try{
        const dataToValidate = {
          restaurant: this.restaurant.toString(),
          foodName: this.foodName,
          quantity: this.quantity,
          category: this.category,
          expiryTime: this.expiryTime,
          pickupAddress: this.pickupAddress,
          pickupInstructions: this.pickupInstructions,
          status: this.status,
          isActive: this.isActive,
          acceptedBy: this.acceptedBy ? this.acceptedBy.toString() : null,
          acceptedAt: this.acceptedAt,
          pickedUpAt: this.pickedUpAt,
        };

        await donationYupSchema.validate(dataToValidate, {abortEarly: false});
        next();
      } catch(error){
        if(error.name === 'validationError'){
          const mongooseError = new Error('Validation failed');
          mongooseError.name = 'ValidationError';
          mongooseError.errors = {};

          error.inner.forEach(err=>{
            mongooseError.errors[err.path] = {
              message: err.message,
              path: err.path,
              value: err.value
            };
          });
          return next(mongooseError);
        }
        return next(error);
      }
    }else{
      next();
    }
});

// Auto-expire donations
donationSchema.methods.checkExpiry = function() {
  if (this.expiryTime < new Date() && this.status === 'Pending') {
    this.status = 'Expired';
    this.isActive = false;
    return this.save();
  }
};

module.exports = mongoose. model('Donation', donationSchema);
module.exports. donationYupSchema = donationYupSchema;