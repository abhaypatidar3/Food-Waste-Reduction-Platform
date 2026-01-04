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
    // Only add token if it exists and is not 'none'
    if (token && token !== 'none' && token. length > 10) {
      config.headers. Authorization = `Bearer ${token}`;
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
    
    // Handle 401 Unauthorized errors (except for auth endpoints)
    if (error.response?.status === 401 && !isAuthEndpoint) {
      console.warn('Unauthorized access - clearing session');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if not already on login page
      if (! window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Handle 403 Forbidden errors
    if (error.response?.status === 403) {
      console.warn('Access forbidden');
    }
    
    return Promise. reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
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

  verifyEmail: async (email, otp) => {
    try {
      const response = await api. post('/auth/verify-email', { email, otp });
      return response.data;
    } catch (error) {
      throw {
        response: {
          data: {
            success: false,
            message: error.response?.data?.message || 'Verification failed'
          }
        }
      };
    }
  },

  resendOTP: async (email, type) => {
    try {
      const response = await api.post('/auth/resend-otp', { email, type });
      return response.data;
    } catch (error) {
      throw {
        response: {
          data: {
            success: false,
            message: error.response?. data?.message || 'Failed to resend OTP'
          }
        }
      };
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw {
        response: {
          data: {
            success: false,
            message: error.response?. data?.message || 'Login failed',
            requiresVerification: error.response?.data?.requiresVerification || false,
            email: error.response?.data?.email || null
          }
        }
      };
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response. data;
    } catch (error) {
      console.error('Logout error:', error);
      return { success: true };
    }
  },

  getMe: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      throw error;
    }
  },

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

  resetPassword: async (email, otp, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { email, otp, newPassword });
      return response.data;
    } catch (error) {
      throw {
        response: {
          data:  {
            success: false,
            message: error.response?.data?.message || 'Password reset failed'
          }
        }
      };
    }
  }
};

// Donation API endpoints
export const donationAPI = {
  // Get all donations
  getAll:  async (params = {}) => {
    const response = await api.get('/donations', { params });
    return response.data;
  },

  // Get single donation
  getById: async (id) => {
    const response = await api.get(`/donations/${id}`);
    return response.data;
  },

  // Create donation (Restaurant)
  create: async (donationData) => {
    const response = await api.post('/donations', donationData);
    return response.data;
  },

  // Update donation (Restaurant)
  update: async (id, donationData) => {
    const response = await api. patch(`/donations/${id}`, donationData);
    return response. data;
  },

  // Delete donation (Restaurant)
  delete: async (id) => {
    const response = await api.delete(`/donations/${id}`);
    return response.data;
  },

  // Accept donation (NGO)
  accept: async (id) => {
    const response = await api.patch(`/donations/${id}/accept`);
    return response.data;
  },

  // Mark as picked up (NGO)
  markAsPickedUp: async (id) => {
    const response = await api.patch(`/donations/${id}/picked-up`);
    return response.data;
  },

  // Get nearby donations (NGO)
  getNearby: async (params = {}) => {
    const response = await api.get('/donations/nearby', { params });
    return response.data;
  },

  // Get my donations (Restaurant)
  getMyDonations: async () => {
    const response = await api.get('/donations/my-donations');
    return response.data;
  },

  // Get donation stats (Restaurant)
  getStats: async () => {
    const response = await api.get('/donations/stats');
    return response.data;
  }
};

// NGO API endpoints
export const ngoAPI = {
  // Get NGO analytics
  getAnalytics: async () => {
    const response = await api.get('/ngo/analytics');
    return response.data;
  }
};

// Notification API endpoints
export const notificationAPI = {
  // Get all notifications
  getAll: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  // Mark notification as read
  markAsRead:  async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  }
};

// landingpage API endpoints
export const landingPageAPI = {
  getAnalytics: async ()=>{
    const response = await api.get('/landing-page/analytics');
    return response.data;
  }
};

export default api;