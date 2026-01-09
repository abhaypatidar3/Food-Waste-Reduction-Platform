const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20, // ek ip se 20 requests har 5 minute me
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests.  Please try again later.',
      retryAfter: Math.ceil(req.rateLimit. resetTime / 1000)
    });
  }
});


const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 5, // ek ip se sirf 5 login attempts har 5 minute me
  skipSuccessfulRequests: false,
  message: {
    success: false,
    message:  'Too many authentication attempts, please try again after 15 minutes'
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again after 15 minutes.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

const emailLimiter = rateLimit({
  windowMs:  60 * 60 * 1000, 
  max: 10, // ek phone se 10 email/OTP requests har ghante me
  message: {
    success: false,
    message: 'Too many email requests, please try again after an hour'
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many email/OTP requests. Please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});


const apiLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 30, 
  message: {
    success: false,
    message: 'Too many API requests, please slow down'
  }
});


const donationLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 5, // 1 min me maximum 5 donations create kar sakte hai
  message: {
    success: false,
    message: 'Please wait before creating another donation'
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'You are creating donations too quickly. Please wait a moment.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

const acceptDonationLimiter = rateLimit({
  windowMs:  60 * 1000, // 1 minute
  max: 5, // 1 minute me maximum 5 acceptances kar sakte hai
  message: {
    success: false,
    message: 'Please wait before accepting another donation'
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  emailLimiter,
  apiLimiter,
  donationLimiter,
  acceptDonationLimiter
};