const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const nodemailer = require('nodemailer')
const admin = require('../config/firebase') // ← Firebase activé

// ── Nodemailer transporter (Gmail SMTP) ──
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
})

// ─────────────────────────────────────────
// GET /api/campagnes
// ─────────────────────────────────────────
router.get('/', async (req, res) => {
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
router.post('/', async (req, res) => {
  try {
    const { title, type, clientId, dateScheduled } = req.body
    const campagne = await prisma.campagne.create({
      data: {
        title,
        type,
        clientId: parseInt(clientId),
        dateScheduled: dateScheduled ? new Date(dateScheduled) : null,
        status: 'draft',
      }
    })
    res.json(campagne)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────
// PATCH /api/campagnes/:id
// ─────────────────────────────────────────
router.patch('/:id', async (req, res) => {
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
      }
    })
    res.json(campagne)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────
// POST /api/campagnes/send/:id
// ─────────────────────────────────────────
router.post('/send/:id', async (req, res) => {
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
      if (!clientEmail) {
        return res.status(400).json({ error: "Le client n'a pas d'adresse email" })
      }

      await transporter.sendMail({
        from: `"MarketingCloudOps" <${process.env.MAIL_USER}>`,
        to: clientEmail,
        subject: campagne.title,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;">
            <h2 style="color:#f5a623;">${campagne.title}</h2>
            <p>Bonjour <strong>${campagne.client?.name || 'Client'}</strong>,</p>
            <p>Vous recevez cette campagne marketing de notre part.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
            <p style="color:#999;font-size:12px;">MarketingCloudOps — Campagne envoyée automatiquement</p>
          </div>
        `,
      })
    }

    // ── 📱 SMS ────────────────────────────────
    else if (type === 'sms') {
      const clientPhone = campagne.client?.phone
      if (!clientPhone) {
        return res.status(400).json({ error: "Le client n'a pas de numéro de téléphone" })
      }
      // Décommentez quand Twilio est configuré :
      // const twilio = require('twilio')
      // const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN)
      // await client.messages.create({
      //   body: campagne.title,
      //   from: process.env.TWILIO_FROM,
      //   to: clientPhone,
      // })
      console.log(`[SMS] Envoi simulé à ${clientPhone} : ${campagne.title}`)
    }

    // ── 🔔 PUSH — Firebase FCM ────────────────
    else if (type === 'push') {
      const fcmToken = campagne.client?.fcmToken
      if (!fcmToken) {
        return res.status(400).json({ error: "Le client n'a pas de token FCM" })
      }

      await admin.messaging().send({
        token: fcmToken,
        notification: {
          title: campagne.title,
          body: `Nouvelle campagne de ${campagne.client?.name || 'MarketingCloudOps'}`,
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
      data: {
        status: 'sent',
        sentAt: new Date(),
      },
      include: { client: true }
    })

    res.json({ message: 'Campagne envoyée avec succès', campagne: updated })

  } catch (err) {
    console.error('[SEND ERROR]', err)
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────
// DELETE /api/campagnes/:id
// ─────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    await prisma.campagne.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ message: 'Campagne supprimée' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router