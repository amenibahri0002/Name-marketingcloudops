const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/kpis - Vue d'ensemble (pour compatibilité)
router.get('/', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    const [
      totalCampagnes,
      totalInscriptions,
      totalClients,
      totalRevenus,
      campagnesActives
    ] = await Promise.all([
      prisma.campagne.count({ where: { tenantId } }),
      prisma.inscription.count({ where: { tenantId } }),
      prisma.client.count({ where: { tenantId } }),
      prisma.paiement.aggregate({
        where: { tenantId, status: 'PAYE' },
        _sum: { montant: true }
      }),
      prisma.campagne.count({ where: { tenantId, status: 'ACTIVE' } })
    ]);

    res.json({
      campagnesActives,
      campagnesChange: 12,
      inscriptionsTotal: totalInscriptions,
      inscriptionsChange: 8,
      revenus: totalRevenus._sum.montant || 0,
      revenusChange: 15,
      tauxConversion: totalCampagnes > 0 ? Math.round((totalInscriptions / totalCampagnes) * 100) : 0,
      nouveauxClients: totalClients,
      clientsChange: 5,
      satisfaction: 4.5
    });
  } catch (err) {
    console.error('[KPIS ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/kpis/evolution - Évolution par période
router.get('/evolution', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const days = parseInt(req.query.days) || 30;
    
    const now = new Date();
    const dateDebut = new Date();
    dateDebut.setDate(now.getDate() - days);

    const inscriptions = await prisma.inscription.findMany({
      where: {
        tenantId,
        createdAt: { gte: dateDebut }
      },
      orderBy: { createdAt: 'asc' }
    });

    const parJour = {};
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      parJour[dateStr] = { date: dateStr, inscriptions: 0, revenus: 0 };
    }

    inscriptions.forEach(i => {
      const dateStr = i.createdAt.toISOString().split('T')[0];
      if (parJour[dateStr]) {
        parJour[dateStr].inscriptions++;
        parJour[dateStr].revenus += i.prixTotal || 0;
      }
    });

    const data = Object.values(parJour).sort((a, b) => a.date.localeCompare(b.date));
    res.json(data);
  } catch (err) {
    console.error('[KPIS EVOLUTION ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/kpis/performance - Performance des campagnes
router.get('/performance', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    const campagnes = await prisma.campagne.findMany({
      where: { tenantId },
      include: {
        inscriptions: { select: { id: true, prixTotal: true, status: true } }
      }
    });

    const data = campagnes.map(c => {
      const inscrits = c.inscriptions.length;
      const placesTotal = c.placesTotal || 20;
      const revenus = c.inscriptions.reduce((sum, i) => sum + (i.prixTotal || 0), 0);
      
      return {
        id: c.id,
        title: c.title,
        type: c.type,
        inscrits,
        placesTotal,
        tauxRemplissage: Math.round((inscrits / placesTotal) * 100),
        tauxConversion: Math.round((inscrits / (c.placesRestantes || 1)) * 100),
        revenus
      };
    });

    res.json(data);
  } catch (err) {
    console.error('[KPIS PERFORMANCE ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/kpis/canaux - Canaux de communication
router.get('/canaux', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    res.json([
      { name: 'Email', value: 0, tauxOuverture: 0, tauxClic: 0, conversions: 0 },
      { name: 'SMS', value: 0, tauxOuverture: 0, tauxClic: 0, conversions: 0 },
      { name: 'Push', value: 0, tauxOuverture: 0, tauxClic: 0, conversions: 0 }
    ]);
  } catch (err) {
    console.error('[KPIS CANAUX ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/kpis/segments - Segments clients
router.get('/segments', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    const segments = await prisma.segment.findMany({
      where: { tenantId },
      include: { _count: { select: { contacts: true } } }
    });

    const data = segments.map(s => ({
      name: s.name,
      value: s._count.contacts,
      clients: s._count.contacts,
      inscription: 0,
      revenuTotal: 0,
      revenuMoyen: 0,
      fidelite: 0,
      canalPrefere: 'Email'
    }));

    res.json(data);
  } catch (err) {
    console.error('[KPIS SEGMENTS ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/kpis/inscriptions - Inscriptions
router.get('/inscriptions', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const days = parseInt(req.query.days) || 30;
    
    const now = new Date();
    const dateDebut = new Date();
    dateDebut.setDate(now.getDate() - days);

    const inscriptions = await prisma.inscription.findMany({
      where: {
        tenantId,
        createdAt: { gte: dateDebut }
      }
    });

    const parJour = {};
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      parJour[dateStr] = { date: dateStr, count: 0, confirmees: 0, attente: 0, annulees: 0 };
    }

    inscriptions.forEach(i => {
      const dateStr = i.createdAt.toISOString().split('T')[0];
      if (parJour[dateStr]) {
        parJour[dateStr].count++;
        if (i.status === 'paye') parJour[dateStr].confirmees++;
        else if (i.status === 'en_attente') parJour[dateStr].attente++;
        else if (i.status === 'annule') parJour[dateStr].annulees++;
      }
    });

    const data = Object.values(parJour).sort((a, b) => a.date.localeCompare(b.date));
    res.json(data);
  } catch (err) {
    console.error('[KPIS INSCRIPTIONS ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/kpis/top-campagnes - Top campagnes
router.get('/top-campagnes', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    const campagnes = await prisma.campagne.findMany({
      where: { tenantId },
      include: {
        inscriptions: { select: { id: true, prixTotal: true } }
      }
    });

    const data = campagnes
      .map(c => ({
        id: c.id,
        nom: c.title,
        title: c.title,
        type: c.type,
        location: c.lieu || 'Sfax',
        inscription: c.inscriptions.length,
        tauxRemplissage: Math.round((c.inscriptions.length / (c.placesTotal || 1)) * 100),
        revenus: c.inscriptions.reduce((sum, i) => sum + (i.prixTotal || 0), 0)
      }))
      .sort((a, b) => b.inscription - a.inscription)
      .slice(0, 10);

    res.json(data);
  } catch (err) {
    console.error('[KPIS TOP ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;