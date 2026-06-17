const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient();

// POST /api/feedbacks - Client donne son avis
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { campagneId, rating, comment } = req.body;
    const userId = req.user.id || req.user.userId;

    // Verifier que l'utilisateur est inscrit et a paye
    const inscription = await prisma.inscription.findFirst({
      where: {
        campagneId: parseInt(campagneId),
        userId: userId,
        status: 'paye'
      }
    });

    if (!inscription) {
      return res.status(403).json({
        error: 'Vous devez etre inscrit et avoir paye pour donner votre avis'
      });
    }

    // Verifier si deja donne un feedback
    const existing = await prisma.feedback.findFirst({
      where: { campagneId: parseInt(campagneId), userId: userId }
    });

    if (existing) {
      return res.status(409).json({
        error: 'Vous avez deja donne votre avis pour cette formation'
      });
    }

    const feedback = await prisma.feedback.create({
      data: {
        rating: parseInt(rating),
        comment: comment || '',
        campagneId: parseInt(campagneId),
        userId: userId
      },
      include: {
        user: { select: { name: true } },
        campagne: { select: { title: true } }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Merci pour votre avis !',
      feedback
    });

  } catch (err) {
    console.error('[FEEDBACK ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/feedbacks/campagne/:campagneId - Voir les avis d'une campagne (Admin/Responsable)
router.get('/campagne/:campagneId', authMiddleware, async (req, res) => {
  try {
    const { campagneId } = req.params;

    if (req.user.role !== 'ADMIN' && req.user.role !== 'RESPONSABLE_MARKETING') {
      return res.status(403).json({ error: 'Acces reserve' });
    }

    const feedbacks = await prisma.feedback.findMany({
      where: { campagneId: parseInt(campagneId) },
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const avgRating = feedbacks.length > 0
      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
      : 0;

    res.json({
      feedbacks,
      stats: {
        total: feedbacks.length,
        average: avgRating,
        distribution: {
          5: feedbacks.filter(f => f.rating === 5).length,
          4: feedbacks.filter(f => f.rating === 4).length,
          3: feedbacks.filter(f => f.rating === 3).length,
          2: feedbacks.filter(f => f.rating === 2).length,
          1: feedbacks.filter(f => f.rating === 1).length,
        }
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/feedbacks/mes-feedbacks - Mes avis (client)
router.get('/mes-feedbacks', authMiddleware, async (req, res) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      where: { userId: req.user.id || req.user.userId },
      include: {
        campagne: { select: { title: true, image: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
