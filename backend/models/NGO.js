const mongoose = require('mongoose');
const User = require('./User');
const Yup = require('yup');

const ngoYupSchema = Yup.object().shape({
  organizationName: Yup.string().required('Organization name is required').trim().min(3, 'Org name must be at least 3 characters'),
  phone: Yup.string().required('Phone number is required').matches(/^\d{10}$/, 'provide valid 10-digit phone number'),
  address: Yup.object().required('Address is required'),
  location: Yup.mixed().optional(),
  certificateUrl: Yup.string().url('Invalid certificate URL format').nullable().optional(),
  totalReceived: Yup.number().integer('Total received must be an integer').min(0, 'Total received cannot be negative').default(0),
  mealsReceived: Yup.number().integer('Meals received must be an integer').min(0, 'Meals received cannot be negative').default(0)
});

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
  },
  registrationNumber: {
    type: String
  },
  servingArea: {
    type: String
  },
  description: {
    type: String
  }
});

ngoSchema.pre('save', async function() {
  if (this.isNew) {
    try {
      const dataToValidate = {
        organizationName: this.organizationName,
        phone: this.phone,
        address: {
          street: this.address?.street,
          city: this.address?.city,
          state: this.address?.state,
          zipCode: this.address?.zipCode
        },
        location: this.location,
        certificateUrl: this.certificateUrl,
        totalReceived: this.totalReceived,
        mealsReceived: this.mealsReceived
      };
      
      await ngoYupSchema.validate(dataToValidate, { abortEarly: false });
      
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

const NGO = User.discriminator('ngo', ngoSchema);

module.exports = NGO;
module.exports.ngoYupSchema = ngoYupSchema;
