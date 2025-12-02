// utils/api.js
import axios from 'axios';

export const baseAPI = "https://ramstoresbackend.onrender.com";

const API = axios.create({
  baseURL: 'https://ramstoresbackend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to get token from both storage types
export const getToken = () => {
  // Check sessionStorage first (our new approach)
  let token = sessionStorage.getItem('token');
  
  // Fallback to localStorage for backward compatibility
  if (!token) {
    token = localStorage.getItem('token') || localStorage.getItem('userToken');
  }
  
  return token;
};

// Request interceptor to add auth token
API.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage and redirect to login
      sessionStorage.clear();
      localStorage.removeItem('token');
      localStorage.removeItem('userToken');
      localStorage.removeItem('user');
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;