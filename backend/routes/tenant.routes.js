// backend/routes/tenant.routes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ============================================
// MIDDLEWARE — Vérification admin super
// ============================================
function requireSuperAdmin(req, res, next) {
  if (req.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Accès réservé au super administrateur' });
  }
  next();
}

// ============================================
// ROUTES PUBLIQUES
// ============================================

// GET /api/tenants/resolve — Résoudre un tenant par slug ou domaine
router.get('/resolve', async (req, res) => {
  try {
    const { slug, domain, subdomain } = req.query;

    let tenant = null;

    if (slug) {
      tenant = await prisma.tenant.findUnique({ where: { slug } });
    } else if (domain) {
      tenant = await prisma.tenant.findUnique({ where: { domain } });
    } else if (subdomain) {
      tenant = await prisma.tenant.findUnique({ where: { subdomain } });
    }

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant non trouvé' });
    }

    const { id, name, slug: tSlug, logo, status, plan, domain: tDomain, subdomain: tSubdomain, settings } = tenant;

    res.json({
      id,
      name,
      slug: tSlug,
      logo,
      status,
      plan,
      domain: tDomain,
      subdomain: tSubdomain,
      settings: settings || {},
    });
  } catch (error) {
    console.error('[Tenant Resolve] Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/tenants/:slug/config — Configuration publique d'un tenant
router.get('/:slug/config', async (req, res) => {
  try {
    const { slug } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        description: true,
        settings: true,
        plan: true,
      }
    });

    if (!tenant || tenant.status !== 'ACTIVE') {
      return res.status(404).json({ error: 'Tenant non trouvé ou inactif' });
    }

    res.json({
      ...tenant,
      settings: tenant.settings || {},
    });
  } catch (error) {
    console.error('[Tenant Config] Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================
// ROUTES PROTÉGÉES (Super Admin)
// ============================================

// GET /api/tenants — Liste tous les tenants
router.get('/', requireSuperAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, plan, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (plan) where.plan = plan;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { domain: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              users: true,
              clients: true,
              campagnes: true,
              inscriptions: true,
            }
          }
        }
      }),
      prisma.tenant.count({ where }),
    ]);

    res.json({
      tenants,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      }
    });
  } catch (error) {
    console.error('[Tenants List] Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/tenants — Créer un nouveau tenant
router.post('/', 
  requireSuperAdmin,
  [
    body('name').trim().notEmpty().withMessage('Le nom est requis'),
    body('slug').trim().isSlug().withMessage('Slug invalide'),
    body('plan').optional().isIn(['FREE', 'STARTER', 'PRO', 'ENTERPRISE']).withMessage('Plan invalide'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, slug, description, plan = 'FREE', domain, subdomain, adminEmail, adminPassword, adminName } = req.body;

      const existing = await prisma.tenant.findUnique({ where: { slug } });
      if (existing) {
        return res.status(409).json({ error: 'Ce slug est déjà utilisé' });
      }

      if (domain) {
        const existingDomain = await prisma.tenant.findUnique({ where: { domain } });
        if (existingDomain) {
          return res.status(409).json({ error: 'Ce domaine est déjà utilisé' });
        }
      }
      if (subdomain) {
        const existingSubdomain = await prisma.tenant.findUnique({ where: { subdomain } });
        if (existingSubdomain) {
          return res.status(409).json({ error: 'Ce sous-domaine est déjà utilisé' });
        }
      }

      const tenant = await prisma.tenant.create({
        data: {
          name,
          slug,
          description,
          plan: plan.toUpperCase(),
          domain,
          subdomain,
          status: 'ACTIVE',
          settings: {
            theme: 'light',
            language: 'fr',
            currency: 'TND',
            timezone: 'Africa/Tunis',
          },
        }
      });

      let admin = null;
      if (adminEmail && adminPassword) {
        const hashedPassword = await bcrypt.hash(adminPassword, 12);
        admin = await prisma.user.create({
          data: {
            tenantId: tenant.id,
            name: adminName || 'Administrateur',
            email: adminEmail,
            password: hashedPassword,
            role: 'ADMIN',
            status: 'ACTIVE',
          }
        });
      }

      res.status(201).json({
        message: 'Tenant créé avec succès',
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          plan: tenant.plan,
          status: tenant.status,
        },
        admin: admin ? {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        } : null,
      });
    } catch (error) {
      console.error('[Tenant Create] Erreur:', error);
      res.status(500).json({ error: 'Erreur lors de la création du tenant' });
    }
  }
);

// GET /api/tenants/:id — Détails d'un tenant
router.get('/:id', requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            clients: true,
            campagnes: true,
            inscriptions: true,
            paiements: true,
            notifications: true,
            feedbacks: true,
          }
        }
      }
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant non trouvé' });
    }

    res.json(tenant);
  } catch (error) {
    console.error('[Tenant Detail] Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/tenants/:id — Mettre à jour un tenant
router.put('/:id',
  requireSuperAdmin,
  [
    body('name').optional().trim().notEmpty(),
    body('status').optional().isIn(['ACTIVE', 'SUSPENDED', 'PENDING', 'CANCELLED']),
    body('plan').optional().isIn(['FREE', 'STARTER', 'PRO', 'ENTERPRISE']),
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, status, plan, settings, domain, subdomain } = req.body;

      const tenant = await prisma.tenant.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(status && { status }),
          ...(plan && { plan: plan.toUpperCase() }),
          ...(settings && { settings: { ...settings } }),
          ...(domain && { domain }),
          ...(subdomain && { subdomain }),
        }
      });

      res.json({
        message: 'Tenant mis à jour',
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          status: tenant.status,
          plan: tenant.plan,
        }
      });
    } catch (error) {
      console.error('[Tenant Update] Erreur:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
  }
);

// DELETE /api/tenants/:id — Supprimer un tenant (soft delete = suspension)
router.delete('/:id', requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const tenant = await prisma.tenant.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    res.json({
      message: 'Tenant suspendu avec succès',
      tenant: {
        id: tenant.id,
        name: tenant.name,
        status: tenant.status,
      }
    });
  } catch (error) {
    console.error('[Tenant Delete] Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// GET /api/tenants/:id/stats — Statistiques d'un tenant
router.get('/:id/stats', requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant non trouvé' });
    }

    const [users, clients, campagnes, inscriptions, paiements, notifications, feedbacks] = await Promise.all([
      prisma.user.count({ where: { tenantId: id } }),
      prisma.client.count({ where: { tenantId: id } }),
      prisma.campagne.count({ where: { tenantId: id } }),
      prisma.inscription.count({ where: { tenantId: id } }),
      prisma.paiement.count({ where: { tenantId: id } }),
      prisma.notification.count({ where: { tenantId: id } }),
      prisma.feedback.count({ where: { tenantId: id } }),
    ]);

    const limits = {
      FREE: { users: 3, campagnes: 5, inscriptions: 50 },
      STARTER: { users: 10, campagnes: 20, inscriptions: 500 },
      PRO: { users: 50, campagnes: 100, inscriptions: 5000 },
      ENTERPRISE: { users: Infinity, campagnes: Infinity, inscriptions: Infinity },
    };

    const planLimits = limits[tenant.plan] || limits.FREE;

    res.json({
      tenant: {
        id: tenant.id,
        name: tenant.name,
        plan: tenant.plan,
        status: tenant.status,
      },
      stats: { users, clients, campagnes, inscriptions, paiements, notifications, feedbacks },
      limits: planLimits,
      usage: {
        users: { current: users, limit: planLimits.users, percentage: planLimits.users === Infinity ? 0 : (users / planLimits.users * 100).toFixed(1) },
        campagnes: { current: campagnes, limit: planLimits.campagnes, percentage: planLimits.campagnes === Infinity ? 0 : (campagnes / planLimits.campagnes * 100).toFixed(1) },
        inscriptions: { current: inscriptions, limit: planLimits.inscriptions, percentage: planLimits.inscriptions === Infinity ? 0 : (inscriptions / planLimits.inscriptions * 100).toFixed(1) },
      }
    });
  } catch (error) {
    console.error('[Tenant Stats] Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;