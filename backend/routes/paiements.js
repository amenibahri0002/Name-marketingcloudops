const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();
const notificationService = require('../services/notificationService');
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

// GET /api/paiements/mes-paiements
router.get('/mes-paiements', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non identifié' });
    }

    const paiements = await prisma.paiement.findMany({
      where: { userId: userId },
      include: {
        inscription: {
          include: {
            campagne: { 
              select: { 
                title: true, 
                id: true,
                dureeHeures: true
                // PAS de dateDebut/dateFin
              } 
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = paiements.map(p => ({
      id: p.id,
      formation: p.inscription?.campagne?.title || 'Formation inconnue',
      formationId: p.inscription?.campagne?.id,
      date: p.createdAt 
        ? new Date(p.createdAt).toLocaleDateString('fr-FR') 
        : 'N/A',
      mode: p.mode || 'Carte',
      montant: p.montant || 0,
      total: p.montant || 0,
      status: p.status || 'en_attente',
      inscriptionId: p.inscriptionId
    }));

    res.json(formatted);
    
  } catch (error) {
    console.error('[PAIEMENTS ERROR]', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});
// POST /api/paiements - Enregistrer un paiement
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const tenantId = req.tenantId;
    const { inscriptionId, montant, mode } = req.body;

    const paiement = await prisma.paiement.create({
      data: {
        userId,
        inscriptionId,
        montant,
        mode,
        tenantId,
        status: 'CONFIRME',
      },
      include: {
        inscription: { include: { campagne: true } },
      },
    });

    // 🔔 NOTIFIER LE CLIENT
    notificationService.notifyPaiement(userId, {
      id: paiement.id,
      montant: paiement.montant,
      formation: paiement.inscription.campagne.title,
      date: new Date().toLocaleDateString('fr-FR'),
      mode: paiement.mode,
    }).catch(err => console.error('[NOTIFY PAIEMENT ERROR]', err));

    res.json(paiement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;