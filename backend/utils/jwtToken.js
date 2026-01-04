const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, 
    {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    }
  );
};

// Send token in response
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id, user.role);
  
  const options = {
    expires: new Date(
      Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',                                     
    path: '/'
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
        isVerified: user. isVerified,
        isActive: user.isActive,
        phone: user.phone,
        address: user.address
      }
    });
};

module.exports = { generateToken, sendTokenResponse };