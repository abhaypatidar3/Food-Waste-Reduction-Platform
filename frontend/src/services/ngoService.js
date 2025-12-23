import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get analytics
export const getNGOAnalytics = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/ngo/analytics`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};