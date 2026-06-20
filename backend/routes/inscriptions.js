const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();
const notificationService = require('../services/notificationService');

// ← IMPORT CORRECT
const { authenticate } = require('../middleware/auth');

// GET /api/inscriptions - Liste du tenant
router.get('/', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const inscriptions = await prisma.inscription.findMany({
      where: { tenantId },
      include: {
        campagne: { select: { id: true, title: true } },
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(inscriptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/inscriptions - Créer une inscription
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const tenantId = req.tenantId;
    const { campagneId } = req.body;

    const inscription = await prisma.inscription.create({
      data: {
        userId,
        campagneId,
        tenantId,
        status: 'EN_ATTENTE',
      },
      include: {
        campagne: true,
      },
    });

    // NOTIFIER LE CLIENT
    notificationService.notifyInscription(userId, {
      id: inscription.id,
      formation: inscription.campagne.title,
      date: inscription.campagne.dateDebut,
      lieu: inscription.campagne.lieu,
      numero: `INS-${String(inscription.id).padStart(4, '0')}`,
    }).catch(err => console.error('[NOTIFY INSCRIPTION ERROR]', err));

    res.json(inscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/inscriptions/:id/status
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const tenantId = req.tenantId;

    if (!status || !['EN_ATTENTE', 'CONFIRMEE', 'TERMINEE', 'ANNULEE'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const inscription = await prisma.inscription.updateMany({
      where: { id: parseInt(id), tenantId },
      data: { status }
    });

    res.json({ success: true, inscription });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/inscriptions/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    await prisma.inscription.deleteMany({ 
      where: { id: parseInt(req.params.id), tenantId } 
    });
    res.json({ message: 'Inscription supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;