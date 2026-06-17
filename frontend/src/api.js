// api.js avec retry
import axios from 'axios';


const isDocker = window.location.hostname === 'localhost' && window.location.port === '8080';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 30000, // 30 secondes
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur response avec retry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config } = error;
    
    // Si pas de config, rejeter
    if (!config) return Promise.reject(error);
    
    // Log l'erreur
    console.error('API Error:', error.message);
    
    // Retry sur erreur réseau (max 3 fois)
    if (!config.retryCount && error.message.includes('Network Error')) {
      config.retryCount = 0;
    }
    
    if (config.retryCount < 3 && error.message.includes('Network Error')) {
      config.retryCount += 1;
      console.log(`Retry ${config.retryCount}/3...`);
      
      // Attendre 2 secondes avant retry
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return api(config);
    }
    
    // 401 → déconnexion
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
