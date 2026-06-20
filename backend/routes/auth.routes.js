// backend/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'CLIENT', tenantId } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        tenantId: tenantId || req.tenantId,
        status: 'ACTIVE',
      }
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, tenantId: user.tenantId },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('[Register] Error:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Récupérer le tenantId depuis le middleware ou le body
    const tenantId = req.tenantId || req.body.tenantId;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID manquant' });
    }

    // ✅ CORRECTION : Utiliser tenantId_email
    const user = await prisma.user.findUnique({
      where: { 
        tenantId_email: { 
          tenantId: tenantId,
          email: email 
        } 
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, tenantId: user.tenantId },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        tenantId: user.tenantId 
      } 
    });
  } catch (error) {
    console.error('[Login] Error:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true, tenantId: true, status: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (error) {
    console.error('[Me] Error:', error);
    res.status(401).json({ error: 'Token invalide' });
  }
});

module.exports = router;