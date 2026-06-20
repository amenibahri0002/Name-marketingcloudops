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
// GET /api/certificats/mes-certificats
// ============================================
router.get('/mes-certificats', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const tenantId = req.tenantId || req.user?.tenantId;

    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non identifié' });
    }

    console.log('[CERTIFICATS] userId:', userId, 'tenantId:', tenantId);

    // Récupérer les inscriptions avec SEULEMENT les champs existants dans Campagne
    const inscriptions = await prisma.inscription.findMany({
      where: { 
        userId: userId,
        tenantId: tenantId
      },
      include: {
        campagne: {
          select: {
            title: true,
            dureeHeures: true,
            // PAS de dateDebut/dateFin — ces champs n'existent pas
            id: true
          }
        }
      }
    });

    console.log('[CERTIFICATS] Inscriptions trouvées:', inscriptions.length);

    // Filtrer celles qui sont terminées
    const inscriptionsTerminees = inscriptions.filter(ins => {
      const status = (ins.status || '').toUpperCase();
      return status === 'TERMINEE' || 
             status === 'COMPLETED' || 
             status === 'DONE' ||
             status === 'FINISHED';
    });

    // Formater comme certificats
    const certificats = inscriptionsTerminees.map((ins) => ({
      id: ins.id,
      formation: ins.campagne?.title || 'Formation',
      formateur: 'DigiLab Solutions',
      numero: `CERT-${String(ins.id).padStart(4, '0')}`,
      date: ins.updatedAt 
        ? new Date(ins.updatedAt).toLocaleDateString('fr-FR') 
        : new Date().toLocaleDateString('fr-FR'),
      duree: ins.campagne?.dureeHeures 
        ? `${ins.campagne.dureeHeures}h` 
        : '40h',
      status: 'disponible',
    }));

    console.log('[CERTIFICATS] Certificats retournés:', certificats.length);
    res.json(certificats);
    
  } catch (error) {
    console.error('[CERTIFICATS ERROR]', error);
    res.status(500).json({ 
      error: 'Erreur serveur', 
      details: error.message 
    });
  }
});

// ============================================
// GET /api/certificats/:id/download
// ============================================
router.get('/:id/download', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const certId = parseInt(req.params.id);

    if (isNaN(certId)) {
      return res.status(400).json({ error: 'ID invalide' });
    }

    const inscription = await prisma.inscription.findFirst({
      where: { 
        id: certId,
        userId: userId
      },
      include: { 
        campagne: { 
          select: { 
            title: true,
            dureeHeures: true
          } 
        }
      }
    });

    if (!inscription) {
      return res.status(404).json({ error: 'Certificat non trouvé' });
    }

    res.json({
      message: 'Certificat généré',
      certificatId: certId,
      formation: inscription.campagne?.title,
      date: new Date().toISOString()
    });
  } catch (error) {
    console.error('[CERTIFICAT DOWNLOAD ERROR]', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

module.exports = router;