// routes/all.js - Route pour récupérer TOUTES les données
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// GET /api/all - Toutes les données de la plateforme
router.get('/', async (req, res) => {
  try {
    const [users, clients, formations, contacts, segments, inscriptions] = await Promise.all([
      prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, clientId: true } }),
      prisma.client.findMany(),
      prisma.campagne.findMany({ where: { type: 'FORMATION' } }),
      prisma.contact.findMany(),
      prisma.segment.findMany({ include: { contacts: true } }),
      prisma.inscription.findMany({ include: { campagne: { select: { title: true } } } })
    ]);

    res.json({
      users,
      clients,
      formations,
      contacts,
      segments,
      inscriptions,
      total: {
        users: users.length,
        clients: clients.length,
        formations: formations.length,
        contacts: contacts.length,
        inscriptions: inscriptions.length
      }
    });
  } catch (error) {
    console.error('Erreur /api/all:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;