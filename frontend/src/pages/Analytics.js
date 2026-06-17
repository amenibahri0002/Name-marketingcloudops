import React, { useState, useEffect, useCallback } from 'react';
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
  danger: '#ef4444',
  dangerLight: '#fee2e2',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  info: '#3b82f6',
  infoLight: '#dbeafe',
  dark: '#1a1a2e',
};

const TABS = [
  { id: 'overview', label: "Vue d'ensemble", icon: '📊' },
  { id: 'performance', label: 'Performance', icon: '🎯' },
  { id: 'canaux', label: 'Canaux', icon: '📡' },
  { id: 'segments', label: 'Segments', icon: '👥' },
  { id: 'inscriptions', label: 'inscriptions', icon: '📝' },
  { id: 'top', label: 'Top Campagnes', icon: '🏆' },
];

const TIME_FILTERS = [
  { label: '7j', days: 7 },
  { label: '30j', days: 30 },
  { label: '90j', days: 90 },
  { label: '1an', days: 365 },
];

const SCROLLBAR_STYLE = `
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #d1c7b7; border-radius: 3px; }
  * { scrollbar-width: thin; scrollbar-color: #d1c7b7 transparent; }
`;

const SPINNER_STYLE = `@keyframes spin { to { transform: rotate(360deg); } }`;

const AnalyticsMarketing = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeFilter, setTimeFilter] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [evolution, setEvolution] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [canaux, setCanaux] = useState([]);
  const [segments, setSegments] = useState([]);
  const [inscriptionsData, setinscriptionsData] = useState([]);
  const [topCampagnes, setTopCampagnes] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled([
        api.get('/api/analytics/kpis'),
        api.get(`/api/analytics/evolution?days=${timeFilter}`),
        api.get('/api/analytics/performance'),
        api.get('/api/analytics/canaux'),
        api.get('/api/analytics/segments'),
        api.get(`/api/analytics/inscriptions?days=${timeFilter}`),
        api.get('/api/analytics/top-campagnes'),
      ]);

      if (results[0].status === 'fulfilled') setKpis(results[0].value.data);
      if (results[1].status === 'fulfilled') setEvolution(results[1].value.data);
      if (results[2].status === 'fulfilled') setPerformance(results[2].value.data);
      if (results[3].status === 'fulfilled') setCanaux(results[3].value.data);
      if (results[4].status === 'fulfilled') setSegments(results[4].value.data);
      if (results[5].status === 'fulfilled') setinscriptionsData(results[5].value.data);
      if (results[6].status === 'fulfilled') setTopCampagnes(results[6].value.data);

      const failed = results.filter(r => r.status === 'rejected');
      if (failed.length > 0) {
        console.warn('Certaines routes analytics ont echoue:', failed.map(f => f.reason?.message));
      }
    } catch (err) {
      console.error('Erreur analytics:', err);
      setError('Erreur lors du chargement des donnees analytics');
    } finally {
      setLoading(false);
    }
  }, [timeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getMaxValue = (arr, key) => Math.max(...arr.map(d => d[key] || 0), 1);

  const renderKPIs = () => {
    if (!kpis) return null;
    const cards = [
      { title: 'Campagnes Actives', value: kpis.campagnesActives, change: kpis.campagnesChange, icon: '🚀', color: THEME.gold, bg: THEME.goldLight },
      { title: 'inscriptions', value: kpis.inscriptionsTotal, change: kpis.inscriptionsChange, icon: '👥', color: THEME.info, bg: THEME.infoLight },
      { title: 'Revenus (TND)', value: kpis.revenus?.toLocaleString(), change: kpis.revenusChange, icon: '💰', color: THEME.success, bg: THEME.successLight },
      { title: 'Taux Conversion', value: `${kpis.tauxConversion}%`, change: null, icon: '📈', color: THEME.warning, bg: THEME.warningLight },
      { title: 'Nouveaux Clients', value: kpis.nouveauxClients, change: kpis.clientsChange, icon: '✨', color: '#8b5cf6', bg: '#ede9fe' },
      { title: 'Satisfaction', value: kpis.satisfaction, change: null, icon: '⭐', color: '#ec4899', bg: '#fce7f3' },
    ];

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
        {cards.map((card, i) => (
          <div key={i} style={{
            background: THEME.card,
            borderRadius: 16,
            padding: 24,
            borderTop: `4px solid ${card.color}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            transition: 'all 0.2s',
            cursor: 'pointer',
          }} onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.12)';
          }} onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, background: card.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
              }}>{card.icon}</div>
              {card.change !== null && (
                <span style={{
                  fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
                  background: card.change >= 0 ? '#d1fae5' : '#fee2e2',
                  color: card.change >= 0 ? '#059669' : '#dc2626',
                }}>
                  {card.change >= 0 ? '↗' : '↘'} {Math.abs(card.change)}%
                </span>
              )}
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: THEME.text, marginBottom: 4 }}>{card.value}</div>
            <div style={{ fontSize: 13, color: THEME.textLight, fontWeight: 500 }}>{card.title}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderEvolution = () => {
    if (!evolution.length) return (
      <div style={{ textAlign: 'center', padding: 60, color: THEME.textLight }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
        <div>Aucune donnee d evolution disponible</div>
      </div>
    );
    const maxInsc = getMaxValue(evolution, 'inscriptions');
    const maxRev = getMaxValue(evolution, 'revenus');

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        <div style={{ background: THEME.card, borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600, color: THEME.text }}>📈 inscriptions</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 200 }}>
            {evolution.map((d, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: '100%', background: `linear-gradient(to top, ${THEME.info}, ${THEME.infoLight})`,
                  borderRadius: '4px 4px 0 0', height: `${(d.inscriptions / maxInsc) * 180}px`,
                  transition: 'height 0.5s', minHeight: 4,
                }} />
                <span style={{ fontSize: 10, color: THEME.textLight, transform: 'rotate(-45deg)', transformOrigin: 'top left', whiteSpace: 'nowrap' }}>
                  {d.date?.slice(5)}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: THEME.card, borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600, color: THEME.text }}>💰 Revenus</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 200 }}>
            {evolution.map((d, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: '100%', background: `linear-gradient(to top, ${THEME.success}, ${THEME.successLight})`,
                  borderRadius: '4px 4px 0 0', height: `${(d.revenus / maxRev) * 180}px`,
                  transition: 'height 0.5s', minHeight: 4,
                }} />
                <span style={{ fontSize: 10, color: THEME.textLight, transform: 'rotate(-45deg)', transformOrigin: 'top left', whiteSpace: 'nowrap' }}>
                  {d.date?.slice(5)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPerformance = () => {
    if (!performance.length) return (
      <div style={{ textAlign: 'center', padding: 60, color: THEME.textLight }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
        <div>Aucune donnee de performance disponible</div>
      </div>
    );
    return (
      <div style={{ background: THEME.card, borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: 32 }}>
        <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600, color: THEME.text }}>🎯 Performance des Campagnes</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: THEME.textLight, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Campagne</th>
                <th style={{ textAlign: 'center', padding: '12px 16px', color: THEME.textLight, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Inscrits</th>
                <th style={{ textAlign: 'center', padding: '12px 16px', color: THEME.textLight, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Places</th>
                <th style={{ textAlign: 'center', padding: '12px 16px', color: THEME.textLight, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Remplissage</th>
                <th style={{ textAlign: 'center', padding: '12px 16px', color: THEME.textLight, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Conversion</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', color: THEME.textLight, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Revenus</th>
              </tr>
            </thead>
            <tbody>
              {performance.map((p, i) => (
                <tr key={p.id || i} style={{ borderBottom: `1px solid ${THEME.border}`, transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 16px', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: THEME.goldLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🚀</div>
                      <div>
                        <div style={{ fontWeight: 600, color: THEME.text }}>{p.title}</div>
                        <div style={{ fontSize: 12, color: THEME.textLight }}>{p.type}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', padding: '14px 16px', fontWeight: 600 }}>{p.inscrits}</td>
                  <td style={{ textAlign: 'center', padding: '14px 16px', color: THEME.textLight }}>{p.placesTotal}</td>
                  <td style={{ textAlign: 'center', padding: '14px 16px' }}>
                    <span style={{
                      padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                      background: p.tauxRemplissage >= 80 ? '#d1fae5' : p.tauxRemplissage >= 50 ? '#fef3c7' : '#fee2e2',
                      color: p.tauxRemplissage >= 80 ? '#059669' : p.tauxRemplissage >= 50 ? '#d97706' : '#dc2626',
                    }}>{p.tauxRemplissage}%</span>
                  </td>
                  <td style={{ textAlign: 'center', padding: '14px 16px', fontWeight: 600, color: THEME.success }}>{p.tauxConversion}%</td>
                  <td style={{ textAlign: 'right', padding: '14px 16px', fontWeight: 600, color: THEME.text }}>{p.revenus?.toLocaleString()} TND</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCanaux = () => {
    if (!canaux.length) return (
      <div style={{ textAlign: 'center', padding: 60, color: THEME.textLight }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📡</div>
        <div>Aucune donnee de canaux disponible</div>
      </div>
    );
    const maxVal = getMaxValue(canaux, 'value');
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444'];

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        <div style={{ background: THEME.card, borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600, color: THEME.text }}>📡 Repartition par Canal</h3>
          {canaux.map((c, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14 }}>
                <span style={{ fontWeight: 500, color: THEME.text }}>{c.name}</span>
                <span style={{ fontWeight: 600, color: THEME.text }}>{c.value}</span>
              </div>
              <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  width: `${(c.value / maxVal) * 100}%`, height: '100%', background: colors[i % colors.length],
                  borderRadius: 4, transition: 'width 0.5s',
                }} />
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 12, color: THEME.textLight }}>
                <span>📖 Ouverture: {c.tauxOuverture}%</span>
                <span>👆 Clics: {c.tauxClic}%</span>
                <span>✅ Conversions: {c.conversions}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: THEME.card, borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600, color: THEME.text }}>📊 Statistiques Canaux</h3>
          {canaux.map((c, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
              borderRadius: 12, marginBottom: 10, background: '#f8fafc',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: colors[i % colors.length] + '20',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }}>📡</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: THEME.text, fontSize: 14 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: THEME.textLight }}>{c.value} notifications envoyees</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: colors[i % colors.length], fontSize: 16 }}>{c.tauxOuverture}%</div>
                <div style={{ fontSize: 11, color: THEME.textLight }}>ouverture</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSegments = () => {
    if (!segments.length) return (
      <div style={{ textAlign: 'center', padding: 60, color: THEME.textLight }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
        <div>Aucune donnee de segments disponible</div>
      </div>
    );
    const maxVal = getMaxValue(segments, 'value');
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        <div style={{ background: THEME.card, borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600, color: THEME.text }}>👥 Segments Clients</h3>
          {segments.map((s, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14 }}>
                <span style={{ fontWeight: 500, color: THEME.text }}>{s.name}</span>
                <span style={{ fontWeight: 600, color: THEME.text }}>{s.value} clients</span>
              </div>
              <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  width: `${(s.value / maxVal) * 100}%`, height: '100%', background: colors[i % colors.length],
                  borderRadius: 4, transition: 'width 0.5s',
                }} />
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 12, color: THEME.textLight }}>
                <span>📝 {s.inscriptions} inscriptions</span>
                <span>💰 {s.revenuTotal?.toLocaleString()} TND</span>
                <span>❤️ Fidelite: {s.fidelite}%</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: THEME.card, borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600, color: THEME.text }}>📋 Details Segments</h3>
          {segments.map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
              borderRadius: 12, marginBottom: 10, background: '#f8fafc',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: colors[i % colors.length] + '20',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }}>👤</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: THEME.text, fontSize: 14 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: THEME.textLight }}>{s.canalPrefere} • Revenu moyen: {s.revenuMoyen} TND</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: colors[i % colors.length], fontSize: 16 }}>{s.clients}</div>
                <div style={{ fontSize: 11, color: THEME.textLight }}>clients</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderinscriptions = () => {
    if (!inscriptionsData.length) return (
      <div style={{ textAlign: 'center', padding: 60, color: THEME.textLight }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
        <div>Aucune donnee d inscriptions disponible</div>
      </div>
    );
    const maxCount = getMaxValue(inscriptionsData, 'count');

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        <div style={{ background: THEME.card, borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600, color: THEME.text }}>📝 Evolution des inscriptions</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 200 }}>
            {inscriptionsData.map((d, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: '100%', background: `linear-gradient(to top, ${THEME.info}, ${THEME.infoLight})`,
                  borderRadius: '4px 4px 0 0', height: `${(d.count / maxCount) * 180}px`,
                  transition: 'height 0.5s', minHeight: 4,
                }} />
                <span style={{ fontSize: 10, color: THEME.textLight, transform: 'rotate(-45deg)', transformOrigin: 'top left', whiteSpace: 'nowrap' }}>
                  {d.date?.slice(5)}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: THEME.card, borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600, color: THEME.text }}>📊 Repartition par Statut</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Confirmees', key: 'confirmees', color: THEME.success, bg: THEME.successLight },
              { label: 'En attente', key: 'attente', color: THEME.warning, bg: THEME.warningLight },
              { label: 'Annulees', key: 'annulees', color: THEME.danger, bg: THEME.dangerLight },
            ].map((item, idx) => {
              const total = inscriptionsData.reduce((sum, d) => sum + (d[item.key] || 0), 0);
              const maxTotal = inscriptionsData.reduce((sum, d) => sum + (d.count || 0), 0);
              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14 }}>
                    <span style={{ fontWeight: 500, color: THEME.text }}>{item.label}</span>
                    <span style={{ fontWeight: 600, color: item.color }}>{total}</span>
                  </div>
                  <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      width: `${maxTotal ? (total / maxTotal) * 100 : 0}%`, height: '100%', background: item.color,
                      borderRadius: 4, transition: 'width 0.5s',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderTopCampagnes = () => {
    if (!topCampagnes.length) return (
      <div style={{ textAlign: 'center', padding: 60, color: THEME.textLight }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
        <div>Aucune donnee de top campagnes disponible</div>
      </div>
    );
    return (
      <div style={{ background: THEME.card, borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: 32 }}>
        <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600, color: THEME.text }}>🏆 Top 10 Campagnes</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: THEME.textLight, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>#</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: THEME.textLight, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Campagne</th>
                <th style={{ textAlign: 'center', padding: '12px 16px', color: THEME.textLight, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>inscriptions</th>
                <th style={{ textAlign: 'center', padding: '12px 16px', color: THEME.textLight, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Remplissage</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', color: THEME.textLight, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Revenus</th>
              </tr>
            </thead>
            <tbody>
              {topCampagnes.map((c, i) => (
                <tr key={c.id || i} style={{ borderBottom: `1px solid ${THEME.border}`, transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: i < 3 ? THEME.gold : THEME.textLight, fontSize: 18 }}>
                    {i + 1}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: i < 3 ? THEME.goldLight : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                        {i < 3 ? '🥇' : '🚀'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: THEME.text }}>{c.title || c.nom}</div>
                        <div style={{ fontSize: 12, color: THEME.textLight }}>{c.type} • {c.location}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', padding: '14px 16px', fontWeight: 600 }}>{c.inscriptions}</td>
                  <td style={{ textAlign: 'center', padding: '14px 16px' }}>
                    <span style={{
                      padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                      background: c.tauxRemplissage >= 80 ? '#d1fae5' : c.tauxRemplissage >= 50 ? '#fef3c7' : '#fee2e2',
                      color: c.tauxRemplissage >= 80 ? '#059669' : c.tauxRemplissage >= 50 ? '#d97706' : '#dc2626',
                    }}>{c.tauxRemplissage}%</span>
                  </td>
                  <td style={{ textAlign: 'right', padding: '14px 16px', fontWeight: 600, color: THEME.text }}>{c.revenus?.toLocaleString()} TND</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return (
        <>
          {renderKPIs()}
          {renderEvolution()}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div style={{ background: THEME.card, borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: THEME.text }}>🏆 Top 5 Campagnes</h3>
                <button onClick={() => setActiveTab('top')} style={{
                  fontSize: 13, color: THEME.gold, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600,
                }}>Voir tout →</button>
              </div>
              {topCampagnes.slice(0, 5).map((c, i) => (
                <div key={c.id || i} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  borderRadius: 10, marginBottom: 8, background: '#f8fafc', cursor: 'pointer',
                }} onClick={() => navigate(`/campagnes/${c.slug || c.id}`)}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, background: i < 3 ? THEME.goldLight : '#f1f5f9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                  }}>{i < 3 ? '🥇' : '🚀'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: THEME.text, fontSize: 14 }}>{c.title || c.nom}</div>
                    <div style={{ fontSize: 12, color: THEME.textLight }}>{c.inscriptions} inscriptions</div>
                  </div>
                  <div style={{ fontWeight: 700, color: THEME.gold, fontSize: 14 }}>{c.revenus?.toLocaleString()} TND</div>
                </div>
              ))}
              {!topCampagnes.length && (
                <div style={{ textAlign: 'center', padding: 40, color: THEME.textLight }}>Aucune campagne</div>
              )}
            </div>
            <div style={{ background: THEME.card, borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: THEME.text }}>📡 Canaux Actifs</h3>
                <button onClick={() => setActiveTab('canaux')} style={{
                  fontSize: 13, color: THEME.gold, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600,
                }}>Voir tout →</button>
              </div>
              {canaux.slice(0, 5).map((c, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  borderRadius: 10, marginBottom: 8, background: '#f8fafc',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, background: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'][i % 5] + '20',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                  }}>📡</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: THEME.text, fontSize: 14 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: THEME.textLight }}>{c.value} envois</div>
                  </div>
                  <div style={{ fontWeight: 700, color: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'][i % 5], fontSize: 14 }}>{c.tauxOuverture}%</div>
                </div>
              ))}
              {!canaux.length && (
                <div style={{ textAlign: 'center', padding: 40, color: THEME.textLight }}>Aucun canal</div>
              )}
            </div>
          </div>
        </>
      );
      case 'performance': return renderPerformance();
      case 'canaux': return renderCanaux();
      case 'segments': return renderSegments();
      case 'inscriptions': return renderinscriptions();
      case 'top': return renderTopCampagnes();
      default: return null;
    }
  };

  return (
    <Layout>
      <div style={{ background: THEME.bg, minHeight: '100vh', color: THEME.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
        <style>{SCROLLBAR_STYLE}</style>

        {/* Header sticky avec titre + filtres */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 50, background: THEME.card,
          borderBottom: `1px solid ${THEME.border}`, padding: '20px 32px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: THEME.goldLight,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>📊</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: THEME.text }}>KPIs Marketing</h1>
              <p style={{ margin: 0, fontSize: 13, color: THEME.textLight }}>Analytics et performance des campagnes</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {TIME_FILTERS.map(f => (
              <button key={f.days} onClick={() => setTimeFilter(f.days)} style={{
                padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                border: 'none',
                background: timeFilter === f.days ? THEME.dark : '#f1f5f9',
                color: timeFilter === f.days ? 'white' : THEME.textLight,
                transition: 'all 0.2s',
              }}>{f.label}</button>
            ))}
            <button onClick={fetchData} style={{
              width: 36, height: 36, borderRadius: 8, border: `1px solid ${THEME.border}`,
              background: THEME.card, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: THEME.textLight,
            }} title="Rafraichir">🔄</button>
          </div>
        </div>

        {/* Tabs sticky */}
        <div style={{
          position: 'sticky', top: 85, zIndex: 40, background: THEME.bg,
          borderBottom: `1px solid ${THEME.border}`, padding: '0 32px',
          display: 'flex', gap: 4, overflowX: 'auto',
        }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: '14px 20px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap',
              color: activeTab === tab.id ? THEME.gold : THEME.textLight,
              borderBottom: `3px solid ${activeTab === tab.id ? THEME.gold : 'transparent'}`,
              transition: 'all 0.2s',
            }}>
              <span style={{ marginRight: 8 }}>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <main style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 32px 40px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
              <div style={{
                width: 40, height: 40, border: `3px solid ${THEME.border}`,
                borderTop: `3px solid ${THEME.gold}`, borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }} />
              <style>{SPINNER_STYLE}</style>
            </div>
          ) : error ? (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12,
              padding: 24, textAlign: 'center', color: '#dc2626',
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{error}</div>
              <button onClick={fetchData} style={{
                padding: '10px 24px', borderRadius: 8, background: '#dc2626', color: 'white',
                border: 'none', fontWeight: 600, cursor: 'pointer', marginTop: 12,
              }}>Reessayer</button>
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>
    </Layout>
  );
};

export default AnalyticsMarketing;
