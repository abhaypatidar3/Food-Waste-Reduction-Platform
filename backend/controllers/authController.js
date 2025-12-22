const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const NGO = require('../models/NGO');
const Admin = require('../models/Admin');
const { sendTokenResponse } = require('../utils/jwtToken');
const { saveOTP, verifyOTP, canResendOTP } = require('../utils/otpHelper');
const { sendVerificationOTP, sendPasswordResetOTP } = require('../utils/emailService');

// @desc    Register user (Restaurant/NGO) - Send OTP
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    console.log('📝 Registration attempt with data:', req.body);

    const {
      email,
      password,
      role,
      organizationName,
      phone,
      address,
      certificateUrl
    } = req.body;

    // Validate required fields
    if (!email || !password || ! role || !organizationName || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    let user;

    // Create user based on role (unverified)
    if (role === 'restaurant') {
      user = await Restaurant.create({
        email,
        password,
        role,
        organizationName,
        phone,
        address,
        certificateUrl,
        isVerified: false
      });
    } else if (role === 'ngo') {
      user = await NGO. create({
        email,
        password,
        role,
        organizationName,
        phone,
        address,
        certificateUrl,
        isVerified:  false
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified.  Must be "restaurant" or "ngo"'
      });
    }

    console.log('✅ User created (unverified):', user._id);

    // Generate and send OTP
    const otp = await saveOTP(email, 'email_verification');
    const emailResult = await sendVerificationOTP(email, otp, organizationName);

    if (!emailResult.success) {
      // If email fails, delete the user
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email.  Please try again.'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for OTP.',
      email: email,
      requiresVerification: true
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0] || 'Validation failed'
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message :  undefined
    });
  }
};

// @desc    Verify Email with OTP
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP'
      });
    }

    // Verify OTP
    const verification = await verifyOTP(email, otp, 'email_verification');

    if (!verification.success) {
      return res.status(400).json({
        success: false,
        message: verification.message
      });
    }

    // Update user as verified
    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get full user details based on role
    let fullUser;
    if (user. role === 'restaurant') {
      fullUser = await Restaurant.findById(user._id);
    } else if (user. role === 'ngo') {
      fullUser = await NGO.findById(user._id);
    }

    console.log('✅ Email verified for:', email);

    // Send token response (log them in)
    sendTokenResponse(fullUser, 200, res);

  } catch (error) {
    console.error('❌ Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during verification'
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports. resendOTP = async (req, res) => {
  try {
    const { email, type } = req.body; // type: 'email_verification' or 'password_reset'

    if (!email || !type) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and type'
      });
    }

    // Check rate limiting
    const canResend = await canResendOTP(email, type);
    if (!canResend. canResend) {
      return res.status(429).json({
        success: false,
        message: canResend.message
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get organization name
    let fullUser;
    if (user. role === 'restaurant') {
      fullUser = await Restaurant.findById(user._id);
    } else if (user.role === 'ngo') {
      fullUser = await NGO.findById(user._id);
    }

    // Generate and send new OTP
    const otp = await saveOTP(email, type);
    
    let emailResult;
    if (type === 'email_verification') {
      emailResult = await sendVerificationOTP(email, otp, fullUser.organizationName);
    } else {
      emailResult = await sendPasswordResetOTP(email, otp, fullUser.organizationName);
    }

    if (!emailResult. success) {
      return res. status(500).json({
        success: false,
        message:  'Failed to send email.  Please try again.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully! Please check your email.'
    });

  } catch (error) {
    console.error('❌ Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if email is verified
    if (!user. isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in',
        requiresVerification: true,
        email: email
      });
    }

    if (!user.isActive) {
      return res. status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.'
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res. status(401).json({
        success: false,
        message:  'Invalid credentials'
      });
    }

    let fullUser;
    if (user. role === 'restaurant') {
      fullUser = await Restaurant.findById(user._id);
    } else if (user.role === 'ngo') {
      fullUser = await NGO.findById(user._id);
    } else if (user.role === 'admin') {
      fullUser = await Admin.findById(user._id);
    }

    sendTokenResponse(fullUser, 200, res);

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Forgot Password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if email exists or not (security)
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset OTP'
      });
    }

    // Get organization name
    let fullUser;
    if (user.role === 'restaurant') {
      fullUser = await Restaurant.findById(user._id);
    } else if (user.role === 'ngo') {
      fullUser = await NGO.findById(user._id);
    }

    // Generate and send OTP
    const otp = await saveOTP(email, 'password_reset');
    const emailResult = await sendPasswordResetOTP(email, otp, fullUser.organizationName);

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send email. Please try again.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to your email'
    });

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      success: false,
      message:  'Server error'
    });
  }
};

// @desc    Reset Password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || ! otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, OTP, and new password'
      });
    }

    // Verify OTP
    const verification = await verifyOTP(email, otp, 'password_reset');

    if (!verification.success) {
      return res.status(400).json({
        success: false,
        message: verification.message
      });
    }

    // Find user and update password
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.password = newPassword;
    await user.save();

    console.log('✅ Password reset successfully for:', email);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now login with your new password.'
    });

  } catch (error) {
    console.error('❌ Reset password error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error. errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0]
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    let user;
    
    if (req.user.role === 'restaurant') {
      user = await Restaurant.findById(req.user.id);
    } else if (req. user.role === 'ngo') {
      user = await NGO.findById(req.user.id);
    } else if (req.user.role === 'admin') {
      user = await Admin.findById(req.user.id);
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};