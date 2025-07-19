import axios from 'axios';
import BASE_URL from '../config';
// Create axios instance with custom config

const instance = axios.create({
  baseURL: BASE_URL, // Your backend server URL
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false // Disable sending cookies since we're using token-based auth
});

// Add a request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('Response error:', error);
    
    if (error.response?.status === 401) {
      // Handle unauthorized error (e.g., redirect to login)
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Network errors
    if (error.message === 'Network Error') {
      console.error('Network error - make sure the backend server is running');
    }
    
    return Promise.reject(error);
  }
);

export default instance; 