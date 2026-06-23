const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Niveaux valides (minuscules pour le frontend, majuscules pour Prisma enum)
const NIVEAUX_VALIDES = ['debutant', 'etudiant', 'professionnel'];
const NIVEAU_MAP = {
  debutant: 'DEBUTANT',
  etudiant: 'ETUDIANT',
  professionnel: 'PROFESSIONNEL',
};

// Helper pour obtenir tenantId depuis la requête
const getTenantId = (req) => req.tenantId || req.headers['x-tenant-id'] || null;

// ═══════════════════════════════════════════════════════════════
// GET /api/segments — liste tous les segments du tenant
// ═══════════════════════════════════════════════════════════════
router.get('/', async function(req, res) {
  try {
    const tenantId = getTenantId(req);
    if (!tenantId) return res.status(403).json({ error: 'Tenant manquant' });

    const segments = await prisma.segment.findMany({
      where: { tenantId: tenantId },
      include: {
        contacts: {
          include: { contact: { select: { id: true, name: true, email: true, phone: true, niveau: true } } }
        },
        _count: { select: { contacts: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(segments);
  } catch (err) {
    console.error('Erreur GET /segments:', err);
    if (err.message?.includes('Unknown table') || err.message?.includes('does not exist') || err.code === 'P2021') {
      return res.json([]);
    }
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// GET /api/segments/stats/niveaux — stats par niveau
// ═══════════════════════════════════════════════════════════════
router.get('/stats/niveaux', async function(req, res) {
  try {
    const tenantId = getTenantId(req);
    if (!tenantId) return res.status(403).json({ error: 'Tenant manquant' });

    const stats = {};
    for (const [key, prismaVal] of Object.entries(NIVEAU_MAP)) {
      const count = await prisma.contact.count({
        where: { tenantId: tenantId, niveau: prismaVal }
      });
      stats[key] = count;
    }
    res.json(stats);
  } catch (err) {
    console.error('Erreur stats niveaux:', err);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// GET /api/segments/niveau/:niveau — contacts d'un niveau
// CORRECTION: retirer 'taille' qui n'existe pas dans le modèle Contact
// ═══════════════════════════════════════════════════════════════
router.get('/niveau/:niveau', async function(req, res) {
  try {
    const tenantId = getTenantId(req);
    if (!tenantId) return res.status(403).json({ error: 'Tenant manquant' });

    const niveauParam = req.params.niveau;

    if (!NIVEAUX_VALIDES.includes(niveauParam)) {
      return res.status(400).json({ error: 'Niveau invalide. Valeurs: debutant, etudiant, professionnel' });
    }

    const prismaNiveau = NIVEAU_MAP[niveauParam];

    const contacts = await prisma.contact.findMany({
      where: {
        tenantId: tenantId,
        niveau: prismaNiveau,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        niveau: true,
        secteur: true,
        region: true,
        type: true,
        createdAt: true,
      }
    });

    res.json(contacts);
  } catch (err) {
    console.error('Erreur GET /segments/niveau/:niveau:', err);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /api/segments — créer un segment + ajouter les contacts
// ═══════════════════════════════════════════════════════════════
router.post('/', async function(req, res) {
  try {
    const tenantId = getTenantId(req);
    if (!tenantId) return res.status(403).json({ error: 'Tenant manquant' });

    const { name, niveau, criteria, campagneIds, contactIds } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nom du segment requis' });
    }

    if (niveau && !NIVEAUX_VALIDES.includes(niveau)) {
      return res.status(400).json({ error: 'Niveau invalide' });
    }

    let segment;
    try {
      segment = await prisma.$transaction(async (tx) => {
        const newSegment = await tx.segment.create({
          data: {
            name: name.trim(),
            niveau: niveau || null,
            criteria: criteria || {},
            campagneIds: campagneIds || [],
            tenantId: tenantId,
          }
        });

        if (contactIds && contactIds.length > 0) {
          await tx.contactSegment.createMany({
            data: contactIds.map(contactId => ({
              segmentId: newSegment.id,
              contactId: contactId,
              niveau: niveau || null,
            })),
            skipDuplicates: true,
          });
        }

        return await tx.segment.findUnique({
          where: { id: newSegment.id },
          include: {
            contacts: {
              include: { contact: { select: { id: true, name: true, email: true, phone: true, niveau: true } } }
            },
            _count: { select: { contacts: true } }
          }
        });
      });
    } catch (prismaErr) {
      console.error('Prisma segment error:', prismaErr);
      if (prismaErr.message?.includes('Unknown table') || prismaErr.message?.includes('does not exist') || prismaErr.code === 'P2021') {
        return res.json({
          id: 'mock-' + Date.now(),
          name: name.trim(),
          niveau: niveau || null,
          criteria: criteria || {},
          campagneIds: campagneIds || [],
          tenantId: tenantId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          mock: true,
          contacts: (contactIds || []).map(id => ({ contactId: id, contact: { id, name: 'Client ' + id.slice(0,4) } })),
          _count: { contacts: (contactIds || []).length }
        });
      }
      throw prismaErr;
    }

    res.status(201).json(segment);
  } catch (err) {
    console.error('Erreur POST /segments:', err);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// PUT /api/segments/:id — modifier un segment + mettre à jour contacts
// ═══════════════════════════════════════════════════════════════
router.put('/:id', async function(req, res) {
  try {
    const tenantId = getTenantId(req);
    if (!tenantId) return res.status(403).json({ error: 'Tenant manquant' });

    const { name, niveau, criteria, campagneIds, contactIds } = req.body;

    if (niveau && !NIVEAUX_VALIDES.includes(niveau)) {
      return res.status(400).json({ error: 'Niveau invalide' });
    }

    const segment = await prisma.$transaction(async (tx) => {
      const updated = await tx.segment.update({
        where: { id: req.params.id, tenantId: tenantId },
        data: {
          name: name?.trim(),
          niveau: niveau || undefined,
          criteria: criteria || undefined,
          campagneIds: campagneIds || undefined,
        }
      });

      if (contactIds !== undefined) {
        await tx.contactSegment.deleteMany({
          where: { segmentId: req.params.id }
        });
        if (contactIds.length > 0) {
          await tx.contactSegment.createMany({
            data: contactIds.map(contactId => ({
              segmentId: req.params.id,
              contactId: contactId,
              niveau: niveau || null,
            })),
            skipDuplicates: true,
          });
        }
      }

      return await tx.segment.findUnique({
        where: { id: req.params.id },
        include: {
          contacts: {
            include: { contact: { select: { id: true, name: true, email: true, phone: true, niveau: true } } }
          },
          _count: { select: { contacts: true } }
        }
      });
    });

    res.json(segment);
  } catch (err) {
    console.error('Erreur PUT /segments/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// DELETE /api/segments/:id — supprimer un segment
// ═══════════════════════════════════════════════════════════════
router.delete('/:id', async function(req, res) {
  try {
    const tenantId = getTenantId(req);
    if (!tenantId) return res.status(403).json({ error: 'Tenant manquant' });

    await prisma.segment.delete({
      where: { id: req.params.id, tenantId: tenantId }
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Erreur DELETE /segments/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /api/segments/:id/contacts — ajouter un contact au segment
// ═══════════════════════════════════════════════════════════════
router.post('/:id/contacts', async function(req, res) {
  try {
    const tenantId = getTenantId(req);
    if (!tenantId) return res.status(403).json({ error: 'Tenant manquant' });

    const { contactId, niveau } = req.body;

    const link = await prisma.contactSegment.create({
      data: {
        segmentId: req.params.id,
        contactId,
        niveau: niveau || null,
      }
    });

    res.status(201).json(link);
  } catch (err) {
    console.error('Erreur POST /segments/:id/contacts:', err);
    res.status(500).json({ error: err.message });
  }
});

console.log('[segments.js] Router exporte avec succes');
module.exports = router;