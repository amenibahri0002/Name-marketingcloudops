const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

const { authenticate } = require('../middleware/auth');
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
const DEFAULT_TENANT_ID = 'cmqlsn2yu0000ybn5t0unlx8u';
    const tenantId = req.tenantId || DEFAULT_TENANT_ID;

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
    console.error('[PUBLIC CAMPAGNES ERROR]', e);
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

    // Vérifier si c'est un CUID (string) ou un ancien ID numérique
    const isCuid = /^c[a-z0-9]{24}$/.test(idOrSlug);
    const isNumeric = /^\d+$/.test(idOrSlug);

    let campagne;
    if (isCuid) {
      // CUID = string direct
      campagne = await prisma.campagne.findFirst({
        where: { id: idOrSlug, tenantId },
        include: { 
          inscriptions: { 
            select: { id: true, name: true, email: true, phone: true, status: true, createdAt: true } 
          }
        },
      });
    } else if (isNumeric) {
      // Ancien ID numérique
      campagne = await prisma.campagne.findFirst({
        where: { id: idOrSlug, tenantId },
        include: { 
          inscriptions: { 
            select: { id: true, name: true, email: true, phone: true, status: true, createdAt: true } 
          }
        },
      });
    } else {
      // Slug
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
      date,
      duration,
      location,
      iconName,
      couleur,
      prerequis,
      tools,
      tags,
      inclus,
      isPublic,
      ...ignored
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
      tenantId: tenantId,
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
    const campagneId = req.params.id; // String (CUID)

    const existing = await prisma.campagne.findFirst({ 
      where: { id: campagneId, tenantId } 
    });

    if (!existing) return res.status(404).json({ message: 'Campagne introuvable' });

    let slug = existing.slug;
    if (req.body.title && req.body.title !== existing.title) {
      slug = await generateUniqueSlug(req.body.title, tenantId, campagneId);
    }

    const { date, duration, location, iconName, couleur, prerequis, tools, tags, inclus, isPublic, ...validData } = req.body;

    const campagne = await prisma.campagne.update({
      where: { id: campagneId },
      data: { ...validData, slug }
    });
    res.json(campagne);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ============================================
// DELETE /api/campagnes/:id - AVEC CASCADE MANUEL
// ============================================
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const campagneId = req.params.id; // String (CUID) - PAS Number() !

    console.log(`[DELETE] Tentative suppression campagne ${campagneId} (tenant: ${tenantId})`);

    // 1. Vérifier que la campagne existe et appartient au tenant
    const campagne = await prisma.campagne.findFirst({
      where: { id: campagneId, tenantId }
    });

    if (!campagne) {
      return res.status(404).json({ message: 'Campagne introuvable' });
    }

    console.log(`[DELETE] Campagne trouvée: ${campagne.title}`);

    // 2. Supprimer les relations en CASCADE manuel
    // 2.1 Supprimer les inscriptions liées
    try {
      const deletedInscriptions = await prisma.inscription.deleteMany({
        where: { campagneId }
      });
      console.log(`[DELETE] ${deletedInscriptions.count} inscriptions supprimées`);
    } catch (err) {
      console.log('[DELETE] Pas d\'inscriptions à supprimer:', err.message);
    }

    // 2.2 Supprimer les paiements liés
    try {
      const deletedPaiements = await prisma.paiement.deleteMany({
        where: { campagneId }
      });
      console.log(`[DELETE] ${deletedPaiements.count} paiements supprimés`);
    } catch (err) {
      console.log('[DELETE] Pas de paiements à supprimer:', err.message);
    }

    // 2.3 Supprimer les notifications liées
    try {
      const deletedNotifications = await prisma.notification.deleteMany({
        where: { campagneId }
      });
      console.log(`[DELETE] ${deletedNotifications.count} notifications supprimées`);
    } catch (err) {
      console.log('[DELETE] Pas de notifications à supprimer:', err.message);
    }

    // 2.4 Supprimer les feedbacks/avis liés
    try {
      const deletedFeedbacks = await prisma.feedback.deleteMany({
        where: { campagneId }
      });
      console.log(`[DELETE] ${deletedFeedbacks.count} feedbacks supprimés`);
    } catch (err) {
      console.log('[DELETE] Pas de feedbacks à supprimer:', err.message);
    }

    // 2.5 Supprimer les segments liés
    try {
      const deletedSegments = await prisma.segment.deleteMany({
        where: { campagneId }
      });
      console.log(`[DELETE] ${deletedSegments.count} segments supprimés`);
    } catch (err) {
      console.log('[DELETE] Pas de segments à supprimer:', err.message);
    }

    // 3. Supprimer la campagne
    await prisma.campagne.delete({
      where: { id: campagneId }
    });

    console.log(`[DELETE] ✅ Campagne ${campagneId} supprimée avec succès`);
    res.json({ message: 'Campagne supprimée avec succès' });

  } catch (e) { 
    console.error('[DELETE CAMPAGNE ERROR]', e);
    res.status(500).json({ message: e.message }); 
  }
});

// ============================================
// PUT /api/campagnes/:id/publish - PUBLIER
// ============================================
router.put('/:id/publish', authenticate, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const campagneId = req.params.id; // String (CUID) - PAS Number() !

    console.log(`[PUBLISH] Tentative publication campagne ${campagneId}`);

    // Vérifier que la campagne existe
    const existing = await prisma.campagne.findFirst({
      where: { id: campagneId, tenantId }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Campagne introuvable' });
    }

    // Utiliser update (pas updateMany) pour retourner l'objet
    const campagne = await prisma.campagne.update({
      where: { id: campagneId },
      data: { published: true, status: 'ACTIVE' }
    });

    console.log(`[PUBLISH] ✅ Campagne "${campagne.title}" publiée`);
    res.json({ 
      success: true,
      message: 'Campagne publiée avec succès',
      campagne 
    });

  } catch (e) { 
    console.error('[PUBLISH ERROR]', e);
    res.status(500).json({ message: e.message }); 
  }
});
// ============================================
// PUT /api/campagnes/:id/unpublish - DÉPUBLIER
// ============================================
router.put('/:id/unpublish', authenticate, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const campagneId = req.params.id; // String (CUID) - PAS Number() !

    console.log(`[UNPUBLISH] Tentative dépublication campagne ${campagneId}`);

    // Vérifier que la campagne existe
    const existing = await prisma.campagne.findFirst({
      where: { id: campagneId, tenantId }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Campagne introuvable' });
    }

    // Utiliser update (pas updateMany) pour retourner l'objet
    const campagne = await prisma.campagne.update({
      where: { id: campagneId },
      data: { published: false, status: 'PAUSED' }
    });

    console.log(`[UNPUBLISH] ✅ Campagne "${campagne.title}" dépubliée`);
    res.json({ 
      success: true,
      message: 'Campagne dépubliée avec succès',
      campagne 
    });

  } catch (e) { 
    console.error('[UNPUBLISH ERROR]', e);
    res.status(500).json({ message: e.message }); 
  }
});
module.exports = router;