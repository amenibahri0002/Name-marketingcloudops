import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, Download, CheckCircle, Clock, AlertCircle,
  Calendar, ArrowLeft, FileText, Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const COLORS = {
  primary: '#F5A623',
  primaryLight: '#FFF8E7',
  dark: '#0A0A0A',
  gray: '#666666',
  grayLight: '#F5F5F5',
  grayBorder: '#E5E5E5',
  white: '#FFFFFF',
  green: '#10B981',
  red: '#EF4444',
  blue: '#3B82F6',
};

// Données de démo (à remplacer par API)
const PAIEMENTS_DATA = [
  {
    id: 'INV-1234567890',
    formation: 'Formation Digital Marketing & AI',
    date: '30 Avril 2026',
    montant: 850,
    tva: 161.50,
    total: 1011.50,
    status: 'paye',
    mode: 'Carte Bancaire',
    facture: true
  },
  {
    id: 'INV-1234567891',
    formation: 'Formation Web WordPress',
    date: '8 Avril 2026',
    montant: 450,
    tva: 85.50,
    total: 535.50,
    status: 'paye',
    mode: 'Virement Bancaire',
    facture: true
  },
  {
    id: 'INV-1234567892',
    formation: 'Formation Design Graphique & Marketing Digital',
    date: '3 Avril 2026',
    montant: 1200,
    tva: 228,
    total: 1428,
    status: 'en_attente',
    mode: 'D17 - Paiement differe',
    facture: true
  }
];

export default function Paiements() {
  const navigate = useNavigate();
  const [filtre, setFiltre] = useState('tous');

  const paiementsFiltres = filtre === 'tous' 
    ? PAIEMENTS_DATA 
    : PAIEMENTS_DATA.filter(p => p.status === filtre);

  const totalPaye = PAIEMENTS_DATA
    .filter(p => p.status === 'paye')
    .reduce((sum, p) => sum + p.total, 0);

  const totalEnAttente = PAIEMENTS_DATA
    .filter(p => p.status === 'en_attente')
    .reduce((sum, p) => sum + p.total, 0);

  const telechargerFacture = (paiement) => {
    const factureHTML = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Facture ${paiement.id}</title>
<style>
  body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
  .header { border-bottom: 3px solid ${COLORS.primary}; padding-bottom: 20px; margin-bottom: 30px; }
  .header h1 { color: ${COLORS.primary}; margin: 0; font-size: 28px; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th { background: ${COLORS.primary}; color: white; padding: 12px; text-align: left; }
  td { padding: 12px; border-bottom: 1px solid ${COLORS.grayBorder}; }
  .total { font-weight: bold; font-size: 18px; color: ${COLORS.primary}; }
  .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; color: white; }
  .badge.paye { background: ${COLORS.green}; }
  .badge.attente { background: ${COLORS.blue}; }
</style>
</head>
<body>
  <div class="header">
    <h1>FACTURE</h1>
    <p><strong>N° ${paiement.id}</strong></p>
    <p>Date : ${paiement.date}</p>
    <span class="badge ${paiement.status === 'paye' ? 'paye' : 'attente'}">${paiement.status === 'paye' ? 'PAYÉE' : 'EN ATTENTE'}</span>
  </div>
  <table>
    <tr><th>Description</th><th>Montant HT</th><th>TVA 19%</th><th>Total TTC</th></tr>
    <tr><td><strong>${paiement.formation}</strong></td><td>${paiement.montant.toFixed(2)} TND</td><td>${paiement.tva.toFixed(2)} TND</td><td><strong>${paiement.total.toFixed(2)} TND</strong></td></tr>
  </table>
  <p><strong>Mode de paiement :</strong> ${paiement.mode}</p>
  <p style="margin-top:40px; text-align:center; color: #666;">DigiLab Solutions - +216 22 044 105</p>
</body>
</html>`;

    const blob = new Blob([factureHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Facture_' + paiement.id + '.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="paiements-page">
      <style>{`
        .paiements-page { min-height: 100vh; background: ${COLORS.grayLight}; padding: 30px; }
        .paiements-container { max-width: 1000px; margin: 0 auto; }

        .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 30px; }
        .back-btn { display: flex; align-items: center; gap: 8px; color: ${COLORS.gray}; background: none; border: none; cursor: pointer; font-size: 0.95rem; }
        .back-btn:hover { color: ${COLORS.dark}; }
        .page-title { font-size: 1.8rem; font-weight: 800; color: ${COLORS.dark}; }

        .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: ${COLORS.white}; padding: 24px; border-radius: 16px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border: 1px solid ${COLORS.grayBorder}; }
        .stat-value { font-size: 1.8rem; font-weight: 800; color: ${COLORS.primary}; }
        .stat-label { font-size: 0.9rem; color: ${COLORS.gray}; margin-top: 4px; }
        .stat-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }

        .filtres { display: flex; gap: 10px; margin-bottom: 20px; }
        .filtre-btn { padding: 8px 16px; border-radius: 20px; border: 2px solid ${COLORS.grayBorder}; background: ${COLORS.white}; color: ${COLORS.gray}; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .filtre-btn:hover, .filtre-btn.actif { background: ${COLORS.primary}; color: ${COLORS.white}; border-color: ${COLORS.primary}; }

        .paiement-card { background: ${COLORS.white}; padding: 24px; border-radius: 16px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border: 1px solid ${COLORS.grayBorder}; margin-bottom: 16px; transition: all 0.3s; }
        .paiement-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }

        .paiement-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
        .paiement-id { font-size: 0.85rem; color: ${COLORS.gray}; font-family: monospace; }
        .paiement-status { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
        .status-paye { background: ${COLORS.green}15; color: ${COLORS.green}; }
        .status-attente { background: ${COLORS.blue}15; color: ${COLORS.blue}; }

        .paiement-formation { font-size: 1.1rem; font-weight: 700; color: ${COLORS.dark}; margin-bottom: 12px; }

        .paiement-details { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px; }
        .detail-item { display: flex; flex-direction: column; }
        .detail-label { font-size: 0.75rem; color: ${COLORS.gray}; text-transform: uppercase; }
        .detail-value { font-size: 1rem; font-weight: 600; color: ${COLORS.dark}; margin-top: 4px; }

        .paiement-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid ${COLORS.grayBorder}; }
        .paiement-total { font-size: 1.3rem; font-weight: 800; color: ${COLORS.primary}; }
        .btn-facture { display: flex; align-items: center; gap: 8px; padding: 10px 18px; background: ${COLORS.primary}; color: ${COLORS.white}; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .btn-facture:hover { background: ${COLORS.primaryDark}; }

        .empty-state { text-align: center; padding: 60px 20px; }
        .empty-state svg { color: ${COLORS.grayBorder}; margin-bottom: 16px; }
        .empty-state h3 { color: ${COLORS.dark}; margin-bottom: 8px; }
        .empty-state p { color: ${COLORS.gray}; }

        @media (max-width: 768px) {
          .stats-row { grid-template-columns: 1fr; }
          .paiement-details { grid-template-columns: 1fr; }
          .paiements-page { padding: 20px; }
        }
      `}</style>

      <div className="paiements-container">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/campagnes')}>
            <ArrowLeft size={18} /> Retour
          </button>
          <h1 className="page-title">Mes Paiements</h1>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: COLORS.primaryLight, color: COLORS.primary }}>
              <CreditCard size={20} />
            </div>
            <div className="stat-value">{PAIEMENTS_DATA.length}</div>
            <div className="stat-label">Paiements total</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: COLORS.green + '15', color: COLORS.green }}>
              <CheckCircle size={20} />
            </div>
            <div className="stat-value">{totalPaye.toFixed(2)} TND</div>
            <div className="stat-label">Payé</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: COLORS.blue + '15', color: COLORS.blue }}>
              <Clock size={20} />
            </div>
            <div className="stat-value">{totalEnAttente.toFixed(2)} TND</div>
            <div className="stat-label">En attente</div>
          </div>
        </div>

        <div className="filtres">
          <button className={"filtre-btn " + (filtre === 'tous' ? 'actif' : '')} onClick={() => setFiltre('tous')}>Tous</button>
          <button className={"filtre-btn " + (filtre === 'paye' ? 'actif' : '')} onClick={() => setFiltre('paye')}>Payés</button>
          <button className={"filtre-btn " + (filtre === 'en_attente' ? 'actif' : '')} onClick={() => setFiltre('en_attente')}>En attente</button>
        </div>

        {paiementsFiltres.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <h3>Aucun paiement</h3>
            <p>Vous n'avez pas encore de paiement enregistré.</p>
          </div>
        ) : (
          paiementsFiltres.map((paiement, index) => (
            <motion.div 
              key={paiement.id}
              className="paiement-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="paiement-header">
                <span className="paiement-id">{paiement.id}</span>
                <span className={"paiement-status " + (paiement.status === 'paye' ? 'status-paye' : 'status-attente')}>
                  {paiement.status === 'paye' ? <CheckCircle size={14} /> : <Clock size={14} />}
                  {paiement.status === 'paye' ? 'Payé' : 'En attente'}
                </span>
              </div>

              <div className="paiement-formation">{paiement.formation}</div>

              <div className="paiement-details">
                <div className="detail-item">
                  <span className="detail-label">Date</span>
                  <span className="detail-value"><Calendar size={14} style={{ display: 'inline', marginRight: 4 }} />{paiement.date}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Mode</span>
                  <span className="detail-value">{paiement.mode}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Montant HT</span>
                  <span className="detail-value">{paiement.montant.toFixed(2)} TND</span>
                </div>
              </div>

              <div className="paiement-footer">
                <div className="paiement-total">{paiement.total.toFixed(2)} TND <span style={{ fontSize: '0.8rem', color: COLORS.gray, fontWeight: 400 }}>TTC</span></div>
                <button className="btn-facture" onClick={() => telechargerFacture(paiement)}>
                  <Download size={16} /> Facture
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}