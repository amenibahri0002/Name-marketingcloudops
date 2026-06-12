// routes/formations.js (Express)
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// GET /api/formations — Toutes les formations publiques
router.get('/', async (req, res) => {
  try {
    const formations = await prisma.campagne.findMany({
      where: { 
        type: 'FORMATION',
        status: 'ACTIVE',
        isPublic: true 
      },
      orderBy: { dateScheduled: 'asc' },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        image: true,
        duration: true,
        format: true,
        date: true,
        location: true,
        contact: true,
        prix: true,
        prixOriginal: true,
        placesTotal: true,
        placesRestantes: true,
        dureeHeures: true,
        iconName: true,
        couleur: true,
        prerequis: true,
        tools: true,
        tags: true,
        inclus: true,
      }
    });
    res.json(formations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/formations/:slug — Détail d'une formation
router.get('/:slug', async (req, res) => {
  try {
    const formation = await prisma.campagne.findUnique({
      where: { slug: req.params.slug },
      include: {
        inscriptions: {
          select: { id: true, name: true, email: true, createdAt: true }
        }
      }
    });

    if (!formation || formation.type !== 'FORMATION') {
      return res.status(404).json({ error: 'Formation non trouvée' });
    }

    res.json(formation);
  } catch (error) {
    console.error('Erreur détail formation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;