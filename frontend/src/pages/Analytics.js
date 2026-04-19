import React, { useState, useEffect } from 'react';
import api from '../api';

function Analytics() {
  const [kpis, setKpis] = useState(null);
  const [evolution, setEvolution] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/analytics/kpis'),
      api.get('/api/analytics/evolution')
    ]).then(([kpisRes, evolutionRes]) => {
      setKpis(kpisRes.data);
      setEvolution(evolutionRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <div style={{ color: '#6b7280' }}>Chargement des analytics...</div>
    </div>
  );

  const kpiCards = kpis ? [
    { label: 'Total Clients', value: kpis.overview.totalClients, icon: '👥', color: '#4f46e5', bg: '#eef2ff' },
    { label: 'Total Contacts', value: kpis.overview.totalContacts, icon: '📋', color: '#059669', bg: '#ecfdf5' },
    { label: 'Campagnes envoyées', value: kpis.overview.campagnesEnvoyees, icon: '📢', color: '#0891b2', bg: '#e0f7ff' },
    { label: 'Campagnes planifiées', value: kpis.overview.campagnesPlanifiees, icon: '📅', color: '#d97706', bg: '#fffbeb' },
  ] : []

  const perfCards = kpis ? [
    { label: 'Emails envoyés', value: kpis.performance.totalEmailsSent, icon: '📧', color: '#4f46e5' },
    { label: 'Taux d\'ouverture', value: kpis.performance.tauxOuvertureMoyen + '%', icon: '👁️', color: '#059669' },
    { label: 'Taux de clic', value: kpis.performance.tauxClicMoyen + '%', icon: '🖱️', color: '#0891b2' },
    { label: 'Conversions', value: kpis.performance.totalConversions, icon: '✅', color: '#d97706' },
    { label: 'ROI Total', value: kpis.performance.roiTotal + '%', icon: '💰', color: '#7c3aed' },
  ] : []

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', margin: 0 }}>Analytics & KPIs</h1>
        <p style={{ color: '#6b7280', marginTop: 4, fontSize: 14 }}>
          Tableau de bord analytique complet de votre plateforme
        </p>
      </div>

      {/* Overview KPIs */}
      <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1f2937', margin: '0 0 16px' }}>
        Vue d'ensemble
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {kpiCards.map(k => (
          <div key={k.label} style={{
            background: 'white', borderRadius: 12,
            border: '1px solid #e8e8f0', padding: 20,
            display: 'flex', alignItems: 'center', gap: 16
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: k.bg, display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 22
            }}>
              {k.icon}
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance KPIs */}
      <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1f2937', margin: '0 0 16px' }}>
        Performance des campagnes
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 32 }}>
        {perfCards.map(k => (
          <div key={k.label} style={{
            background: 'white', borderRadius: 12,
            border: '1px solid #e8e8f0', padding: 20,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{k.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Evolution */}
      <div style={{
        background: 'white', borderRadius: 12,
        border: '1px solid #e8e8f0', padding: 24, marginBottom: 32
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1f2937', margin: '0 0 20px' }}>
          Évolution des campagnes par mois
        </h2>
        {evolution.length === 0 ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', padding: 20 }}>
            Aucune donnée disponible
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>Mois</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>Campagnes</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>Emails envoyés</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>Ouvertures</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>Conversions</th>
              </tr>
            </thead>
            <tbody>
              {evolution.map((e, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}>
                  <td style={{ padding: '12px', fontSize: 14, fontWeight: 500, color: '#1f2937' }}>{e.mois}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ background: '#eef2ff', color: '#4f46e5', padding: '2px 8px', borderRadius: 20, fontSize: 12 }}>
                      {e.campagnes}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: 14, color: '#6b7280' }}>{e.emailsSent}</td>
                  <td style={{ padding: '12px', fontSize: 14, color: '#6b7280' }}>{e.opens}</td>
                  <td style={{ padding: '12px', fontSize: 14, color: '#6b7280' }}>{e.conversions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Segments stats */}
      <div style={{
        background: 'white', borderRadius: 12,
        border: '1px solid #e8e8f0', padding: 24
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1f2937', margin: '0 0 16px' }}>
          Résumé analytique
        </h2>
        {kpis && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div style={{ background: '#f8f9ff', borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>SEGMENTS ACTIFS</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#4f46e5' }}>{kpis.overview.totalSegments}</div>
            </div>
            <div style={{ background: '#f0fdf4', borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>TAUX DE CONVERSION</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#059669' }}>{kpis.performance.tauxConversionMoyen}%</div>
            </div>
            <div style={{ background: '#fdf4ff', borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>ROI GLOBAL</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#7c3aed' }}>{kpis.performance.roiTotal}%</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Analytics;