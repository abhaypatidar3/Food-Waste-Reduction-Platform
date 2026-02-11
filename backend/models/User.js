const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Yup = require('yup');


const userYupSchema = Yup.object().shape({
  email: Yup.string().required('Email is required').email('Invalid email format').matches(/^[a-zA-Z][a-zA-Z0-9._-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Email must start with a letter').trim().lowercase(),
  password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter').matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
      'Password must contain at least one special character'
  ),
  role: Yup.string().oneOf(['restaurant', 'ngo', 'admin'], 'Invalid role').required('User role is required'),
  isVerified: Yup.boolean().default(false),

  isActive: Yup.boolean().default(true)
  
})



const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email) {
        const emailRegex = /^[a-zA-Z][a-zA-Z0-9._-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
      },
      message: 'Email must start with a letter and be in valid format'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
    validate: {
      validator: function(password) {
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/? ]/.test(password);
        return hasUppercase && hasLowercase && hasSpecialChar;
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one special character'
    }
  },
  role: {
    type: String,
    enum: ['restaurant', 'ngo', 'admin'],
    required: [true, 'User role is required']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type:  Date,
    default: Date. now
  }
}, {
  discriminatorKey: 'role',
  collection: 'users'
});


userSchema.pre('save', async function () {
  // Only validate on new documents or when password is modified
  if (this.isNew || this.isModified('password')) {
    const dataToValidate = {
      email: this.email,
      role: this.role,
      isVerified: this.isVerified,
      isActive: this.isActive
    };

    // Only validate password if being modified and not already hashed
    if (this.isModified('password') && this.password) {
      if (
        !this.password.startsWith('$2a$') &&
        !this.password.startsWith('$2b$')
      ) {
        dataToValidate.password = this.password;
      }
    }

    try {
      await userYupSchema.validate(dataToValidate, { abortEarly: false });
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

        throw mongooseError; // ✅ throw instead of next()
      }

      throw error; // ✅ throw instead of next()
    }
  }

  // Hash password before saving
  if (this.password && this.isModified('password')) {
    if (
      !this.password.startsWith('$2a$') &&
      !this.password.startsWith('$2b$')
    ) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }
});


// Compare entered password with hashed password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

// ✅ Export both the model and validation schema
module.exports = User;
module.exports.userYupSchema = userYupSchema;
