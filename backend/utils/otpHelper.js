const crypto = require('crypto');
const OTP = require('../models/otp');

// Generate 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Save OTP to database
const saveOTP = async (email, type) => {
  try {
    // Delete any existing OTPs for this email and type
    await OTP.deleteMany({ email, type });

    // Generate new OTP
    const otp = generateOTP();

    // Calculate expiry time (10 minutes from now)
    const expiryMinutes = parseInt(process.env.OTP_EXPIRE_MINUTES) || 10;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Save to database
    await OTP.create({
      email,
      otp,
      type,
      expiresAt
    });

    console.log(`✅ OTP saved for ${email}:  ${otp} (expires in ${expiryMinutes} min)`);
    return otp;

  } catch (error) {
    console.error('❌ Error saving OTP:', error);
    throw error;
  }
};

// Verify OTP
const verifyOTP = async (email, otp, type) => {
  try {
    // Find OTP
    const otpRecord = await OTP.findOne({
      email,
      otp,
      type,
      expiresAt: { $gt: new Date() } // Not expired
    });

    if (!otpRecord) {
      return { success: false, message: 'Invalid or expired OTP' };
    }

    // Delete OTP after verification (one-time use)
    await OTP.deleteOne({ _id: otpRecord._id });

    console.log(`✅ OTP verified successfully for ${email}`);
    return { success: true };

  } catch (error) {
    console.error('❌ Error verifying OTP:', error);
    return { success:  false, message: 'Error verifying OTP' };
  }
};

// Resend OTP (with rate limiting)
const canResendOTP = async (email, type) => {
  // Check if OTP was created less than 1 minute ago
  const recentOTP = await OTP. findOne({
    email,
    type,
    createdAt: { $gt: new Date(Date.now() - 60 * 1000) } // Within last 1 minute
  });

  if (recentOTP) {
    const waitTime = 60 - Math.floor((Date.now() - recentOTP.createdAt) / 1000);
    return { 
      canResend: false, 
      message: `Please wait ${waitTime} seconds before requesting a new OTP` 
    };
  }

  return { canResend: true };
};

module.exports = {
  generateOTP,
  saveOTP,
  verifyOTP,
  canResendOTP
};