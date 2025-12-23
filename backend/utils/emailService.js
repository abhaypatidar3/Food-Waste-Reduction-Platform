const nodemailer = require('nodemailer');

// Create transporter with Port 465 SSL
const createTransporter = () => {
  return nodemailer. createTransport({
    host:  process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process. env.EMAIL_PORT) || 465,
    secure: true, 
    auth: {
      user: process.env. EMAIL_USER,
      pass:  process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized:  false
    },
    // Add timeout settings for better error handling
    connectionTimeout:  10000,  
    greetingTimeout: 10000,
    socketTimeout: 10000
  });
};

// Verify transporter on module load (optional but helpful)
const verifyConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ SMTP Server is ready to send emails');
    console.log(`   Host: ${process.env.EMAIL_HOST}`);
    console.log(`   Port: ${process.env.EMAIL_PORT}`);
    console.log(`   User: ${process.env.EMAIL_USER}`);
  } catch (error) {
    console.error('❌ SMTP Connection Failed:', error.message);
  }
};

// Call verification on startup
verifyConnection();

// Send OTP Email for Email Verification
const sendVerificationOTP = async (email, otp, organizationName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify Your Email - FoodShare',
      html:  `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height:  1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #059669; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #059669; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍃 FoodShare</h1>
              <p>Email Verification</p>
            </div>
            <div class="content">
              <h2>Hello ${organizationName},</h2>
              <p>Thank you for registering with FoodShare!  To complete your registration, please verify your email address using the OTP below: </p>
              
              <div class="otp-box">
                <p style="margin: 0; font-size: 14px; color: #666;">Your OTP Code</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Valid for ${process.env.OTP_EXPIRE_MINUTES || 10} minutes</p>
              </div>

              <p><strong>Important:</strong></p>
              <ul>
                <li>This OTP will expire in ${process.env.OTP_EXPIRE_MINUTES || 10} minutes</li>
                <li>Do not share this OTP with anyone</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>

              <p>Together, let's reduce food waste and feed those in need!  🌱</p>
              
              <div class="footer">
                <p>&copy; 2024 FoodShare.  All rights reserved.</p>
                <p>This is an automated email. Please do not reply.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter. sendMail(mailOptions);
    console.log('✅ Verification email sent:', info.messageId);
    console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    return { success: true };
  } catch (error) {
    console.error('❌ Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Send OTP Email for Password Reset
const sendPasswordResetOTP = async (email, otp, organizationName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Reset Your Password - FoodShare',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding:  30px; border-radius:  0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #dc2626; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #dc2626; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset</h1>
              <p>FoodShare</p>
            </div>
            <div class="content">
              <h2>Hello ${organizationName},</h2>
              <p>We received a request to reset your password.  Use the OTP below to proceed: </p>
              
              <div class="otp-box">
                <p style="margin: 0; font-size: 14px; color: #666;">Your Reset OTP</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Valid for ${process.env.OTP_EXPIRE_MINUTES || 10} minutes</p>
              </div>

              <div class="warning">
                <strong>⚠️ Security Alert:</strong>
                <ul style="margin: 10px 0 0 0;">
                  <li>Do not share this OTP with anyone</li>
                  <li>FoodShare staff will never ask for your OTP</li>
                  <li>If you didn't request this, please secure your account immediately</li>
                </ul>
              </div>

              <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
              
              <div class="footer">
                <p>&copy; 2024 FoodShare. All rights reserved. </p>
                <p>This is an automated email. Please do not reply.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    return { success: true };
  } catch (error) {
    console.error('❌ Email sending error:', error);
    return { success: false, error: error. message };
  }
};

module.exports = {
  sendVerificationOTP,
  sendPasswordResetOTP
};