import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  console.warn('NEXT_PUBLIC_API_URL is missing, falling back to localhost for development.');
}

const finalApiUrl = API_URL || 'http://localhost:5000/api';

export const getServerUrl = () => {
  return finalApiUrl.replace('/api', '');
};

const api = axios.create({
  baseURL: finalApiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    
    if (error.response?.status === 401) {
      // Handle unauthorized (e.g., redirect to login)
      localStorage.removeItem('token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(new Error(message));
  }
);

export default api;
