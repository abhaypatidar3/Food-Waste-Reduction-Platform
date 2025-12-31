import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Leaf, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { validateEmail, validatePassword } from '../../utils/validation';
import * as Yup from 'yup';


const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email:  '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isFormReady, setIsFormReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFormReady(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear errors when user starts typing
    if (errors[name] || errors.submit) {
      setErrors({});
    }
  };


  const LoginSchema = Yup.object().shape({
    email: Yup.string().email('email is invalid').matches(/^[a-zA-Z][a-zA-Z0-9._-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,'Email must start with a letter').required('Email is required'),
    password: Yup.string().required('Password is required').min(6,'Password must be at least 6 characters')
  })

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isFormReady) return;

    setErrors({});
    setLoading(true);
    
    

    try {
      await LoginSchema.validate(formData, { abortEarly: false });
      const result = await login({email: formData.email.trim(), password: formData.password});

      if (result.success) {
        // ✅ Redirect based on user role
        setLoading(true);
        const user = result.user || JSON.parse(localStorage.getItem('user') || '{}');
        const role = user.role;

        if (role === 'ngo') {
          navigate('/ngo/dashboard');
        } else if (role === 'restaurant') {
          navigate('/restaurant/dashboard');
        } else if (role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        // Check if user needs verification
        if (result.requiresVerification && result.email) {
          navigate('/verify-email', { state: { email: result.email } });
        } else {
          setErrors({ submit: result.message || 'Invalid email or password' });
        }
        setLoading(false);
      }
    } catch (error) {
      if (error.inner) {
        const newErrors = {};
        error.inner.forEach((err) => {
          newErrors[err.path] = err. message;
        });
        setErrors(newErrors);
      } else {
        // Handle API/network errors
        console.error('Login error:', error);
        setErrors({ 
          submit: error.response?.data?.message || 'Unable to connect to server. Please try again.' 
        });
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center p-4">
      <Link 
        to="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-white hover:text-emerald-100 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back to Home</span>
      </Link>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Leaf className="text-emerald-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-800">FoodShare</h1>
          </div>
          <p className="text-gray-600">Welcome back! Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} autoComplete="on" noValidate>
          {errors. submit && (
            <div className="mb-5 bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg flex items-start gap-2 animate-shake">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Login Failed</p>
                <p className="text-sm">{errors.submit}</p>
              </div>
            </div>
          )}

          <div className="space-y-5">
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
                  value={formData. email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  autoComplete="username"
                  className={`w-full pl-11 pr-4 py-3 border ${
                    errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500'
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`w-full pl-11 pr-4 py-3 border ${
                    errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500'
                  } rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all`}
                />
                <button
                type="button"
                onClick={() => setShowPassword(! showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
              </div>
              {errors. password && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700">Remember me</span>
              </label>
              <Link 
                to="/forgot-password" 
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading || !isFormReady}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Signing in... 
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-emerald-600 hover:text-emerald-700 font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;