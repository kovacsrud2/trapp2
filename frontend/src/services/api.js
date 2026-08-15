import axios from 'axios';

// Létrehozunk egy Axios példányt az alap URL-lel
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

// Interceptor: Minden kiküldött kérés előtt lefut
api.interceptors.request.use(
  (config) => {
    // Megnézzük, van-e elmentett tokenünk
    const token = localStorage.getItem('token');
    
    // Ha van, hozzáfűzzük az Authorization fejlécet
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Később ide jöhet egy response interceptor is, ami pl. kijelentkeztet, ha lejárt a token (401-es hiba)

export default api;