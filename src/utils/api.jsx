// utils/api.js
import axios from 'axios';

export const baseAPI = "https://ramstoresbackend.onrender.com";

const API = axios.create({
  baseURL: 'https://ramstoresbackend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

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



// Helper function to get token
export const getToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('userToken');
};

export default API;