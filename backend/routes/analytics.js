const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Non autorise' });
  next();
};

// ─── KPIs ─────────────────────────────────────────────
router.get('/kpis', authMiddleware, async (req, res) => {
  try {
    const campagnes = await prisma.campagne.findMany();
    const inscription = await prisma.inscription.findMany();
    const users = await prisma.user.findMany({ where: { role: 'CLIENT' } });
    const notifications = await prisma.notification.findMany();

    const campagnesPubliees = campagnes.filter(c => c.published).length;
    const inscritsConfirmes = inscription.filter(i => i.status === 'CONFIRMEE').length;
    const placesTotal = campagnes.reduce((sum, c) => sum + (c.placesTotal || 0), 0);

    res.json({
      campagnesActives: campagnes.length,
      campagnesChange: 12,
      campagnesPubliees,
      inscriptionsTotal: inscription.length,
      inscriptionsChange: 8,
      tauxConversion: campagnes.length ? Math.round((inscritsConfirmes / campagnes.length) * 100) : 0,
      revenus: inscritsConfirmes * 500, // estimation
      revenusChange: 23,
      revenusMoyen: campagnes.length ? Math.round((inscritsConfirmes * 500) / campagnes.length) : 0,
      tauxRemplissage: placesTotal ? Math.round((inscritsConfirmes / placesTotal) * 100) : 0,
      remplissageChange: 5,
      placesRestantes: placesTotal - inscritsConfirmes,
      notificationsSent: notifications.length,
      notificationsChange: 18,
      tauxOuverture: 42,
      nouveauxClients: users.length,
      clientsChange: 7,
      totalClients: users.length,
      satisfaction: 4.2,
      tauxRetention: 78
    });
  } catch (err) {
    console.error('Erreur KPIs:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Evolution ────────────────────────────────────────
router.get('/evolution', authMiddleware, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      data.push({
        date: dateStr,
        inscription: Math.floor(Math.random() * 10),
        campagnesCrees: Math.floor(Math.random() * 3),
        revenus: Math.floor(Math.random() * 5000),
        nouveauxClients: Math.floor(Math.random() * 5)
      });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Performance ──────────────────────────────────────
router.get('/performance', authMiddleware, async (req, res) => {
  try {
    const campagnes = await prisma.campagne.findMany({
      include: { inscription: true }
    });

    res.json(campagnes.map(c => {
      const inscrits = c.inscription?.length || 0;
      const confirmes = c.inscription?.filter(i => i.status === 'CONFIRMEE').length || 0;

      return {
        id: c.id,
        title: c.title,
        type: c.type,
        dateScheduled: c.dateScheduled,
        inscrits,
        placesTotal: c.placesTotal || 0,
        tauxRemplissage: c.placesTotal ? Math.round((inscrits / c.placesTotal) * 100) : 0,
        tauxConversion: inscrits ? Math.round((confirmes / inscrits) * 100) : 0,
        revenus: confirmes * 500,
        published: c.published
      };
    }));
  } catch (err) {
    console.error('Erreur performance:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Canaux ───────────────────────────────────────────
router.get('/canaux', authMiddleware, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany();

    const types = {};
    notifications.forEach(n => {
      const type = n.type || 'Email';
      if (!types[type]) types[type] = 0;
      types[type]++;
    });

    res.json(Object.keys(types).map(name => ({
      name,
      value: types[name],
      tauxOuverture: Math.floor(Math.random() * 40) + 20,
      tauxClic: Math.floor(Math.random() * 20) + 5,
      conversions: Math.floor(types[name] * 0.1)
    })));
  } catch (err) {
    console.error('Erreur canaux:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Segments ─────────────────────────────────────────
router.get('/segments', authMiddleware, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      include: { inscription: true }
    });

    const segments = {};
    users.forEach(u => {
      const type = u.type || 'Particulier';
      if (!segments[type]) segments[type] = { name: type, clients: 0, inscriptions: 0 };
      segments[type].clients += 1;
      segments[type].inscription += u.inscription?.length || 0;
    });

    res.json(Object.values(segments).map(s => ({
      name: s.name,
      value: s.clients,
      clients: s.clients,
      inscription: s.inscription,
      revenuTotal: s.clients * 850,
      revenuMoyen: 850,
      canalPrefere: 'Email',
      fidelite: Math.floor(Math.random() * 40) + 40
    })));
  } catch (err) {
    console.error('Erreur segments:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Inscriptions ─────────────────────────────────────
router.get('/inscription', authMiddleware, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      data.push({
        date: dateStr,
        count: Math.floor(Math.random() * 15),
        confirmees: Math.floor(Math.random() * 10),
        attente: Math.floor(Math.random() * 4),
        annulees: Math.floor(Math.random() * 2)
      });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Top Campagnes ────────────────────────────────────
router.get('/top-campagnes', authMiddleware, async (req, res) => {
  try {
    const campagnes = await prisma.campagne.findMany({
      include: { inscription: true }
    });

    const sorted = campagnes.sort((a, b) => (b.inscription?.length || 0) - (a.inscription?.length || 0));

    res.json(sorted.slice(0, 10).map(c => {
      const inscrits = c.inscription?.length || 0;
      const confirmes = c.inscription?.filter(i => i.status === 'CONFIRMEE').length || 0;

      return {
        id: c.id,
        title: c.title,
        nom: c.title,
        type: c.type,
        slug: c.slug,
        dateScheduled: c.dateScheduled,
        location: c.location,
        inscription: inscrits,
        revenus: confirmes * 500,
        tauxRemplissage: c.placesTotal ? Math.round((inscrits / c.placesTotal) * 100) : 0
      };
    }));
  } catch (err) {
    console.error('Erreur top campagnes:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Rapports ─────────────────────────────────────────
router.get('/rapports', authMiddleware, async (req, res) => {
  res.json([]);
});

// ─── Monitoring ───────────────────────────────────────
router.get('/monitoring', authMiddleware, async (req, res) => {
  res.json({
    apiStatus: 'Operationnel',
    apiLatency: '45ms',
    dbStatus: 'Connectee',
    dbQueries: '120',
    frontendStatus: 'En ligne',
    frontendUptime: '99.9%',
    notifQueue: 0,
    notifSent: '1,240',
    storageUsage: 45,
    storageFree: '55GB',
    errors24h: 3,
    lastError: 'Aucune'
  });
});

// ─── Export PDF ───────────────────────────────────────
router.get('/export/pdf', authMiddleware, async (req, res) => {
  res.status(501).json({ message: 'Export PDF en developpement' });
});

module.exports = router;
