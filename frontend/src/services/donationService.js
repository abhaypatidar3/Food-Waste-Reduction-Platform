import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// const API_URL = 'http://localhost:5000/api';/

// Create axios instance with credentials
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add token to requests
api.interceptors. request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Restaurant APIs
export const createDonation = async (donationData) => {
  const response = await api.post('/donations', donationData);
  return response.data;
};

export const getMyDonations = async () => {
  const response = await api.get('/donations/my-donations');
  return response.data;
};

export const updateDonation = async (id, donationData) => {
  const response = await api.patch(`/donations/${id}`, donationData);
  return response.data;
};

export const deleteDonation = async (id) => {
  const response = await api.delete(`/donations/${id}`);
  return response.data;
};

export const getDonationStats = async () => {
  const response = await api.get('/donations/stats');
  return response.data;
};

// NGO APIs
export const getNearbyDonations = async (params) => {
  const response = await api.get('/donations/nearby', { params });
  return response.data;
};

export const acceptDonation = async (id) => {
  const response = await api.patch(`/donations/${id}/accept`);
  return response.data;
};

export const markAsPickedUp = async (id) => {
  const response = await api.patch(`/donations/${id}/picked-up`);
  return response.data;
};

// Common APIs
export const getDonation = async (id) => {
  const response = await api.get(`/donations/${id}`);
  return response.data;
};

export const getAllDonations = async (params) => {
  const response = await api.get('/donations', { params });
  return response. data;
};