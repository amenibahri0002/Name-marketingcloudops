require('dotenv').config({ override: true })
const express = require('express')
const cors = require('cors')
const { PrismaClient } = require('@prisma/client')
const client = require('prom-client')
const { authMiddleware: authenticate } = require('./middleware/auth')
const { helmetMiddleware, globalLimiter } = require('./middleware/security')
const compression = require('compression')
require('dotenv').config();
const { verifierAlertesAutomatiques } = require('./services/notificationService');
// ============================================================
// 1. CRÉER APP D'ABORD
// ============================================================
const app = express()
const path = require('path');
app.set('trust proxy', 1)
const dbUrl = process.env.DATABASE_URL;
const jwtSecret = process.env.JWT_SECRET;
const twilioSid = process.env.TWILIO_SID;
const prisma = new PrismaClient()

console.log('SERVER STARTING...')

// ============================================================
// 2. MIDDLEWARES (avant les routes)
// ============================================================
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://digipip.vercel.app',
    'https://marketingcloudops-frontend.vercel.app'
  ],
  credentials: true
}));

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(helmetMiddleware)
app.use(globalLimiter)
app.use(compression())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// ============================================================
// 3. ROUTES (après app et middlewares)
// ============================================================
app.use('/api/chat', require('./routes/chat'));
app.use('/api/formations', require('./routes/formations'));
const cloudRoutes = require('./routes/cloud');
app.use('/api/cloud', require('./routes/cloud'));
const authRoutes = require('./routes/auth')
app.use('/api/auth', authRoutes)
const notificationRoutes = require('./routes/notifications');
app.use('/api/notifications', authenticate, notificationRoutes);
const clientRoutes = require('./routes/clients')
app.use('/api/clients', authenticate, clientRoutes)

const campagnesRoutes = require('./routes/campagnes')
app.use('/api/campagnes', campagnesRoutes)

const contactsRoutes = require('./routes/contacts')
app.use('/api/contacts', authenticate, contactsRoutes)

const emailsRoutes = require('./routes/emails')
app.use('/api/emails', authenticate, emailsRoutes)

const segmentsRoutes = require('./routes/segments')
app.use('/api/segments', authenticate, segmentsRoutes)

const statsRoutes = require('./routes/stats')
app.use('/api/stats', authenticate, statsRoutes)

const usersRoutes = require('./routes/users')
app.use('/api/users', authenticate, usersRoutes)

const alertesRoutes = require('./routes/alertes')
app.use('/api/alertes', authenticate, alertesRoutes)

const notifRoutes = require('./routes/notifications')
app.use('/api/notifications', authenticate, notifRoutes)

const smsRoutes = require('./routes/sms')
app.use('/api/sms', authenticate, smsRoutes)

const analyticsRoutes = require('./routes/analytics')
app.use('/api/analytics', authenticate, analyticsRoutes)

const chatRoutes = require('./routes/chat');
app.use('/api/chat', chatRoutes);

const devopsRouter = require('./routes/devops')
app.use('/api/devops', devopsRouter)

const exportRoutes = require('./routes/export')
app.use('/api/export', authenticate, exportRoutes)

// ============================================================
// 4. ROUTES INSCRIPTIONS (NOUVEAU)
// ============================================================
const inscriptionRoutes = require('./routes/inscriptions')
app.use('/api/inscriptions', inscriptionRoutes)

// ============================================================
// 5. MÉTRIQUES & HEALTH CHECK
// ============================================================
client.collectDefaultMetrics({ timeout: 5000 })

app.get('/api/health', (req, res) => res.json({ 
  status: 'ok', 
  timestamp: new Date(),
  service: 'MarketingCloudOps Backend'
}))

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType)
  res.end(await client.register.metrics())
})

app.get('/', (req, res) => res.send('MarketingCloudOps API OK'))

// ============================================================
// 6. DÉMARRAGE
// ============================================================
app.use('/api/paiements', require('./routes/paiements'));
const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0', () => {
  console.log('✅ Backend sur http://localhost:' + PORT)
})
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads', 'campagnes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}