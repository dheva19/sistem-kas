import axios from 'axios';

// Gunakan base URL relatif agar bekerja langsung baik di local proxy maupun saat di-deploy di Vercel
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menyematkan JWT Token otomatis
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('kas_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor untuk menangani expired session / 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('kas_token');
      localStorage.removeItem('kas_admin');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
