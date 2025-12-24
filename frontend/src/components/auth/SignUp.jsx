import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, Phone, MapPin, Leaf, Upload, ChefHat, Heart, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { validateEmail, validatePassword, validatePhone, validateOrganizationName } from '../../utils/validation';

const Signup = () => {
  const { register } = useAuth();
  const [userType, setUserType] = useState('restaurant');
  const [formData, setFormData] = useState({
    organizationName: '',
    email:  '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    certificate: null,
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          setErrors(prev => ({ ...prev, certificate: 'File size must be less than 5MB' }));
          return;
        }
        const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!validTypes.includes(file.type)) {
          setErrors(prev => ({ ...prev, certificate: 'Only PDF, JPG, or PNG files allowed' }));
          return;
        }
        setFormData(prev => ({ ...prev, certificate: file }));
        setFileName(file.name);
        setErrors(prev => ({ ...prev, certificate: '' }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked :  value
      }));
      
      if (errors[name] || errors. submit) {
        setErrors(prev => {
          const newErrors = { ... prev };
          delete newErrors[name];
          delete newErrors.submit;
          return newErrors;
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    const orgValidation = validateOrganizationName(formData.organizationName);
    if (! orgValidation.isValid) {
      newErrors.organizationName = orgValidation.error;
    }
    
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation. isValid) {
      newErrors.email = emailValidation.error;
    }
    
    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.isValid) {
      newErrors.phone = phoneValidation.error;
    }
    
    if (! formData.address. trim()) {
      newErrors.address = 'Address is required';
    }
    
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.error;
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
const navigate = useNavigate();
const handleSubmit = async (e) => {
  e.preventDefault();
  
  setErrors({});
  
  if (!validateForm()) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  
  setLoading(true);

  try {
    const registrationData = {
      email:  formData.email. trim(),
      password: formData.password,
      role: userType,
      organizationName: formData.organizationName.trim(),
      phone: formData.phone.replace(/\D/g, ''),
      address: formData.address.trim(),
      certificateUrl: null
    };

    // Call API directly (don't use AuthContext register)
    const response = await authAPI.register(registrationData);

    if (response.success) {
      // Redirect to verification page
      navigate('/verify-email', { state: { email: formData.email. trim() } });
    } else {
      setErrors({ submit: response.message || 'Registration failed.  Please try again.' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  } catch (error) {
    console.error('Signup error:', error);
    setErrors({ submit: error.response?. data?.message || 'Unable to connect to server. Please try again.' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } finally {
    setLoading(false);
  }
  if (response.requiresVerification) {
  navigate('/verify-email', { state: { email:  formData.email } });
  return;
}

};
 

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center p-4 py-12">
      <Link 
        to="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-white hover:text-emerald-100 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back to Home</span>
      </Link>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Leaf className="text-emerald-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-800">FoodShare</h1>
          </div>
          <p className="text-gray-600">Create your account and start making an impact</p>
        </div>

        <div className="mb-8">
          <p className="text-sm font-medium text-gray-700 mb-3">I am a... </p>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setUserType('restaurant')}
              className={`p-6 border-2 rounded-xl transition-all ${
                userType === 'restaurant'
                  ? 'border-emerald-600 bg-emerald-50'
                  : 'border-gray-300 hover:border-emerald-300'
              }`}
            >
              <ChefHat 
                className={`mx-auto mb-3 ${
                  userType === 'restaurant' ?  'text-emerald-600' : 'text-gray-400'
                }`} 
                size={40} 
              />
              <h3 className="font-semibold text-gray-800 mb-1">Restaurant / Donor</h3>
              <p className="text-sm text-gray-600">I want to donate surplus food</p>
            </button>

            <button
              type="button"
              onClick={() => setUserType('ngo')}
              className={`p-6 border-2 rounded-xl transition-all ${
                userType === 'ngo'
                  ?  'border-emerald-600 bg-emerald-50'
                  : 'border-gray-300 hover:border-emerald-300'
              }`}
            >
              <Heart 
                className={`mx-auto mb-3 ${
                  userType === 'ngo' ? 'text-emerald-600' : 'text-gray-400'
                }`} 
                size={40} 
              />
              <h3 className="font-semibold text-gray-800 mb-1">NGO / Shelter</h3>
              <p className="text-sm text-gray-600">I want to receive food donations</p>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {errors.submit && (
            <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg flex items-start gap-2">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Registration Failed</p>
                <p className="text-sm">{errors. submit}</p>
              </div>
            </div>
          )}

          {/* Organization Name */}
          <div>
            <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-2">
              Organization Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                id="organizationName"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                placeholder="e.g., Hope Foundation"
                className={`w-full pl-11 pr-4 py-3 border ${
                  errors.organizationName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus: ring-emerald-500'
                } rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all`}
              />
            </div>
            {errors. organizationName && (
              <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors. organizationName}
              </p>
            )}
          </div>

          {/* Email & Phone Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  autoComplete="email"
                  className={`w-full pl-11 pr-4 py-3 border ${
                    errors. email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500'
                  } rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="1234567890"
                  autoComplete="tel"
                  className={`w-full pl-11 pr-4 py-3 border ${
                    errors. phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500'
                  } rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all`}
                />
              </div>
              {errors.phone && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.phone}
                </p>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Full address with city"
                autoComplete="street-address"
                className={`w-full pl-11 pr-4 py-3 border ${
                  errors.address ?  'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500'
                } rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all`}
              />
            </div>
            {errors. address && (
              <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors. address}
              </p>
            )}
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min.  6 characters"
                  autoComplete="new-password"
                  className={`w-full pl-11 pr-4 py-3 border ${
                    errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500'
                  } rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all`}
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.password}
                </p>
              )}
              {/* Password Requirements Hint */}
              {! errors.password && (
                <p className="mt-1.5 text-xs text-gray-500">
                  Must include uppercase, lowercase, and special character
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  className={`w-full pl-11 pr-4 py-3 border ${
                    errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus: ring-emerald-500'
                  } rounded-lg focus: ring-2 focus:border-transparent outline-none transition-all`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Registration Certificate <span className="text-gray-500">(Optional)</span>
            </label>
            <div className={`border-2 border-dashed ${
              errors.certificate ? 'border-red-500' : 'border-gray-300'
            } rounded-lg p-8 text-center hover:border-emerald-500 transition-colors cursor-pointer`}>
              <input
                type="file"
                id="certificate"
                name="certificate"
                onChange={handleChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
              />
              <label htmlFor="certificate" className="cursor-pointer">
                <Upload className="mx-auto text-gray-400 mb-3" size={40} />
                {fileName ?  (
                  <p className="text-sm text-emerald-600 font-medium">{fileName}</p>
                ) : (
                  <>
                    <p className="text-gray-700 mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">PDF, JPG or PNG (max.  5MB)</p>
                  </>
                )}
              </label>
            </div>
            {errors. certificate && (
              <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors. certificate}
              </p>
            )}
          </div>

          {/* Terms Agreement */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className={`mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded focus: ring-emerald-500 ${
                  errors.agreeToTerms ? 'border-red-500' : ''
                }`}
              />
              <span className="text-sm text-gray-700 leading-relaxed">
                I agree to the{' '}
                <Link to="/terms" className="text-emerald-600 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-emerald-600 hover:underline">
                  Privacy Policy
                </Link>
                .  I understand that this platform is for reducing food waste and not for collecting sensitive personal information.
              </span>
            </label>
            {errors.agreeToTerms && (
              <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.agreeToTerms}
              </p>
            )}
          </div>

          {/* Create Account Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;