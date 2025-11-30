// utils/api.js
import axios from 'axios';

export const baseAPI = "http://localhost:5000";

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
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