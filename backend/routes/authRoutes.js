const express = require('express');
const {
  register,
  verifyEmail,
  resendOTP,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter, emailLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

// Public routes
router.post('/register', authLimiter, register);
router.post('/verify-email',emailLimiter, verifyEmail);
router.post('/resend-otp', emailLimiter, resendOTP);
router.post('/login', authLimiter, login);
router.post('/forgot-password',authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

// Protected routes
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;