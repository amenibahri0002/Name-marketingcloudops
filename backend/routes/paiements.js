const express = require('express');
const { PrismaClient } = require('@prisma/client');
const PDFDocument = require('pdfkit');
const { authMiddleware: authenticate } = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient();

// GET /api/paiements/mes-paiements - Paiements du client connect?
router.get('/mes-paiements', authenticate, async (req, res) => {
  try {
    const paiements = await prisma.paiement.findMany({
      where: { userId: req.user.userId },
      include: {
        inscription: {
          include: {
            campagne: { select: { title: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Formater les donn?es pour le frontend
    const formatted = paiements.map(p => ({
      id: p.id,
      formation: p.inscription?.campagne?.title || 'Formation inconnue',
      date: p.createdAt ? new Date(p.createdAt).toLocaleDateString('fr-FR') : 'N/A',
      mode: p.mode || 'Carte',
      montant: p.montant || 0,
      total: p.montant || 0,
      status: p.status || 'en_attente',
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error('Erreur paiements:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/paiements/:id/facture - T?l?charger facture
router.get('/:id/facture', authenticate, async (req, res) => {
  try {
    const paiement = await prisma.paiement.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { inscription: { include: { campagne: true, user: { select: { email: true, name: true} } } } }
    });
    
    if (!paiement) return res.status(404).json({ error: 'Paiement non trouv?' });
    


// Cr?er un PDF
    const doc = new PDFDocument();
    
    // Configurer les headers pour le t?l?chargement
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Facture_${paiement.id}_${new Date().toISOString().split('T')[0]}.pdf"`);
doc.pipe(res);
// Contenu du PDF
    doc.fontSize(25).text('DigiPip - Facture', 100, 80);
    doc.fontSize(15).text(`Facture #${paiement.id}`, 100, 150);
    doc.fontSize(12).text(`Date: ${new Date(paiement.createdAt).toLocaleDateString('fr-FR')}`, 100, 180);
    doc.text(`Client: ${paiement.inscription?.user?.name || 'Client'}`, 100, 200);
    doc.text(`Email: ${paiement.inscription?.user?.email || ''}`, 100, 220);
    
    doc.moveDown();
    doc.fontSize(14).text('Formation:', 100, 260);
    doc.fontSize(12).text(`${paiement.inscription?.campagne?.title || 'Formation'}`, 100, 280);
    
    doc.moveDown();
    doc.fontSize(14).text('D?tails du paiement:', 100, 320);
    doc.fontSize(12).text(`Mode: ${paiement.mode || 'Carte'}`, 100, 340);
    doc.text(`Montant HT: ${paiement.montant?.toFixed(2)} TND`, 100, 360);
    doc.text(`TVA (19%): ${(paiement.montant * 0.19).toFixed(2)} TND`, 100, 380);
    doc.text(`Total TTC: ${(paiement.montant * 1.19).toFixed(2)} TND`, 100, 400);
    
    doc.moveDown();
    doc.fontSize(10).text('DigiPip - Cloud Marketing', 100, 500);
    doc.text('Sfax, Tunisie', 100, 515);
    doc.text('contact@digipip.com', 100, 530);
    
    // Finaliser le PDF
    doc.end();
    
  } catch (error) {
    console.error('Erreur facture:', error);
    res.status(500).json({ error: 'Erreur lors de la g?n?ration de la facture' });
  }
});
module.exports = router;
