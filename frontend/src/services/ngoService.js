import axios from 'axios';
import { ngoAPI } from './api';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get analytics
export const getNGOAnalytics = () => ngoAPI.getAnalytics();