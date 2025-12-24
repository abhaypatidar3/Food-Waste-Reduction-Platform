import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Leaf, AlertCircle, CheckCircle, Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail, resendOTP } = useAuth();
  const email = location.state?. email;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef([]);

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && ! otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/. test(pastedData)) return;

    const newOtp = pastedData.split('');
    while (newOtp.length < 6) newOtp.push('');
    
    setOtp(newOtp);
    inputRefs.current[Math. min(pastedData.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const otpString = otp. join('');
    
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use AuthContext verifyEmail function
      const result = await verifyEmail(email, otpString);

      if (result.success) {
        setSuccess('Email verified successfully! Redirecting.. .');
        // AuthContext will handle the redirect automatically
      } else {
        setError(result.message || 'Verification failed');
        setLoading(false);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('Invalid or expired OTP.  Please try again.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setResendLoading(true);
    setError('');
    setSuccess('');

    try {
      // Use AuthContext resendOTP function
      const result = await resendOTP(email, 'email_verification');
      
      if (result.success) {
        setSuccess(result.message || 'OTP sent successfully! Please check your email.');
        setResendCooldown(60); // 60 seconds cooldown
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?. focus();
      } else {
        setError(result.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  if (! email) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center p-4">
      {/* Back Button */}
      <button
        onClick={() => navigate('/signup')}
        className="absolute top-6 left-6 flex items-center gap-2 text-white hover:text-emerald-100 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back to Sign Up</span>
      </button>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Leaf className="text-emerald-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-800">FoodShare</h1>
          </div>
          <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="text-emerald-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h2>
          <p className="text-gray-600 text-sm">
            We've sent a 6-digit OTP to
          </p>
          <p className="text-emerald-600 font-semibold mt-1">{email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded-lg flex items-start gap-2 animate-fade-in">
              <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg flex items-start gap-2 animate-shake">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* OTP Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              Enter OTP
            </label>
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  disabled={loading || success}
                  className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:ring-2 focus: ring-emerald-500 focus:border-transparent outline-none transition-all ${
                    error ?  'border-red-500' : 'border-gray-300'
                  } ${(loading || success) ? 'bg-gray-50 cursor-not-allowed' :  ''}`}
                />
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Verifying...
              </>
            ) : success ? (
              <>
                <CheckCircle size={20} />
                Verified! 
              </>
            ) : (
              'Verify Email'
            )}
          </button>

          {/* Resend OTP */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Didn't receive the code? </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading || resendCooldown > 0 || success}
              className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {resendLoading ?  (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                  Sending...
                </span>
              ) : resendCooldown > 0 ? (
                `Resend in ${resendCooldown}s`
              ) : (
                'Resend OTP'
              )}
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-center text-blue-800">
              💡 <strong>Tip:</strong> The OTP is valid for 10 minutes. Check your spam folder if you don't see the email.
            </p>
          </div>
        </div>

        {/* Support Link */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Having trouble? {' '}
            <a href="mailto:support@foodshare. com" className="text-emerald-600 hover:text-emerald-700 font-semibold">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;