// backend/routes/inscriptions.js - CORRIGÉ FINAL
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// POST /api/inscriptions - Inscription (publique ou connectée)
router.post('/', async (req, res) => {
  try {
    const { 
      name, email, phone, entreprise, notes,
      formule, paymentType, prixTotal,
      campagneId, userId, paymentData
    } = req.body;

    console.log('=== INSCRIPTION REQUEST ===');
    console.log('Body:', req.body);

    // Validation
    if (!campagneId) {
      return res.status(400).json({ error: 'ID de campagne requis' });
    }

    // Vérifier la campagne
    const campagne = await prisma.campagne.findUnique({
      where: { id: parseInt(campagneId) }
    });
    if (!campagne) {
      return res.status(404).json({ error: 'Formation non trouvée' });
    }

    // Si userId fourni, récupérer les infos utilisateur
    let finalName = name;
    let finalEmail = email;
    let finalPhone = phone;
    
    if (userId) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: parseInt(userId) },
          include: { client: true }
        });
        if (user) {
          finalName = finalName || user.name;
          finalEmail = finalEmail || user.email;
          finalPhone = finalPhone || user.client?.phone || '';
        }
      } catch (e) {
        console.log('User fetch error:', e.message);
      }
    }

    // Validation email
    if (!finalEmail || finalEmail.trim() === '') {
      return res.status(400).json({ 
        error: 'Email requis' 
      });
    }

    // Vérifier si déjà inscrit
    const existing = await prisma.inscription.findFirst({
      where: { 
        AND: [
          { email: finalEmail },
          { campagneId: parseInt(campagneId) }
        ]
      }
    });
    
    if (existing) {
      return res.status(400).json({ 
        error: 'Vous êtes déjà inscrit à cette formation' 
      });
    }

    // Décrémenter places si limité
    if (campagne.placesRestantes !== null && campagne.placesRestantes <= 0) {
      return res.status(400).json({ error: 'Plus de places disponibles' });
    }

    if (campagne.placesRestantes !== null) {
      await prisma.campagne.update({
        where: { id: parseInt(campagneId) },
        data: { placesRestantes: { decrement: 1 } }
      });
    }

    // CRÉER L'INSCRIPTION
    let inscription;
    try {
      inscription = await prisma.inscription.create({
        data: {
          name: finalName || 'Inconnu',
          email: finalEmail,
          phone: finalPhone || '',
          entreprise: entreprise || null,
          notes: notes || null,
          formule: formule || 'standard',
          paymentType: paymentType || 'carte',
          prixTotal: prixTotal ? Math.round(parseFloat(prixTotal)) : null,
          campagneId: parseInt(campagneId),
          userId: userId ? parseInt(userId) : null,
          status: paymentType === 'carte' ? 'paye' : 'en_attente',
          paymentData: paymentData || null
        },
        include: { campagne: true }
      });
      console.log('Inscription créée:', inscription.id);
    } catch (createError) {
      console.error('Erreur création inscription:', createError);
      return res.status(500).json({ 
        error: 'Erreur lors de la création de l\'inscription',
        details: createError.message 
      });
    }

    // CRÉER LE PAIEMENT (optionnel)
    if (prixTotal) {
      try {
        await prisma.paiement.create({
          data: {
            inscriptionId: inscription.id,
            montant: Math.round(parseFloat(prixTotal)),
            mode: paymentType || 'carte',
            status: paymentType === 'carte' ? 'paye' : 'en_attente',
            reference: `INV-${Date.now()}-${inscription.id}`,
            userId: userId ? parseInt(userId) : null
          }
        });
        console.log('Paiement créé');
      } catch (paymentError) {
        console.error('Erreur création paiement (non bloquant):', paymentError.message);
      }
    }

    res.status(201).json({
      message: 'Inscription réussie !',
      inscription,
      needAccount: !userId
    });

  } catch (error) {
    console.error('[INSCRIPTION ERROR]', error);
    res.status(500).json({ 
      error: 'Erreur serveur', 
      details: error.message 
    });
  }
});

// GET /api/inscriptions/mes-inscriptions - Inscriptions du client connecté
router.get('/mes-inscriptions', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'techevent_secret_2026');
    
    const inscriptions = await prisma.inscription.findMany({
      where: { userId: decoded.userId },
      include: {
        campagne: true,
        paiements: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(inscriptions);
  } catch (error) {
    console.error('[MES INSCRIPTIONS ERROR]', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/inscriptions - Liste toutes les inscriptions (ADMIN/MARKETING uniquement)
router.get('/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Vérifier l'authentification
    if (!authHeader) {
      return res.status(401).json({ error: 'Non authentifié - Token manquant' });
    }

    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'techevent_secret_2026');
    
    console.log('GET /api/inscriptions - Token decoded:', decoded);
    
    // Vérifier le rôle
    if (decoded.role !== 'ADMIN' && decoded.role !== 'RESPONSABLE_MARKETING') {
      return res.status(403).json({ error: 'Accès interdit - Rôle insuffisant' });
    }

    // ADMIN ou RESPONSABLE_MARKETING → voit TOUTES les inscriptions
    const inscriptions = await prisma.inscription.findMany({
      include: {
        campagne: true,
        user: { 
          select: { 
            id: true, 
            name: true, 
            email: true
            
          } 
        },
        paiements: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`[ADMIN/MARKETING] ${inscriptions.length} inscriptions retournées`);
    res.json(inscriptions);
  } catch (error) {
    console.error('[INSCRIPTIONS LIST ERROR]', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

module.exports = router;