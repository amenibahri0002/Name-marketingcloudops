const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/clients - Tous les clients du tenant
router.get('/', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    // Récupérer les clients du tenant
    const clients = await prisma.client.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });

    // Récupérer les utilisateurs du tenant (comme clients)
    const users = await prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true
      }
    });

    // Fusionner
    const allClients = [
      ...clients.map(c => ({ ...c, source: 'client_table' })),
      ...users.map(u => ({ 
        ...u, 
        name: u.name || 'Utilisateur',
        type: 'utilisateur',
        source: 'user_table' 
      }))
    ];

    res.json(allClients);
  } catch (err) {
    console.error('[CLIENTS ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/clients/:id
router.get('/:id', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const id = req.params.id;

    let client = await prisma.client.findFirst({
      where: { id, tenantId }
    });

    if (!client) {
      const user = await prisma.user.findFirst({
        where: { id, tenantId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true
        }
      });
      if (user) {
        client = { ...user, type: 'utilisateur', source: 'user_table' };
      }
    }

    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/clients
router.post('/', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { name, email, phone, type } = req.body;
    
    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone: phone || '',
        type: type || 'particulier',
        tenantId,
        status: 'ACTIVE'
      }
    });
    res.status(201).json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/clients/:id
router.put('/:id', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { name, email, phone, type, status } = req.body;
    
    const client = await prisma.client.updateMany({
      where: { id: req.params.id, tenantId },
      data: { name, email, phone, type, status }
    });
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/clients/:id
router.delete('/:id', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    await prisma.client.deleteMany({ 
      where: { id: req.params.id, tenantId } 
    });
    res.json({ message: 'Client supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;