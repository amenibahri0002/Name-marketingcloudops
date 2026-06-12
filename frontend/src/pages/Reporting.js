import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import Layout from '../Layout';

const C = {
  bg: '#f8fafc', surface: '#ffffff', surface2: '#f1f5f9',
  border: '#e2e8f0', text: '#0f172a', text2: '#475569', muted: '#94a3b8',
  gold: '#f5a623', green: '#10b981', red: '#ef4444', blue: '#3b82f6',
  orange: '#f59e0b', purple: '#8b5cf6', cloud: '#60a5fa', sky: '#0ea5e9'
};

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    .reporting * { box-sizing: border-box; font-family: 'Inter', sans-serif; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .5; } }
    .anim-fade { animation: fadeInUp .4s ease-out forwards; }
    ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
  `}</style>
);

const Card = ({ children, style = {} }) => {
  const [hover, setHover] = useState(false);
  return (
    <div 
      onMouseEnter={() => setHover(true)} 
      onMouseLeave={() => setHover(false)}
      style={{
        background: C.surface, borderRadius: 16, border: '1px solid ' + C.border,
        overflow: 'hidden', transition: 'all .3s cubic-bezier(.4,0,.2,1)',
        boxShadow: hover ? '0 20px 40px -12px rgba(0,0,0,.12)' : '0 1px 3px rgba(0,0,0,.05)',
        transform: hover ? 'translateY(-3px)' : 'translateY(0)',
        ...style
      }}
    >
      {children}
    </div>
  );
};

const KPICard = ({ title, value, subtitle, trend, icon, color, delay = 0 }) => {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <Card style={{ padding: 24, opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(16px)', transition: `all .5s ease ${delay}ms` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{icon}</div>
        {trend && <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: trend.startsWith('+') ? '#d1fae5' : '#fee2e2', color: trend.startsWith('+') ? '#059669' : '#dc2626' }}>{trend.startsWith('+') ? '↗' : '↘'} {trend.replace('+', '')}</span>}
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: C.text, letterSpacing: '-0.02em', marginBottom: 4 }}>{value}</div>
      {subtitle && <div style={{ fontSize: 12, color: C.muted }}>{subtitle}</div>}
    </Card>
  );
};

const ProgressBar = ({ value, max = 100, color, height = 8 }) => {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1, height, background: C.surface2, borderRadius: height / 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: pct + '%', background: color || C.gold, borderRadius: height / 2, transition: 'width 1.5s cubic-bezier(.4,0,.2,1)' }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: C.text2, minWidth: 36, textAlign: 'right' }}>{pct.toFixed(0)}%</span>
    </div>
  );
};

export default function Reporting() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    users: [], campagnes: [], inscriptions: [], notifications: [],
    reportType: 'monthly', dateRange: '30j'
  });

  useEffect(() => { fetchReportData(); }, [data.reportType, data.dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true); setError(null);
      const [usersRes, campagnesRes, inscriptionsRes, notificationsRes] = await Promise.all([
        api.get('/api/auth/users').catch(() => ({ data: [] })),
        api.get('/api/campagnes').catch(() => ({ data: [] })),
        api.get('/api/inscriptions').catch(() => ({ data: [] })),
        api.get('/api/notifications').catch(() => ({ data: [] }))
      ]);
      const users = Array.isArray(usersRes.data) ? usersRes.data : [];
      const campagnes = Array.isArray(campagnesRes.data) ? campagnesRes.data : [];
      const inscriptions = Array.isArray(inscriptionsRes.data) ? inscriptionsRes.data : [];
      const notifications = Array.isArray(notificationsRes.data) ? notificationsRes.data : [];
      setData(prev => ({ ...prev, users, campagnes, inscriptions, notifications }));
    } catch (err) { console.error('Erreur reporting:', err); setError('Erreur lors du chargement des données'); }
    finally { setLoading(false); }
  };

  const reportData = useMemo(() => {
    const totalRevenue = data.campagnes.reduce((acc, c) => { const inscrits = c.placesTotal - c.placesRestantes; return acc + (inscrits * (c.prix || 0)); }, 0);
    const avgPrice = data.campagnes.length > 0 ? data.campagnes.reduce((acc, c) => acc + (c.prix || 0), 0) / data.campagnes.length : 0;
    const conversionRate = data.inscriptions.length > 0 && data.campagnes.length > 0 ? ((data.inscriptions.length / (data.campagnes.length * 20)) * 100).toFixed(1) : 0;
    const satisfaction = 94.2;
    const byType = {}; data.campagnes.forEach(c => { byType[c.type || 'FORMATION'] = (byType[c.type || 'FORMATION'] || 0) + 1; });
    const bySegment = {}; data.users.forEach(u => { const segment = u.type || 'particulier'; bySegment[segment] = (bySegment[segment] || 0) + 1; });
    const monthlyRevenue = [
      { month: 'Jan', revenue: 45000, target: 50000 }, { month: 'Fév', revenue: 52000, target: 55000 },
      { month: 'Mar', revenue: 48000, target: 50000 }, { month: 'Avr', revenue: 61000, target: 60000 },
      { month: 'Mai', revenue: 58000, target: 60000 }, { month: 'Juin', revenue: totalRevenue, target: 70000 },
    ];
    return { totalRevenue, avgPrice: avgPrice.toFixed(0), conversionRate, satisfaction, byType: Object.entries(byType).map(([type, count]) => ({ type, count })), bySegment: Object.entries(bySegment).map(([segment, count]) => ({ segment, count })), monthlyRevenue };
  }, [data.campagnes, data.inscriptions, data.users]);

  const handleExport = () => {
    const report = { date: new Date().toISOString(), type: data.reportType, range: data.dateRange, data: reportData };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `report-${data.reportType}-${new Date().toISOString().split('T')[0]}.json`; a.click(); URL.revokeObjectURL(url);
  };

  if (loading) return (
    <Layout>
      <div className="reporting" style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16, animation: 'pulse 1.5s infinite' }}>📈</div>
          <p style={{ color: C.muted }}>Génération du rapport...</p>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="reporting" style={{ minHeight: '100vh', background: C.bg, color: C.text }}>
        <GlobalStyles />
        <main style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 32px 40px' }}>
          <div className="anim-fade">
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
              <KPICard title="Revenus Totaux" value={reportData.totalRevenue.toLocaleString() + ' TND'} subtitle="Objectif: 350,000 TND" trend="+8.5" icon="💰" color={C.green} delay={0} />
              <KPICard title="Prix Moyen" value={reportData.avgPrice + ' TND'} subtitle="Par formation" trend="+3.2" icon="💵" color={C.blue} delay={100} />
              <KPICard title="Taux Conversion" value={reportData.conversionRate + '%'} subtitle="Objectif: 25%" trend="+2.1" icon="📊" color={C.gold} delay={200} />
              <KPICard title="Satisfaction" value={reportData.satisfaction + '%'} subtitle="Score moyen" trend="+1.5" icon="⭐" color={C.orange} delay={300} />
            </div>

            {/* Revenue Chart */}
            <Card style={{ padding: 24, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text }}>📈 Évolution des Revenus</h2>
                <span style={{ fontSize: 12, color: C.muted }}>6 derniers mois</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 250, padding: '10px 0' }}>
                {reportData.monthlyRevenue.map((m, i) => {
                  const max = Math.max(...reportData.monthlyRevenue.map(x => x.target));
                  const h1 = (m.revenue / max) * 200; const h2 = (m.target / max) * 200;
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.text }}>{(m.revenue / 1000).toFixed(0)}k</div>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, width: '100%', justifyContent: 'center' }}>
                        <div style={{ width: '45%', height: h2, background: C.surface2, borderRadius: '4px 4px 0 0', border: '2px dashed ' + C.border }} />
                        <div style={{ width: '45%', height: h1, background: i === reportData.monthlyRevenue.length - 1 ? C.gold : C.blue, borderRadius: '4px 4px 0 0' }} />
                      </div>
                      <div style={{ fontSize: 10, color: C.muted }}>{m.month}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 20, fontSize: 11, marginTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: C.blue }} /><span style={{ color: C.muted }}>Réel</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: C.surface2, border: '2px dashed ' + C.border }} /><span style={{ color: C.muted }}>Objectif</span></div>
              </div>
            </Card>

            {/* Distribution Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <Card style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text }}>📊 Répartition par Type</h2>
                  <span style={{ fontSize: 12, color: C.muted }}>{data.campagnes.length} campagnes</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {reportData.byType.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: C.surface2, borderRadius: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: [C.blue, C.green, C.orange, C.purple][i % 4] + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: [C.blue, C.green, C.orange, C.purple][i % 4] }}>{item.count}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{item.type}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>{((item.count / data.campagnes.length) * 100).toFixed(0)}% des campagnes</div>
                      </div>
                      <ProgressBar value={item.count} max={data.campagnes.length} color={[C.blue, C.green, C.orange, C.purple][i % 4]} height={6} />
                    </div>
                  ))}
                  {reportData.byType.length === 0 && <div style={{ textAlign: 'center', padding: 32, color: C.muted }}><div style={{ fontSize: '2rem', marginBottom: 8 }}>📊</div><div>Aucune donnée disponible</div></div>}
                </div>
              </Card>

              <Card style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text }}>👥 Répartition par Segment</h2>
                  <span style={{ fontSize: 12, color: C.muted }}>{data.users.length} clients</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {reportData.bySegment.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: C.surface2, borderRadius: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: [C.blue, C.green, C.orange, C.purple][i % 4] + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: [C.blue, C.green, C.orange, C.purple][i % 4] }}>{item.count}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{item.segment}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>{((item.count / data.users.length) * 100).toFixed(0)}% des clients</div>
                      </div>
                      <ProgressBar value={item.count} max={data.users.length} color={[C.blue, C.green, C.orange, C.purple][i % 4]} height={6} />
                    </div>
                  ))}
                  {reportData.bySegment.length === 0 && <div style={{ textAlign: 'center', padding: 32, color: C.muted }}><div style={{ fontSize: '2rem', marginBottom: 8 }}>👥</div><div>Aucune donnée disponible</div></div>}
                </div>
              </Card>
            </div>

            {/* Detailed Report */}
            <Card style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text }}>📋 Rapport Détaillé</h2>
                <button onClick={handleExport} style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid ' + C.border, background: C.surface, color: C.muted, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>📥 Télécharger JSON</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <div style={{ padding: 20, background: C.surface2, borderRadius: 12 }}>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Performance Commerciale</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: C.text }}>{reportData.conversionRate}%</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Taux de conversion</div>
                  <div style={{ marginTop: 12, padding: '8px 12px', background: C.surface, borderRadius: 8, border: '1px solid ' + C.border }}>
                    <div style={{ fontSize: 11, color: C.muted }}>Revenus: {reportData.totalRevenue.toLocaleString()} TND</div>
                  </div>
                </div>
                <div style={{ padding: 20, background: C.surface2, borderRadius: 12 }}>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Engagement Clients</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: C.text }}>{data.users.length}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Utilisateurs inscrits</div>
                  <div style={{ marginTop: 12, padding: '8px 12px', background: C.surface, borderRadius: 8, border: '1px solid ' + C.border }}>
                    <div style={{ fontSize: 11, color: C.muted }}>Inscriptions: {data.inscriptions.length}</div>
                  </div>
                </div>
                <div style={{ padding: 20, background: C.surface2, borderRadius: 12 }}>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Satisfaction Client</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: C.text }}>{reportData.satisfaction}%</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Score moyen</div>
                  <div style={{ marginTop: 12, padding: '8px 12px', background: C.surface, borderRadius: 8, border: '1px solid ' + C.border }}>
                    <div style={{ fontSize: 11, color: C.muted }}>Notifications: {data.notifications.length}</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </Layout>
  );
}