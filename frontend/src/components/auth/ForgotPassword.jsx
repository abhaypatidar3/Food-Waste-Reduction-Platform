import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Leaf, AlertCircle, CheckCircle } from 'lucide-react';
import { authAPI } from '../../services/api';
import { validateEmail, validatePassword } from '../../utils/validation';

const ForgotPassword = () => {
  const navigate = useNavigate();
  
  // Step 1: Email input
  const [step, setStep] = useState(1); // 1 = email, 2 = OTP + password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [success, setSuccess] = useState(false);

  const inputRefs = useRef([]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setErrors({});

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setErrors({ email: emailValidation.error });
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.forgotPassword(email);
      if (response.success) {
        setStep(2);
        setResendCooldown(60);
        setErrors({ success: 'OTP sent successfully!  Check your email.' });
      }
    } catch (error) {
      setErrors({ email: error.response?.data?.message || 'Failed to send OTP' });
    } finally {
      setLoading(false);
    }
  };

  // OTP Input Handlers
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setErrors(prev => ({ ...prev, otp: '' }));

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && ! otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('');
    while (newOtp.length < 6) newOtp.push('');
    setOtp(newOtp);
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      newErrors.otp = 'Please enter the complete 6-digit OTP';
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation. error;
    }

    if (! confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const otpString = otp.join('');
      const response = await authAPI. resetPassword(email, otpString, password);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Password reset failed' });
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setResendLoading(true);
    setErrors({});

    try {
      const response = await authAPI.resendOTP(email, 'password_reset');
      if (response. success) {
        setErrors({ success: 'New OTP sent successfully!' });
        setResendCooldown(60);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?. focus();
      }
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Failed to resend OTP' });
    } finally {
      setResendLoading(false);
    }
  };

  // Success Screen
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Password Reset Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your password has been reset successfully. You can now login with your new password.
            </p>
            <p className="text-sm text-gray-500">Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center p-4">
      <Link 
        to="/login" 
        className="absolute top-6 left-6 flex items-center gap-2 text-white hover:text-emerald-100 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back to Login</span>
      </Link>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Leaf className="text-emerald-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-800">FoodShare</h1>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {step === 1 ? 'Forgot Password?' : 'Reset Password'}
          </h2>
          <p className="text-gray-600 text-sm">
            {step === 1 
              ? 'Enter your email to receive a reset code'
              : `Enter the OTP sent to ${email}`
            }
          </p>
        </div>

        {/* Success/Error Messages */}
        {errors.success && (
          <div className="mb-5 bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded-lg flex items-start gap-2">
            <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
            <p className="text-sm">{errors.success}</p>
          </div>
        )}

        {errors.submit && (
          <div className="mb-5 bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg flex items-start gap-2">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <p className="text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Step 1: Email Input */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e. target.value);
                    setErrors(prev => ({ ...prev, email: '' }));
                  }}
                  placeholder="your@email. com"
                  autoComplete="email"
                  className={`w-full pl-11 pr-4 py-3 border ${
                    errors.email ?  'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500'
                  } rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all`}
                />
              </div>
              {errors. email && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.email}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                'Send Reset Code'
              )}
            </button>
          </form>
        )}

        {/* Step 2: OTP + Password Reset */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                Enter OTP
              </label>
              <div className="flex justify-center gap-2 mb-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className={`w-10 h-12 text-center text-xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all ${
                      errors.otp ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                ))}
              </div>
              {errors.otp && (
                <p className="text-sm text-red-600 flex items-center justify-center gap-1">
                  <AlertCircle size={14} />
                  {errors. otp}
                </p>
              )}
              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendLoading || resendCooldown > 0}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendLoading ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e. target.value);
                    setErrors(prev => ({ ...prev, password: '' }));
                  }}
                  placeholder="Enter new password"
                  className={`w-full pl-11 pr-4 py-3 border ${
                    errors. password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500'
                  } rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all`}
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.password}
                </p>
              )}
              {! errors.password && (
                <p className="mt-1.5 text-xs text-gray-500">
                  Must include uppercase, lowercase, and special character
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target. value);
                    setErrors(prev => ({ ...prev, confirmPassword: '' }));
                  }}
                  placeholder="Re-enter new password"
                  className={`w-full pl-11 pr-4 py-3 border ${
                    errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500'
                  } rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors. confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-6 text-center">
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="text-sm text-gray-600 hover:text-gray-800 mb-2 block w-full"
            >
              ← Use different email
            </button>
          )}
          <Link to="/login" className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;