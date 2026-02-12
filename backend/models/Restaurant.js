const mongoose = require('mongoose');
const User = require('./User');
const Yup = require('yup');

const restaurantYupSchema = Yup.object().shape({
  organizationName: Yup.string()
    .required('Organization name is required')
    .trim()
    .min(3, 'Org name must be at least 3 characters'),
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^\d{10}$/, 'provide valid 10-digit phone number'),
  address: Yup.string().required('Address is required'),
  location: Yup.string().optional(),
  operatingHours: Yup.string()
    .trim()
    .optional(),
  description: Yup.string()
    .trim()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
  certificateUrl: Yup.string()
    .url('Invalid certificate URL format')
    .nullable()
    .optional(),
  totalDonations: Yup.number()
    .integer('Total donations must be an integer')
    .min(0, 'Total donations cannot be negative')
    .default(0),
  mealsProvided: Yup.number()
    .integer('Meals provided must be an integer')
    .min(0, 'Meals provided cannot be negative')
    .default(0)
});

const restaurantSchema = new mongoose.Schema({
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
  operatingHours: {
    type: String
  },
  description: {
    type: String
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

restaurantSchema.pre('save', async function() {
  // Only validate on new documents
  if (this.isNew) {
    try {
      const dataToValidate = {
        organizationName: this.organizationName,
        phone: this.phone,
        address: this.address,
        location: this.location,
        operatingHours: this.operatingHours,
        description: this.description,
        certificateUrl: this.certificateUrl,
        totalDonations: this.totalDonations,
        mealsProvided: this.mealsProvided
      };
      
      // Validate with Yup
      await restaurantYupSchema.validate(dataToValidate, { abortEarly: false });
      
    } catch (error) {
      if (error.name === 'ValidationError') {
        // Transform Yup errors to Mongoose format
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

const Restaurant = User.discriminator('restaurant', restaurantSchema);

module.exports = Restaurant;
module.exports.restaurantYupSchema = restaurantYupSchema;
