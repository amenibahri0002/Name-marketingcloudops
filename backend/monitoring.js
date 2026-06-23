// backend/monitoring.js
const client = require('prom-client');
const axios = require('axios');

// Configuration Grafana Cloud
const GRAFANA_URL = 'https://prometheus-prod-58-prod-eu-central-0.grafana.net';
const USERNAME = 'amenibahri0002';
const API_KEY = '3c0d102d-1e98-4150-86e7-34dd21d8187e'; // ← Remplacez par votre token copié

// Créer un registre
const register = new client.Registry();

// Métriques par défaut (CPU, mémoire, etc.)
client.collectDefaultMetrics({ register });

// Métriques personnalisées DigiPip
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register]
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route'],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register]
});

const activeUsers = new client.Gauge({
  name: 'active_users',
  help: 'Number of active users',
  registers: [register]
});

const dbQueryDuration = new client.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries',
  labelNames: ['query'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1],
  registers: [register]
});

// Fonction pour envoyer les métriques vers Grafana Cloud
async function pushMetrics() {
  try {
    const metrics = await register.metrics();
    
    await axios.post(`${GRAFANA_URL}/api/v1/write`, metrics, {
      headers: {
        'Content-Type': 'text/plain',
      },
      auth: {
        username: USERNAME,
        password: API_KEY
      }
    });
    
    console.log('✅ Métriques envoyées à Grafana Cloud');
  } catch (err) {
    console.error('❌ Erreur envoi métriques:', err.message);
  }
}

// Envoyer toutes les 15 secondes
setInterval(pushMetrics, 15000);

// Exporter pour utilisation dans le serveur
module.exports = {
  register,
  httpRequestsTotal,
  httpRequestDuration,
  activeUsers,
  dbQueryDuration,
  pushMetrics
};