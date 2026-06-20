const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/sms - Logs SMS
router.get('/', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const sms = await prisma.smsLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json(sms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;