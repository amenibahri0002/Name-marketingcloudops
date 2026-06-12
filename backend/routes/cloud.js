// backend/routes/cloud.js (nouveau fichier)
const express = require('express');
const router = express.Router();

// Régions cloud
router.get('/regions', async (req, res) => {
  res.json([
    { id: 'tn-north', name: 'Tunis Nord', provider: 'AWS', status: 'active', health: 98, latency: 24, users: 45200, cost: 2450 },
    { id: 'tn-south', name: 'Sfax Sud', provider: 'Azure', status: 'active', health: 96, latency: 32, users: 28300, cost: 1890 },
    { id: 'tn-central', name: 'Sousse Centre', provider: 'GCP', status: 'warning', health: 87, latency: 45, users: 15600, cost: 1200 },
    { id: 'tn-backup', name: 'Gabès Backup', provider: 'OVH', status: 'standby', health: 100, latency: 12, users: 0, cost: 450 },
  ]);
});

// Services cloud
router.get('/services', async (req, res) => {
  res.json([
    { id: 1, name: 'DigiPip Engine', type: 'compute', status: 'active', instances: 12, cpu: 67, memory: 72, storage: 45, cost: 850, uptime: 99.97, region: 'tn-north' },
    // ... autres services
  ]);
});

// Coûts
router.get('/costs', async (req, res) => {
  res.json([
    { month: 'Jan', compute: 3200, storage: 1200, network: 800, database: 1500, total: 6700 },
    // ... autres mois
  ]);
});

module.exports = router;