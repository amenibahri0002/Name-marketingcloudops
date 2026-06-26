require('dotenv').config({ override: true });
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const compression = require('compression');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');

// ============================================================
// 1. IMPORTS
// ============================================================
const { authenticate } = require('./middleware/auth');
const { tenantMiddleware, tenantAccessControl, planLimitMiddleware } = require('./middleware/tenant');
const { helmetMiddleware, globalLimiter } = require('./middleware/security');
const metricsMiddleware = require('./middleware/metrics');
const app = express();
const prisma = new PrismaClient();
const server = http.createServer(app);
app.set('trust proxy', 1);
console.log('SERVER STARTING...');

// Endpoint /metrics — Prometheus viendra scraper ici
app.get('/metrics', async (req, res) => {
  const client = require('prom-client');
  const register = new client.Registry();
  client.collectDefaultMetrics({ register });
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

setInterval(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('[KEEP-ALIVE] Database pinged at', new Date().toISOString());
  } catch (err) {
    console.error('[KEEP-ALIVE] Ping failed:', err.message);
  }
}, 4 * 60 * 1000);

// Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});
global.io = io;

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Token manquant'));

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    socket.userId = decoded.userId || decoded.id;
    socket.tenantId = decoded.tenantId;

    next();
  } catch (err) {
    next(new Error('Token invalide'));
  }
});

io.on('connection', (socket) => {
  console.log('[SOCKET] User connecté:', socket.userId);
  socket.join(`user_${socket.userId}`);
  socket.join(`tenant_${socket.tenantId}`);
  socket.on('disconnect', () => {
    console.log('[SOCKET] User déconnecté:', socket.userId);
  });
});

// ============================================================
// 2. MIDDLEWARES GLOBAUX
// ============================================================
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8080',
    'https://digipip.vercel.app',
    'https://marketingcloudops-frontend.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-Requested-With'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmetMiddleware);
app.use(globalLimiter);
app.use(compression());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(metricsMiddleware);

// ============================================================
// 3. ROUTES PUBLIQUES (SANS AUTH, SANS TENANT)
// ============================================================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tenants', require('./routes/tenant.routes'));
app.get('/api/health', (req, res) => res.json({ 
  status: 'ok', 
  tenant: req.tenant?.name || null 
}));

// ============================================================
// 4. MIDDLEWARE TENANT (pour routes publiques avec tenant)
// ============================================================
app.use(tenantMiddleware);

// ============================================================
// 5. ROUTES PUBLIQUES AVEC TENANT
// ============================================================
app.get('/api/campagnes/public', async (req, res) => {
  try {
    const DEFAULT_TENANT_ID = 'cmqpeaa3o000013c526wukadg';
    const tenantId = req.tenantId || DEFAULT_TENANT_ID;

    const campagnes = await prisma.campagne.findMany({
      where: { 
        tenantId,
        published: true, 
        status: 'ACTIVE' 
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('[PUBLIC CAMPAGNES]', campagnes.length, 'campagnes trouvées');
    res.json(campagnes);
  } catch (e) { 
    console.error('[PUBLIC CAMPAGNES ERROR]', e);
    res.status(500).json({ message: e.message }); 
  }
});

// Routes publiques avec tenant (pas besoin d'auth)
app.use('/api/Formations', require('./routes/Formations'));
app.use('/api/cloud', require('./routes/cloud'));
app.use('/api/devops', require('./routes/devops'));
app.use('/api/chat', require('./routes/chat'));

// ============================================================
// 6. AUTHENTIFICATION (pour routes protégées)
// ============================================================
app.use(authenticate);

// ============================================================
// 7. CONTRÔLE D'ACCÈS TENANT (après auth)
// ============================================================
app.use(tenantAccessControl);
app.use(planLimitMiddleware);

// ============================================================
// 8. ROUTES PROTÉGÉES (auth + tenant requis)
// ============================================================
app.use('/api/campagnes', require('./routes/campagnes'));
app.use('/api/inscriptions', require('./routes/inscriptions'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/emails', require('./routes/emails'));
app.use('/api/segments', require('./routes/segments'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/users', require('./routes/users'));
app.use('/api/alertes', require('./routes/alertes'));
app.use('/api/sms', require('./routes/sms'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/export', require('./routes/export'));
app.use('/api/certificats', require('./routes/certificats'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/paiements', require('./routes/paiements'));
app.use('/api/feedbacks', require('./routes/feedbacks'));
app.use('/api/kpis', require('./routes/kpis'));

// ============================================================
// 9. MÉTRIQUES & HEALTH
// ============================================================
app.use('/metrics', require('./routes/metrics'));

app.get('/', (req, res) => res.send('DigiPip API OK'));

// ============================================================
// 10. UPLOADS
// ============================================================
const uploadDir = path.join(__dirname, 'uploads', 'campagnes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ============================================================
// 11. DÉMARRAGE
// ============================================================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Backend sur http://localhost:${PORT}`);
});