const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const router = express.Router();
const prisma = new PrismaClient();

// ============================================
// MIDDLEWARE INLINE
// ============================================
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

// ============================================
// POST /api/users/fcm-token
// ============================================
router.post('/fcm-token', authenticate, async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const userId = req.user?.id || req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non identifié' });
    }

    console.log(`[FCM TOKEN] Reçu pour user ${userId}: ${fcmToken?.substring(0, 30)}...`);

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

// ============================================
// GET /api/users — LISTE AVEC FILTRE TENANT
// ============================================
router.get('/', authenticate, async (req, res) => {
  try {
    // Vérifier que c'est un admin ou responsable
    if (!['ADMIN', 'RESPONSABLE_MARKETING', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès interdit' });
    }

    const users = await prisma.user.findMany({
      where: { tenantId: req.user.tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (err) {
    console.error('[USERS LIST ERROR]', err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
});

// ============================================
// POST /api/users — CRÉER UN UTILISATEUR
// ============================================
router.post('/', authenticate, async (req, res) => {
  try {
    // Vérifier que c'est un admin
    if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès interdit — Admin requis' });
    }

    const { name, email, password, role, phone, status } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nom, email et mot de passe requis' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    // Vérifier si l'email existe déjà dans ce tenant
    const existing = await prisma.user.findUnique({
      where: { 
        tenantId_email: {
          tenantId: req.user.tenantId,
          email: email
        }
      }
    });

    if (existing) {
      return res.status(409).json({ error: 'Un utilisateur avec cet email existe déjà' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'CLIENT',
        phone: phone || null,
        status: status || 'ACTIVE',
        tenantId: req.user.tenantId
      },
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

    console.log('[USERS CREATE] Utilisateur créé:', newUser.email);
    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      user: newUser
    });

  } catch (err) {
    console.error('[USERS CREATE ERROR]', err);
    res.status(500).json({ 
      error: 'Erreur lors de la création', 
      details: err.message 
    });
  }
});

// ============================================
// PUT /api/users/:id — MODIFIER UN UTILISATEUR
// ============================================
router.put('/:id', authenticate, async (req, res) => {
  try {
    // Vérifier que c'est un admin
    if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès interdit — Admin requis' });
    }

    const { id } = req.params;
    const { name, email, phone, role, status } = req.body;

    // Vérifier que l'utilisateur existe et appartient au même tenant
    const existing = await prisma.user.findFirst({
      where: { 
        id: id,
        tenantId: req.user.tenantId
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Mettre à jour
    const updated = await prisma.user.update({
      where: { id: id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(role && { role }),
        ...(status && { status })
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    console.log('[USERS UPDATE] Utilisateur modifié:', updated.email);
    res.json({
      success: true,
      message: 'Utilisateur modifié avec succès',
      user: updated
    });

  } catch (err) {
    console.error('[USERS UPDATE ERROR]', err);
    res.status(500).json({ 
      error: 'Erreur lors de la modification', 
      details: err.message 
    });
  }
});

// ============================================
// DELETE /api/users/:id — SUPPRIMER UN UTILISATEUR
// ============================================
router.delete('/:id', authenticate, async (req, res) => {
  try {
    // Vérifier que c'est un admin
    if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès interdit — Admin requis' });
    }

    const { id } = req.params;

    // Vérifier que l'utilisateur existe et appartient au même tenant
    const existing = await prisma.user.findFirst({
      where: { 
        id: id,
        tenantId: req.user.tenantId
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Empêcher la suppression de soi-même
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    // Supprimer l'utilisateur
    await prisma.user.delete({
      where: { id: id }
    });

    console.log('[USERS DELETE] Utilisateur supprimé:', id);
    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });

  } catch (err) {
    console.error('[USERS DELETE ERROR]', err);
    res.status(500).json({ 
      error: 'Erreur lors de la suppression', 
      details: err.message 
    });
  }
});

// ============================================
// PATCH /api/users/:id/status — CHANGER LE STATUT
// ============================================
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès interdit' });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const existing = await prisma.user.findFirst({
      where: { 
        id: id,
        tenantId: req.user.tenantId
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const updated = await prisma.user.update({
      where: { id: id },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: `Statut mis à jour : ${status}`,
      user: updated
    });

  } catch (err) {
    console.error('[USERS STATUS ERROR]', err);
    res.status(500).json({ error: 'Erreur', details: err.message });
  }
});

module.exports = router;