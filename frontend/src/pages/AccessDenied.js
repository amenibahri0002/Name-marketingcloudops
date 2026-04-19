import React from 'react';
import { useNavigate } from 'react-router-dom';

function AccessDenied() {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#f8f9ff', fontFamily: "'Segoe UI', sans-serif"
    }}>
      <div style={{ fontSize: 64, marginBottom: 24 }}>🔒</div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1f2937', margin: '0 0 12px' }}>
        Accès refusé
      </h1>
      <p style={{ color: '#6b7280', marginBottom: 32 }}>
        Vous n'avez pas les permissions pour accéder à cette page.
      </p>
      <button onClick={() => navigate(-1)} style={{
        background: '#4f46e5', color: 'white', border: 'none',
        padding: '12px 28px', borderRadius: 8, fontSize: 15,
        fontWeight: 600, cursor: 'pointer'
      }}>
        Retour
      </button>
    </div>
  );
}

export default AccessDenied;