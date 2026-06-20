// backend/routes/notifications.js
const express = require('express');
const router = express.Router();
const { manualDiffusion } = require('../services/notificationService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST /api/notifications/diffuse — Diffusion manuelle d'une campagne (ASYNCHRONE)
router.post('/diffuse', async (req, res) => {
  try {
    // ✅ CORRECTION : Extraire title et message (pas customMessage)
    const { campagneId, channels, title, message } = req.body;
    const tenantId = req.tenantId || req.user?.tenantId;

    console.log('[DIFFUSE] req.body:', req.body);  // Debug
    console.log('[DIFFUSE] title reçu:', title);     // Debug
    console.log('[DIFFUSE] message reçu:', message); // Debug

    if (!campagneId) {
      return res.status(400).json({ error: 'campagneId requis' });
    }
    if (!channels || !Array.isArray(channels) || channels.length === 0) {
      return res.status(400).json({ error: 'Au moins un canal requis' });
    }
    if (!title) {
      return res.status(400).json({ error: 'title requis' });
    }
    if (!message) {
      return res.status(400).json({ error: 'message requis' });
    }

    // Récupérer la campagne
    const campagne = await prisma.campagne.findUnique({
      where: { id: campagneId },
    });

    if (!campagne) {
      return res.status(404).json({ error: 'Campagne non trouvée' });
    }

    // Vérifier que l'utilisateur a le droit (Responsable Marketing ou Admin)
    if (req.user.role !== 'ADMIN' && req.user.role !== 'RESPONSABLE_MARKETING') {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    // ✅ ASYNCHRONE : Répondre immédiatement au frontend
    res.json({
      success: true,
      message: `Diffusion lancée sur ${channels.length} canal(s) en arrière-plan`,
      status: 'processing',
      channels: channels,
    });

    // ✅ Traiter la diffusion en arrière-plan (sans await, non-bloquant)
    const finalTenantId = campagne.tenantId || tenantId;

    console.log('[DIFFUSE] Lancement de la diffusion en arrière-plan...');

    manualDiffusion(finalTenantId, campagneId, channels, title, message)
      .then(results => {
        console.log('[DIFFUSE] Terminé avec succès:', JSON.stringify(results, null, 2));
      })
      .catch(err => {
        console.error('[DIFFUSE] Erreur en arrière-plan:', err);
      });

  } catch (err) {
    console.error('[NOTIFY DIFFUSE ERROR]', err);
    // Si la réponse n'a pas encore été envoyée
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || 'Erreur lors de la diffusion' });
    }
  }
});

// POST /api/notifications/receive — Recevoir une notification push et la sauvegarder
router.post('/receive', async (req, res) => {
  try {
    const { title, message, type, campagneId, priority } = req.body;
    const userId = req.user.id;
    const tenantId = req.tenantId;

    if (!title || !message) {
      return res.status(400).json({ error: 'Title et message sont requis' });
    }

    console.log(`[NOTIFICATION RECEIVE] User: ${userId}, Title: ${title}`);

    // Créer la notification en base
    const notification = await prisma.notification.create({
      data: {
        tenantId,
        userId,
        type: type || 'CAMPAGNE_PROMO',
        title,
        message,
        campagneId: campagneId || null,
        read: false,
        priority: priority || 1,
      },
    });

    // Créer le recipient
    await prisma.notificationRecipient.create({
      data: {
        notificationId: notification.id,
        userId,
        channels: ['PUSH'],
      },
    });

    console.log(`[NOTIFICATION RECEIVE] Notification ${notification.id} sauvegardée`);
    res.json({ success: true, notification });
  } catch (err) {
    console.error('[NOTIFICATION RECEIVE ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;