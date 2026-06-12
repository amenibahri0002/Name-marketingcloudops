const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware: authenticate } = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient();

// GET /api/certificats/mes-certificats - Certificats du client connecté
router.get('/mes-certificats', authenticate, async (req, res) => {
  try {
    // Récupérer les inscriptions terminées de l'utilisateur
    const inscriptions = await prisma.inscription.findMany({
      where: { 
        userId: req.user.userId,
        status: 'terminee'
      },
      include: {
        campagne: true
      }
    });

    // Formater comme certificats
    const certificats = inscriptions.map((ins, index) => ({
      id: ins.id,
      formation: ins.campagne?.title || 'Formation',
      formateur: 'DigiLab Solutions',
      numero: `CERT-${String(ins.id).padStart(4, '0')}`,
      date: ins.updatedAt ? new Date(ins.updatedAt).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR'),
      duree: `${ins.campagne?.dureeHeures || 40}h`,
      status: 'disponible',
    }));

    res.json(certificats);
  } catch (error) {
    console.error('Erreur certificats:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/certificats/:id/download - Télécharger certificat (placeholder)
router.get('/:id/download', authenticate, async (req, res) => {
  try {
    const inscription = await prisma.inscription.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { campagne: true }
    });

    if (!inscription) return res.status(404).json({ error: 'Certificat non trouvé' });

    res.json({
      message: 'Certificat généré',
      certificatId: req.params.id,
      formation: inscription.campagne?.title,
      date: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;