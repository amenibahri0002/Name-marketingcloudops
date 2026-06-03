const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const nodemailer = require('nodemailer')
const admin = require('../config/firebase')
const { authMiddleware, requireRole, ROLES } = require('../middleware/auth')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
})

// -- ROUTES FIXES (avant /:id) --------------------------------------

router.get('/public', async (req, res) => {
  try {
    const campagnes = await prisma.campagne.findMany({
      where: { OR: [{ isPublic: true }, { status: 'sent' }, { status: 'draft' }] },
      include: { client: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    })
    res.json(campagnes)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/mes-inscriptions', authMiddleware, async (req, res) => {
  try {
    const inscriptions = await prisma.inscription.findMany({
      where: { userId: req.user.id },
      include: { campagne: { include: { client: true } } },
      orderBy: { createdAt: 'desc' },
    })
    res.json(inscriptions)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = req.user
    const campagnes = user.role === 'ADMIN'
      ? await prisma.campagne.findMany({ orderBy: { createdAt: 'desc' }, include: { client: true } })
      : await prisma.campagne.findMany({ where: { clientId: user.clientId }, orderBy: { createdAt: 'desc' }, include: { client: true } })
    res.json(campagnes)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, type, clientId, dateScheduled } = req.body
    const campagne = await prisma.campagne.create({
      data: { title, type, clientId: parseInt(clientId), dateScheduled: dateScheduled ? new Date(dateScheduled) : null, status: 'draft' }
    })
    res.json(campagne)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/send/:id', authMiddleware, async (req, res) => {
  try {
    const campagne = await prisma.campagne.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { client: true }
    })
    if (!campagne) return res.status(404).json({ error: 'Campagne introuvable' })
    if (campagne.status === 'sent') return res.status(400).json({ error: 'Campagne d�j� envoy�e' })

    const type = campagne.type?.toLowerCase()

    if (type === 'email') {
      const clientEmail = campagne.client?.email
      if (!clientEmail) return res.status(400).json({ error: "Le client n'a pas d'adresse email" })
      await transporter.sendMail({
        from: `"MarketingCloudOps" <${process.env.MAIL_USER}>`,
        to: clientEmail,
        subject: campagne.title,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;"><h2 style="color:#f5a623;">${campagne.title}</h2><p>Bonjour <strong>${campagne.client?.name || 'Client'}</strong>,</p><p>Vous recevez cette campagne marketing de notre part.</p></div>`,
      })
    } else if (type === 'sms') {
      console.log(`[SMS] Envoi simul� � ${campagne.client?.phone} : ${campagne.title}`)
    } else if (type === 'push') {
      const fcmToken = campagne.client?.fcmToken
      if (!fcmToken) return res.status(400).json({ error: "Le client n'a pas de token FCM" })
      await admin.messaging().send({
        token: fcmToken,
        notification: { title: campagne.title, body: `Nouvelle campagne de ${campagne.client?.name || 'MarketingCloudOps'}` },
      })
    }

    const updated = await prisma.campagne.update({
      where: { id: campagne.id },
      data: { status: 'sent', sentAt: new Date() },
      include: { client: true }
    })
    res.json({ message: 'Campagne envoy�e avec succ�s', campagne: updated })
  } catch (err) {
    console.error('[SEND ERROR]', err)
    res.status(500).json({ error: err.message })
  }
})

// -- ROUTES AVEC /:id (apr�s les routes fixes) ----------------------

router.get('/:id', async (req, res) => {
  try {
    const campagne = await prisma.campagne.findUnique({
      where: { id: Number(req.params.id) },
      include: { client: { select: { name: true } } },
    })
    if (!campagne) return res.status(404).json({ message: 'Campagne introuvable' })
    res.json(campagne)
  } catch (e) { res.status(500).json({ message: e.message }) }
})

router.post('/:id/inscrire', authMiddleware, async (req, res) => {
  try {
    const campagneId = parseInt(req.params.id)
    const userId = req.user.id
    const { nom, email, telephone } = req.body

    if (!nom?.trim())       return res.status(400).json({ message: 'Le nom est requis' })
    if (!email?.trim())     return res.status(400).json({ message: "L'email est requis" })
    if (!telephone?.trim()) return res.status(400).json({ message: 'Le t�l�phone est requis' })

    const campagne = await prisma.campagne.findUnique({ where: { id: campagneId } })
    if (!campagne) return res.status(404).json({ message: 'Campagne introuvable' })

    const existing = await prisma.inscription.findFirst({ where: { userId, campagneId } })
    if (existing) return res.status(409).json({ message: 'D�j� inscrit.' })

    const inscription = await prisma.inscription.create({
      data: { userId, campagneId, name: nom.trim(), email: email.trim(), telephone: telephone.trim() }
    })
    res.status(201).json({ message: 'Inscription r�ussie', inscription })
  } catch (err) {
    console.error('[INSCRIRE ERROR]', err)
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id/inscrits', authMiddleware, async (req, res) => {
  try {
    const inscrits = await prisma.inscription.findMany({
      where: { campagneId: Number(req.params.id) },
      orderBy: { createdAt: 'desc' },
    })
    res.json(inscrits)
  } catch (e) { res.status(500).json({ message: e.message }) }
})

router.get('/:id/is-registered', authMiddleware, async (req, res) => {
  try {
    const inscription = await prisma.inscription.findFirst({
      where: { userId: req.user.id, campagneId: parseInt(req.params.id) },
    })
    res.json({ isRegistered: !!inscription })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, status, dateScheduled } = req.body
    const campagne = await prisma.campagne.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(title !== undefined && { title }),
        ...(status !== undefined && { status }),
        ...(dateScheduled !== undefined && { dateScheduled: dateScheduled ? new Date(dateScheduled) : null }),
      }
    })
    res.json(campagne)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.campagne.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ message: 'Campagne supprim�e' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
