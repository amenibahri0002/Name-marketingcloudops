const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET tous les segments du tenant
router.get('/', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    const segments = await prisma.segment.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: { contacts: { include: { contact: true } } }
    });
    
    res.json(segments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST créer un segment
router.post('/', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { name, criteria } = req.body;
    
    const segment = await prisma.segment.create({
      data: { name, criteria, tenantId }
    });
    
    res.json(segment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST ajouter contact manuellement
router.post('/:id/contacts', async (req, res) => {
  try {
    const { contactId } = req.body;
    const cs = await prisma.contactSegment.create({
      data: {
        segmentId: req.params.id,
        contactId: contactId
      }
    });
    res.json(cs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE supprimer un segment
router.delete('/:id', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    await prisma.contactSegment.deleteMany({ 
      where: { segmentId: req.params.id } 
    });
    await prisma.segment.deleteMany({ 
      where: { id: req.params.id, tenantId } 
    });
    res.json({ message: 'Segment supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
module.exports.recalculerSegments = async function() {};