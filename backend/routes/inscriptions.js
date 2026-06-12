
// ============================================================
// BACKEND - routes/inscriptions.js (COMPLET)
// ============================================================

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware: authenticate } = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient();

// POST /api/inscriptions - Inscription publique avec formule et paiement
router.post('/', async (req, res) => {
  try {
    const { 
      name, email, phone, entreprise, notes,
      formule, paymentType, prixTotal,
      campagneId 
    } = req.body;

    // Validation
    if (!name || !email || !phone || !campagneId) {
      return res.status(400).json({ error: 'Nom, email, téléphone et campagne requis' });
    }

    // Vérifier si déjà inscrit
    const existing = await prisma.inscription.findFirst({
      where: { email, campagneId: parseInt(campagneId) }
    });
    if (existing) {
      return res.status(400).json({ error: 'Vous êtes déjà inscrit à cette formation' });
    }

    // Vérifier la campagne
    const campagne = await prisma.campagne.findUnique({
      where: { id: parseInt(campagneId) }
    });
    if (!campagne) {
      return res.status(404).json({ error: 'Formation non trouvée' });
    }
    if (campagne.placesRestantes <= 0) {
      return res.status(400).json({ error: 'Plus de places disponibles' });
    }

    // Décrémenter places
    await prisma.campagne.update({
      where: { id: parseInt(campagneId) },
      data: { placesRestantes: { decrement: 1 } }
    });

    // Créer l'inscription avec tous les nouveaux champs
    const inscription = await prisma.inscription.create({
      data: {
        name,
        email,
        phone,
        entreprise: entreprise || null,
        notes: notes || null,
        formule: formule || 'standard',
        paymentType: paymentType || 'carte',
        prixTotal: prixTotal ? parseInt(prixTotal) : null,
        campagneId: parseInt(campagneId),
        userId: null,
        status: paymentType === 'carte' ? 'paye' : 'en_attente'
      },
      include: { campagne: true }
    });

    // Créer un paiement associé
    if (prixTotal) {
      await prisma.paiement.create({
        data: {
          inscriptionId: inscription.id,
          montant: parseInt(prixTotal),
          mode: paymentType || 'carte',
          status: paymentType === 'carte' ? 'paye' : 'en_attente',
          reference: `INV-${Date.now()}-${inscription.id}`
        }
      });
    }

    res.status(201).json({
      message: 'Inscription réussie !',
      inscription,
      needAccount: true
    });

  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/inscriptions/mes-inscriptions - Inscriptions du client connecté
router.get('/mes-inscriptions', authenticate, async (req, res) => {
  try {
    const inscriptions = await prisma.inscription.findMany({
      where: { userId: req.user.userId },
      include: {
        campagne: true,
        paiements: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(inscriptions);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/inscriptions/link - Lier inscription à compte
router.post('/link', authenticate, async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user.userId;

    const updated = await prisma.inscription.updateMany({
      where: { email },
      data: { userId }
    });

    res.json({
      message: `${updated.count} inscription(s) liée(s)`,
      updated
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
// GET /api/inscriptions - Liste toutes les inscriptions (pour le comptage)
router.get('/', async (req, res) => {
  try {
    const inscriptions = await prisma.inscription.findMany({
      include: { campagne: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(inscriptions);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;