const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

let notificationService;
try {
  notificationService = require('../services/notificationService');
} catch (e) {
  console.log('[WARN] notificationService non disponible');
  notificationService = null;
}

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
      status: p.status?.toLowerCase() || 'en_attente',  // ← Normaliser pour le frontend
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
    const tenantId = req.tenantId || req.user.tenantId;
    const { inscriptionId, montant, mode } = req.body;

    const paiement = await prisma.paiement.create({
      data: {
        userId,
        inscriptionId,
        montant,
        mode: mode?.toUpperCase() || 'CARTE',
        tenantId,
        status: 'PAYE',  // ← CORRIGÉ: 'PAYE' au lieu de 'CONFIRME'
      },
      include: {
        inscription: { include: { campagne: true } },
      },
    });

    // 🔔 NOTIFIER LE CLIENT (avec vérification)
    try {
      if (notificationService && typeof notificationService.notifyPaiement === 'function') {
        await notificationService.notifyPaiement(userId, {
          id: paiement.id,
          montant: paiement.montant,
          formation: paiement.inscription.campagne.title,
          date: new Date().toLocaleDateString('fr-FR'),
          mode: paiement.mode,
        });
      } else {
        console.log('[NOTIFY SKIP] notifyPaiement non disponible');
      }
    } catch (err) {
      console.error('[NOTIFY PAIEMENT ERROR]', err.message);
    }

    res.json(paiement);
  } catch (error) {
    console.error('[PAIEMENT CREATE ERROR]', error);
    res.status(500).json({ error: error.message });
  }
});
const puppeteer = require('puppeteer');

// GET /api/paiements/:id/facture - Facture HTML (imprimable en PDF par le navigateur)
router.get('/:id/facture', authenticate, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { id } = req.params;

    const paiement = await prisma.paiement.findFirst({
      where: { id: id, userId: userId },
      include: {
        inscription: {
          include: {
            campagne: true,
            user: { select: { name: true, email: true } }
          }
        }
      }
    });

    if (!paiement) {
      return res.status(404).json({ error: 'Paiement non trouvé' });
    }

    const montantHT = (paiement.montant / 1.19).toFixed(2);
    const tva = (paiement.montant - (paiement.montant / 1.19)).toFixed(2);

    const factureHTML = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="utf-8">
        <title>Facture ${paiement.id.slice(-8).toUpperCase()}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            padding: 40px; 
            color: #1e293b; 
            line-height: 1.6;
            max-width: 210mm;
            margin: 0 auto;
          }
          .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start;
            border-bottom: 3px solid #d4a574; 
            padding-bottom: 24px; 
            margin-bottom: 32px; 
          }
          .header-left h1 { 
            color: #d4a574; 
            font-size: 2.2rem; 
            margin-bottom: 4px; 
            letter-spacing: 2px;
          }
          .header-left p { color: #64748b; font-size: 0.9rem; }
          .header-right { text-align: right; }
          .header-right .facture-num { 
            font-size: 1.2rem; 
            font-weight: 700; 
            color: #1e293b; 
            margin-bottom: 4px;
          }
          .header-right .facture-date { color: #64748b; font-size: 0.9rem; }
          .badge { 
            display: inline-block; 
            padding: 5px 14px; 
            border-radius: 20px; 
            font-size: 0.75rem; 
            font-weight: 600; 
          }
          .badge-paye { background: #d1fae5; color: #065f46; }
          .badge-attente { background: #fef3c7; color: #92400e; }
          .grid-2 { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 24px; 
            margin-bottom: 32px; 
          }
          .box { background: #f8fafc; padding: 20px; border-radius: 12px; }
          .box h3 { 
            color: #d4a574; 
            font-size: 0.75rem; 
            text-transform: uppercase; 
            letter-spacing: 1px; 
            margin-bottom: 14px; 
            font-weight: 700;
          }
          .box p { margin-bottom: 6px; font-size: 0.9rem; }
          .box .big { font-size: 1.05rem; font-weight: 700; color: #1e293b; }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 24px 0; 
            font-size: 0.9rem;
          }
          th { 
            background: #f5efe6; 
            color: #1a1a2e; 
            padding: 14px; 
            text-align: left; 
            font-weight: 600; 
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          td { padding: 14px; border-bottom: 1px solid #e2e8f0; }
          .text-right { text-align: right; }
          .totals { 
            margin-top: 24px; 
            padding-top: 20px; 
            border-top: 2px solid #e2e8f0; 
            width: 320px;
            margin-left: auto;
          }
          .totals-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 10px; 
            font-size: 0.9rem; 
            color: #475569;
          }
          .totals-row.total { 
            font-size: 1.25rem; 
            font-weight: 800; 
            color: #d4a574; 
            margin-top: 14px; 
            padding-top: 14px; 
            border-top: 2px solid #d4a574; 
          }
          .footer { 
            margin-top: 60px; 
            text-align: center; 
            color: #94a3b8; 
            font-size: 0.75rem; 
            padding-top: 20px; 
            border-top: 1px solid #e2e8f0; 
          }
          .footer p { margin-bottom: 4px; }
          .print-btn {
            display: block;
            margin: 20px auto;
            padding: 12px 32px;
            background: #d4a574;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            font-size: 1rem;
          }
          @media print { 
            .no-print { display: none !important; } 
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <button class="print-btn no-print" onclick="window.print()">🖨️ Imprimer / Enregistrer en PDF</button>
        
        <div class="header">
          <div class="header-left">
            <h1>DIGIPIP</h1>
            <p>Cloud Marketing Solutions</p>
          </div>
          <div class="header-right">
            <div class="facture-num">FACTURE N° ${paiement.id.slice(-8).toUpperCase()}</div>
            <div class="facture-date">
              ${new Date(paiement.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
            <span class="badge badge-${paiement.status === 'PAYE' ? 'paye' : 'attente'}" style="margin-top: 10px;">
              ${paiement.status === 'PAYE' ? 'Payé' : 'En attente'}
            </span>
          </div>
        </div>

        <div class="grid-2">
          <div class="box">
            <h3>Facturé à</h3>
            <p class="big">${paiement.inscription?.user?.name || 'Client'}</p>
            <p>${paiement.inscription?.user?.email || ''}</p>
            <p style="margin-top: 6px; color: #64748b; font-size: 0.75rem;">ID Client: ${userId.slice(-8).toUpperCase()}</p>
          </div>
          <div class="box">
            <h3>Détails du paiement</h3>
            <p><strong>Mode :</strong> ${paiement.mode || 'Carte'}</p>
            <p><strong>Date :</strong> ${new Date(paiement.createdAt).toLocaleDateString('fr-FR')}</p>
            <p><strong>Référence :</strong> ${paiement.id}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 50%;">Description</th>
              <th style="text-align: center; width: 15%;">Qté</th>
              <th class="text-right" style="width: 20%;">Prix unit. HT</th>
              <th class="text-right" style="width: 15%;">Total HT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong style="font-size: 1rem;">${paiement.inscription?.campagne?.title || 'Formation'}</strong><br>
                <span style="color: #64748b; font-size: 0.8rem;">
                  ${paiement.inscription?.campagne?.description?.slice(0, 140) || 'Formation professionnelle'}...
                </span>
              </td>
              <td style="text-align: center;">1</td>
              <td class="text-right">${montantHT} TND</td>
              <td class="text-right">${montantHT} TND</td>
            </tr>
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-row">
            <span>Sous-total HT</span>
            <span><strong>${montantHT} TND</strong></span>
          </div>
          <div class="totals-row">
            <span>TVA 19%</span>
            <span><strong>${tva} TND</strong></span>
          </div>
          <div class="totals-row total">
            <span>TOTAL TTC</span>
            <span>${paiement.montant.toFixed(2)} TND</span>
          </div>
        </div>

        <div class="footer">
          <p><strong>DigiPip</strong> — Route Bouzayen Km 5, Immeuble El Bachir, 4ème étage App 4-2 – Sfax, Tunisia</p>
          <p>Tél : +216 22 044 105 | Email : contact@digipip.tn | MF : 1234567/A/B/000</p>
          <p style="margin-top: 10px; font-style: italic;">
            Cette facture a été générée électroniquement et est valable sans signature.
          </p>
        </div>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(factureHTML);

  } catch (error) {
    console.error('[FACTURE ERROR]', error);
    res.status(500).json({ error: 'Erreur lors de la génération de la facture', details: error.message });
  }
});
// ============================================
// GET /api/paiements — Liste tous les paiements (Admin)
// ============================================
router.get('/', authenticate, async (req, res) => {
  try {
    // Vérifier que c'est un admin
    if (!['ADMIN', 'RESPONSABLE_MARKETING', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès interdit' });
    }

    const tenantPrisma = req.tenantPrisma || getTenantPrisma(req.user.tenantId);

    const paiements = await tenantPrisma.paiement.findMany({
      include: {
        user: { select: { name: true, email: true } },
        inscription: {
          include: {
            campagne: { select: { title: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(paiements);
  } catch (err) {
    console.error('[PAIEMENTS LIST ERROR]', err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
});

module.exports = router;