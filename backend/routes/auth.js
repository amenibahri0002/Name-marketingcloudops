const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db'); // ← Singleton, pas new PrismaClient()

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
// INSCRIPTION CLIENT
// POST /api/auth/register
// ============================================================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, type, sector } = req.body;
    const tenantId = req.tenantId; // ← Depuis le tenant middleware

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Nom, email et mot de passe requis' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Le mot de passe doit contenir au moins 6 caractères' 
      });
    }

    // Vérifier email existant dans User (unique global)
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Cet email est déjà utilisé' 
      });
    }

    // Hasher le password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Créer le User (Auth) d'abord
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || '',
        role: 'CLIENT',
        status: 'ACTIVE',
        tenantId,
        lastLogin: new Date()
      }
    });

    // 2. Créer le Client lié au User (userId dans Client)
    const client = await prisma.client.create({
      data: {
        userId: user.id,  // ← LIEN : userId dans Client
        name,
        email,
        phone: phone || '',
        password: hashedPassword,
        type: type?.toUpperCase() || 'PARTICULIER',
        sector: sector || '',
        tenantId,
        status: 'ACTIVE'
      }
    });

    // 3. Générer token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        tenantId: user.tenantId
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Inscription réussie ! Bienvenue chez DigiPip',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        clientId: client.id
      }
    });

  } catch (err) {
    console.error('[REGISTER ERROR]', err);
    res.status(500).json({ 
      error: "Erreur lors de l'inscription", 
      details: err.message 
    });
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

const tenantId = req.tenantId || req.body.tenantId || 'cmqlsn2yu0000ybn5t0unlx8u';

// Essayer avec l'index composite d'abord
let user = null;
try {
  user = await prisma.user.findUnique({
    where: { 
      tenantId_email: { 
        tenantId: tenantId,
        email: email 
      } 
    }
  });
} catch (e) {
  // Fallback sur findFirst si l'index composite échoue
  user = await prisma.user.findFirst({ where: { email } });
}

if (!user) {
  // Dernier essai sans tenant
  user = await prisma.user.findFirst({ where: { email } });
}

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Email ou mot de passe incorrect' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Récupérer le client lié
    const client = await prisma.client.findUnique({
      where: { userId: user.id }
    });

    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        tenantId: user.tenantId
      },
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
        tenantId: user.tenantId,
        clientId: client?.id || null
      }
    });

  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// ============================================================
// CRÉER UN COMPTE (Admin ou Responsable Marketing)
// POST /api/auth/create-client
// ============================================================
router.post('/create-client', authenticate, async (req, res) => {
  try {
    if (!['ADMIN', 'RESPONSABLE_MARKETING', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }

    const { 
      name, 
      email, 
      password, 
      phone, 
      type = 'PARTICULIER', 
      sector = '', 
      role = 'CLIENT',
      tenantId: bodyTenantId
    } = req.body;

    const tenantId = bodyTenantId || req.user.tenantId;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nom, email et mot de passe requis' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer le User
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || '',
        role: role,
        status: 'ACTIVE',
        tenantId,
        lastLogin: null
      }
    });

    // Créer le Client si c'est un CLIENT
    let client = null;
    if (role === 'CLIENT') {
      client = await prisma.client.create({
        data: {
          userId: user.id,
          name,
          email,
          phone: phone || '',
          password: hashedPassword,
          type: type.toUpperCase(),
          sector,
          tenantId,
          status: 'ACTIVE'
        }
      });
    }

    res.status(201).json({
      message: 'Compte créé avec succès',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        clientId: client?.id || null,
        status: user.status,
        createdAt: user.createdAt,
        type: client?.type || null,
        sector: client?.sector || null
      }
    });

  } catch (err) {
    console.error('[CREATE CLIENT ERROR]', err);
    res.status(500).json({ error: 'Erreur lors de la création du compte' });
  }
});

// ============================================================
// LISTE DES UTILISATEURS (Admin/RM uniquement)
// GET /api/auth/users
// ============================================================
router.get('/users', authenticate, async (req, res) => {
  try {
    if (!['ADMIN', 'RESPONSABLE_MARKETING', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès réservé' });
    }

    const tenantId = req.user.tenantId;

    // Récupérer les utilisateurs du tenant (pas les CLIENTS)
    const users = await prisma.user.findMany({
      where: {
        tenantId,
        role: { in: ['ADMIN', 'RESPONSABLE_MARKETING', 'SUPPORT', 'SUPER_ADMIN'] }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        lastLogin: true,
        phone: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);

  } catch (err) {
    console.error('[USERS LIST ERROR]', err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
});

// ============================================================
// LISTE DES CLIENTS (Admin/RM uniquement)
// GET /api/auth/clients
// ============================================================
router.get('/clients', authenticate, async (req, res) => {
  try {
    if (!['ADMIN', 'RESPONSABLE_MARKETING', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès réservé' });
    }

    const tenantId = req.user.tenantId;

    // Récupérer les users avec role=CLIENT et leur client lié
    const users = await prisma.user.findMany({
      where: {
        tenantId,
        role: 'CLIENT'
      },
      include: {
        client: true,
        inscriptions: {
          select: { id: true, campagneId: true, status: true }
        },
        _count: { select: { inscriptions: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const clients = users.map(u => ({
      id: u.client?.id || u.id,
      userId: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      type: u.client?.type?.toLowerCase() || 'particulier',
      sector: u.client?.sector || 'Non spécifié',
      status: u.status?.toLowerCase() || 'active',
      createdAt: u.createdAt,
      inscriptionsCount: u._count?.inscriptions || 0,
      campagnesInscrites: u.inscriptions?.map(i => i.campagneId) || []
    }));

    res.json(clients);

  } catch (err) {
    console.error('[CLIENTS LIST ERROR]', err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
});

// ============================================================
// MODIFIER UN UTILISATEUR
// PUT /api/auth/users/:id
// ============================================================
router.put('/users/:id', authenticate, async (req, res) => {
  try {
    if (!['ADMIN', 'RESPONSABLE_MARKETING', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès réservé' });
    }

    const { id } = req.params;
    const { name, email, role, status } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
    });

    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status
    });

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
    if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }

    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: { client: true }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Supprimer les inscriptions du client si existe
    if (user.client) {
      await prisma.inscription.deleteMany({ 
        where: { clientId: user.client.id } 
      }).catch(() => {});
    }

    // Supprimer le User (cascade supprime le Client grâce à onDelete: Cascade)
    await prisma.user.delete({ where: { id } });

    res.json({ message: 'Utilisateur supprimé avec succès' });

  } catch (err) {
    console.error('[DELETE USER ERROR]', err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
});

// ============================================================
// PROFIL UTILISATEUR CONNECTÉ
// GET /api/auth/me
// ============================================================
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        client: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      tenantId: user.tenantId,
      phone: user.phone,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      client: user.client ? {
        id: user.client.id,
        type: user.client.type,
        sector: user.client.sector,
        phone: user.client.phone
      } : null
    });

  } catch (err) {
    console.error('[ME ERROR]', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;