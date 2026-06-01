require('dotenv').config({ override: true })
const express = require('express')
const cors = require('cors')
const { PrismaClient } = require('@prisma/client')
const client = require('prom-client')
const { authMiddleware: authenticate } = require('./middleware/auth')
const { helmetMiddleware, globalLimiter } = require('./middleware/security')
const compression = require('compression')

const app = express()
app.set('trust proxy', 1)

const prisma = new PrismaClient()

console.log('SERVER STARTING...')

app.use(cors({
  origin: [
    'http://localhost:3000',
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
app.use('/api/chat', require('./routes/chat'));

const authRoutes = require('./routes/auth')
app.use('/api/auth', authRoutes)

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
app.use('/api/chat', chatRoutes); // sans authenticate — route publique

const devopsRouter = require('./routes/devops')
app.use('/api/devops', devopsRouter)

const exportRoutes = require('./routes/export')
app.use('/api/export', authenticate, exportRoutes)

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

const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0', () => {
  console.log('Backend sur http://localhost:' + PORT)
})