const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware: authenticate } = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient();

// GET /api/paiements/mes-paiements - Paiements du client connecté
router.get('/mes-paiements', authenticate, async (req, res) => {
  try {
    const paiements = await prisma.paiement.findMany({
      where: { userId: req.user.userId },
      include: {
        inscription: {
          include: {
            campagne: { select: { title: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Formater les données pour le frontend
    const formatted = paiements.map(p => ({
      id: p.id,
      formation: p.inscription?.campagne?.title || 'Formation inconnue',
      date: p.createdAt ? new Date(p.createdAt).toLocaleDateString('fr-FR') : 'N/A',
      mode: p.mode || 'Carte',
      montant: p.montant || 0,
      total: p.montant || 0,
      status: p.status || 'en_attente',
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error('Erreur paiements:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/paiements/:id/facture - Télécharger facture
router.get('/:id/facture', authenticate, async (req, res) => {
  try {
    const paiement = await prisma.paiement.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { inscription: { include: { campagne: true } } }
    });
    
    if (!paiement) return res.status(404).json({ error: 'Paiement non trouvé' });
    
    // Placeholder: retourner JSON (en production, générer un vrai PDF)
    res.json({ 
      message: 'Facture générée',
      paiementId: paiement.id,
      montant: paiement.montant,
      date: paiement.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;