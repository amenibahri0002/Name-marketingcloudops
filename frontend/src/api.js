import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' }
});
console.log('[API] baseURL:', api.defaults.baseURL); //

// Routes qui ne doivent JAMAIS rediriger vers login même en 401
const PUBLIC_ENDPOINTS = [
  '/api/campagnes/public',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/contact',
  '/api/health'
];

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  // N'envoyer le token que si ce n'est pas une route publique
  // (ou envoyer-le toujours, mais ne pas rediriger sur 401 pour les publiques)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  const tenant = localStorage.getItem('digipip_tenant');
  if (tenant) {
    try {
      const parsed = JSON.parse(tenant);
      config.headers['X-Tenant-ID'] = parsed.id;
    } catch (e) {
      config.headers['X-Tenant-ID'] = 'cmqlsn2yu0000ybn5t0unlx8u';
    }
  } else {
    config.headers['X-Tenant-ID'] = 'cmqlsn2yu0000ybn5t0unlx8u';
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config } = error;
    if (!config) return Promise.reject(error);
    
    console.error('API Error:', error.message, 'URL:', config.url);
    
    // Retry Network Error
    if (!config.retryCount) config.retryCount = 0;
    if (config.retryCount < 3 && error.message.includes('Network Error')) {
      config.retryCount += 1;
      await new Promise(r => setTimeout(r, 2000 * config.retryCount));
      return api(config);
    }
    
    // 401 → déconnexion SEULEMENT si ce n'est pas une route publique
    const isPublic = PUBLIC_ENDPOINTS.some(ep => config.url?.includes(ep));
    
    if (error.response?.status === 401 && !isPublic && !config._noRedirect) {
      console.log('[API] 401 sur route protégée, déconnexion...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;