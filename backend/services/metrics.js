// services/metrics.js
const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Durée des requêtes HTTP en secondes',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Nombre total de requêtes HTTP',
  labelNames: ['method', 'route', 'status']
});

const activeUsers = new client.Gauge({
  name: 'active_users',
  help: 'Nombre d\'utilisateurs actifs'
});

const inscriptionsTotal = new client.Counter({
  name: 'inscriptions_total',
  help: 'Nombre total d\'inscriptions',
  labelNames: ['campagne_id']
});

const campagnesTotal = new client.Gauge({
  name: 'campagnes_total',
  help: 'Nombre total de campagnes actives'
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(activeUsers);
register.registerMetric(inscriptionsTotal);
register.registerMetric(campagnesTotal);

module.exports = {
  register,
  httpRequestDuration,
  httpRequestsTotal,
  activeUsers,
  inscriptionsTotal,
  campagnesTotal
};