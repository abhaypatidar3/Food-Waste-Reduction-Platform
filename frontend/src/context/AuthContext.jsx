import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  } 
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser && token !== 'none') {
        try {
          // Verify token is still valid
          const response = await authAPI. getMe();
          setUser(response.user);
          setIsAuthenticated(true);
        } catch (error) {
          // Token invalid or expired, clear storage
          console.error('Token validation failed:', error);
          localStorage.removeItem('token');
          localStorage. removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
          
          // Redirect to login if on protected route
          if (! location.pathname.startsWith('/login') && 
              !location.pathname.startsWith('/signup') &&
              !location.pathname.startsWith('/verify-email') &&
              !location.pathname. startsWith('/forgot-password')) {
            navigate('/login', { replace: true });
          }
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []); // Remove dependencies to avoid infinite loops

  // Register function
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      if (response.success) {
        // If registration requires verification, don't set auth state yet
        if (response.requiresVerification) {
          return { 
            success: true, 
            requiresVerification: true,
            email: userData.email,
            message: response.message 
          };
        }

        // If no verification needed, login user
        localStorage.setItem('token', response. token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        setUser(response.user);
        setIsAuthenticated(true);

        redirectToDashboard(response.user.role);

        return { success: true };
      } else {
        return { success:  false, message: response.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Register error:', error);
      const message = error.response?.data?.message || 'Registration failed.  Please try again.';
      return { success: false, message };
    }
  };

  // Verify Email function
  const verifyEmail = async (email, otp) => {
    try {
      const response = await authAPI.verifyEmail(email, otp);
      
      if (response.success) {
        // After verification, login user
        localStorage. setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response. user));
        
        setUser(response.user);
        setIsAuthenticated(true);

        redirectToDashboard(response. user.role);

        return { success: true };
      } else {
        return { success: false, message: response.message || 'Verification failed' };
      }
    } catch (error) {
      console.error('Verify email error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Verification failed. Please try again.' 
      };
    }
  };

  // Resend OTP function
  const resendOTP = async (email, type = 'email_verification') => {
    try {
      const response = await authAPI. resendOTP(email, type);
      
      if (response.success) {
        return { success: true, message: response.message || 'OTP sent successfully' };
      } else {
        return { success: false, message: response.message || 'Failed to send OTP' };
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to send OTP.  Please try again.' 
      };
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      
      if (response.success) {
        localStorage.setItem('token', response. token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        setUser(response.user);
        setIsAuthenticated(true);

        redirectToDashboard(response.user.role);

        return { success: true };
      } else {
        return { 
          success: false, 
          message: response.message || 'Login failed',
          requiresVerification: response.requiresVerification || false,
          email: response.email || null
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Invalid email or password',
        requiresVerification: error.response?.data?.requiresVerification || false,
        email: error.response?. data?.email || null
      };
    }
  };

  // Forgot Password function
  const forgotPassword = async (email) => {
    try {
      const response = await authAPI.forgotPassword(email);
      
      if (response.success) {
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message || 'Failed to send reset email' };
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      return { 
        success: false, 
        message: error.response?. data?.message || 'Failed to send reset email' 
      };
    }
  };

  // Reset Password function
  const resetPassword = async (email, otp, newPassword) => {
    try {
      const response = await authAPI.resetPassword(email, otp, newPassword);
      
      if (response.success) {
        return { success: true, message: response.message || 'Password reset successfully' };
      } else {
        return { success: false, message: response.message || 'Password reset failed' };
      }
    } catch (error) {
      console.error('Reset password error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Password reset failed' 
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear storage and state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      
      // Navigate to login and prevent going back
      navigate('/login', { replace: true });
      
      // Prevent back button navigation
      window.history.pushState(null, '', '/login');
      
      window.addEventListener('popstate', preventBack);
    }
  };

  // Prevent back navigation after logout
  const preventBack = () => {
    window.history. pushState(null, '', '/login');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener('popstate', preventBack);
    };
  }, []);

  // Redirect to appropriate dashboard
  const redirectToDashboard = (role) => {
    switch (role) {
      case 'restaurant':
        navigate('/restaurant/dashboard', { replace: true });
        break;
      case 'ngo': 
        navigate('/ngo/dashboard', { replace: true });
        break;
      case 'admin': 
        navigate('/admin/dashboard', { replace: true });
        break;
      default: 
        navigate('/', { replace:  true });
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    register,
    verifyEmail,
    resendOTP,
    login,
    forgotPassword,
    resetPassword,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};