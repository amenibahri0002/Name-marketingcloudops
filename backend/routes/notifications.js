const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware: authenticate } = require('../middleware/auth');
const { sendCampagneNotification } = require('../services/emailService');
const { sendPush } = require('../services/pushService');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/notifications
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, message, type, canal, campagneId } = req.body;

    if (!title || !message || !canal) {
      return res.status(400).json({ error: 'Titre, message et canal requis' });
    }

    // Créer la notification
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type: type || 'info',
        canal,
        campagneId: campagneId ? parseInt(campagneId) : null,
        status: 'pending'
      }
    });

    // Répondre immédiatement
    res.status(201).json({
      message: 'Notification créée - Envoi en cours',
      notification
    });

    // Envoyer en arrière-plan (après la réponse)
    if (canal === 'email') {
      envoyerEmail(notification, title, message);
    } else if (canal === 'push') {
      envoyerPushNotif(notification, title, message);
    }

  } catch (error) {
    console.error('[NOTIFICATION ERROR]', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
});

// ============================================================
// FONCTION EMAIL (définie dans le même fichier)
// ============================================================
async function envoyerEmail(notification, title, message) {
  try {
    const contacts = await prisma.contact.findMany({
      select: { email: true, name: true }
    });
    
    const users = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      select: { email: true, name: true }
    });

    const allDestinataires = [...contacts, ...users];
    const uniqueDestinataires = allDestinataires.filter((dest, index, self) => 
      index === self.findIndex(d => d.email === dest.email)
    );

    const campagne = notification.campagneId ? await prisma.campagne.findUnique({
      where: { id: notification.campagneId }
    }) : null;

    const result = await sendCampagneNotification(uniqueDestinataires, title, message, campagne);

    await prisma.notification.update({
      where: { id: notification.id },
      data: { 
        status: result.success ? 'sent' : 'failed',
        sentAt: result.success ? new Date() : null
      }
    });

    console.log(`[EMAIL] ✅ ${result.sent}/${result.total} emails envoyés`);

  } catch (err) {
    console.error('[EMAIL ERROR]', err);
    await prisma.notification.update({
      where: { id: notification.id },
      data: { status: 'failed' }
    });
  }
}

// ============================================================
// FONCTION PUSH (définie dans le même fichier)
// ============================================================
async function envoyerPushNotif(notification, title, message) {
  try {
    const result = await sendPush({
      title: title,
      message: message,
      type: notification.type,
      campagneId: notification.campagneId
    });

    await prisma.notification.update({
      where: { id: notification.id },
      data: { 
        status: result.success ? 'sent' : 'failed',
        sentAt: result.success ? new Date() : null,
        metadata: {
          sent: result.sent,
          failed: result.failed
        }
      }
    });

    console.log(`[PUSH] ✅ ${result.sent}/${result.total} push envoyés`);

  } catch (err) {
    console.error('[PUSH ERROR]', err);
    await prisma.notification.update({
      where: { id: notification.id },
      data: { status: 'failed' }
    });
  }
}

// GET /api/notifications
router.get('/', authenticate, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;