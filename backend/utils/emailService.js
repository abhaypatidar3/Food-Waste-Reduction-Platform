const nodemailer = require('nodemailer');

// Create transporter with Gmail service shorthand
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail', // ✅ Use this instead of host/port
    auth: {
      user: process.env.EMAIL_USER,
      pass: process. env.EMAIL_PASS // Must be App Password
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Verify connection
const verifyConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ SMTP Server is ready to send emails');
    console.log(`   User: ${process.env.EMAIL_USER}`);
  } catch (error) {
    console.error('❌ SMTP Connection Failed:', error. message);
    console.error('   Make sure you are using Gmail App Password! ');
  }
};

verifyConnection();

// ...  rest of your code (sendVerificationOTP, sendPasswordResetOTP) stays the same