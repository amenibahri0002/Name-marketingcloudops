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

app.use(cors({ origin: '*', credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(helmetMiddleware)
app.use(globalLimiter)
app.use(compression())

const authRoutes = require('./routes/auth')
app.use('/auth', authRoutes)

const clientRoutes = require('./routes/clients')
app.use('/api/clients', authenticate, clientRoutes)

const campagnesRoutes = require('./routes/campagnes')
app.use('/api/campagnes', authenticate, campagnesRoutes)

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

const exportRoutes = require('./routes/export')
app.use('/api/export', authenticate, exportRoutes)

client.collectDefaultMetrics({ timeout: 5000 })

app.get('/health', (req, res) => res.json({ status: 'ok' }))

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType)
  res.end(await client.register.metrics())
})

app.get('/', (req, res) => res.send('MarketingCloudOps API OK'))

const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0', () => {
  console.log('Backend sur http://localhost:' + PORT)
})