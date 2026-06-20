const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/stats/overview - Vue d'ensemble
router.get('/overview', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    const [
      totalCampagnes,
      totalInscriptions,
      totalClients,
      totalRevenus,
      totalNotifications,
      campagnesActives
    ] = await Promise.all([
      prisma.campagne.count({ where: { tenantId } }),
      prisma.inscription.count({ where: { tenantId } }),
      prisma.client.count({ where: { tenantId } }),
      prisma.paiement.aggregate({
        where: { tenantId, status: 'paye' },
        _sum: { montant: true }
      }),
      prisma.notification.count({ where: { tenantId } }),
      prisma.campagne.count({ where: { tenantId, status: 'ACTIVE' } })
    ]);

    res.json({
      totalCampagnes,
      totalInscriptions,
      totalClients,
      totalRevenus: totalRevenus._sum.montant || 0,
      totalNotifications,
      campagnesActives,
      tauxConversion: totalCampagnes > 0 ? Math.round((totalInscriptions / totalCampagnes) * 100) : 0
    });
  } catch (err) {
    console.error('[STATS OVERVIEW ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stats/performance - Performance par période
router.get('/performance', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { periode = '30j' } = req.query;
    
    const now = new Date();
    let dateDebut = new Date();
    
    switch(periode) {
      case '7j': dateDebut.setDate(now.getDate() - 7); break;
      case '30j': dateDebut.setDate(now.getDate() - 30); break;
      case '90j': dateDebut.setDate(now.getDate() - 90); break;
      case '1an': dateDebut.setFullYear(now.getFullYear() - 1); break;
      default: dateDebut.setDate(now.getDate() - 30);
    }

    const inscriptions = await prisma.inscription.findMany({
      where: {
        tenantId,
        createdAt: { gte: dateDebut }
      },
      include: { campagne: { select: { title: true } } },
      orderBy: { createdAt: 'asc' }
    });

    // Grouper par jour
    const parJour = {};
    inscriptions.forEach(i => {
      const date = i.createdAt.toISOString().split('T')[0];
      if (!parJour[date]) parJour[date] = { inscriptions: 0, revenus: 0 };
      parJour[date].inscriptions++;
      parJour[date].revenus += i.prixTotal || 0;
    });

    const data = Object.entries(parJour).map(([date, values]) => ({
      date,
      ...values
    }));

    res.json({ data, periode });
  } catch (err) {
    console.error('[STATS PERFORMANCE ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stats/canaux - Canaux de communication
router.get('/canaux', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    const [emails, sms, notifications] = await Promise.all([
      prisma.emailLog.count({ where: { tenantId } }),
      prisma.smsLog.count({ where: { tenantId } }),
      prisma.notification.count({ where: { tenantId } })
    ]);

    res.json({
      canaux: [
        { nom: 'Email', count: emails, color: '#3b82f6' },
        { nom: 'SMS', count: sms, color: '#10b981' },
        { nom: 'Push', count: notifications, color: '#f59e0b' }
      ]
    });
  } catch (err) {
    console.error('[STATS CANAUX ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stats/segments - Stats des segments
router.get('/segments', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    const segments = await prisma.segment.findMany({
      where: { tenantId },
      include: { _count: { select: { contacts: true } } }
    });

    const data = segments.map(s => ({
      nom: s.name,
      contacts: s._count.contacts,
      criteria: s.criteria
    }));

    res.json({ data });
  } catch (err) {
    console.error('[STATS SEGMENTS ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stats/inscriptions - Stats des inscriptions
router.get('/inscriptions', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    const inscriptions = await prisma.inscription.findMany({
      where: { tenantId },
      include: { campagne: { select: { title: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const parStatut = {
      en_attente: inscriptions.filter(i => i.status === 'en_attente').length,
      paye: inscriptions.filter(i => i.status === 'paye').length,
      confirme: inscriptions.filter(i => i.status === 'confirme').length,
      annule: inscriptions.filter(i => i.status === 'annule').length
    };

    res.json({ inscriptions, parStatut });
  } catch (err) {
    console.error('[STATS INSCRIPTIONS ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stats/top-campagnes - Top campagnes
router.get('/top-campagnes', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    const campagnes = await prisma.campagne.findMany({
      where: { tenantId },
      include: {
        inscriptions: { select: { id: true, prixTotal: true } }
      }
    });

    const topCampagnes = campagnes
      .map(c => ({
        id: c.id,
        title: c.title,
        inscriptions: c.inscriptions.length,
        revenus: c.inscriptions.reduce((sum, i) => sum + (i.prixTotal || 0), 0),
        image: c.image
      }))
      .sort((a, b) => b.inscriptions - a.inscriptions)
      .slice(0, 5);

    res.json({ topCampagnes });
  } catch (err) {
    console.error('[STATS TOP ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;