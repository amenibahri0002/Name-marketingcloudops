const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate: authMiddleware } = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient();

// POST /api/feedbacks — Créer un avis (auth requise)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const tenantId = req.tenantId || req.user?.tenantId;
    const { campagneId, rating, comment } = req.body;
    const userId = req.user.id || req.user.userId;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID manquant' });
    }

    // Vérifier inscription payée (PAYEE en majuscule selon le schéma)
    const inscription = await prisma.inscription.findFirst({
      where: {
        campagneId: campagneId,  // ← CUID = string, PAS de parseInt
        userId: userId,
        status: 'PAYEE',  // ← MAJUSCULE
        tenantId
      }
    });

    if (!inscription) {
      return res.status(403).json({
        error: 'Vous devez être inscrit et avoir payé pour donner votre avis'
      });
    }

    // Vérifier si déjà donné
    const existing = await prisma.feedback.findFirst({
      where: { campagneId: campagneId, userId, tenantId }  // ← PAS de parseInt
    });

    if (existing) {
      return res.status(409).json({
        error: 'Vous avez déjà donné votre avis pour cette formation'
      });
    }

    const feedback = await prisma.feedback.create({
      data: {
        rating: parseInt(rating),
        comment: comment || '',
        campagneId: campagneId,  // ← CUID = string
        userId: userId,
        tenantId
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

// GET /api/feedbacks/campagne/:campagneId — PUBLIQUE (pas d'auth requise)
router.get('/campagne/:campagneId', async (req, res) => {
  try {
    const { campagneId } = req.params;

    // Pas de vérification auth/tenant — les avis sont publics
    const feedbacks = await prisma.feedback.findMany({
      where: { campagneId: campagneId },  // ← CUID = string
      include: {
        user: { select: { id: true, name: true } }  // ← Ajouté id pour vérifier hasGivenFeedback
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
    console.error('[FEEDBACKS GET ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/feedbacks/mes-feedbacks — Avis de l'utilisateur connecté
router.get('/mes-feedbacks', authMiddleware, async (req, res) => {
  try {
    const tenantId = req.tenantId || req.user?.tenantId;
    const userId = req.user.id || req.user.userId;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID manquant' });
    }

    const feedbacks = await prisma.feedback.findMany({
      where: { userId: userId, tenantId },
      include: {
        campagne: { select: { title: true, image: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(feedbacks);
  } catch (err) {
    console.error('[MES-FEEDBACKS ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;