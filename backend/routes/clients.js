const express = require('express');
const router = express.Router();
const prisma = require('../db');

// Map frontend → Prisma enum
const CLIENT_TYPE_MAP = {
  'particulier': 'PARTICULIER',
  'entreprise': 'ENTREPRISE',
  'agence': 'AGENCE',
  'etablissement': 'ETABLISSEMENT',
  'association': 'ASSOCIATION',
  'institution': 'INSTITUTION',
};

const CLIENT_STATUS_MAP = {
  'active': 'ACTIVE',
  'inactive': 'INACTIVE',
  'actif': 'ACTIVE',
  'inactif': 'INACTIVE',
  'prospect': 'PROSPECT',
  'archived': 'ARCHIVED',
};

const normalizeType = (type) => CLIENT_TYPE_MAP[type?.toLowerCase()] || 'PARTICULIER';
const normalizeStatus = (status) => CLIENT_STATUS_MAP[status?.toLowerCase()] || 'ACTIVE';

// Helper pour récupérer le tenantId
const getTenantId = (req) => {
  return req.tenantId || req.user?.tenantId || req.user?.tenant?.id;
};

// GET /api/clients — SEULEMENT les clients (User avec role=CLIENT)
router.get('/', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    
    if (!tenantId) {
      console.error('[CLIENTS GET] tenantId manquant');
      return res.status(400).json({ error: 'Tenant ID manquant' });
    }

    console.log('[CLIENTS GET] tenantId:', tenantId);

    const users = await prisma.user.findMany({
      where: {
        tenantId,
        role: 'CLIENT'
      },
      include: {
        client: true,
        inscriptions: {
          select: { id: true, campagneId: true, status: true }
        },
        _count: { select: { inscriptions: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('[CLIENTS GET] Users trouvés:', users.length);

    const clients = users.map(u => ({
      id: u.client?.id || u.id,
      userId: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      type: u.client?.type?.toLowerCase() || 'particulier',
      sector: u.client?.sector || 'Non spécifié',
      status: u.status?.toLowerCase() || 'active',
      createdAt: u.createdAt,
      inscriptionsCount: u._count?.inscriptions || 0,
      campagnesInscrites: u.inscriptions?.map(i => i.campagneId) || []
    }));

    res.json(clients);
  } catch (err) {
    console.error('[CLIENTS GET ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/clients/:id
router.get('/:id', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const { id } = req.params;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID manquant' });
    }

    const client = await prisma.client.findFirst({
      where: { id, tenantId },
      include: {
        user: true,
        inscriptions: {
          include: { campagne: { select: { id: true, title: true } } }
        }
      }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    res.json({
      ...client,
      type: client.type?.toLowerCase(),
      status: client.status?.toLowerCase(),
      user: {
        id: client.user?.id,
        name: client.user?.name,
        email: client.user?.email,
        phone: client.user?.phone,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/clients — CRÉER UN CLIENT
router.post('/', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const { name, email, phone, type, sector, status } = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID manquant' });
    }

    if (!name || !email) {
      return res.status(400).json({ error: 'Nom et email requis' });
    }

    // Vérifier si l'email existe déjà dans ce tenant
    const existing = await prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId,
          email
        }
      }
    });

    if (existing) {
      return res.status(409).json({ error: 'Un utilisateur avec cet email existe déjà' });
    }

    // Créer le User avec role CLIENT
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        role: 'CLIENT',
        status: normalizeStatus(status),
        tenantId
      }
    });

    // Créer le Client lié
    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone: phone || null,
        type: normalizeType(type),
        sector: sector || 'Non spécifié',
        status: normalizeStatus(status),
        tenantId,
        userId: user.id
      }
    });

    res.status(201).json({
      success: true,
      client: {
        id: client.id,
        userId: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        type: client.type.toLowerCase(),
        sector: client.sector,
        status: user.status.toLowerCase(),
        createdAt: user.createdAt,
        inscriptionsCount: 0,
        campagnesInscrites: []
      }
    });

  } catch (err) {
    console.error('[CLIENT POST ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/clients/:id
router.put('/:id', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const { id } = req.params;
    const { name, email, phone, type, status, sector } = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID manquant' });
    }

    const client = await prisma.client.findFirst({
      where: { id, tenantId },
      include: { user: true }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    // Mettre à jour le User
    await prisma.user.update({
      where: { id: client.userId },
      data: { name, email, phone }
    });

    // Mettre à jour le Client
    const updated = await prisma.client.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        type: normalizeType(type),
        sector: sector || client.sector,
        status: normalizeStatus(status),
      }
    });

    res.json({
      success: true,
      client: {
        id: updated.id,
        name,
        email,
        phone,
        type: updated.type.toLowerCase(),
        sector: updated.sector,
        status: updated.status.toLowerCase()
      }
    });

  } catch (err) {
    console.error('[CLIENT PUT ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/clients/:id
router.delete('/:id', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const { id } = req.params;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID manquant' });
    }

    const client = await prisma.client.findFirst({
      where: { id, tenantId },
      include: { user: true }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    // Supprimer le User (cascade supprime le Client)
    await prisma.user.delete({ where: { id: client.userId } });

    res.json({ message: 'Client supprimé' });
  } catch (err) {
    console.error('[CLIENT DELETE ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;