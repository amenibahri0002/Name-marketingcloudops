const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

// Middleware auth
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Non authentifié' });
  next();
};

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

// POST - Créer
router.post('/', authenticate, async (req, res) => {
  try {
    const slug = await generateUniqueSlug(req.body.title);
    const campagne = await prisma.campagne.create({
      data: { ...req.body, slug },
      include: { client: { select: { name: true } } },
    });
    res.status(201).json(campagne);
  } catch (e) { res.status(500).json({ message: e.message }); }
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

module.exports = router;