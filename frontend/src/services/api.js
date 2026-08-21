import axios from 'axios';

// Létrehozunk egy Axios példányt az alap URL-lel
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

// Request Interceptor: Token csatolása
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: 401 kezelése (lejárt vagy érvénytelen token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Csak akkor töröljük és irányítunk át, ha nem a bejelentkezési végpont dobott 401-et
      const isAuthLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isAuthLoginRequest) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        const loginPath = import.meta.env.BASE_URL ? `${import.meta.env.BASE_URL}login`.replace(/\/+/g, '/') : '/trapp/login';
        if (!window.location.pathname.includes('/login')) {
          window.location.href = loginPath;
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;