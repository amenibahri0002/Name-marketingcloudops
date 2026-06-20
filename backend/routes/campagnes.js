const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

const { authenticate } = require('../middleware/auth');
const { sendCampagneNotification } = require('../services/emailService');
const notificationService = require('../services/notificationService');

function generateSlug(title) {
  return title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').substring(0, 50);
}

async function generateUniqueSlug(title, tenantId, excludeId = null) {
  let slug = generateSlug(title);
  let counter = 1;
  let uniqueSlug = slug;
  while (true) {
    const existing = await prisma.campagne.findUnique({ 
      where: { tenantId_slug: { tenantId, slug: uniqueSlug } } 
    });
    if (!existing || existing.id === excludeId) break;
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
  return uniqueSlug;
}

// ============================================
// GET /api/campagnes/public - Campagnes publiques
// ============================================
router.get('/public', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const campagnes = await prisma.campagne.findMany({
      where: { 
        tenantId,
        published: true, 
        status: 'ACTIVE' 
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(campagnes);
  } catch (e) { 
    res.status(500).json({ message: e.message }); 
  }
});

// ============================================
// GET /api/campagnes - Liste avec compteurs
// ============================================
router.get('/', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const campagnes = await prisma.campagne.findMany({
      where: { tenantId },
      include: {
        inscriptions: {
          select: {
            id: true,
            status: true,
            prixTotal: true,
            userId: true,
            name: true,
            email: true,
            createdAt: true
          }
        },
        _count: {
          select: { inscriptions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = campagnes.map(c => ({
      ...c,
      inscriptionsCount: c._count.inscriptions,
      inscriptionsPayees: c.inscriptions.filter(i => i.status === 'PAYEE').length,
      inscriptionsEnAttente: c.inscriptions.filter(i => i.status === 'EN_ATTENTE').length,
      revenusTotal: c.inscriptions.reduce((sum, i) => sum + (i.prixTotal || 0), 0),
      inscriptions: c.inscriptions
    }));

    res.json(formatted);
  } catch (e) { 
    console.error('[CAMPAGNES ERROR]', e);
    res.status(500).json({ message: e.message }); 
  }
});

// ============================================
// GET /api/campagnes/:idOrSlug - Détail
// ============================================
router.get('/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const tenantId = req.tenantId;
    const isNumeric = /^\d+$/.test(idOrSlug);

    let campagne;
    if (isNumeric) {
      campagne = await prisma.campagne.findFirst({
        where: { id: Number(idOrSlug), tenantId },
        include: { 
          inscriptions: { 
            select: { id: true, name: true, email: true, phone: true, status: true, createdAt: true } 
          }
        },
      });
    } else {
      campagne = await prisma.campagne.findUnique({
        where: { tenantId_slug: { tenantId, slug: idOrSlug } },
        include: { 
          inscriptions: { 
            select: { id: true, name: true, email: true, phone: true, status: true, createdAt: true } 
          }
        },
      });
    }

    if (!campagne) return res.status(404).json({ message: 'Campagne introuvable' });
    res.json(campagne);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ============================================
// POST /api/campagnes - Créer
// ============================================
router.post('/', authenticate, async (req, res) => {
  try {
    const tenantId = req.tenantId;

    // Extraire SEULEMENT les champs valides du schéma Prisma
    const {
      title,
      description,
      prix,
      prixOriginal,
      placesTotal,
      dateDebut,
      dateAffichee,
      duree,
      dureeHeures,
      format,
      lieu,
      contact,
      type,
      image,
      published,
      status,
      // Ignorer tous les autres champs envoyés par le frontend
      date,        // ← ignoré
      duration,    // ← ignoré
      location,    // ← ignoré
      iconName,    // ← ignoré
      couleur,     // ← ignoré
      prerequis,   // ← ignoré
      tools,       // ← ignoré
      tags,        // ← ignoré
      inclus,      // ← ignoré
      isPublic,    // ← ignoré
      ...ignored   // ← tout le reste est ignoré
    } = req.body;

    const slug = await generateUniqueSlug(title, tenantId);

    const campagne = await prisma.campagne.create({
      data: {
        title,
        slug,
        description,
        prix: prix ? parseInt(prix) : null,
        prixOriginal: prixOriginal ? parseInt(prixOriginal) : (prix ? parseInt(prix) : null),
        placesTotal: placesTotal ? parseInt(placesTotal) : 20,
        placesRestantes: placesTotal ? parseInt(placesTotal) : 20,
        dateScheduled: dateDebut ? new Date(dateDebut) : null,
        dateAffichee,
        duree,
        dureeHeures: dureeHeures ? parseInt(dureeHeures) : null,
        format,
        lieu,
        contact,
        type: type || 'FORMATION',
        image: image || null,
        published: published !== undefined ? published : true,
        status: status || 'ACTIVE',
        tenantId,
        // PAS de ...rest ici !
      }
    });

    // NOTIFIER LES CLIENTS (async, ne bloque pas la réponse)
    notificationService.notifyNewCampagne({
      id: campagne.id,
      title: campagne.title,
      description: campagne.description,
      prix: campagne.prix,
      dateScheduled: campagne.dateScheduled,
      lieu: campagne.lieu,
      slug: campagne.slug,
      tenantId: tenantId, // <-- AJOUTÉ
    }).catch(err => console.error('[NOTIFY CAMPAGNE ERROR]', err));

    res.status(201).json({
      message: 'Campagne créée avec succès !',
      campagne
    });

  } catch (e) { 
    console.error('[CAMPAGNE CREATE ERROR]', e);
    res.status(500).json({ message: e.message }); 
  }
});

// ============================================
// PUT /api/campagnes/:id - Modifier
// ============================================
router.put('/:id', authenticate, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const existing = await prisma.campagne.findFirst({ 
      where: { id: Number(req.params.id), tenantId } 
    });

    if (!existing) return res.status(404).json({ message: 'Campagne introuvable' });

    let slug = existing.slug;
    if (req.body.title && req.body.title !== existing.title) {
      slug = await generateUniqueSlug(req.body.title, tenantId, Number(req.params.id));
    }

    // Filtrer les champs invalides pour l'update aussi
    const { date, duration, location, iconName, couleur, prerequis, tools, tags, inclus, isPublic, ...validData } = req.body;

    const campagne = await prisma.campagne.update({
      where: { id: Number(req.params.id) },
      data: { ...validData, slug }
    });
    res.json(campagne);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ============================================
// DELETE /api/campagnes/:id
// ============================================
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    await prisma.campagne.deleteMany({ 
      where: { id: Number(req.params.id), tenantId } 
    });
    res.json({ message: 'Campagne supprimée' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ============================================
// PUT /api/campagnes/:id/publish
// ============================================
router.put('/:id/publish', authenticate, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const campagne = await prisma.campagne.updateMany({
      where: { id: Number(req.params.id), tenantId },
      data: { published: true, status: 'ACTIVE' }
    });
    res.json({ message: 'Campagne publiée', campagne });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ============================================
// PUT /api/campagnes/:id/unpublish
// ============================================
router.put('/:id/unpublish', authenticate, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const campagne = await prisma.campagne.updateMany({
      where: { id: Number(req.params.id), tenantId },
      data: { published: false, status: 'PAUSED' }
    });
    res.json({ message: 'Campagne dépubliée', campagne });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;