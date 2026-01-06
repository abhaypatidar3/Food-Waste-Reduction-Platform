const mongoose = require('mongoose');
const Yup = require('yup');

const otpYupSchema = Yup.object().shape({
  email: Yup.string().email('invalid email').trim().lowercase().required('Email is required'),
  otp: Yup.string().required('OTP is required'),
  type: Yup.string().required('OTP is required').matches(/^\d{6}$/, 'OTP must be exactly 6 digits integers').length(6, 'OTP must be exactly 6 digits'),
});


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

otpSchema.pre('save', async function(next) {
  if(this.isNew){
    try{
      const dataToValidate = {
        email: this.email,
        otp: this.otp,
        type: this.type,
      };
      await otpYupSchema.validate(dataToValidate, {abortEarly: false});
      next();
    }catch(error){
      if(error.name === 'ValidationError'){
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
        return next(mongooseError);
      }
      return next(error);

    }
  }
  else{
    next();
  }
});
const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
module.exports. otpYupSchema = otpYupSchema;