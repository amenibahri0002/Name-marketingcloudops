const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware: authenticate } = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient();

// GET /api/notifications - Historique des notifications
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

// GET /api/notifications/stats - Statistiques des notifications
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

// POST /api/notifications - Créer une notification manuelle
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, message, type, canal, campagneId, segmentId } = req.body;

    if (!title || !message || !canal) {
      return res.status(400).json({ error: 'Titre, message et canal requis' });
    }

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

    res.status(201).json({
      message: 'Notification créée',
      notification
    });
  } catch (error) {
    console.error('[NOTIFICATION CREATE ERROR]', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/notifications/:id - Détail d'une notification
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