import axios from 'axios';

const api = axios.create({
  baseURL: process.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global error handling — redirect to login on 401, but only for our own backend API
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't log out if the 401 comes from a third-party like Cloudinary
      const requestUrl = error.config?.url || '';
      if (!requestUrl.includes('cloudinary.com')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
