import api from './api';

export const adminAPI = {
  // Get admin stats
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Get all users
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  // Get all donations
  getDonations: async (params = {}) => {
    const response = await api.get('/admin/donations', { params });
    return response.data;
  },

  // Verify user
  verifyUser: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/verify`);
    return response.data;
  },

  // Toggle user status
  toggleUserStatus: async (userId) => {
    const response = await api. put(`/admin/users/${userId}/toggle-status`);
    return response.data;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await api. delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Delete donation
  deleteDonation: async (donationId) => {
    const response = await api.delete(`/admin/donations/${donationId}`);
    return response.data;
  }
};