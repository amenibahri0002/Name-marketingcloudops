const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

// ✅ UN SEUL authMiddleware - supprimer la déclaration locale !
const { authMiddleware: authenticate } = require('../middleware/auth');

// ✅ Importer la BONNE fonction depuis emailService.js
const { sendCampagneNotification } = require('../services/emailService');

function generateSlug(title) {
  return title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').substring(0, 50);
}

async function generateUniqueSlug(title, excludeId = null) {
  let slug = generateSlug(title);
  let counter = 1;
  let uniqueSlug = slug;
  while (true) {
    const existing = await prisma.campagne.findUnique({ where: { slug: uniqueSlug } });
    if (!existing || existing.id === excludeId) break;
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
  return uniqueSlug;
}

// GET /api/campagnes/public - Campagnes publiques
router.get('/public', async (req, res) => {
  try {
    const campagnes = await prisma.campagne.findMany({
      where: { isPublic: true, status: 'ACTIVE' },
      include: { 
        client: { select: { name: true } },
        _count: { select: { inscription: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(campagnes);
  } catch (e) { 
    res.status(500).json({ message: e.message }); 
  }
});

// GET /api/campagnes - Liste avec compteurs dynamiques
router.get('/', async (req, res) => {
  try {
    const campagnes = await prisma.campagne.findMany({
      include: {
        client: { select: { name: true } },
        inscription: {
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
          select: { inscription: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = campagnes.map(c => ({
      ...c,
      inscriptionsCount: c._count.inscription,
      inscriptionsPayees: c.inscription.filter(i => i.status === 'paye').length,
      inscriptionsEnAttente: c.inscription.filter(i => i.status === 'en_attente').length,
      revenusTotal: c.inscription.reduce((sum, i) => sum + (i.prixTotal || 0), 0),
      inscriptions: c.inscription
    }));

    res.json(formatted);
  } catch (e) { 
    console.error('[CAMPAGNES ERROR]', e);
    res.status(500).json({ message: e.message }); 
  }
});

// GET /api/campagnes/:idOrSlug - Détail par ID ou SLUG
router.get('/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isNumeric = /^\d+$/.test(idOrSlug);
    const where = isNumeric ? { id: Number(idOrSlug) } : { slug: idOrSlug };

    const campagne = await prisma.campagne.findUnique({
      where,
      include: { 
        client: { select: { name: true } },
        inscription: { 
          select: { id: true, name: true, email: true, phone: true, status: true, createdAt: true } 
        }
      },
    });

    if (!campagne) return res.status(404).json({ message: 'Campagne introuvable' });
    res.json(campagne);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ============================================================
// POST - Créer + ENVOI AUTO EMAIL
// ============================================================
router.post('/', authenticate, async (req, res) => {
  try {
    const slug = await generateUniqueSlug(req.body.title);
    
    // Créer la campagne
    const campagne = await prisma.campagne.create({
      data: { ...req.body, slug },
      include: { client: { select: { name: true } } },
    });

    // ============================================================
    // ✅ ENVOI AUTOMATIQUE D'EMAIL (non-bloquant)
    // ============================================================
    // Lancer en arrière-plan sans bloquer la réponse HTTP
    (async () => {
      try {
        // 1. Récupérer les destinataires (contacts + users clients)
        const contacts = await prisma.contact.findMany({
          select: { email: true, name: true }
        });
        
        const users = await prisma.user.findMany({
          where: { role: 'CLIENT' },
          select: { email: true, name: true }
        });

        // Fusionner et dédupliquer par email
        const allDestinataires = [...contacts, ...users];
        const uniqueDestinataires = allDestinataires.filter((dest, index, self) => 
          index === self.findIndex(d => d.email === dest.email)
        );

        if (uniqueDestinataires.length > 0) {
          // 2. Préparer le message
          const message = `Découvrez notre nouvelle formation "${campagne.title}" ! 
Date: ${campagne.date ? new Date(campagne.date).toLocaleDateString('fr-FR') : 'À définir'}
Lieu: ${campagne.location || 'Sfax'}
Prix: ${campagne.prix || 'N/A'} TND
Places limitées: ${campagne.placesTotal || 20} places.`;

          // 3. Envoyer via emailService.js (Resend)
          const result = await sendCampagneNotification(
            uniqueDestinataires,
            `🎉 Nouvelle formation - ${campagne.title}`,
            message,
            campagne
          );

          console.log(`[AUTO EMAIL] ✅ ${result.sent}/${result.total} emails envoyés pour campagne #${campagne.id}`);

          // 4. Créer une notification en base pour l'historique
          await prisma.notification.create({
            data: {
              title: `🎉 Nouvelle formation - ${campagne.title}`,
              message: message.substring(0, 500),
              type: 'nouvelle_campagne',
              canal: 'email',
              status: result.success ? 'sent' : 'failed',
              campagneId: campagne.id,
              sentAt: result.success ? new Date() : null,
              metadata: {
                destinatairesCount: uniqueDestinataires.length,
                sent: result.sent,
                failed: result.failed
              }
            }
          });
        } else {
          console.log('[AUTO EMAIL] ⚠️ Aucun destinataire trouvé');
        }
      } catch (err) {
        console.error('[AUTO EMAIL ERROR]', err);
      }
    })();

    // RÉPONDRE IMMÉDIATEMENT (pas d'attente de l'email)
    res.status(201).json({
      message: 'Campagne créée avec succès ! Les emails de notification sont en cours d\'envoi.',
      campagne
    });

  } catch (e) { 
    console.error('[CAMPAGNE CREATE ERROR]', e);
    res.status(500).json({ message: e.message }); 
  }
});

// PUT - Modifier
router.put('/:id', authenticate, async (req, res) => {
  try {
    const existing = await prisma.campagne.findUnique({ where: { id: Number(req.params.id) } });
    let slug = existing.slug;
    if (req.body.title && req.body.title !== existing.title) {
      slug = await generateUniqueSlug(req.body.title, Number(req.params.id));
    }
    const campagne = await prisma.campagne.update({
      where: { id: Number(req.params.id) },
      data: { ...req.body, slug },
      include: { client: { select: { name: true } } },
    });
    res.json(campagne);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await prisma.campagne.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Campagne supprimée' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});


// ============================================================
// PUT /:id/publish - Publier / Dépublier une campagne
// ============================================================
router.put('/:id/publish', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { published, isPublic } = req.body;

    const campagne = await prisma.campagne.update({
      where: { id: Number(id) },
      data: { 
        published: published !== undefined ? published : undefined,
        isPublic: isPublic !== undefined ? isPublic : undefined
      },
      include: { client: { select: { name: true } } }
    });

    res.json({
      success: true,
      message: published ? 'Campagne publiée avec succès !' : 'Campagne dépubliée avec succès !',
      campagne
    });
  } catch (e) { 
    console.error('[PUBLISH ERROR]', e);
    res.status(500).json({ message: e.message }); 
  }
});

module.exports = router;