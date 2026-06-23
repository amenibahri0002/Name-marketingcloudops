const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

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
// GET /api/campagnes/:idOrSlug - Detail
// ============================================
router.get('/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const tenantId = req.tenantId;

    const isCuid = /^c[a-z0-9]{24}$/.test(idOrSlug);
    const isNumeric = /^\d+$/.test(idOrSlug);

    let campagne;
    if (isCuid || isNumeric) {
      campagne = await prisma.campagne.findFirst({
        where: { id: idOrSlug, tenantId },
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
// POST /api/campagnes - Creer
// ============================================
router.post('/', async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const {
      title, description, prix, prixOriginal, placesTotal,
      dateDebut, dateAffichee, duree, dureeHeures, format,
      lieu, contact, type, image, published, status,
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
      message: 'Campagne creee avec succes !',
      campagne
    });

  } catch (e) { 
    console.error('[CAMPAGNE CREATE ERROR]', e);
    res.status(500).json({ message: e.message }); 
  }
});

// ============================================
// PUT /api/campagnes/:id/publish - PUBLIER (specifique avant generique)
// ============================================
router.put('/:id/publish', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const campagneId = req.params.id;

    const existing = await prisma.campagne.findFirst({
      where: { id: campagneId, tenantId }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Campagne introuvable' });
    }

    const campagne = await prisma.campagne.update({
      where: { id: campagneId },
      data: { published: true, status: 'ACTIVE' }
    });

    res.json({ 
      success: true,
      message: 'Campagne publiee avec succes',
      campagne 
    });

  } catch (e) { 
    console.error('[PUBLISH ERROR]', e);
    res.status(500).json({ message: e.message }); 
  }
});

// ============================================
// PUT /api/campagnes/:id/unpublish - DEPUBLIER (specifique avant generique)
// ============================================
router.put('/:id/unpublish', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const campagneId = req.params.id;

    const existing = await prisma.campagne.findFirst({
      where: { id: campagneId, tenantId }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Campagne introuvable' });
    }

    const campagne = await prisma.campagne.update({
      where: { id: campagneId },
      data: { published: false, status: 'PAUSED' }
    });

    res.json({ 
      success: true,
      message: 'Campagne depubliee avec succes',
      campagne 
    });

  } catch (e) { 
    console.error('[UNPUBLISH ERROR]', e);
    res.status(500).json({ message: e.message }); 
  }
});

// ============================================
// PUT /api/campagnes/:id - Modifier (generique en DERNIER)
// ============================================
router.put('/:id', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const campagneId = req.params.id;

    console.log(`[PUT CAMPAGNE] ID: ${campagneId}, Tenant: ${tenantId}`);
    console.log(`[PUT CAMPAGNE] Body:`, JSON.stringify(req.body, null, 2));

    const existing = await prisma.campagne.findFirst({ 
      where: { id: campagneId, tenantId } 
    });

    if (!existing) {
      console.log(`[PUT CAMPAGNE] Campagne non trouvee: ${campagneId}`);
      return res.status(404).json({ message: 'Campagne introuvable' });
    }

    let slug = existing.slug;
    if (req.body.title && req.body.title !== existing.title) {
      slug = await generateUniqueSlug(req.body.title, tenantId, campagneId);
    }

    // Mapper les champs du frontend vers le schema Prisma
    const {
      title, description, prix, prixOriginal, placesTotal, placesRestantes,
      dateDebut, dateAffichee, duree, dureeHeures, format,
      lieu, contact, type, image, published, status,
      visibleHome, publie,
      ...ignored
    } = req.body;

    // === CORRECTION DATE : ne pas ecraser avec des champs vides ===
    let dateValue = null;
    if (dateDebut !== undefined && dateDebut !== '' && dateDebut !== null) {
      dateValue = new Date(dateDebut);
    }

    const updateData = {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(prix !== undefined && { prix: parseInt(prix) || null }),
      ...(prixOriginal !== undefined && { prixOriginal: parseInt(prixOriginal) || null }),
      ...(placesTotal !== undefined && { placesTotal: parseInt(placesTotal) || 20 }),
      ...(placesRestantes !== undefined && { placesRestantes: parseInt(placesRestantes) || parseInt(placesTotal) || 20 }),
      ...(dateValue !== null && { dateScheduled: dateValue }),
      ...(dateAffichee !== undefined && { dateAffichee }),
      ...(duree !== undefined && { duree }),
      ...(dureeHeures !== undefined && { dureeHeures: parseInt(dureeHeures) || null }),
      ...(format !== undefined && { format }),
      ...(lieu !== undefined && { lieu }),
      ...(contact !== undefined && { contact }),
      ...(type !== undefined && { type }),
      ...(image !== undefined && { image }),
      ...(published !== undefined && { published }),
      ...(publie !== undefined && { published: publie }),
      ...(visibleHome !== undefined && { visibleHome }),
      ...(status !== undefined && { status }),
      slug,
    };

    console.log(`[PUT CAMPAGNE] Update data:`, JSON.stringify(updateData, null, 2));

    const campagne = await prisma.campagne.update({
      where: { id: campagneId },
      data: updateData
    });

    console.log(`[PUT CAMPAGNE] Campagne mise a jour: ${campagne.title}`);
    res.json(campagne);

  } catch (e) { 
    console.error('[PUT CAMPAGNE ERROR]', e);
    res.status(500).json({ message: e.message, error: e.stack }); 
  }
});


// ============================================
// PATCH /api/campagnes/:id - Modifier (alias de PUT pour compatibilite frontend)
// ============================================
router.patch('/:id', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const campagneId = req.params.id;

    console.log(`[PATCH CAMPAGNE] ID: ${campagneId}, Tenant: ${tenantId}`);
    console.log(`[PATCH CAMPAGNE] Body:`, JSON.stringify(req.body, null, 2));

    const existing = await prisma.campagne.findFirst({ 
      where: { id: campagneId, tenantId } 
    });

    if (!existing) {
      console.log(`[PATCH CAMPAGNE] Campagne non trouvee: ${campagneId}`);
      return res.status(404).json({ message: 'Campagne introuvable' });
    }

    let slug = existing.slug;
    if (req.body.title && req.body.title !== existing.title) {
      slug = await generateUniqueSlug(req.body.title, tenantId, campagneId);
    }

    // Mapper les champs du frontend vers le schema Prisma
    const {
      title, description, prix, prixOriginal, placesTotal, placesRestantes,
      dateScheduled, date, dateDebut, dateAffichee, duree, dureeHeures, format,
      lieu, location, contact, type, image, published, status,
      visibleHome, publie, isPublic,
      ...ignored
    } = req.body;

    // === CORRECTION DATE : prendre la premiere date valide, ne pas ecraser avec des champs vides ===
    let dateValue = undefined;  // undefined = ne pas modifier

    if (dateScheduled !== undefined && dateScheduled !== '' && dateScheduled !== null) {
      dateValue = new Date(dateScheduled);
    } else if (dateDebut !== undefined && dateDebut !== '' && dateDebut !== null) {
      dateValue = new Date(dateDebut);
    } else if (date !== undefined && date !== '' && date !== null) {
      dateValue = new Date(date);
    }

    // Si toutes les dates sont explicitement vides, mettre a null
    if (dateScheduled === '' || date === '' || dateDebut === '') {
      if ((dateScheduled === '' || dateScheduled === undefined) && 
          (date === '' || date === undefined) && 
          (dateDebut === '' || dateDebut === undefined)) {
        dateValue = null;
      }
    }

    const updateData = {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(prix !== undefined && { prix: parseInt(prix) || null }),
      ...(prixOriginal !== undefined && { prixOriginal: parseInt(prixOriginal) || null }),
      ...(placesTotal !== undefined && { placesTotal: parseInt(placesTotal) || 20 }),
      ...(placesRestantes !== undefined && { placesRestantes: parseInt(placesRestantes) || parseInt(placesTotal) || 20 }),
      ...(dateValue !== undefined && { dateScheduled: dateValue }),
      ...(dateAffichee !== undefined && { dateAffichee }),
      ...(duree !== undefined && { duree }),
      ...(dureeHeures !== undefined && { dureeHeures: parseInt(dureeHeures) || null }),
      ...(format !== undefined && { format }),
      ...(lieu !== undefined && { lieu }),
      ...(location !== undefined && { lieu: location }),
      ...(contact !== undefined && { contact }),
      ...(type !== undefined && { type }),
      ...(image !== undefined && { image }),
      ...(published !== undefined && { published }),
      ...(publie !== undefined && { published: publie }),
      ...(isPublic !== undefined && { published: isPublic }),
      ...(visibleHome !== undefined && { visibleHome }),
      ...(status !== undefined && { status }),
      slug,
    };

    console.log(`[PATCH CAMPAGNE] Update data:`, JSON.stringify(updateData, null, 2));

    const campagne = await prisma.campagne.update({
      where: { id: campagneId },
      data: updateData
    });

    console.log(`[PATCH CAMPAGNE] Campagne mise a jour: ${campagne.title}`);
    res.json(campagne);

  } catch (e) { 
    console.error('[PATCH CAMPAGNE ERROR]', e);
    res.status(500).json({ message: e.message, error: e.stack }); 
  }
});

// ============================================
// DELETE /api/campagnes/:id - AVEC CASCADE MANUEL
// ============================================
router.delete('/:id', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const campagneId = req.params.id;

    console.log(`[DELETE] Tentative suppression campagne ${campagneId} (tenant: ${tenantId})`);

    const campagne = await prisma.campagne.findFirst({
      where: { id: campagneId, tenantId }
    });

    if (!campagne) {
      return res.status(404).json({ message: 'Campagne introuvable' });
    }

    console.log(`[DELETE] Campagne trouvee: ${campagne.title}`);

    // Cascade manuel
    try {
      const deletedInscriptions = await prisma.inscription.deleteMany({
        where: { campagneId }
      });
      console.log(`[DELETE] ${deletedInscriptions.count} inscriptions supprimees`);
    } catch (err) {
      console.log('[DELETE] Pas d inscriptions a supprimer:', err.message);
    }

    try {
      const deletedPaiements = await prisma.paiement.deleteMany({
        where: { campagneId }
      });
      console.log(`[DELETE] ${deletedPaiements.count} paiements supprimes`);
    } catch (err) {
      console.log('[DELETE] Pas de paiements a supprimer:', err.message);
    }

    try {
      const deletedNotifications = await prisma.notification.deleteMany({
        where: { campagneId }
      });
      console.log(`[DELETE] ${deletedNotifications.count} notifications supprimees`);
    } catch (err) {
      console.log('[DELETE] Pas de notifications a supprimer:', err.message);
    }

    try {
      const deletedFeedbacks = await prisma.feedback.deleteMany({
        where: { campagneId }
      });
      console.log(`[DELETE] ${deletedFeedbacks.count} feedbacks supprimes`);
    } catch (err) {
      console.log('[DELETE] Pas de feedbacks a supprimer:', err.message);
    }

    try {
      const deletedSegments = await prisma.segment.deleteMany({
        where: { campagneId }
      });
      console.log(`[DELETE] ${deletedSegments.count} segments supprimes`);
    } catch (err) {
      console.log('[DELETE] Pas de segments a supprimer:', err.message);
    }

    await prisma.campagne.delete({
      where: { id: campagneId }
    });

    console.log(`[DELETE] Campagne ${campagneId} supprimee avec succes`);
    res.json({ message: 'Campagne supprimee avec succes' });

  } catch (e) { 
    console.error('[DELETE CAMPAGNE ERROR]', e);
    res.status(500).json({ message: e.message }); 
  }
});

module.exports = router;