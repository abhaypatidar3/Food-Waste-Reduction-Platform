import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

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

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage. getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          // Verify token is still valid
          const response = await authAPI.getMe();
          setUser(response.user);
          setIsAuthenticated(true);
        } catch (error) {
          // Token invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Register function
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      // Check if response is successful
      if (response.success) {
        // Save token and user
        localStorage.setItem('token', response.token);
        localStorage. setItem('user', JSON.stringify(response.user));
        
        setUser(response.user);
        setIsAuthenticated(true);

        // Redirect based on role
        redirectToDashboard(response.user.role);

        return { success: true };
      } else {
        // Backend returned success:  false
        return { success: false, message: response.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Register error:', error);
      const message = error.response?.data?.message || 'Registration failed.  Please try again.';
      return { success: false, message };
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      
      // Check if response is successful
      if (response.success) {
        // Save token and user
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response. user));
        
        setUser(response.user);
        setIsAuthenticated(true);

        // Redirect based on role
        redirectToDashboard(response. user.role);

        return { success: true };
      } else {
        // Return error with requiresVerification flag
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
        success:  false, 
        message: error.response?.data?.message || 'Invalid email or password',
        requiresVerification: error.response?.data?.requiresVerification || false,
        email: error. response?. data?.email || null
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
      navigate('/login');
    }
  };

  // Redirect to appropriate dashboard
  const redirectToDashboard = (role) => {
    switch (role) {
      case 'restaurant':
        navigate('/restaurant/dashboard'); // ✅ Updated
        break;
      case 'ngo': 
        navigate('/ngo/dashboard'); // ✅ Updated
        break;
      case 'admin':
        navigate('/admin/dashboard'); // ✅ Updated
        break;
      default: 
        navigate('/');
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    register,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};