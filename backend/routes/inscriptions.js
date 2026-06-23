const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// ← IMPORT AVEC FALLBACK
let notificationService;
try {
  notificationService = require('../services/notificationService');
} catch (e) {
  console.log('[WARN] notificationService non disponible');
  notificationService = null;
}

const { authenticate } = require('../middleware/auth');

// GET /api/inscriptions - Liste du tenant
router.get('/', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const inscriptions = await prisma.inscription.findMany({
      where: { tenantId },
      include: {
        campagne: { select: { id: true, title: true } },
        user: { select: { id: true, name: true, email: true } },
        client: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(inscriptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/inscriptions/mes-inscriptions
router.get('/mes-inscriptions', authenticate, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const tenantId = req.tenantId || req.user.tenantId;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID manquant' });
    }

    const inscriptions = await prisma.inscription.findMany({
      where: { 
        userId: userId,
        tenantId: tenantId 
      },
      include: {
        campagne: {
          select: {
            id: true,
            title: true,
            slug: true,
            dateScheduled: true,
            dateAffichee: true,
            duree: true,
            format: true,
            dureeHeures: true,
            lieu: true,
            contact: true,
            image: true,
            prix: true
          }
        },
        paiements: {
          select: {
            id: true,
            status: true,
            montant: true,
            mode: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(inscriptions);
  } catch (err) {
    console.error('[MES-INSCRIPTIONS ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/inscriptions - Créer une inscription
router.post('/', async (req, res) => {
  try {
const userId = req.user?.id || req.user?.userId || null;
const tenantId = req.tenantId || req.user?.tenantId;    
    const { campagneId, name, email, phone, formule, paymentType, prixTotal } = req.body;

    console.log('[INSCRIPTION POST] Body:', req.body);
    console.log('[INSCRIPTION POST] tenantId:', tenantId);
    console.log('[INSCRIPTION POST] userId:', userId);

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID manquant. Veuillez vous reconnecter.' });
    }

    if (!campagneId) {
      return res.status(400).json({ error: 'Campagne ID manquant' });
    }

    // Récupérer les infos utilisateur AVEC clientId
    let userName = name;
    let userEmail = email;
    let userClientId = null;
    
    if (!userName || !userEmail) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, phone: true, tenantId: true, clientId: true }
      });
      
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
      
      userName = userName || user.name;
      userEmail = userEmail || user.email;
      userClientId = user.clientId;
    }

    // ✅ DÉTERMINER LES STATUTS SELON LE MODE DE PAIEMENT
    const isImmediatePayment = ['carte', 'virement'].includes(paymentType);
    const inscriptionStatus = isImmediatePayment ? 'PAYEE' : 'EN_ATTENTE';
    const paiementStatus = isImmediatePayment ? 'PAYE' : 'EN_ATTENTE';

    // ✅ CRÉER L'INSCRIPTION AVEC LE BON STATUT
    const inscription = await prisma.inscription.create({
      data: {
        name: userName,
        email: userEmail,
        phone: phone || null,
        status: inscriptionStatus,  // ← Utiliser le statut calculé
        formule: formule || null,
        paymentType: paymentType || null,
        prixTotal: prixTotal || null,
        tenant: { connect: { id: tenantId } },
        campagne: { connect: { id: campagneId } },
        user: userId ? { connect: { id: userId } } : undefined,
        client: userClientId ? { connect: { id: userClientId } } : undefined
      },
      include: {
        campagne: true,
        tenant: { select: { name: true } },
        user: { select: { name: true, email: true } },
        client: { select: { name: true } }
      },
    });

    // ✅ CRÉER LE PAIEMENT ASSOCIÉ
    try {
      await prisma.paiement.create({
        data: {
          tenantId: tenantId,
          montant: prixTotal || 0,
          mode: (paymentType || 'ESPECES').toUpperCase(),
          status: paiementStatus,  // ← EN_ATTENTE pour espèces, PAYE pour carte/virement
          inscriptionId: inscription.id,
          userId: userId
        }
      });
      console.log('[PAIEMENT] Créé avec statut', paiementStatus, 'pour mode', paymentType);
    } catch (err) {
      console.error('[PAIEMENT CREATE ERROR]', err.message);
    }

    // NOTIFIER LE CLIENT
    try {
      if (notificationService && typeof notificationService.notifyInscription === 'function') {
        await notificationService.notifyInscription(userId, {
          id: inscription.id,
          formation: inscription.campagne.title,
          date: inscription.campagne.dateScheduled,
          lieu: inscription.campagne.lieu,
          numero: `INS-${String(inscription.id).padStart(4, '0')}`,
          tenantId: tenantId,
        });
      } else {
        console.log('[NOTIFY SKIP] Service non disponible');
      }
    } catch (err) {
      console.error('[NOTIFY INSCRIPTION ERROR]', err.message);
    }

    res.status(201).json({
      success: true,
      message: 'Inscription créée avec succès',
      inscription
    });

  } catch (error) {
    console.error('[INSCRIPTION CREATE ERROR]', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/inscriptions/:id/status
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const tenantId = req.tenantId;

    if (!status || !['EN_ATTENTE', 'CONFIRMEE', 'PAYEE', 'ANNULEE', 'TERMINEE'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const inscription = await prisma.inscription.updateMany({
      where: { id: id, tenantId },
      data: { status }
    });

    res.json({ success: true, inscription });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/inscriptions/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    await prisma.inscription.deleteMany({ 
      where: { id: req.params.id, tenantId }
    });
    res.json({ message: 'Inscription supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;