require('dotenv').config({ override: true });

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const compression = require('compression');
const fs = require('fs');

// ============================================================
// 1. IMPORTS DES SERVICES ET MIDDLEWARES
// ============================================================
const { authMiddleware: authenticate } = require('./middleware/auth');
const { helmetMiddleware, globalLimiter } = require('./middleware/security');
const { verifierAlertesAutomatiques } = require('./services/notificationService');
const metricsMiddleware = require('./middleware/metrics');
const { activeUsers, inscriptionsTotal, campagnesTotal } = require('./services/metrics');

// ============================================================
// 2. CRÉER APP ET PRISMA
// ============================================================
const app = express();
const prisma = new PrismaClient();

app.set('trust proxy', 1);

console.log('SERVER STARTING...');

// ============================================================
// 3. MIDDLEWARES GLOBAUX (avant les routes)
// ============================================================
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8080',  // ← AJOUTER CECI (frontend Docker)
    'https://digipip.vercel.app',
    'https://marketingcloudops-frontend.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmetMiddleware);
app.use(globalLimiter);
app.use(compression());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MÉTRIQUES PROMETHEUS (capture des requêtes)
app.use(metricsMiddleware);

// ============================================================
// 4. ROUTES API (sans authentification ou avec)
// ============================================================

// Routes publiques (pas d'authentification)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/campagnes', require('./routes/campagnes'));
app.use('/api/Formations', require('./routes/Formations'));
app.use('/api/cloud', require('./routes/cloud'));
app.use('/api/devops', require('./routes/devops'));
app.use('/api/chat', require('./routes/chat'));

// Routes protégées (authentification requise)
app.use('/api/notifications', authenticate, require('./routes/notifications'));
app.use('/api/clients', authenticate, require('./routes/clients'));
app.use('/api/contacts', authenticate, require('./routes/contacts'));
app.use('/api/emails', authenticate, require('./routes/emails'));
app.use('/api/segments', authenticate, require('./routes/segments'));
app.use('/api/stats', authenticate, require('./routes/stats'));
app.use('/api/users', authenticate, require('./routes/users'));
app.use('/api/alertes', authenticate, require('./routes/alertes'));
app.use('/api/sms', authenticate, require('./routes/sms'));
app.use('/api/analytics', authenticate, require('./routes/analytics'));
app.use('/api/export', authenticate, require('./routes/export'));
app.use('/api/certificats', authenticate, require('./routes/certificats'));

// Routes inscriptions (publiques pour inscription, protégées pour admin)
app.use('/api/inscriptions', require('./routes/inscriptions'));

// Paiements
app.use('/api/paiements', require('./routes/paiements'));

// ============================================================
// 5. MÉTRIQUES PROMETHEUS (endpoint /metrics)
// ============================================================
app.use('/metrics', require('./routes/metrics'));

// ============================================================
// 6. HEALTH CHECK
// ============================================================
app.get('/api/health', (req, res) => res.json({ 
  status: 'ok', 
  timestamp: new Date(),
  service: 'DigiPip Backend'
}));

app.get('/', (req, res) => res.send('DigiPip API OK'));

// ============================================================
// 7. CRÉATION DOSSIER UPLOADS
// ============================================================
const uploadDir = path.join(__dirname, 'uploads', 'campagnes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ============================================================
// 8. DÉMARRAGE
// ============================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('✅ Backend sur http://localhost:' + PORT);
  console.log('📊 Metrics Prometheus: http://localhost:' + PORT + '/metrics');
});