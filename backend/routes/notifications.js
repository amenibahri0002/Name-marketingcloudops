// backend/routes/notifications.js - CORRIGÉ
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

    // 1. Créer la notification
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

    // 2. RÉPONDRE immédiatement (UNE SEULE FOIS)
    res.status(201).json({
      message: 'Notification créée - Envoi en cours',
      notification
    });

    // 3. ENVOYER en arrière-plan (après la réponse, avec setTimeout)
    setTimeout(async () => {
      try {
        let result;
        
        if (canal === 'email') {
          result = await envoyerEmail(notification, title, message);
        } else if (canal === 'push') {
          result = await envoyerPushNotif(notification, title, message);
        } else {
          result = { success: false, error: `${canal} non configuré` };
        }

        // Mettre à jour le statut
        await prisma.notification.update({
          where: { id: notification.id },
          data: { 
            status: result.success ? 'sent' : 'failed',
            sentAt: result.success ? new Date() : null,
            metadata: result
          }
        });

        console.log(`[${canal.toUpperCase()}] ✅ ${result.sent || 0}/${result.total || 0} envoyés`);

      } catch (err) {
        console.error(`[NOTIFICATION SEND ERROR]`, err);
        await prisma.notification.update({
          where: { id: notification.id },
          data: { status: 'failed', metadata: { error: err.message } }
        });
      }
    }, 100);

  } catch (error) {
    console.error('[NOTIFICATION CREATE ERROR]', error);
    // ✅ Vérifier si on a déjà répondu avant d'envoyer une erreur
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
});

// ✅ CORRECTION : Fonctions définies DANS le fichier
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

    return {
      success: result.success,
      sent: result.sent,
      failed: result.failed,
      total: result.total
    };

  } catch (err) {
    console.error('[EMAIL ERROR]', err);
    return { success: false, error: err.message };
  }
}

async function envoyerPushNotif(notification, title, message) {
  try {
    const result = await sendPush({
      title: title,
      message: message,
      type: notification.type,
      campagneId: notification.campagneId
    });

    return result;

  } catch (err) {
    console.error('[PUSH ERROR]', err);
    return { success: false, error: err.message };
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