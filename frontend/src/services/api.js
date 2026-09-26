import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Attach JWT token to outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('stocksense_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Format API error responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if invalid or expired
      if (localStorage.getItem('stocksense_token')) {
        localStorage.removeItem('stocksense_token');
        localStorage.removeItem('stocksense_user');
        window.dispatchEvent(new Event('auth-logout'));
      }
    }
    const message =
      error.response?.data?.message || error.message || 'An unexpected error occurred. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default api;
