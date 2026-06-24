// backend/monitoring.js — VERSION SIMPLIFIÉE ET FONCTIONNELLE
const client = require('prom-client');

// Configuration Grafana Cloud
const GRAFANA_URL = 'https://prometheus-prod-58-prod-eu-central-0.grafana.net';
const USERNAME = 'amenibahri0002';

// ⚠️ CLÉ API EN VARIABLE D'ENVIRONNEMENT (jamais dans le code)
const API_KEY = process.env.GRAFANA_API_KEY;

if (!API_KEY) {
  console.warn('⚠️ GRAFANA_API_KEY non définie - push métriques désactivé');

const register = new client.Registry();
client.collectDefaultMetrics({ register });

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

module.exports = {
  register,
  httpRequestsTotal,
  httpRequestDuration
}};