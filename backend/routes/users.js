const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Middleware inline
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Token manquant' });
    
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token invalide' });

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    req.user = {
      id: decoded.userId || decoded.id,
      userId: decoded.userId || decoded.id,
      email: decoded.email,
      role: decoded.role,
      tenantId: decoded.tenantId
    };
    
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide' });
  }
};

// ============================================
// GET /api/users/me
// ============================================
router.get('/me', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non identifié' });
    }

    console.log('[USERS/ME] Recherche userId:', userId);

    // Essayer d'abord sans _count (qui peut causer des erreurs)
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          tenantId: true,
          status: true,
          createdAt: true,
          updatedAt: true
        }
      });
    } catch (err) {
      console.error('[USERS/ME] Prisma error:', err.message);
      return res.status(500).json({ 
        error: 'Erreur base de données', 
        details: err.message 
      });
    }

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Compter les inscriptions et paiements séparément
    let inscriptionsCount = 0;
    let paiementsCount = 0;
    
    try {
      inscriptionsCount = await prisma.inscription.count({
        where: { userId: userId }
      });
    } catch (e) { /* ignorer */ }

    try {
      paiementsCount = await prisma.paiement.count({
        where: { userId: userId }
      });
    } catch (e) { /* ignorer */ }

    const response = {
      id: user.id,
      name: user.name,
      nom: user.name,
      email: user.email,
      mail: user.email,
      phone: user.phone,
      telephone: user.phone,
      role: user.role,
      tenantId: user.tenantId,
      status: user.status,
      createdAt: user.createdAt,
      inscriptionsCount: inscriptionsCount,
      paiementsCount: paiementsCount,
      formationsCompletees: 0
    };

    console.log('[USERS/ME] User trouvé:', user.name);
    res.json(response);
    
  } catch (err) {
    console.error('[USERS/ME ERROR]', err);
    res.status(500).json({ 
      error: 'Erreur serveur', 
      details: err.message 
    });
  }
});
router.post('/fcm-token', async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const userId = req.user.id;


 console.log(`[FCM TOKEN] Reçu pour user ${userId}: ${fcmToken.substring(0, 30)}...`);

    

    await prisma.user.update({
      where: { id: userId },
      data: { fcmToken },
    });


    console.log(`[FCM TOKEN] Enregistré avec succès pour user ${userId}`);
    res.json({ success: true, message: 'Token FCM enregistré' });
  } catch (err) {
    console.error('[FCM TOKEN ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});
// ============================================
// PUT /api/users/me
// ============================================
router.put('/me', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const { name, phone, email } = req.body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(email && { email })
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        tenantId: true,
        status: true,
        createdAt: true
      }
    });

    res.json(updated);
  } catch (err) {
    console.error('[USERS UPDATE ERROR]', err);
    res.status(500).json({ error: 'Erreur mise à jour', details: err.message });
  }
});

module.exports = router;