const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env. JWT_SECRET, {
    expiresIn: process.env. JWT_EXPIRE || '7d'
  });
};

// Send token in response
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  
  const options = {
    expires: new Date(
      Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };
  
  res.status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user. email,
        role: user. role,
        organizationName: user.organizationName || user.fullName,
        isVerified: user. isVerified
      }
    });
};

module.exports = { generateToken, sendTokenResponse };