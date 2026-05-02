import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  console.warn('NEXT_PUBLIC_API_URL is missing, falling back to 127.0.0.1 for development.');
}

// Use 127.0.0.1 instead of localhost for Windows stability
let finalApiUrl = API_URL || 'http://127.0.0.1:5000/api';

if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && finalApiUrl.includes('127.0.0.1')) {
  console.error('CRITICAL: API is pointing to 127.0.0.1 but app is running in production. Please set NEXT_PUBLIC_API_URL.');
}

export const getServerUrl = () => {
  return finalApiUrl.replace('/api', '');
};

const api = axios.create({
  baseURL: finalApiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10s timeout
});

// Request deduplication map
const pendingRequests = new Map();

// Request interceptor to add the token and handle deduplication
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Deduplication logic: cancel duplicate pending requests
    const requestKey = `${config.method}:${config.url}:${JSON.stringify(config.params || {})}:${JSON.stringify(config.data || {})}`;
    
    if (pendingRequests.has(requestKey)) {
      const controller = pendingRequests.get(requestKey);
      controller.abort();
    }

    const controller = new AbortController();
    config.signal = controller.signal;
    pendingRequests.set(requestKey, controller);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and cleanup deduplication
api.interceptors.response.use(
  (response) => {
    const requestKey = `${response.config.method}:${response.config.url}:${JSON.stringify(response.config.params || {})}:${JSON.stringify(response.config.data || {})}`;
    pendingRequests.delete(requestKey);
    return response.data;
  },
  (error) => {
    if (error.config) {
      const requestKey = `${error.config.method}:${error.config.url}:${JSON.stringify(error.config.params || {})}:${JSON.stringify(error.config.data || {})}`;
      pendingRequests.delete(requestKey);
    }

    if (axios.isCancel(error)) {
      // Return a special object that indicates cancellation so UI doesn't show error
      return Promise.reject({ _isCancelled: true, message: 'Request cancelled' });
    }
    
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Error]', {
        url: error.config?.url,
        status: error.response?.status,
        message: message
      });
    }

    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const isAuthPage = ['/login', '/register'].some(path => window.location.pathname.startsWith(path));
        if (!isAuthPage) {
          localStorage.removeItem('token');
          setTimeout(() => {
            if (window.location.pathname !== '/login') {
              window.location.href = '/login?error=session_expired';
            }
          }, 100);
        }
      }
    }
    
    return Promise.reject(new Error(message));
  }
);

export default api;
