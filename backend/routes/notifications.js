const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware: authenticate } = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient();

// ============================================================
// CONFIGURATION EMAIL
// ============================================================
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

// ============================================================
// POST /api/notifications - Créer ET envoyer
// ============================================================
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, message, type, canal, campagneId, segmentId } = req.body;

    if (!title || !message || !canal) {
      return res.status(400).json({ error: 'Titre, message et canal requis' });
    }

    // 1. Créer la notification en base
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

    // 2. ENVOYER L'EMAIL si canal = 'email'
    if (canal === 'email') {
      try {
        // Récupérer les contacts/clients
        const contacts = await prisma.contact.findMany({
          select: { email: true, name: true }
        });
        
        const users = await prisma.user.findMany({
          where: { role: 'CLIENT' },
          select: { email: true, name: true }
        });

        const destinataires = contacts.length > 0 ? contacts : users;

        // Envoyer les emails (non-bloquant)
        const emailPromises = destinataires.map(dest => 
          transporter.sendMail({
            from: `"DigiLab Solutions" <${process.env.MAIL_USER}>`,
            to: dest.email,
            subject: title,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #F5A623;">${title}</h2>
                <p>${message}</p>
                <a href="https://digipip.vercel.app/campagnes" 
                   style="background: #F5A623; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 20px;">
                  Voir les formations
                </a>
              </div>
            `
          }).catch(err => {
            console.error(`[EMAIL ERROR] ${dest.email}:`, err.message);
            return null;
          })
        );

        const results = await Promise.all(emailPromises);
        const sent = results.filter(r => r !== null).length;

        // Mettre à jour le statut
        await prisma.notification.update({
          where: { id: notification.id },
          data: { 
            status: sent > 0 ? 'sent' : 'failed',
            sentAt: sent > 0 ? new Date() : null
          }
        });

        res.status(201).json({
          message: `Notification créée et envoyée à ${sent} destinataires`,
          notification: { ...notification, status: sent > 0 ? 'sent' : 'failed' }
        });

      } catch (emailError) {
        console.error('[EMAIL ERROR]', emailError);
        res.status(201).json({
          message: 'Notification créée mais email non envoyé',
          notification
        });
      }
    } else {
      // SMS, Push, etc.
      res.status(201).json({
        message: 'Notification créée',
        notification
      });
    }

  } catch (error) {
    console.error('[NOTIFICATION CREATE ERROR]', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

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