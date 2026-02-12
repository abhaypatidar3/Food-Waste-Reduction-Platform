const mongoose = require('mongoose');
const User = require('./User');
const Yup = require('yup');

const adminYupSchema = Yup.object().shape({
  fullName: Yup.string().required('Full name is required').trim(),
  permissions: Yup.array().of(
    Yup.string().oneOf(['manage_users', 'manage_donations', 'view_analytics', 'manage_content'], 'Invalid permission')
  )
});

const adminSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  permissions: [{
    type: String,
    enum: ['manage_users', 'manage_donations', 'view_analytics', 'manage_content']
  }]
});

adminSchema.pre('save', async function() {
  if (this.isNew) {
    try {
      const dataToValidate = {
        fullName: this.fullName,
        permissions: this.permissions
      };
      
      await adminYupSchema.validate(dataToValidate, { abortEarly: false });
      
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

const Admin = User.discriminator('admin', adminSchema);

module.exports = Admin;
module.exports.adminYupSchema = adminYupSchema;
