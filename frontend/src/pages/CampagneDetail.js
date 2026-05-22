import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const T = {
  bg: '#080d14',
  bgCard: '#0d1520',
  border: '#1a2d45',
  gold: '#f5a623',
  green: '#22c55e',
  text: '#c8d8e8',
  textHi: '#e8f4ff',
  muted: '#4a6380',
};

export default function CampagneDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campagne, setCampagne] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inscrit, setInscrit] = useState(false);

  useEffect(() => {
    // Simulation temporaire
    setTimeout(() => {
      setCampagne({
        id,
        title: "Conférence IA 2026",
        description: "Événement majeur sur l'intelligence artificielle.",
        date: "2026-04-15",
        type: "Événement"
      });
      setLoading(false);
    }, 500);
  }, [id]);

  const handleInscription = () => {
    setInscrit(true);
    alert("✅ Inscription réussie !");
  };

  if (loading) return <div style={{padding: '100px', textAlign:'center'}}>Chargement...</div>;
  if (!campagne) return <div>Campagne non trouvée</div>;

  return (
    <div style={{ padding: '40px', background: T.bg, minHeight: '100vh', color: T.text }}>
      <button onClick={() => navigate('/mes-campagnes')} style={{marginBottom:30}}>
        ← Retour à Mes Campagnes
      </button>

      <div style={{ maxWidth: 800, margin: '0 auto', background: T.bgCard, padding: 40, borderRadius: 16, border: `1px solid ${T.border}` }}>
        <h1 style={{ fontSize: 32, color: T.textHi }}>{campagne.title}</h1>
        <p style={{ color: T.muted, fontSize: 18 }}>{campagne.description}</p>

        <div style={{ margin: '30px 0' }}>
          <p><strong>Date :</strong> {new Date(campagne.date).toLocaleDateString('fr-FR')}</p>
          <p><strong>Type :</strong> {campagne.type}</p>
        </div>

        {!inscrit ? (
          <button onClick={handleInscription} style={{
            padding: '18px 40px', fontSize: 18, background: T.gold, color: '#000',
            border: 'none', borderRadius: 12, fontWeight: 'bold', cursor: 'pointer'
          }}>
            S'INSCRIRE À L'ÉVÉNEMENT
          </button>
        ) : (
          <h2 style={{color: T.green}}>🎉 Vous êtes inscrit !</h2>
        )}
      </div>
    </div>
  );
}