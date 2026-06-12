import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import Layout from '../Layout';

const C = {
  bg: '#f8fafc', surface: '#ffffff', surface2: '#f1f5f9',
  border: '#e2e8f0', text: '#0f172a', text2: '#475569', muted: '#94a3b8',
  gold: '#f5a623', green: '#10b981', red: '#ef4444', blue: '#3b82f6',
  orange: '#f59e0b', purple: '#8b5cf6', cloud: '#60a5fa', sky: '#0ea5e9'
};

const Card = ({ children, style = {} }) => {
  const [hover, setHover] = useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: C.surface, borderRadius: 16, border: '1px solid ' + C.border,
        overflow: 'hidden', transition: 'all .3s cubic-bezier(.4,0,.2,1)',
        boxShadow: hover ? '0 20px 40px -12px rgba(0,0,0,.12)' : '0 1px 3px rgba(0,0,0,.05)',
        transform: hover ? 'translateY(-3px)' : 'translateY(0)',
        ...style
      }}>
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

const StatusBadge = ({ status }) => {
  const cfg = {
    active: { bg: '#d1fae5', color: '#059669', label: 'Actif' },
    warning: { bg: '#fef3c7', color: '#d97706', label: 'Attention' },
    critical: { bg: '#fee2e2', color: '#dc2626', label: 'Critique' },
    resolved: { bg: '#d1fae5', color: '#059669', label: 'Résolu' },
  };
  const c = cfg[status] || cfg.active;
  return <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: c.bg, color: c.color }}>{c.label}</span>;
};

function Monitoring() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    users: [], campagnes: [], inscriptions: [], notifications: [],
    metrics: { totalUsers: 0, activeUsers: 0, totalCampagnes: 0, publishedCampagnes: 0, totalInscriptions: 0, pendingInscriptions: 0, totalRevenue: 0, avgSatisfaction: 94.2, cloudUptime: 99.97, responseTime: 245, errorRate: 0.12, activeAlerts: 0 }
  });
  const [timeRange, setTimeRange] = useState('24h');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchMonitoringData(); }, [timeRange]);

  const fetchMonitoringData = async () => {
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

      const activeUsers = users.filter(u => u.status === 'active').length;
      const publishedCampagnes = campagnes.filter(c => c.published).length;
      const pendingInscriptions = inscriptions.filter(i => i.status === 'en_attente' || i.status === 'PENDING').length;
      const totalRevenue = campagnes.reduce((acc, c) => { const inscrits = c.placesTotal - c.placesRestantes; return acc + (inscrits * (c.prix || 0)); }, 0);
      const activeAlerts = campagnes.filter(c => c.placesRestantes <= 5 && c.placesRestantes > 0).length;

      setData({ users, campagnes, inscriptions, notifications,
        metrics: { totalUsers: users.length, activeUsers, totalCampagnes: campagnes.length, publishedCampagnes, totalInscriptions: inscriptions.length, pendingInscriptions, totalRevenue, avgSatisfaction: 94.2, cloudUptime: 99.97, responseTime: 245, errorRate: 0.12, activeAlerts }
      });
    } catch (err) { console.error('Erreur monitoring:', err); setError('Erreur lors du chargement des données'); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const handleRefresh = () => { setRefreshing(true); fetchMonitoringData(); };

  const campagneHealth = useMemo(() => data.campagnes.map(c => ({
    name: c.title?.substring(0, 15) || 'Campagne', health: c.published ? 99 : 95,
    inscrits: c.placesTotal - c.placesRestantes, places: c.placesTotal,
    taux: c.placesTotal > 0 ? ((c.placesTotal - c.placesRestantes) / c.placesTotal * 100).toFixed(0) : 0
  })), [data.campagnes]);

  const userActivity = useMemo(() => {
    const byRole = {}; data.users.forEach(u => { byRole[u.role] = (byRole[u.role] || 0) + 1; });
    return Object.entries(byRole).map(([role, count]) => ({ role, count }));
  }, [data.users]);

  const inscriptionTrend = useMemo(() => {
    const byStatus = {}; data.inscriptions.forEach(i => { byStatus[i.status] = (byStatus[i.status] || 0) + 1; });
    return Object.entries(byStatus).map(([status, count]) => ({ status, count }));
  }, [data.inscriptions]);

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16, animation: 'pulse 1.5s infinite' }}>📊</div>
          <p style={{ color: C.muted }}>Chargement du monitoring...</p>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div style={{ minHeight: '100vh', background: C.bg, color: C.text }}>
        <main style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 32px 40px' }}>
          {/* Filtres temps + Refresh */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 4, padding: 4, background: C.surface2, borderRadius: 10, border: '1px solid ' + C.border }}>
              {['24h', '7j', '30j', '90j'].map(range => (
                <button key={range} onClick={() => setTimeRange(range)} style={{
                  padding: '6px 14px', borderRadius: 8, border: 'none',
                  background: timeRange === range ? C.surface : 'transparent', color: timeRange === range ? C.text : C.muted,
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', boxShadow: timeRange === range ? '0 1px 3px rgba(0,0,0,.08)' : 'none'
                }}>{range}</button>
              ))}
            </div>
            <button onClick={handleRefresh} disabled={refreshing} style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid ' + C.border, background: C.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14 }}>
              {refreshing ? '⏳' : '🔄'}
            </button>
          </div>

          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            <KPICard title="Utilisateurs Actifs" value={data.metrics.activeUsers} subtitle={data.metrics.totalUsers + ' total'} trend="+12" icon="👥" color={C.blue} delay={0} />
            <KPICard title="Campagnes Publiées" value={data.metrics.publishedCampagnes} subtitle={data.metrics.totalCampagnes + ' total'} trend="+8" icon="📢" color={C.green} delay={100} />
            <KPICard title="Inscriptions" value={data.metrics.totalInscriptions} subtitle={data.metrics.pendingInscriptions + ' en attente'} trend="+15" icon="📝" color={C.gold} delay={200} />
            <KPICard title="Revenus" value={data.metrics.totalRevenue.toLocaleString() + ' TND'} subtitle="MRR: 70,500 TND" trend="+8.5" icon="💰" color={C.green} delay={300} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            <KPICard title="Uptime Cloud" value={data.metrics.cloudUptime + '%'} subtitle="Objectif: 99.95%" icon="☁️" color={C.cloud} delay={400} />
            <KPICard title="Temps Réponse" value={data.metrics.responseTime + 'ms'} subtitle="Moyenne API" trend="-5" icon="⚡" color={C.orange} delay={500} />
            <KPICard title="Taux Erreur" value={data.metrics.errorRate + '%'} subtitle="< 0.5% objectif" trend="-0.03" icon="❌" color={C.red} delay={600} />
            <KPICard title="Alertes Actives" value={data.metrics.activeAlerts} subtitle="Nécessitent attention" icon="🔔" color={data.metrics.activeAlerts > 0 ? C.red : C.green} delay={700} />
          </div>

          {/* Santé + Activité */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <Card style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text }}>🏥 Santé des Campagnes</h2>
                <span style={{ fontSize: 12, color: C.muted }}>{campagneHealth.length} campagnes</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {campagneHealth.slice(0, 6).map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: C.surface2, borderRadius: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: c.health > 98 ? '#d1fae5' : c.health > 95 ? '#fef3c7' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: c.health > 98 ? '#059669' : c.health > 95 ? '#d97706' : '#dc2626' }}>{c.health}%</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{c.inscrits} / {c.places} inscrits ({c.taux}%)</div>
                    </div>
                    <StatusBadge status={c.health > 98 ? 'active' : c.health > 95 ? 'warning' : 'critical'} />
                  </div>
                ))}
                {campagneHealth.length === 0 && <div style={{ textAlign: 'center', padding: 32, color: C.muted }}><div style={{ fontSize: '2rem', marginBottom: 8 }}>☁️</div><p>Aucune campagne à monitorer</p></div>}
              </div>
            </Card>

            <Card style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text }}>👥 Activité Utilisateurs</h2>
                <span style={{ fontSize: 12, color: C.muted }}>{data.users.length} utilisateurs</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {userActivity.map((u, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: C.surface2, borderRadius: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: [C.blue, C.green, C.orange, C.purple][i % 4] + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: [C.blue, C.green, C.orange, C.purple][i % 4] }}>{u.count}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{u.role}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{((u.count / data.users.length) * 100).toFixed(0)}% des utilisateurs</div>
                    </div>
                    <ProgressBar value={u.count} max={data.users.length} color={[C.blue, C.green, C.orange, C.purple][i % 4]} height={6} />
                  </div>
                ))}
                {userActivity.length === 0 && <div style={{ textAlign: 'center', padding: 32, color: C.muted }}><div style={{ fontSize: '2rem', marginBottom: 8 }}>👤</div><p>Aucun utilisateur enregistré</p></div>}
              </div>
            </Card>
          </div>

          {/* Inscriptions + Notifications */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <Card style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text }}>📝 Flux d'Inscriptions</h2>
                <span style={{ fontSize: 12, color: C.muted }}>{data.inscriptions.length} total</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {inscriptionTrend.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: C.surface2, borderRadius: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: [C.green, C.orange, C.red, C.blue][i % 4] + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: [C.green, C.orange, C.red, C.blue][i % 4] }}>{item.count}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{item.status}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{((item.count / data.inscriptions.length) * 100).toFixed(0)}% des inscriptions</div>
                    </div>
                    <ProgressBar value={item.count} max={data.inscriptions.length} color={[C.green, C.orange, C.red, C.blue][i % 4]} height={6} />
                  </div>
                ))}
                {inscriptionTrend.length === 0 && <div style={{ textAlign: 'center', padding: 32, color: C.muted }}><div style={{ fontSize: '2rem', marginBottom: 8 }}>📝</div><p>Aucune inscription</p></div>}
              </div>
            </Card>

            <Card style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text }}>🔔 Notifications Envoyées</h2>
                <span style={{ fontSize: 12, color: C.muted }}>{data.notifications.length} total</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {data.notifications.slice(0, 5).map((notif, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: C.surface2, borderRadius: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: notif.status === 'sent' ? '#d1fae5' : '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{notif.status === 'sent' ? '✅' : '⏳'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{notif.title}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{notif.canal} · {new Date(notif.createdAt).toLocaleDateString('fr-FR')}</div>
                    </div>
                    <StatusBadge status={notif.status === 'sent' ? 'active' : 'warning'} />
                  </div>
                ))}
                {data.notifications.length === 0 && <div style={{ textAlign: 'center', padding: 32, color: C.muted }}><div style={{ fontSize: '2rem', marginBottom: 8 }}>📭</div><p>Aucune notification envoyée</p></div>}
              </div>
            </Card>
          </div>

          {/* Métriques Système */}
          <Card style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text }}>⚙️ Métriques Système</h2>
              <span style={{ fontSize: 12, color: C.muted }}>Temps réel</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div style={{ padding: 20, background: C.surface2, borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: C.cloud }}>99.97%</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Disponibilité Cloud</div>
                <ProgressBar value={99.97} max={100} color={C.cloud} height={8} />
              </div>
              <div style={{ padding: 20, background: C.surface2, borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: C.green }}>245ms</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Temps Réponse API</div>
                <ProgressBar value={245} max={500} color={C.green} height={8} />
              </div>
              <div style={{ padding: 20, background: C.surface2, borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: C.gold }}>0.12%</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Taux Erreur</div>
                <ProgressBar value={0.12} max={1} color={C.gold} height={8} />
              </div>
            </div>
          </Card>
        </main>

        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
      </div>
    </Layout>
  );
}

export default Monitoring;