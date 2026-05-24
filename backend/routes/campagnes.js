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
// ✅ GET /api/campagnes/public  (sans auth)
// Liste les campagnes envoyées pour la homepage
// ─────────────────────────────────────────
// Remplace cette partie dans routes/campagnes.js
router.get('/public', async (req, res) => {
  try {
    const campagnes = await prisma.campagne.findMany({
      where: {
        // Remplace `status: 'sent'` par `isPublic: true`
        isPublic: true,
        // Optionnel : Filtrer aussi par statut si nécessaire
        // status: { in: ['sent', 'scheduled'] },
      },
      include: {
        client: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(campagnes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// ✅ POST /api/campagnes/:id/inscrire  (auth requise)
// Inscription d'un client à une campagne
// ─────────────────────────────────────────
router.post('/:id/inscrire', authMiddleware, async (req, res) => {
  try {
    const campagneId = parseInt(req.params.id)
    const userId     = req.user.id
 
    // ✅ Récupérer name, email, phone depuis le body
    const { name, email, phone } = req.body
 
    // Validation
    if (!name?.trim())  return res.status(400).json({ message: 'Le nom est requis' })
    if (!email?.trim()) return res.status(400).json({ message: "L'email est requis" })
    if (!phone?.trim()) return res.status(400).json({ message: 'Le téléphone est requis' })
 
    const campagne = await prisma.campagne.findUnique({ where: { id: campagneId } })
    if (!campagne) return res.status(404).json({ message: 'Campagne introuvable' })
 
    // Vérifier si déjà inscrit
    const existing = await prisma.inscription.findFirst({
      where: { userId, campagneId }
    })
    if (existing) return res.status(400).json({ message: 'Vous êtes déjà inscrit à cette campagne' })
 
    // ✅ Créer avec tous les champs requis
    const inscription = await prisma.inscription.create({
      data: {
        userId,
        campagneId,
        name:  name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      }
    })
 
    res.status(201).json({ message: 'Inscription réussie', inscription })
  } catch (err) {
    console.error('[INSCRIRE ERROR]', err)
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
      if (!clientPhone) return res.status(400).json({ error: "Le client n'a pas de numéro de téléphone" })
      console.log(`[SMS] Envoi simulé à ${clientPhone} : ${campagne.title}`)
    }

    // ── 🔔 PUSH — Firebase FCM ────────────────
    else if (type === 'push') {
      const fcmToken = campagne.client?.fcmToken
      if (!fcmToken) return res.status(400).json({ error: "Le client n'a pas de token FCM" })

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
// Ajoute ceci à la fin de routes/campagnes.js
router.get('/mes-inscriptions', authMiddleware, async (req, res) => {
  try {
    const inscriptions = await prisma.inscription.findMany({
      where: {
        userId: req.user.id, // Filtrer par l'utilisateur connecté
      },
      include: {
        campagne: {
          include: {
            client: true, // Inclure les infos du client (organisateur)
          },
        },
      },
      orderBy: {
        dateInscription: 'desc', // Tri par date d'inscription (plus récentes en premier)
      },
    });
    res.json(inscriptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Ajoute ceci aussi dans routes/campagnes.js
router.get('/:id/is-registered', authMiddleware, async (req, res) => {
  try {
    const campagneId = parseInt(req.params.id);
    const userId = req.user.id;

    const inscription = await prisma.inscription.findFirst({
      where: {
        userId,
        campagneId,
      },
    });

    res.json({ isRegistered: !!inscription });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router