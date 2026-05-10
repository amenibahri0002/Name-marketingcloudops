const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const nodemailer = require('nodemailer')
const admin = require('../config/firebase')
const { authMiddleware } = require('../middleware/auth')

// ── Nodemailer transporter (Gmail SMTP) ──
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
})

// ─────────────────────────────────────────
// GET /api/campagnes/public  (sans auth)
// ⚠️ DOIT être AVANT /:id pour ne pas être capturée
// ─────────────────────────────────────────
router.get('/public', async (req, res) => {
  try {
    const campagnes = await prisma.campagne.findMany({
      where: { status: 'sent' },
      include: { client: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    })
    res.json(campagnes)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────
// POST /api/campagnes/send/:id
// ⚠️ DOIT être AVANT /:id pour ne pas être capturée
// ─────────────────────────────────────────
router.post('/send/:id', authMiddleware, async (req, res) => {
  try {
    const campagne = await prisma.campagne.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { client: true }
    })

    if (!campagne) return res.status(404).json({ error: 'Campagne introuvable' })
    if (campagne.status === 'sent') return res.status(400).json({ error: 'Campagne déjà envoyée' })

    const type = campagne.type?.toLowerCase()

    // ── 📧 EMAIL ──────────────────────────────
    if (type === 'email') {
      const clientEmail = campagne.client?.email
      if (!clientEmail) return res.status(400).json({ error: "Le client n'a pas d'adresse email" })

      await transporter.sendMail({
        from: `"DigiPip MarketingCloud" <${process.env.MAIL_USER}>`,
        to: clientEmail,
        subject: `📢 ${campagne.title}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;background:#f9f9f9;">
            <div style="background:#16120d;padding:20px 30px;border-radius:12px 12px 0 0;">
              <h1 style="color:#f5a623;margin:0;font-size:22px;">DigiPip</h1>
              <p style="color:rgba(255,255,255,0.6);margin:4px 0 0;font-size:12px;">Marketing Cloud Platform</p>
            </div>
            <div style="background:#ffffff;padding:30px;border-radius:0 0 12px 12px;border:1px solid #eee;">
              <h2 style="color:#1a1f3c;margin:0 0 16px;">${campagne.title}</h2>
              <p style="color:#6b7280;">Bonjour <strong>${campagne.client?.name || 'Client'}</strong>,</p>
              <p style="color:#6b7280;line-height:1.6;">Vous recevez cette campagne marketing de la part de <strong>DigiPip</strong>.</p>
              <hr style="border:none;border-top:1px solid #f0f0f0;margin:24px 0;" />
              <p style="color:#9ca3af;font-size:12px;">DigiPip MarketingCloudOps — Envoi automatique. Ne pas répondre à cet email.</p>
            </div>
          </div>
        `,
      })
    }

    // ── 📱 SMS ────────────────────────────────
    else if (type === 'sms') {
      const clientPhone = campagne.client?.phone
      if (!clientPhone) return res.status(400).json({ error: "Le client n'a pas de numéro de téléphone" })

      // Twilio SMS
      try {
        const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
        await twilio.messages.create({
          body: `📢 ${campagne.title} — DigiPip MarketingCloud`,
          from: process.env.TWILIO_PHONE,
          to: clientPhone,
        })
        console.log(`[SMS] Envoyé à ${clientPhone}`)
      } catch (twilioErr) {
        console.error('[SMS ERROR]', twilioErr.message)
        // On continue quand même pour mettre à jour le statut
      }
    }

    // ── 🔔 PUSH — Firebase FCM ────────────────
    else if (type === 'push') {
      const fcmToken = campagne.client?.fcmToken
      if (!fcmToken) return res.status(400).json({ error: "Le client n'a pas de token FCM" })

      await admin.messaging().send({
        token: fcmToken,
        notification: {
          title: campagne.title,
          body: `Nouvelle campagne de ${campagne.client?.name || 'DigiPip'}`,
        },
        data: {
          campagneId: String(campagne.id),
          type: 'push',
          clientName: campagne.client?.name || '',
        },
        webpush: {
          notification: {
            icon: '/logo192.png',
            badge: '/logo192.png',
            requireInteraction: true,
          },
        },
      })
    }

    // ── Mettre à jour le statut → sent ────────
    const updated = await prisma.campagne.update({
      where: { id: campagne.id },
      data: { status: 'sent', sentAt: new Date() },
      include: { client: true }
    })

    res.json({ message: 'Campagne envoyée avec succès', campagne: updated })

  } catch (err) {
    console.error('[SEND ERROR]', err)
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────
// GET /api/campagnes  (auth requise)
// ─────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = req.user
    let campagnes
    if (user.role === 'ADMIN') {
      campagnes = await prisma.campagne.findMany({
        orderBy: { createdAt: 'desc' },
        include: { client: true }
      })
    } else {
      campagnes = await prisma.campagne.findMany({
        where: { clientId: user.clientId },
        orderBy: { createdAt: 'desc' },
        include: { client: true }
      })
    }
    res.json(campagnes)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────
// POST /api/campagnes
// ─────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, type, clientId, dateScheduled } = req.body
    if (!title || !type || !clientId) {
      return res.status(400).json({ error: 'title, type et clientId sont requis' })
    }
    const campagne = await prisma.campagne.create({
      data: {
        title,
        type,
        clientId: parseInt(clientId),
        dateScheduled: dateScheduled ? new Date(dateScheduled) : null,
        status: 'draft',
      },
      include: { client: true }
    })
    res.status(201).json(campagne)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────
// PATCH /api/campagnes/:id
// ─────────────────────────────────────────
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, status, dateScheduled } = req.body
    const campagne = await prisma.campagne.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(title         !== undefined && { title }),
        ...(status        !== undefined && { status }),
        ...(dateScheduled !== undefined && {
          dateScheduled: dateScheduled ? new Date(dateScheduled) : null
        }),
      },
      include: { client: true }
    })
    res.json(campagne)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────
// POST /api/campagnes/:id/inscrire
// ─────────────────────────────────────────
router.post('/:id/inscrire', authMiddleware, async (req, res) => {
  try {
    const campagneId = parseInt(req.params.id)
    const userId     = req.user.id

    const campagne = await prisma.campagne.findUnique({ where: { id: campagneId } })
    if (!campagne) return res.status(404).json({ message: 'Campagne introuvable' })

    const existing = await prisma.inscription.findFirst({ where: { userId, campagneId } })
    if (existing) return res.status(400).json({ message: 'Vous êtes déjà inscrit à cette campagne' })

    const inscription = await prisma.inscription.create({ data: { userId, campagneId } })
    res.status(201).json({ message: 'Inscription réussie', inscription })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────
// DELETE /api/campagnes/:id
// ─────────────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.campagne.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ message: 'Campagne supprimée' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router