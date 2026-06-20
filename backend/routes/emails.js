const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/emails - Logs d'emails
router.get('/', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const emails = await prisma.emailLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json(emails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;