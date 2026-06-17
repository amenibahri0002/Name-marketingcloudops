import React, { useState } from 'react';
import { CreditCard, CheckCircle, Loader2 } from 'lucide-react';
import api from '../api';

const THEME = {
  success: '#10b981',
  successLight: '#d1fae5',
  gold: '#f5a623',
  text: '#1e293b',
  textLight: '#64748b',
};

export default function PaiementTest({ campagneId, prix, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const simulerPaiement = async () => {
    try {
      setLoading(true);
      
      // Étape 1 : S'inscrire d'abord
      let inscriptionId;
      
      try {
        const inscriptionRes = await api.post('/api/inscriptions', {
          campagneId: campagneId
        });
        inscriptionId = inscriptionRes.data.inscription.id;
      } catch (err) {
        // Déjà inscrit, récupérer l'inscription
        const mesinscriptions = await api.get('/api/inscriptions/mes-inscriptions');
        const ins = mesinscriptions.data.find(i => i.campagneId === campagneId || i.campagne?.id === campagneId);
        if (!ins) throw new Error('inscription non trouvée');
        inscriptionId = ins.id;
      }

      // Étape 2 : Simuler le paiement
      const paiementRes = await api.post('/api/paiements/simuler', {
        inscriptionId: inscriptionId
      });

      if (paiementRes.data.success) {
        setDone(true);
        onSuccess?.();
      }

    } catch (err) {
      alert('❌ Erreur: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div style={{ 
        padding: 24, background: THEME.successLight, 
        border: '2px solid ' + THEME.success,
        borderRadius: 16, textAlign: 'center'
      }}>
        <CheckCircle size={48} style={{ color: THEME.success, marginBottom: 12 }} />
        <h3 style={{ color: THEME.success, marginBottom: 8 }}>✅ Paiement simulé !</h3>
        <p style={{ color: THEME.textLight }}>
          Vous êtes maintenant inscrit et payé.<br/>
          Allez dans "Mes inscriptions" pour voir la formation.
        </p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: 24, background: '#fffbeb', 
      border: '2px dashed #f59e0b',
      borderRadius: 16, textAlign: 'center'
    }}>
      <div style={{ 
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: '#f59e0b', color: 'white',
        padding: '6px 16px', borderRadius: 20,
        fontSize: '0.85rem', fontWeight: 700,
        marginBottom: 16
      }}>
        🧪 MODE TEST
      </div>
      
      <h3 style={{ color: THEME.text, marginBottom: 8 }}>
        Simuler le paiement
      </h3>
      <p style={{ color: THEME.textLight, marginBottom: 20 }}>
        Aucun vrai paiement ne sera effectué.<br/>
        C'est juste pour tester le flow.
      </p>
      
      <button
        onClick={simulerPaiement}
        disabled={loading}
        style={{
          width: '100%', padding: '16px',
          background: THEME.gold, color: 'white',
          border: 'none', borderRadius: 12,
          fontWeight: 700, fontSize: '1.1rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 10
        }}
      >
        {loading ? (
          <>
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
            Traitement...
          </>
        ) : (
          <>
            <CreditCard size={20} />
            Payer {prix} TND (TEST)
          </>
        )}
      </button>
      
      <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
    </div>
  );
}
