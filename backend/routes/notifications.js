const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware: authenticate } = require('../middleware/auth');
const { sendCampagneNotification } = require('../services/emailService');  // ← Importer mailer.js
const router = express.Router();
const prisma = new PrismaClient();
// POST /api/notifications - Créer ET envoyer (non-bloquant)
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, message, type, canal, campagneId, segmentId } = req.body;

    if (!title || !message || !canal) {
      return res.status(400).json({ error: 'Titre, message et canal requis' });
    }

    // 1. Créer la notification immédiatement
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type: type || 'info',
        canal,
        campagneId: campagneId ? parseInt(campagneId) : null,
        segmentId: segmentId ? parseInt(segmentId) : null,
        status: 'pending'
      }
    });

    // 2. RÉPONDRE IMMÉDIATEMENT au frontend
    res.status(201).json({
      message: 'Notification créée - Envoi en cours',
      notification
    });

    // 3. ENVOYER L'EMAIL en arrière-plan (après la réponse)
    if (canal === 'email') {
      // Lancer l'envoi sans bloquer
      envoyerEmailEnArrierePlan(notification, title, message);
    }

  } catch (error) {
    console.error('[NOTIFICATION CREATE ERROR]', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Fonction async qui tourne en arrière-plan
async function envoyerEmailEnArrierePlan(notification, title, message) {
  try {
    // Récupérer les destinataires
    const contacts = await prisma.contact.findMany({
      select: { email: true, name: true }
    });
    
    const users = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      select: { email: true, name: true }
    });

    const destinataires = contacts.length > 0 ? contacts : users;
    
    // Récupérer la campagne si campagneId
    const campagne = notification.campagneId ? await prisma.campagne.findUnique({
      where: { id: notification.campagneId }
    }) : null;

    // Utiliser mailer.js pour envoyer
    const result = await sendCampagneNotification(destinataires, title, message, campagne);

    // Mettre à jour le statut en base
    await prisma.notification.update({
      where: { id: notification.id },
      data: { 
        status: result.success ? 'sent' : 'failed',
        sentAt: result.success ? new Date() : null
      }
    });

    console.log(`[EMAIL] ✅ ${result.sent}/${result.total} emails envoyés`);

  } catch (err) {
    console.error('[EMAIL BACKGROUND ERROR]', err);
  }
}

// ============================================================
// GET /api/notifications - Historique
// ============================================================
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, canal, status } = req.query;

    const where = {};
    if (type) where.type = type;
    if (canal) where.canal = canal;
    if (status) where.status = status;

    const notifications = await prisma.notification.findMany({
      where,
      include: {
        campagne: { select: { id: true, title: true, slug: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    const total = await prisma.notification.count({ where });

    res.json({
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('[NOTIFICATIONS LIST ERROR]', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================================
// GET /api/notifications/stats - Statistiques
// ============================================================
router.get('/stats', authenticate, async (req, res) => {
  try {
    const stats = await prisma.notification.groupBy({
      by: ['canal', 'status'],
      _count: { id: true }
    });

    const byType = await prisma.notification.groupBy({
      by: ['type'],
      _count: { id: true }
    });

    res.json({ byCanalStatus: stats, byType });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================================
// GET /api/notifications/:id - Détail
// ============================================================
router.get('/:id', authenticate, async (req, res) => {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        campagne: true,
        client: true,
        segment: true
      }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification non trouvée' });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;