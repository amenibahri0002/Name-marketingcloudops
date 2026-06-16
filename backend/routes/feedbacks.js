const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/feedbacks
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'CLIENT') {
      return res.status(403).json({ error: 'Seuls les clients peuvent donner un feedback' });
    }

    const { campagneId, rating, comment } = req.body;

    const inscription = await prisma.inscription.findFirst({
      where: {
        userId: req.user.id,
        campagneId: parseInt(campagneId),
        status: 'paye'
      }
    });

    if (!inscription) {
      return res.status(403).json({ error: 'Vous devez avoir participé et payé cette formation' });
    }

    const campagne = await prisma.campagne.findUnique({
      where: { id: parseInt(campagneId) },
      select: { dateScheduled: true, title: true }
    });

    if (campagne.dateScheduled && new Date(campagne.dateScheduled) > new Date()) {
      return res.status(400).json({ error: 'Vous ne pouvez donner un feedback qu\'après la fin' });
    }

    const existing = await prisma.feedback.findUnique({
      where: { userId_campagneId: { userId: req.user.id, campagneId: parseInt(campagneId) } }
    });

    if (existing) {
      return res.status(409).json({ error: 'Vous avez déjà donné un feedback', feedback: existing });
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId: req.user.id,
        campagneId: parseInt(campagneId),
        rating: parseInt(rating),
        comment: comment || null
      },
      include: {
        user: { select: { name: true, email: true } },
        campagne: { select: { title: true } }
      }
    });

    res.status(201).json({ success: true, message: 'Merci pour votre feedback !', feedback });

  } catch (err) {
    console.error('[CREATE FEEDBACK ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/feedbacks/mes-feedbacks
router.get('/mes-feedbacks', authMiddleware, async (req, res) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        campagne: { select: { id: true, title: true, image: true, dateScheduled: true } }
      }
    });
    res.json(feedbacks);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/feedbacks/par-campagne (RESPONSABLE_MARKETING)
router.get('/par-campagne', authMiddleware, async (req, res) => {
  try {
    if (!['ADMIN', 'RESPONSABLE_MARKETING'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès interdit' });
    }

    const campagnes = await prisma.campagne.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        feedbacks: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, name: true, email: true } } }
        },
        _count: { select: { feedbacks: true } }
      }
    });

    const result = campagnes.map(c => {
      const totalFeedbacks = c.feedbacks.length;
      const moyenneRating = totalFeedbacks > 0
        ? (c.feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks).toFixed(1)
        : 0;

      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      c.feedbacks.forEach(f => { distribution[f.rating]++; });

      return {
        id: c.id,
        title: c.title,
        image: c.image,
        dateScheduled: c.dateScheduled,
        totalFeedbacks,
        moyenneRating,
        distribution,
        feedbacks: c.feedbacks
      };
    });

    res.json(result);

  } catch (err) {
    console.error('[GET FEEDBACKS PAR CAMPAGNE ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;