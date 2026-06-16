const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');
const { notifierNouvelleCampagne, notifierClient, notifierAuLogin, marquerCommeLues } = require('../services/notificationService');
const webpush = require('web-push');
const router = express.Router();
const prisma = new PrismaClient();

// Configurer VAPID
webpush.setVapidDetails(
  'mailto:amenibahri555@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// GET /api/notifications/mes-notifications
router.get('/mes-notifications', authMiddleware, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        campagne: {
          select: { id: true, title: true, image: true, prix: true }
        }
      }
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.json({ notifications, unreadCount, total: notifications.length });

  } catch (err) {
    console.error('[GET NOTIFICATIONS ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    const notification = await prisma.notification.updateMany({
      where: { id: parseInt(req.params.id), userId: req.user.id },
      data: { isRead: true }
    });

    res.json({ success: true, updated: notification.count });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', authMiddleware, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true }
    });

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications/send (ADMIN/MARKETING)
router.post('/send', authMiddleware, async (req, res) => {
  try {
    if (!['ADMIN', 'RESPONSABLE_MARKETING'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès interdit' });
    }

    const { title, message, userId, campagneId, type = 'system' } = req.body;
    const result = await notifierClient(parseInt(userId), title, message, type, { campagneId });
    res.json(result);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notifications/check-login
router.get('/check-login', authMiddleware, async (req, res) => {
  try {
    const result = await notifierAuLogin(req.user.id);
    res.json(result);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// GET /api/notifications/vapid-key
router.get('/vapid-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// POST /api/notifications/subscribe
router.post('/subscribe', authMiddleware, async (req, res) => {
  try {
    const { subscription } = req.body;

    // Sauvegarder dans PushSubscription
    await prisma.pushSubscription.create({
      data: {
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userId: req.user.id
      }
    });

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications/unsubscribe
router.post('/unsubscribe', authMiddleware, async (req, res) => {
  try {
    await prisma.pushSubscription.deleteMany({
      where: { userId: req.user.id }
    });

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications/send-push (test)
router.post('/send-push', authMiddleware, async (req, res) => {
  try {
    if (!['ADMIN', 'RESPONSABLE_MARKETING'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès interdit' });
    }

    const { userId, title, body } = req.body;

    // Récupérer les subscriptions
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: parseInt(userId) }
    });

    const results = [];
    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification({
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth }
        }, JSON.stringify({ title, body }));

        results.push({ endpoint: sub.endpoint, success: true });
      } catch (err) {
        results.push({ endpoint: sub.endpoint, success: false, error: err.message });
      }
    }

    res.json({ success: true, results });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;