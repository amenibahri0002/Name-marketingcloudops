const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/contacts - Tous les contacts du tenant
router.get('/', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const contacts = await prisma.contact.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/contacts - Créer un contact
router.post('/', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { name, email, phone, type } = req.body;
    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        phone,
        type: type || 'prospect',
        tenantId
      }
    });
    res.status(201).json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;