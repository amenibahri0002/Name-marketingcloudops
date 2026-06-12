const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'techevent_secret_2026';

// ============================================================
// MIDDLEWARE AUTH
// ============================================================
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide' });
  }
};

// ============================================================
// INSCRIPTION PUBLIQUE
// POST /api/auth/register
// ============================================================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, type = 'particulier', sector = '' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nom, email et mot de passe requis' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    const existingClient = await prisma.client.findUnique({ where: { email } });
    if (existingClient) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone: phone || '',
        type,
        sector,
        status: 'active'
      }
    });

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'CLIENT',
        clientId: client.id,
        status: 'active',
        lastLogin: new Date()
      }
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, clientId: client.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Inscription réussie !',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        clientId: client.id
      }
    });

  } catch (err) {
    console.error('[REGISTER ERROR]', err);
    res.status(500).json({ error: "Erreur lors de l'inscription" });
  }
});

// ============================================================
// CONNEXION
// POST /api/auth/login
// ============================================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('[LOGIN] Tentative:', { email, hasPassword: !!password });

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, clientId: user.clientId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        clientId: user.clientId
      }
    });

  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// ============================================================
// CRÉER UN COMPTE CLIENT (Admin ou Responsable Marketing)
// POST /api/auth/create-client
// ============================================================
router.post('/create-client', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'RESPONSABLE_MARKETING') {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }

    const { name, email, password, phone, type = 'particulier', sector = '', role = 'CLIENT' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nom, email et mot de passe requis' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    const existingClient = await prisma.client.findUnique({ where: { email } });
    if (existingClient) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let client = null;
    if (role === 'CLIENT') {
      client = await prisma.client.create({
        data: {
          name,
          email,
          phone: phone || '',
          type,
          sector,
          status: 'active'
        }
      });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role,
        clientId: client ? client.id : null,
        status: 'active',
        lastLogin: null
      }
    });

    res.status(201).json({
      message: 'Compte créé avec succès',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        clientId: user.clientId,
        status: user.status,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        type: client ? client.type : null,
        sector: client ? client.sector : null
      }
    });

  } catch (err) {
    console.error('[CREATE CLIENT ERROR]', err);
    res.status(500).json({ error: 'Erreur lors de la création du compte' });
  }
});

// ============================================================
// LISTE DES UTILISATEURS - CORRIGÉ (sans select client)
// GET /api/auth/users
// ============================================================
router.get('/users', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'RESPONSABLE_MARKETING') {
      return res.status(403).json({ error: 'Accès réservé' });
    }

    // Récupérer les utilisateurs sans include client (évite l'erreur)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        lastLogin: true,
        clientId: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Récupérer les clients associés manuellement avec try/catch
    const usersWithClients = await Promise.all(
      users.map(async (u) => {
        let clientData = null;
        if (u.clientId) {
          try {
            clientData = await prisma.client.findUnique({
              where: { id: u.clientId },
              select: {
                id: true,
                name: true,
                email: true,
                type: true,
                sector: true,
                status: true
              }
            });
          } catch (e) {
            console.log('[CLIENT FETCH ERROR] user', u.id, ':', e.message);
          }
        }

        return {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          status: u.status || 'active',
          createdAt: u.createdAt,
          lastLogin: u.lastLogin,
          clientId: u.clientId,
          type: clientData?.type || null,
          secteur: clientData?.sector || null
        };
      })
    );

    console.log('[USERS LIST] ✅', usersWithClients.length, 'utilisateurs récupérés');
    res.json(usersWithClients);

  } catch (err) {
    console.error('[USERS LIST ERROR]', err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
});

// ============================================================
// MODIFIER UN UTILISATEUR
// PUT /api/auth/users/:id
// ============================================================
router.put('/users/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'RESPONSABLE_MARKETING') {
      return res.status(403).json({ error: 'Accès réservé' });
    }

    const userId = parseInt(req.params.id);
    const { name, email, role, status } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    res.json(updatedUser);

  } catch (err) {
    console.error('[UPDATE USER ERROR]', err);
    res.status(500).json({ error: 'Erreur lors de la modification' });
  }
});

// ============================================================
// SUPPRIMER UN UTILISATEUR (Admin uniquement)
// DELETE /api/auth/users/:id
// ============================================================
router.delete('/users/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }

    const userId = parseInt(req.params.id);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (user.clientId) {
      await prisma.inscription.deleteMany({ where: { clientId: user.clientId } }).catch(() => {});
    }

    await prisma.user.delete({ where: { id: userId } });

    if (user.clientId) {
      await prisma.client.delete({ where: { id: user.clientId } }).catch(() => {});
    }

    res.json({ message: 'Utilisateur supprimé avec succès' });

  } catch (err) {
    console.error('[DELETE USER ERROR]', err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
});

// ============================================================
// PROFIL UTILISATEUR CONNECTÉ - CORRIGÉ (sans select client)
// GET /api/auth/me
// ============================================================
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        clientId: true,
        createdAt: true,
        lastLogin: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    let clientData = null;
    if (user.clientId) {
      try {
        clientData = await prisma.client.findUnique({
          where: { id: user.clientId },
          select: {
            id: true,
            name: true,
            email: true,
            type: true,
            sector: true,
            phone: true
          }
        });
      } catch (e) {
        console.log('[CLIENT FETCH ERROR] me:', e.message);
      }
    }

    res.json({
      ...user,
      client: clientData
    });

  } catch (err) {
    console.error('[ME ERROR]', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;