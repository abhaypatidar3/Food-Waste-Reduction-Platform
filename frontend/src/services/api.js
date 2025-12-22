import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Request interceptor - Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.includes('/auth/');
    
    if(error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw {
        response: {
          data: {
            success: false,
            message: error.response?.data?.message || 'Registration failed'
          }
        }
      };
    }
  },

  // Verify email with OTP
  verifyEmail:  async (email, otp) => {
    try {
      const response = await api.post('/auth/verify-email', { email, otp });
      return response. data;
    } catch (error) {
      throw {
        response: {
          data: {
            success: false,
            message: error.response?.data?. message || 'Verification failed'
          }
        }
      };
    }
  },

  // Resend OTP
  resendOTP: async (email, type) => {
    try {
      const response = await api.post('/auth/resend-otp', { email, type });
      return response.data;
    } catch (error) {
      throw {
        response:  {
          data: {
            success: false,
            message:  error.response?.data?.message || 'Failed to resend OTP'
          }
        }
      };
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw {
        response: {
          data: {
            success: false,
            message: error.response?.data?.message || 'Login failed',
            requiresVerification: error.response?. data?.requiresVerification || false,
            email: error.response?. data?.email || null
          }
        }
      };
    }
  },

  // Logout user
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response. data;
  },

  // Get current user
  getMe:  async () => {
    const response = await api.get('/auth/me');
    return response. data;
  },

  // Forgot password - send OTP
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw {
        response: {
          data: {
            success: false,
            message: error.response?.data?.message || 'Failed to send reset email'
          }
        }
      };
    }
  },

  // Reset password with OTP
  resetPassword: async (email, otp, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { email, otp, newPassword });
      return response.data;
    } catch (error) {
      throw {
        response: {
          data: {
            success:  false,
            message: error. response?.data?.message || 'Password reset failed'
          }
        }
      };
    }
  }
};

export default api;