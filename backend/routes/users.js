const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, requireRole, ROLES } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ============================================================
// GET /api/users/me - Profil de l'utilisateur connecté
// ============================================================
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        client: true,
        inscription: {
          include: {
            campagne: {
              select: {
                id: true,
                title: true,
                image: true,
                dateScheduled: true,
                status: true
              }
            }
          }
        },
        paiements: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        notifications: {
          where: { isRead: false },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        feedbacks: {
          include: {
            campagne: {
              select: { id: true, title: true, image: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 3
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Calculer les stats
    const stats = {
      totalInscriptions: user.inscription?.length || 0,
      totalPaiements: user.paiements?.reduce((sum, p) => sum + (p.montant || 0), 0) || 0,
      notificationsNonLues: user.notifications?.length || 0,
      totalFeedbacks: user.feedbacks?.length || 0
    };

    const { password, ...userWithoutPassword } = user;
    res.json({ ...userWithoutPassword, stats });

  } catch (err) {
    console.error('[USERS ME ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// POST /api/users/fcm-token - Enregistrer token Firebase
// ============================================================
router.post('/fcm-token', authMiddleware, async (req, res) => {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({ error: 'Token FCM manquant' });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { fcmToken }
    });

    res.json({ success: true, message: 'Token FCM enregistré' });

  } catch (err) {
    console.error('[FCM TOKEN ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// DELETE /api/users/fcm-token - Supprimer token Firebase
// ============================================================
router.delete('/fcm-token', authMiddleware, async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { fcmToken: null }
    });

    res.json({ success: true, message: 'Token FCM supprimé' });

  } catch (err) {
    console.error('[FCM TOKEN DELETE ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// GET /api/users/me/notifications-count
// Compteur notifications non lues (pour le badge)
// ============================================================
router.get('/me/notifications-count', authMiddleware, async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: {
        userId: req.user.id,
        isRead: false
      }
    });

    res.json({ count });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// GET /api/users - Liste tous les utilisateurs (ADMIN)
// ============================================================
router.get('/', authMiddleware, requireRole(ROLES.ADMIN), async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;

    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          clientId: true,
          fcmToken: true,
          status: true,
          lastLogin: true,
          createdAt: true,
          _count: {
            select: {
              inscription: true,
              paiements: true,
              notifications: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (err) {
    console.error('[GET USERS ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// GET /api/users/:id - Détail d'un utilisateur (ADMIN)
// ============================================================
router.get('/:id', authMiddleware, requireRole(ROLES.ADMIN), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        client: true,
        inscription: {
          include: {
            campagne: {
              select: { id: true, title: true, image: true }
            }
          }
        },
        paiements: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        notifications: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        feedbacks: {
          include: {
            campagne: {
              select: { id: true, title: true }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// POST /api/users - Créer un utilisateur (ADMIN)
// ============================================================
router.post('/', authMiddleware, requireRole(ROLES.ADMIN), async (req, res) => {
  try {
    const { name, email, password, role, clientId } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nom, email et mot de passe requis' });
    }

    const validRoles = Object.values(ROLES);
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        message: 'Role invalide. Roles valides: ' + validRoles.join(', ')
      });
    }

    // Vérifier email unique
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email déjà utilisé' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: role || ROLES.CLIENT,
        clientId: clientId ? parseInt(clientId) : null
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      user
    });

  } catch (err) {
    console.error('[CREATE USER ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// PATCH /api/users/:id - Modifier un utilisateur (ADMIN)
// ============================================================
router.patch('/:id', authMiddleware, requireRole(ROLES.ADMIN), async (req, res) => {
  try {
    const { name, email, role, status, clientId } = req.body;
    const id = parseInt(req.params.id);

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (status) updateData.status = status;
    if (clientId) updateData.clientId = parseInt(clientId);

    if (role) {
      const validRoles = Object.values(ROLES);
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Role invalide' });
      }
      updateData.role = role;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'Utilisateur mis à jour',
      user
    });

  } catch (err) {
    console.error('[UPDATE USER ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// PATCH /api/users/:id/password - Changer mot de passe (ADMIN ou soi-même)
// ============================================================
router.patch('/:id/password', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { currentPassword, newPassword } = req.body;

    // Vérifier permissions (ADMIN ou soi-même)
    if (req.user.role !== ROLES.ADMIN && req.user.id !== id) {
      return res.status(403).json({ error: 'Accès interdit' });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { password: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier ancien mot de passe (si pas ADMIN)
    if (req.user.role !== ROLES.ADMIN) {
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) {
        return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
      }
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id },
      data: { password: hashed }
    });

    res.json({ success: true, message: 'Mot de passe mis à jour' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// DELETE /api/users/:id - Supprimer un utilisateur (ADMIN)
// ============================================================
router.delete('/:id', authMiddleware, requireRole(ROLES.ADMIN), async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Vérifier qu'on ne supprime pas soi-même
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    await prisma.user.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Utilisateur supprimé'
    });

  } catch (err) {
    console.error('[DELETE USER ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// PATCH /api/users/me/last-login - Mettre à jour lastLogin
// ============================================================
router.patch('/me/last-login', authMiddleware, async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { lastLogin: new Date() }
    });

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;