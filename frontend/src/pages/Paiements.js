import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Download, CheckCircle, Clock, ArrowLeft, FileText, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import api from '../api';

const THEME = {
  bg: '#f8fafc',
  card: '#ffffff',
  text: '#1e293b',
  textLight: '#64748b',
  border: '#e2e8f0',
  gold: '#d4a574',
  goldLight: '#f5efe6',
  goldDark: '#b8956a',
  success: '#10b981',
  successLight: '#d1fae5',
  blue: '#3b82f6',
  blueLight: '#dbeafe',
  dark: '#1a1a2e',
};

export default function Paiements() {
  const navigate = useNavigate();
  const [paiements, setPaiements] = useState([]);
  const [filtre, setFiltre] = useState('tous');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPaiements();
  }, []);

  const fetchPaiements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/paiements/mes-paiements');
      setPaiements(res.data || []);
    } catch (err) {
      console.error('Erreur paiements:', err);
      setError('Impossible de charger vos paiements');
    } finally {
      setLoading(false);
    }
  };

  const paiementsFiltres = filtre === 'tous' ? paiements : paiements.filter(p => p.status === filtre);

  const totalPaye = paiements.filter(p => p.status === 'paye').reduce((sum, p) => sum + (p.total || 0), 0);
  const totalEnAttente = paiements.filter(p => p.status === 'en_attente').reduce((sum, p) => sum + (p.total || 0), 0);

  const telechargerFacture = async (paiementId) => {
    try {
      const res = await api.get(`/api/paiements/${paiementId}/facture`);
      // Si le backend retourne un blob PDF
      if (res.headers['content-type']?.includes('pdf')) {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const a = document.createElement('a');
        a.href = url;
        a.download = `Facture_${paiementId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        // Placeholder: afficher un message
        alert('Facture #' + paiementId + ' - Montant: ' + res.data.montant + ' TND');
      }
    } catch (err) {
      alert('Erreur lors du téléchargement de la facture');
    }
  };

  return (
    <Layout>
      <div style={{ background: THEME.bg, minHeight: '100vh', color: THEME.text, fontFamily: 'Inter, system-ui, sans-serif', padding: '30px' }}>
        <style>{"::-webkit-scrollbar { width: 6px; height: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #d1c7b7; border-radius: 3px; } * { scrollbar-width: thin; scrollbar-color: #d1c7b7 transparent; }"}</style>

        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 30 }}>
            <button onClick={() => navigate('/campagnes')} style={{
              display: 'flex', alignItems: 'center', gap: 8, color: THEME.textLight,
              background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.95rem',
              transition: 'color 0.3s',
            }} onMouseEnter={e => e.currentTarget.style.color = THEME.text}
            onMouseLeave={e => e.currentTarget.style.color = THEME.textLight}>
              <ArrowLeft size={18} /> Retour
            </button>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: THEME.text }}>Mes Paiements</h1>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 30 }}>
            {[
              { icon: CreditCard, label: 'Paiements total', value: paiements.length, color: THEME.gold, bg: THEME.goldLight },
              { icon: CheckCircle, label: 'Payé', value: `${totalPaye.toFixed(2)} TND`, color: THEME.success, bg: '#d1fae5' },
              { icon: Clock, label: 'En attente', value: `${totalEnAttente.toFixed(2)} TND`, color: THEME.blue, bg: THEME.blueLight },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} style={{
                  background: THEME.card, padding: 24, borderRadius: 16,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: `1px solid ${THEME.border}`,
                  transition: 'all 0.3s',
                }} onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
                }} onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, background: stat.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 12, color: stat.color,
                  }}>
                    <Icon size={20} />
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: '0.9rem', color: THEME.textLight, marginTop: 4 }}>{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* Filtres */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            {['tous', 'paye', 'en_attente'].map(f => (
              <button key={f} onClick={() => setFiltre(f)} style={{
                padding: '8px 16px', borderRadius: 20, border: '2px solid',
                borderColor: filtre === f ? THEME.gold : THEME.border,
                background: filtre === f ? THEME.gold : THEME.card,
                color: filtre === f ? '#fff' : THEME.textLight,
                fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s',
                textTransform: f === 'tous' ? 'none' : 'capitalize',
              }}>
                {f === 'tous' ? 'Tous' : f === 'paye' ? 'Payés' : 'En attente'}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px', color: THEME.gold }} />
              <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
              <p style={{ color: THEME.textLight }}>Chargement de vos paiements...</p>
            </div>
          ) : error ? (
            <div style={{
              textAlign: 'center', padding: 40, background: '#fef2f2', borderRadius: 16,
              border: '1px solid #fecaca', color: '#dc2626',
            }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{error}</div>
              <button onClick={fetchPaiements} style={{
                padding: '10px 24px', borderRadius: 8, background: '#dc2626', color: '#fff',
                border: 'none', fontWeight: 600, cursor: 'pointer',
              }}>Réessayer</button>
            </div>
          ) : paiementsFiltres.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <FileText size={48} style={{ color: THEME.border, marginBottom: 16 }} />
              <h3 style={{ color: THEME.text, marginBottom: 8 }}>Aucun paiement</h3>
              <p style={{ color: THEME.textLight }}>Vous n'avez pas encore de paiement enregistré.</p>
            </div>
          ) : (
            paiementsFiltres.map((paiement, index) => (
              <motion.div key={paiement.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                style={{
                  background: THEME.card, padding: 24, borderRadius: 16,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: `1px solid ${THEME.border}`,
                  marginBottom: 16, transition: 'all 0.3s',
                }} onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
                }} onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <span style={{ fontSize: '0.85rem', color: THEME.textLight, fontFamily: 'monospace' }}>{paiement.id}</span>
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                    borderRadius: 20, fontSize: '0.8rem', fontWeight: 600,
                    background: paiement.status === 'paye' ? '#d1fae5' : THEME.blueLight,
                    color: paiement.status === 'paye' ? '#059669' : THEME.blue,
                  }}>
                    {paiement.status === 'paye' ? <CheckCircle size={14} /> : <Clock size={14} />}
                    {paiement.status === 'paye' ? 'Payé' : 'En attente'}
                  </span>
                </div>

                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: THEME.text, marginBottom: 12 }}>{paiement.formation}</div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: THEME.textLight, textTransform: 'uppercase' }}>Date</div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: THEME.text, marginTop: 4 }}>{paiement.date}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: THEME.textLight, textTransform: 'uppercase' }}>Mode</div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: THEME.text, marginTop: 4 }}>{paiement.mode}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: THEME.textLight, textTransform: 'uppercase' }}>Montant HT</div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: THEME.text, marginTop: 4 }}>{paiement.montant?.toFixed(2)} TND</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: `1px solid ${THEME.border}` }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: THEME.gold }}>
                    {paiement.total?.toFixed(2)} TND <span style={{ fontSize: '0.8rem', color: THEME.textLight, fontWeight: 400 }}>TTC</span>
                  </div>
                  <button onClick={() => telechargerFacture(paiement.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
                    background: THEME.gold, color: '#fff', border: 'none', borderRadius: 10,
                    fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s',
                  }} onMouseEnter={e => e.currentTarget.style.background = THEME.goldDark}
                  onMouseLeave={e => e.currentTarget.style.background = THEME.gold}>
                    <Download size={16} /> Facture
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}