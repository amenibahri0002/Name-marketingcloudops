const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// GET /api/inscriptions - Liste toutes les inscriptions
router.get('/', async (req, res) => {
  try {
    const inscriptions = await prisma.inscription.findMany({
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

// GET /api/inscriptions/mes-inscriptions - Pour le client connecté
router.get('/mes-inscriptions', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Non authentifié' });

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'techevent_secret_2026');

    const inscriptions = await prisma.inscription.findMany({
      where: { userId: decoded.userId },
      include: {
        campagne: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(inscriptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/inscriptions - Créer une inscription
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, campagneId, userId, formule, paymentType, prixTotal } = req.body;

    const inscription = await prisma.inscription.create({
      data: {
        name,
        email,
        phone,
        campagneId: parseInt(campagneId),
        userId: userId ? parseInt(userId) : null,
        formule: formule || 'standard',
        paymentType: paymentType || 'carte',
        prixTotal: prixTotal ? parseFloat(prixTotal) : null,
        status: 'en_attente'
      }
    });

    res.status(201).json(inscription);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ AJOUTER CETTE ROUTE :
// PATCH /api/inscriptions/:id/status - Changer le statut (Accepter/Refuser)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['en_attente', 'accepte', 'refuse', 'paye'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const inscription = await prisma.inscription.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    res.json({ success: true, inscription });

  } catch (err) {
    console.error('[INSCRIPTION STATUS ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/inscriptions/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.inscription.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Inscription supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;