const express = require('express')
const bcrypt  = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const { authMiddleware, requireRole, ROLES } = require('../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

// GET /api/users/me - Profil de l'utilisateur connecté (TOUS les rôles)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        client: true,
        inscription: {
          include: {
            campagne: true
          }
        },
        paiements: true
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    const { password, ...userWithoutPassword } = user
    res.json(userWithoutPassword)
  } catch (err) {
    console.error('[USERS ME ERROR]', err)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/users - Liste tous les utilisateurs (ADMIN uniquement)
router.get('/', authMiddleware, requireRole(ROLES.ADMIN), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id:true, name:true, email:true, role:true, clientId:true, createdAt:true },
      orderBy: { createdAt: 'desc' }
    })
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
router.post('/fcm-token', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Non authentifié' });

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'techevent_secret_2026');

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { fcmToken: req.body.fcmToken }
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users - Créer un utilisateur (ADMIN uniquement)
router.post('/', authMiddleware, requireRole(ROLES.ADMIN), async (req, res) => {
  try {
    const { name, email, password, role, clientId } = req.body

    const validRoles = Object.values(ROLES)
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Role invalide. Roles valides: ' + validRoles.join(', ') })
    }

    const hashed = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: {
        name, email,
        password: hashed,
        role: role || ROLES.CLIENT,
        clientId: clientId ? parseInt(clientId) : null
      }
    })
    res.status(201).json({ id:user.id, name:user.name, email:user.email, role:user.role })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/users/:id - Modifier un utilisateur (ADMIN uniquement)
router.patch('/:id', authMiddleware, requireRole(ROLES.ADMIN), async (req, res) => {
  try {
    const { role } = req.body
    const validRoles = Object.values(ROLES)
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Role invalide' })
    }
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { role },
      select: { id:true, name:true, email:true, role:true }
    })
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/users/:id - Supprimer un utilisateur (ADMIN uniquement)
router.delete('/:id', authMiddleware, requireRole(ROLES.ADMIN), async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ message: 'Utilisateur supprime' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router