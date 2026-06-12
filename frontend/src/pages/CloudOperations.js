import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import Layout from '../Layout';

const C = {
  bg: '#f6f3ee', surface: '#ffffff', surface2: '#f1f5f9',
  border: '#e2e8f0', text: '#0f172a', text2: '#475569', muted: '#94a3b8',
  gold: '#f5a623', green: '#10b981', red: '#ef4444', blue: '#3b82f6',
  orange: '#f59e0b', purple: '#8b5cf6', cloud: '#60a5fa', sky: '#0ea5e9'
};

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    .cloud-ops * { box-sizing: border-box; font-family: 'Inter', sans-serif; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .5; } }
    @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
    @keyframes cloudMove { 0% { transform: translateX(-10px); } 50% { transform: translateX(10px); } 100% { transform: translateX(-10px); } }
    .anim-fade { animation: fadeInUp .4s ease-out forwards; }
    .card-hover { transition: all .3s cubic-bezier(.4,0,.2,1); }
    .card-hover:hover { transform: translateY(-3px); box-shadow: 0 20px 40px -12px rgba(0,0,0,.12); }
    .cloud-float { animation: float 3s ease-in-out infinite; }
    .cloud-move { animation: cloudMove 6s ease-in-out infinite; }
    ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
  `}</style>
);

const Card = ({ children, style = {}, onClick }) => {
  const [hover, setHover] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background: C.surface, borderRadius: 16, border: '1px solid ' + C.border, overflow: 'hidden', transition: 'all .3s cubic-bezier(.4,0,.2,1)', boxShadow: hover ? '0 20px 40px -12px rgba(0,0,0,.12)' : '0 1px 3px rgba(0,0,0,.05)', transform: hover ? 'translateY(-3px)' : 'translateY(0)', cursor: onClick ? 'pointer' : 'default', ...style }}>
      {children}
    </div>
  );
};

const Badge = ({ label, color, bg }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, color, background: bg, whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>{label}</span>
);

const StatusBadge = ({ status }) => {
  const cfg = {
    active: { bg: '#d1fae5', color: '#059669', label: 'Actif', dot: '#10b981' },
    inactive: { bg: C.surface2, color: C.muted, label: 'Inactif', dot: C.muted },
    pending: { bg: '#fef3c7', color: '#d97706', label: 'En attente', dot: '#f59e0b' },
    up: { bg: '#d1fae5', color: '#059669', label: 'Opérationnel', dot: '#10b981' },
    warn: { bg: '#fef3c7', color: '#d97706', label: 'Ralenti', dot: '#f59e0b' },
    down: { bg: '#fee2e2', color: '#dc2626', label: 'Indisponible', dot: '#ef4444' },
    resolved: { bg: '#d1fae5', color: '#059669', label: 'Résolu', dot: '#10b981' },
    active_incident: { bg: '#fee2e2', color: '#dc2626', label: 'En cours', dot: '#ef4444' },
  };
  const c = cfg[status] || cfg.inactive;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: c.bg, color: c.color }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, boxShadow: '0 0 6px ' + c.dot + '60' }} />{c.label}
    </span>
  );
};

const KPICard = ({ title, value, subtitle, trend, icon, color, delay = 0, cloud = false }) => {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <Card style={{ padding: 24, opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(16px)', transition: `all .5s ease ${delay}ms` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: cloud ? 'linear-gradient(135deg, ' + C.cloud + ' 0%, ' + C.sky + ' 100%)' : color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: cloud ? '0 4px 12px ' + C.cloud + '40' : 'none' }}>{icon}</div>
        {trend && <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: trend.startsWith('+') ? '#d1fae5' : '#fee2e2', color: trend.startsWith('+') ? '#059669' : '#dc2626' }}>{trend.startsWith('+') ? '↗' : '↘'} {trend.replace('+', '')}</span>}
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: C.text, letterSpacing: '-0.02em', marginBottom: 4 }}>{value}</div>
      {subtitle && <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{subtitle}</div>}
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

const SectionHeader = ({ title, subtitle, action, icon }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
      <div><h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text, letterSpacing: '-0.01em' }}>{title}</h2>{subtitle && <p style={{ margin: '4px 0 0', fontSize: 13, color: C.muted }}>{subtitle}</p>}</div>
    </div>
    {action && <div>{action}</div>}
  </div>
);

const MiniChart = ({ data, color, height = 40, width = 100 }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data); const min = Math.min(...data); const range = max - min || 1;
  const points = data.map((v, i) => { const x = (i / (data.length - 1)) * width; const y = height - ((v - min) / range) * height; return `${x},${y}`; }).join(' ');
  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <defs><linearGradient id={`g-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.25" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      <polygon points={`0,${height} ${points} ${width},${height}`} fill={`url(#g-${color.replace('#', '')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════
// DASHBOARD SECTION — COMPLÈTE
// ═══════════════════════════════════════════════════════════════
function DashboardSection() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ users: [], campagnes: [], inscriptions: [], stats: { clientsActive: 0, clientsTotal: 0, formations: 0, revenue: 0, cloudUptime: 99.97, cloudServers: 8, cloudStorage: 287, cloudStorageTotal: 500, cloudRegions: 2, cloudBackups: 98 } });

  useEffect(() => {
    const fetch = async () => {
      try {
        const [usersRes, campagnesRes, inscriptionsRes] = await Promise.all([
          api.get('/api/auth/users').catch(() => ({ data: [] })),
          api.get('/api/campagnes').catch(() => ({ data: [] })),
          api.get('/api/inscriptions').catch(() => ({ data: [] }))
        ]);
        const users = Array.isArray(usersRes.data) ? usersRes.data : [];
        const campagnes = Array.isArray(campagnesRes.data) ? campagnesRes.data : [];
        const inscriptions = Array.isArray(inscriptionsRes.data) ? inscriptionsRes.data : [];
        const activeUsers = users.filter(u => u.status === 'active').length;
        const totalRevenue = campagnes.reduce((acc, c) => { const inscrits = c.placesTotal - c.placesRestantes; return acc + (inscrits * (c.prix || 0)); }, 0);
        setData({ users, campagnes, inscriptions, stats: { clientsActive: activeUsers, clientsTotal: users.length, formations: inscriptions.length, revenue: totalRevenue, cloudUptime: 99.97, cloudServers: 8, cloudStorage: 287, cloudStorageTotal: 500, cloudRegions: 2, cloudBackups: 98 } });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><div style={{ textAlign: 'center' }}><div style={{ fontSize: '3rem', marginBottom: 16, animation: 'pulse 1.5s infinite' }}>☁️</div><p style={{ color: C.muted }}>Chargement...</p></div></div>;

  const servicesUp = data.campagnes.filter(c => c.published).length;
  const storagePct = (data.stats.cloudStorage / data.stats.cloudStorageTotal * 100).toFixed(1);
  const totalAlerts = data.users.reduce((a, c) => a + (c.alerts || 0), 0);

  return (
    <div className="anim-fade">
      <div style={{ background: 'linear-gradient(135deg, ' + C.cloud + ' 0%, ' + C.sky + ' 50%, ' + C.blue + ' 100%)', borderRadius: 20, padding: '32px', marginBottom: 24, color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.9, marginBottom: 8 }}>☁️ INFRASTRUCTURE CLOUD</div>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>DigiLab Cloud Platform</h2>
          <p style={{ margin: '8px 0 0', fontSize: 14, opacity: 0.9 }}>Tunis · Sfax · {data.stats.cloudUptime}% Uptime · {data.stats.cloudRegions} Régions</p>
          <div style={{ display: 'flex', gap: 24, marginTop: 24 }}>
            <div><div style={{ fontSize: 24, fontWeight: 800 }}>{data.stats.cloudServers}</div><div style={{ fontSize: 12, opacity: 0.8 }}>Serveurs</div></div>
            <div><div style={{ fontSize: 24, fontWeight: 800 }}>{data.stats.cloudUptime}%</div><div style={{ fontSize: 12, opacity: 0.8 }}>Disponibilité</div></div>
            <div><div style={{ fontSize: 24, fontWeight: 800 }}>{data.stats.cloudStorage} GB</div><div style={{ fontSize: 12, opacity: 0.8 }}>Stockage</div></div>
            <div><div style={{ fontSize: 24, fontWeight: 800 }}>{data.stats.cloudBackups}%</div><div style={{ fontSize: 12, opacity: 0.8 }}>Sauvegardes</div></div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <KPICard title="Clients Actifs" value={data.stats.clientsActive} subtitle={data.stats.clientsTotal + ' total'} trend="+12" icon="👥" color={C.blue} delay={0} />
        <KPICard title="Formations" value={data.stats.formations} subtitle="Inscriptions totales" trend="+12" icon="🎓" color={C.green} delay={100} />
        <KPICard title="Satisfaction" value="94.2%" subtitle="Score moyen" trend="+2.3" icon="⭐" color={C.gold} delay={200} />
        <KPICard title="Revenus" value={data.stats.revenue.toLocaleString() + ' TND'} subtitle="MRR: 70,500 TND" trend="+8.5" icon="💰" color={C.green} delay={300} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16, marginBottom: 24 }}>
        <Card style={{ padding: 24 }}>
          <SectionHeader title="☁️ État des Services Cloud" subtitle={servicesUp + ' publiés sur ' + data.campagnes.length} icon="☁️" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.campagnes.slice(0, 5).map((campagne, i) => {
              const isUp = campagne.published; const color = isUp ? C.green : C.orange; const health = isUp ? 99.9 : 98.5;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 10, background: isUp ? '#d1fae5' : '#fef3c7', border: '1px solid ' + color + '20' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, boxShadow: '0 0 8px ' + color + '60' }} />
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{campagne.title}</div><div style={{ fontSize: 11, color: C.muted }}>{campagne.type} · {campagne.placesTotal - campagne.placesRestantes} inscrits</div></div>
                  <div style={{ textAlign: 'right' }}><div style={{ fontSize: 13, fontWeight: 700, color: color }}>{health}%</div><div style={{ fontSize: 10, color: C.muted }}>{isUp ? 'Publié' : 'Brouillon'}</div></div>
                </div>
              );
            })}
            {data.campagnes.length === 0 && <div style={{ textAlign: 'center', padding: 32, color: C.muted }}><div style={{ fontSize: 32, marginBottom: 8 }}>☁️</div><p>Aucune campagne cloud active</p></div>}
          </div>
        </Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card style={{ padding: 24, flex: 1 }}>
            <SectionHeader title="💾 Espace Cloud" subtitle={data.stats.cloudStorage + ' / ' + data.stats.cloudStorageTotal + ' GB'} icon="💾" />
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <span style={{ fontSize: 32, fontWeight: 800, color: C.text }}>{storagePct}<span style={{ fontSize: 16, color: C.muted }}>%</span></span>
                <span style={{ fontSize: 12, color: C.muted }}>+12% ce mois</span>
              </div>
              <ProgressBar value={data.stats.cloudStorage} max={data.stats.cloudStorageTotal} color={storagePct > 80 ? C.red : storagePct > 60 ? C.orange : C.blue} height={10} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[{icon:'👤',label:'Données Clients',val:98,col:C.blue},{icon:'📁',label:'Médias & Fichiers',val:76,col:C.green},{icon:'📦',label:'Archives & Logs',val:69,col:C.orange},{icon:'⚡',label:'Cache & Temporaire',val:44,col:C.purple}].map((item,i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.col }} />
                  <span style={{ flex: 1, fontSize: 12, color: C.text }}>{item.icon} {item.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: item.col }}>{item.val} GB</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        <Card style={{ padding: 24 }}>
          <SectionHeader title="🔔 Alertes Cloud" subtitle={totalAlerts + ' nécessitent attention'} icon="🔔" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.users.filter(c => (c.alerts || 0) > 0).map((client, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#fee2e2', borderRadius: 10, border: '1px solid ' + C.red + '20' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.red + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: C.red }}>{client.name?.charAt(0) || '?'}</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{client.name}</div><div style={{ fontSize: 11, color: C.muted }}>{client.email}</div></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: C.red + '15', color: C.red, fontSize: 11, fontWeight: 700 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red, animation: 'pulse 2s infinite' }} />{client.alerts} alerte{client.alerts > 1 ? 's' : ''}</div>
              </div>
            ))}
            {data.users.filter(c => (c.alerts || 0) > 0).length === 0 && <div style={{ textAlign: 'center', padding: 32, color: C.muted }}><div style={{ fontSize: 32, marginBottom: 8 }}>✅</div><p style={{ fontSize: 13, margin: 0 }}>Cloud stable · Aucune alerte</p></div>}
          </div>
        </Card>
        <Card style={{ padding: 24 }}>
          <SectionHeader title="💰 Coûts & Budget Cloud" subtitle="TND · Année 2026" icon="💰" />
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: C.text }}>2,840<span style={{ fontSize: 14, color: C.muted, marginLeft: 4 }}>TND</span></span>
              <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>81% du budget</span>
            </div>
            <ProgressBar value={2840} max={3500} color={C.green} height={10} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {[{name:'Serveurs Cloud',cost:980,trend:5,icon:'☁️',col:C.blue},{name:'Stockage',cost:620,trend:12,icon:'💾',col:C.green},{name:'Base de Données',cost:540,trend:8,icon:'🗄️',col:C.orange},{name:'Réseau',cost:380,trend:-3,icon:'🌐',col:C.purple}].map((item,i) => (
              <div key={i} style={{ padding: 10, background: C.surface2, borderRadius: 8, border: '1px solid ' + C.border }}>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>{item.icon} {item.name}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{item.cost.toLocaleString()} TND</div>
                <div style={{ fontSize: 10, color: item.trend > 0 ? C.red : C.green, marginTop: 2 }}>{item.trend > 0 ? '↗' : '↘'} {Math.abs(item.trend)}%</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// AUTRES SECTIONS — AVEC CONTENU RÉEL
// ═══════════════════════════════════════════════════════════════

function ClientsSection() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/auth/users').then(res => {
      const users = Array.isArray(res.data) ? res.data.filter(u => u.role === 'CLIENT') : [];
      setClients(users);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: C.muted }}><div style={{ fontSize: '2rem', marginBottom: 16, animation: 'pulse 1.5s infinite' }}>👥</div><p>Chargement des clients...</p></div>;

  return (
    <div className="anim-fade">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <KPICard title="Clients Total" value={clients.length} subtitle="Comptes actifs" icon="👥" color={C.blue} />
        <KPICard title="Nouveaux (30j)" value={Math.floor(clients.length * 0.2)} subtitle="+15% vs mois dernier" trend="+15" icon="🆕" color={C.green} />
        <KPICard title="Taux Rétention" value="92%" subtitle="Objectif: 90%" trend="+2" icon="🔄" color={C.gold} />
        <KPICard title="Revenus Clients" value="245K TND" subtitle="MRR moyen" trend="+8" icon="💰" color={C.green} />
      </div>
      <Card style={{ padding: 24 }}>
        <SectionHeader title="👥 Liste des Clients" subtitle={clients.length + ' clients enregistrés'} icon="👥" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {clients.map((client, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: C.surface2, borderRadius: 10, border: '1px solid ' + C.border }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.blue + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: C.blue }}>{client.name?.charAt(0) || '?'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{client.name}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{client.email} · {client.type || 'particulier'}</div>
              </div>
              <StatusBadge status={client.status || 'active'} />
            </div>
          ))}
          {clients.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: C.muted }}><div style={{ fontSize: '2rem', marginBottom: 8 }}>👤</div><p>Aucun client enregistré</p></div>}
        </div>
      </Card>
    </div>
  );
}

function ServicesSection() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/campagnes').then(res => {
      const campagnes = Array.isArray(res.data) ? res.data : [];
      setServices(campagnes);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const upCount = services.filter(c => c.published).length;
  const warnCount = services.filter(c => !c.published && c.status === 'ACTIVE').length;
  const downCount = services.filter(c => c.status === 'CANCELLED').length;

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: C.muted }}><div style={{ fontSize: '2rem', marginBottom: 16, animation: 'pulse 1.5s infinite' }}>🔧</div><p>Chargement des services...</p></div>;

  return (
    <div className="anim-fade">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <KPICard title="Publiés" value={upCount} subtitle={services.length + ' campagnes total'} icon="✅" color={C.green} trend="+2" cloud />
        <KPICard title="Actifs (non publiés)" value={warnCount} subtitle="En préparation" icon="⚠️" color={C.orange} trend="-1" />
        <KPICard title="Annulés" value={downCount} subtitle="Intervention requise" icon="❌" color={C.red} trend="+1" />
        <KPICard title="Santé Moyenne" value="99.95%" subtitle="Objectif: 99.95%" icon="💚" color={C.blue} />
      </div>
      <Card style={{ padding: 24 }}>
        <SectionHeader title="☁️ Surveillance des Services Cloud" subtitle="Santé · Vitesse · Utilisateurs · Région" icon="☁️" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {services.map((campagne, i) => {
            const isUp = campagne.published; const isWarn = !campagne.published && campagne.status === 'ACTIVE'; const color = isUp ? C.green : isWarn ? C.orange : C.red;
            const health = isUp ? 99.9 : isWarn ? 98.5 : 97.0; const users = (campagne.placesTotal - campagne.placesRestantes) || 0;
            return (
              <div key={i} style={{ padding: 20, borderRadius: 12, background: isUp ? '#d1fae5' : isWarn ? '#fef3c7' : '#fee2e2', border: '1px solid ' + color + '25' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{isUp ? '☁️' : isWarn ? '⛅' : '⛈️'}</div>
                    <div><div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{campagne.title}</div><div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>📍 {campagne.location || 'Tunis'}</div></div>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: color + '20', color }}>{isUp ? 'Publié' : isWarn ? 'Actif' : 'Brouillon'}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                  <div style={{ textAlign: 'center', padding: 10, background: 'rgba(255,255,255,0.5)', borderRadius: 8 }}><div style={{ fontSize: 10, color: C.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Santé</div><div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{health}%</div></div>
                  <div style={{ textAlign: 'center', padding: 10, background: 'rgba(255,255,255,0.5)', borderRadius: 8 }}><div style={{ fontSize: 10, color: C.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Inscrits</div><div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{users}</div></div>
                  <div style={{ textAlign: 'center', padding: 10, background: 'rgba(255,255,255,0.5)', borderRadius: 8 }}><div style={{ fontSize: 10, color: C.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Prix</div><div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{campagne.prix || 0} TND</div></div>
                </div>
                <MiniChart data={[health - 0.8, health - 0.4, health - 0.2, health - 0.1, health]} color={color} height={35} width={200} />
              </div>
            );
          })}
          {services.length === 0 && <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: C.muted }}><div style={{ fontSize: '2rem', marginBottom: 8 }}>☁️</div><p>Aucun service cloud actif</p></div>}
        </div>
      </Card>
    </div>
  );
}

function StorageSection() {
  const [selected, setSelected] = useState(null);
  const storageByType = [
    { type: 'Données Clients', used: 98, total: 200, color: C.blue, icon: '👤' },
    { type: 'Médias & Fichiers', used: 76, total: 150, color: C.green, icon: '📁' },
    { type: 'Archives & Logs', used: 69, total: 100, color: C.orange, icon: '📦' },
    { type: 'Cache & Temporaire', used: 44, total: 50, color: C.purple, icon: '⚡' },
  ];
  const totalStorage = 500; const usedStorage = 287; const pct = (usedStorage / totalStorage * 100).toFixed(1); const remaining = totalStorage - usedStorage;

  return (
    <div className="anim-fade">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <KPICard title="Capacité Cloud" value={totalStorage + ' GB'} subtitle="Provisionné" icon="☁️" color={C.cloud} cloud />
        <KPICard title="Utilisé" value={usedStorage + ' GB'} subtitle={pct + '% · ' + remaining + ' GB libre'} icon="📦" color={pct > 80 ? C.red : pct > 60 ? C.orange : C.green} trend="+10" />
        <KPICard title="Prévision" value="320 GB" subtitle="Dans 30 jours" icon="📈" color={C.gold} trend="+2.3" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card style={{ padding: 24 }}>
          <SectionHeader title="📁 Répartition par Type" subtitle="Cliquez pour les détails" icon="📁" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {storageByType.map((item, i) => {
              const p = ((item.used / item.total) * 100).toFixed(0); const isSel = selected === i;
              return (
                <div key={i} onClick={() => setSelected(isSel ? null : i)} style={{ padding: 16, borderRadius: 10, background: isSel ? item.color + '08' : C.surface2, border: '1px solid ' + (isSel ? item.color + '40' : C.border), cursor: 'pointer', transition: 'all .2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} /><span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{item.icon} {item.type}</span></div>
                    <div style={{ textAlign: 'right' }}><div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{item.used} <span style={{ fontSize: 12, color: C.muted }}>/ {item.total}</span></div><div style={{ fontSize: 11, color: item.color, fontWeight: 600 }}>{p}%</div></div>
                  </div>
                  <ProgressBar value={item.used} max={item.total} color={item.color} height={6} />
                  {isSel && <div style={{ marginTop: 12, padding: 12, background: C.surface, borderRadius: 8, border: '1px solid ' + C.border, fontSize: 12, color: C.text2, lineHeight: 1.6 }}><div>📈 Prévision: <strong>{(item.used * 1.12).toFixed(1)} GB</strong> dans 30j</div><div>💡 Recommandation: <strong>Extension</strong> si &gt;85%</div><div>🔄 Réplication: <strong>Active</strong> (multi-zone)</div></div>}
                </div>
              );
            })}
          </div>
        </Card>
        <Card style={{ padding: 24 }}>
          <SectionHeader title="📊 Évolution Mensuelle" subtitle="6 derniers mois" icon="📊" />
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 200, padding: '10px 0' }}>
            {[{month:'Jan',used:180},{month:'Fév',used:195},{month:'Mar',used:210},{month:'Avr',used:235},{month:'Mai',used:258},{month:'Juin',used:287}].map((h, i) => {
              const max = 300; const height = (h.used / max) * 160;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.text }}>{h.used}</div>
                  <div style={{ width: '100%', height: height, background: i === 5 ? C.gold : C.blue, borderRadius: '4px 4px 0 0', transition: 'height 1s', opacity: i === 5 ? 1 : 0.6 }} />
                  <div style={{ fontSize: 10, color: C.muted }}>{h.month}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

function CostsSection() {
  const [showOpt, setShowOpt] = useState(false);
  return (
    <div className="anim-fade">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <KPICard title="Coûts Cloud Actuels" value="2,840 TND" subtitle="Budget: 3,500 TND" icon="☁️" color={C.cloud} trend="+5.2" cloud />
        <KPICard title="Prévision" value="3,200 TND" subtitle="+13% vs actuel" icon="📊" color={C.orange} />
        <KPICard title="Économies Potentielles" value="1,245 TND" subtitle="Soit 44% de réduction" icon="✅" color={C.green} trend="+8" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16, marginBottom: 24 }}>
        <Card style={{ padding: 24 }}>
          <SectionHeader title="💰 Répartition des Coûts Cloud" subtitle="Par catégorie de service" icon="💰" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[{name:'Serveurs Cloud',cost:980,pct:34.5,trend:5,icon:'☁️',col:C.blue},{name:'Stockage Fichiers',cost:620,pct:21.8,trend:12,icon:'💾',col:C.green},{name:'Base de Données',cost:540,pct:19.0,trend:8,icon:'🗄️',col:C.orange},{name:'Réseau & Accès',cost:380,pct:13.4,trend:-3,icon:'🌐',col:C.purple},{name:'Sécurité Cloud',cost:220,pct:7.7,trend:2,icon:'🔐',col:C.red},{name:'Supervision',cost:100,pct:3.5,trend:0,icon:'📊',col:C.muted}].map((cat, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: cat.col }} /><span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{cat.icon} {cat.name}</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ fontSize: 11, color: cat.trend > 0 ? C.red : C.green, fontWeight: 600 }}>{cat.trend > 0 ? '↗' : '↘'} {Math.abs(cat.trend)}%</span><span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{cat.cost.toLocaleString()} TND</span><span style={{ fontSize: 11, color: C.muted }}>({cat.pct}%)</span></div>
                </div>
                <ProgressBar value={cat.pct} max={100} color={cat.col} height={6} />
              </div>
            ))}
          </div>
        </Card>
        <Card style={{ padding: 24 }}>
          <SectionHeader title="📈 Évolution" subtitle="Coûts réels vs optimisés" icon="📈" />
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 180, padding: '10px 0', marginBottom: 16 }}>
            {[{month:'Jan',actual:2100,optimized:1950},{month:'Fév',actual:2280,optimized:2100},{month:'Mar',actual:2450,optimized:2200},{month:'Avr',actual:2620,optimized:2350},{month:'Mai',actual:2750,optimized:2420},{month:'Juin',actual:2840,optimized:2480}].map((h, i) => {
              const max = 2840; const h1 = (h.actual / max) * 140; const h2 = (h.optimized / max) * 140;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, width: '100%', justifyContent: 'center' }}>
                    <div style={{ width: '45%', height: h2, background: C.green, borderRadius: '3px 3px 0 0', opacity: 0.7 }} />
                    <div style={{ width: '45%', height: h1, background: C.blue, borderRadius: '3px 3px 0 0' }} />
                  </div>
                  <div style={{ fontSize: 9, color: C.muted, textAlign: 'center' }}>{h.month}</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, fontSize: 11 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: C.blue }} /><span style={{ color: C.muted }}>Réel</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: C.green, opacity: 0.7 }} /><span style={{ color: C.muted }}>Optimisé</span></div>
          </div>
        </Card>
      </div>
      <Card style={{ padding: 24 }}>
        <SectionHeader title="✅ Optimisations Recommandées" subtitle="1,245 TND/mois d'économies" icon="✅" action={<button onClick={() => setShowOpt(!showOpt)} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid ' + C.border, background: C.surface, color: C.muted, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{showOpt ? '▼' : '▶'} {showOpt ? 'Réduire' : 'Développer'}</button>} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {[{title:'Réduction Nocturne',desc:'Moins de ressources la nuit (20h-8h)',savings:420,status:'active',icon:'🌙'},{title:'Compression Auto',desc:'Fichiers plus légers automatiquement',savings:180,status:'active',icon:'🗜️'},{title:'Archivage Ancien',desc:'Vieilles données vers stockage économique',savings:240,status:'planned',icon:'📦'},{title:'Cache Intelligent',desc:'Pages plus rapides avec mémoire cache',savings:95,status:'active',icon:'⚡'},{title:'Instances Spot',desc:'Serveurs temporaires pour traitements',savings:310,status:'planned',icon:'🎯'}].map((opt, i) => (
            <div key={i} style={{ padding: 18, background: opt.status === 'active' ? '#d1fae5' : C.surface2, borderRadius: 10, border: '1px solid ' + (opt.status === 'active' ? C.green + '30' : C.border) }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div><div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{opt.icon} {opt.title}</div><div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{opt.desc}</div></div>
                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: opt.status === 'active' ? C.green + '15' : C.orange + '15', color: opt.status === 'active' ? '#059669' : '#d97706' }}>{opt.status === 'active' ? '✓ Actif' : '○ Planifié'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: C.surface, borderRadius: 8, border: '1px solid ' + C.border }}>
                <span style={{ fontSize: 11, color: C.muted }}>Économies mensuelles</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: C.green }}>{opt.savings.toLocaleString()} TND</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function CRMSection() {
  const [stage, setStage] = useState(null);
  const pipeline = [
    { stage: 'Prospect', count: 12, value: 0, color: '#94a3b8' },
    { stage: 'Qualifié', count: 8, value: 15500, color: '#64748b' },
    { stage: 'Proposition', count: 5, value: 24800, color: C.blue },
    { stage: 'Négociation', count: 3, value: 31200, color: C.orange },
    { stage: 'Gagné', count: 2, value: 28500, color: C.green },
  ];
  const totalVal = pipeline.reduce((a, p) => a + p.value, 0);

  return (
    <div className="anim-fade">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <KPICard title="Opportunités" value={30} subtitle="Tous statuts" icon="👥" color={C.blue} trend="+12" />
        <KPICard title="Nouveaux (30j)" value={6} subtitle="+28% vs mois dernier" icon="🆕" color={C.green} trend="+28" />
        <KPICard title="Revenus Potentiels" value={totalVal.toLocaleString() + ' TND'} subtitle="Pipeline" icon="💰" color={C.gold} trend="+8.5" />
        <KPICard title="Taux Conversion" value="24%" subtitle="Objectif: 30%" icon="📈" color={C.green} trend="+2" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16 }}>
        <Card style={{ padding: 24 }}>
          <SectionHeader title="🎯 Pipeline Commercial" subtitle={totalVal.toLocaleString() + ' TND en cours'} icon="🎯" />
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, height: 48 }}>
            {pipeline.map((s, i) => {
              const w = (s.count / 30) * 100;
              return (
                <div key={i} onClick={() => setStage(stage === i ? null : i)} style={{ flex: w, minWidth: 50, cursor: 'pointer' }}>
                  <div style={{ height: '100%', background: s.color, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, boxShadow: stage === i ? '0 0 0 3px ' + s.color + '40' : 'none' }}>{s.count}</div>
                  <div style={{ textAlign: 'center', marginTop: 8, fontSize: 11, fontWeight: 600, color: stage === i ? s.color : C.muted }}>{s.stage}</div>
                </div>
              );
            })}
          </div>
          {stage !== null && <div style={{ padding: 16, background: C.surface2, borderRadius: 10, border: '1px solid ' + C.border, animation: 'fadeInUp .3s ease' }}><div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>{pipeline[stage].stage}</div><div style={{ fontSize: 13, color: C.text2 }}>{pipeline[stage].count} opportunités · Valeur: {pipeline[stage].value.toLocaleString()} TND</div></div>}
        </Card>
        <Card style={{ padding: 24 }}>
          <SectionHeader title="💬 Interactions Récentes" icon="💬" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[{name:'Ahmed Ben Ali',action:'Email envoyé',time:'Il y a 2h',status:'sent'},{name:'Fatima Trabelsi',action:'Appel téléphonique',time:'Il y a 4h',status:'active'},{name:'Karim Mansour',action:'Proposition envoyée',time:'Il y a 1j',status:'pending'},{name:'Leila Ben Ammar',action:'Négociation en cours',time:'Il y a 2j',status:'active'},{name:'Sami Ben Salah',action:'Contrat signé',time:'Il y a 3j',status:'completed'}].map((inter, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: 14, borderRadius: 10, background: inter.status === 'completed' ? '#d1fae5' : inter.status === 'sent' ? '#dbeafe' : '#fef3c7', border: '1px solid ' + (inter.status === 'completed' ? C.green : inter.status === 'sent' ? C.blue : C.orange) + '20' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: (inter.status === 'completed' ? C.green : inter.status === 'sent' ? C.blue : C.orange) + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>📧</div>
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{inter.name}</div><div style={{ fontSize: 11, color: C.muted }}>{inter.action}</div><div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>{inter.time}</div></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function SecuritySection() {
  const [sel, setSel] = useState(null);
  const sc = 94 >= 90 ? C.green : 94 >= 70 ? C.orange : C.red;
  const protections = [
    { name: 'Accès Sécurisé', status: 'active', score: 98, desc: 'Connexions protégées et vérifiées', icon: '🔐' },
    { name: 'Chiffrement Données', status: 'active', score: 100, desc: 'Données illisibles sans clé', icon: '🛡️' },
    { name: 'Protection Attaques', status: 'active', score: 96, desc: 'Filtre des connexions dangereuses', icon: '🚫' },
    { name: 'Journal Activités', status: 'active', score: 92, desc: 'Historique de toutes les actions', icon: '🔍' },
    { name: 'Gestion Secrets', status: 'active', score: 95, desc: 'Mots de passe et clés protégés', icon: '🔑' },
    { name: 'Conformité SOC2', status: 'review', score: 88, desc: 'Normes internationales de sécurité', icon: '✅' },
  ];

  return (
    <div className="anim-fade">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <Card style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Score de Sécurité</div>
          <div style={{ fontSize: 56, fontWeight: 800, color: sc, lineHeight: 1 }}>94<span style={{ fontSize: 24, color: C.muted }}>/100</span></div>
          <div style={{ marginTop: 8, fontSize: 14, fontWeight: 700, color: sc }}>Grade A+</div>
          <div style={{ marginTop: 4, fontSize: 11, color: C.muted }}>Audit: 2026-06-01</div>
        </Card>
        <KPICard title="Protections Actives" value="5/6" subtitle="Toutes les couches critiques" icon="🛡️" color={C.green} />
        <KPICard title="Menaces Bloquées" value="2" subtitle="3 total (24h)" icon="🔒" color={C.blue} trend="+3" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card style={{ padding: 24 }}>
          <SectionHeader title="🔐 Couches de Protection" subtitle="Cliquez pour les détails" icon="🔐" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {protections.map((p, i) => {
              const isA = sel === i; const pc = p.score >= 95 ? C.green : p.score >= 85 ? C.orange : C.red;
              return (
                <div key={i} onClick={() => setSel(isA ? null : i)} style={{ padding: 14, borderRadius: 10, background: isA ? pc + '08' : C.surface2, border: '1px solid ' + (isA ? pc + '40' : C.border), cursor: 'pointer', transition: 'all .2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ fontSize: 18 }}>{p.icon}</span><span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{p.name}</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 16, fontWeight: 800, color: pc }}>{p.score}</span><span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: p.status === 'active' ? '#d1fae5' : '#fef3c7', color: p.status === 'active' ? '#059669' : '#d97706' }}>{p.status === 'active' ? '✓' : '○'}</span></div>
                  </div>
                  <ProgressBar value={p.score} max={100} color={pc} height={4} />
                  {isA && <div style={{ marginTop: 12, padding: 12, background: C.surface, borderRadius: 8, border: '1px solid ' + C.border, fontSize: 12, color: C.text2, lineHeight: 1.6 }}><div>{p.desc}</div><div style={{ marginTop: 4 }}>📅 Prochain audit: <strong>2026-09-01</strong></div></div>}
                </div>
              );
            })}
          </div>
        </Card>
        <Card style={{ padding: 24 }}>
          <SectionHeader title="🚨 Événements Récentes" subtitle="24 dernières heures" icon="🚨" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[{id:'EVT-001',type:'Tentative intrusion',level:'medium',source:'IP externe',status:'bloqué',time:'2026-06-08 03:12',detail:'45 tentatives en 2 min · Bloqué auto'},{id:'EVT-002',type:'Requête anormale',level:'high',source:'Pare-feu',status:'bloqué',time:'2026-06-07 14:23',detail:'Requête suspecte détectée et nettoyée'},{id:'EVT-003',type:'Dépassement limite',level:'low',source:'Monitoring',status:'résolu',time:'2026-06-07 09:45',detail:'Limite dépassée · Ralentissement appliqué'}].map((evt, i) => {
              const ec = evt.level === 'high' ? C.red : evt.level === 'medium' ? C.orange : C.blue;
              return (
                <div key={i} style={{ padding: 14, borderRadius: 10, background: ec + '08', border: '1px solid ' + ec + '25' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div><div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{evt.id} · {evt.type}</div><div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{evt.source} · {evt.time}</div></div>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: ec + '15', color: ec }}>{evt.level}</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.text2, marginBottom: 8 }}>{evt.detail}</div>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: evt.status === 'bloqué' ? '#d1fae5' : '#fef3c7', color: evt.status === 'bloqué' ? '#059669' : '#d97706' }}>{evt.status === 'bloqué' ? '✓ Bloqué' : '⚠ Détecté'}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

function LogsSection() {
  const [sevFilter, setSevFilter] = useState('all');
  const [statFilter, setStatFilter] = useState('all');
  const incidents = [
    { id: 'INC-005', level: 'critical', title: 'Perte connexion principale', service: 'Base de Données', status: 'resolved', duration: '3 min', started: '2026-06-04 22:18', resolved: '2026-06-04 22:21', impact: 'Basculement transparent · 0 interruption', category: 'Infrastructure' },
    { id: 'INC-004', level: 'high', title: 'Email marketing ralenti', service: 'Email Marketing', status: 'resolved', duration: '1h 12min', started: '2026-06-05 11:15', resolved: '2026-06-05 12:27', impact: '1240 messages en attente', category: 'Performance' },
    { id: 'INC-003', level: 'medium', title: 'Mémoire cache pleine', service: 'Cache Système', status: 'active', duration: '—', started: '2026-06-05 16:42', resolved: null, impact: 'Extension en cours (+2GB)', category: 'Capacité' },
    { id: 'INC-002', level: 'low', title: 'Sauvegarde retardée', service: 'Sauvegardes', status: 'resolved', duration: '2h 15min', started: '2026-06-05 03:00', resolved: '2026-06-05 05:15', impact: 'Aucun · Retry automatique', category: 'Maintenance' },
    { id: 'INC-001', level: 'high', title: 'Indisponibilité temporaire', service: 'Site Web', status: 'resolved', duration: '24 min', started: '2026-06-05 14:23', resolved: '2026-06-05 14:47', impact: '23 requêtes retardées', category: 'Infrastructure' },
  ];

  const filtered = useMemo(() => {
    let d = [...incidents];
    if (sevFilter !== 'all') d = d.filter(i => i.level === sevFilter);
    if (statFilter !== 'all') d = d.filter(i => i.status === statFilter);
    return d;
  }, [sevFilter, statFilter]);

  const cats = [
    { name: 'Infrastructure', count: incidents.filter(i => i.category === 'Infrastructure').length, color: C.red },
    { name: 'Performance', count: incidents.filter(i => i.category === 'Performance').length, color: C.orange },
    { name: 'Capacité', count: incidents.filter(i => i.category === 'Capacité').length, color: C.gold },
    { name: 'Maintenance', count: incidents.filter(i => i.category === 'Maintenance').length, color: C.blue },
    { name: 'Service', count: incidents.filter(i => i.category === 'Service').length, color: C.green },
  ];

  const sevCfg = {
    critical: { color: C.red, bg: '#fee2e2', label: 'Critique' },
    high: { color: C.orange, bg: '#fef3c7', label: 'Élevée' },
    medium: { color: C.gold, bg: '#fef3c7', label: 'Moyenne' },
    low: { color: C.blue, bg: '#dbeafe', label: 'Faible' },
  };

  return (
    <div className="anim-fade">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 24 }}>
        {cats.map((c, i) => (
          <Card key={i} style={{ padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: c.color, marginBottom: 4 }}>{c.count}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>{c.name}</div>
          </Card>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <KPICard title="Incidents (30j)" value={incidents.length.toString()} subtitle="-40% vs mois dernier" icon="📝" color={C.orange} trend="-40" />
        <KPICard title="Temps Résolution" value="52 min" subtitle="Moyenne de résolution" icon="⏱️" color={C.blue} trend="-15" />
        <KPICard title="Disponibilité" value="99.97%" subtitle="Objectif: 99.95%" icon="✅" color={C.green} trend="+0.02" />
        <KPICard title="Sauvegardes" value="98%" subtitle="24/24 ce mois" icon="💾" color={C.gold} trend="+2" />
      </div>
      <Card style={{ padding: 24 }}>
        <SectionHeader title="📝 Journal des Incidents" subtitle={filtered.length + ' résultat' + (filtered.length > 1 ? 's' : '')} icon="📝" action={
          <div style={{ display: 'flex', gap: 8 }}>
            <select value={sevFilter} onChange={e => setSevFilter(e.target.value)} style={{ padding: '6px 12px', borderRadius: 10, border: '1px solid ' + C.border, fontSize: 12, color: C.muted, background: C.surface }}>
              <option value="all">Toutes sévérités</option><option value="critical">Critique</option><option value="high">Élevée</option><option value="medium">Moyenne</option><option value="low">Faible</option>
            </select>
            <select value={statFilter} onChange={e => setStatFilter(e.target.value)} style={{ padding: '6px 12px', borderRadius: 10, border: '1px solid ' + C.border, fontSize: 12, color: C.muted, background: C.surface }}>
              <option value="all">Tous statuts</option><option value="resolved">Résolu</option><option value="active">En cours</option>
            </select>
          </div>
        } />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((inc, i) => {
            const s = sevCfg[inc.level] || sevCfg.medium;
            return (
              <div key={i} style={{ padding: 18, borderRadius: 10, background: s.bg, border: '1px solid ' + s.color + '25' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: s.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: s.color }}>{inc.level === 'critical' ? '!' : inc.level === 'high' ? 'H' : inc.level === 'medium' ? 'M' : 'L'}</div>
                    <div><div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{inc.id} · {inc.title}</div><div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{inc.service} · {inc.category}</div></div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Badge label={s.label} color={s.color} bg={s.color + '15'} />
                    <Badge label={inc.status === 'resolved' ? 'Résolu' : 'En cours'} color={inc.status === 'resolved' ? '#059669' : '#dc2626'} bg={inc.status === 'resolved' ? '#d1fae5' : '#fee2e2'} />
                  </div>
                </div>
                <div style={{ fontSize: 12, color: C.text2, marginBottom: 10, lineHeight: 1.5 }}>{inc.impact}</div>
                <div style={{ display: 'flex', gap: 16, fontSize: 11, color: C.muted, flexWrap: 'wrap' }}>
                  <span>🕐 {inc.started}</span><span>⏱️ {inc.duration}</span>{inc.resolved && <span>✅ {inc.resolved}</span>}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: C.muted }}><div style={{ fontSize: '2rem', marginBottom: 8 }}>✅</div><p>Aucun incident trouvé</p></div>}
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL — AVEC LAYOUT
// ═══════════════════════════════════════════════════════════════
export default function CloudOperations() {
  const [tab, setTab] = useState('dashboard');
  const tabs = [
    { id: 'dashboard', label: 'Cloud Dashboard', icon: '☁️', color: C.cloud },
    { id: 'clients', label: 'Clients', icon: '👥', color: C.blue },
    { id: 'services', label: 'Services Cloud', icon: '🔧', color: C.green },
    { id: 'storage', label: 'Espace Cloud', icon: '💾', color: C.orange },
    { id: 'costs', label: 'Coûts Cloud', icon: '💰', color: C.red },
    { id: 'crm', label: 'CRM', icon: '🤝', color: C.purple },
    { id: 'security', label: 'Sécurité', icon: '🔐', color: C.green },
    { id: 'logs', label: 'Incidents', icon: '📝', color: C.orange },
  ];

  const sections = {
    dashboard: <DashboardSection />,
    clients: <ClientsSection />,
    services: <ServicesSection />,
    storage: <StorageSection />,
    costs: <CostsSection />,
    crm: <CRMSection />,
    security: <SecuritySection />,
    logs: <LogsSection />,
  };

  return (
    <Layout>
      <div className="cloud-ops" style={{ minHeight: '100vh', background: C.bg, color: C.text }}>
        <GlobalStyles />

        {/* Navigation interne (tabs seulement) */}
        <nav style={{ background: C.surface, borderBottom: '1px solid ' + C.border, padding: '0 32px', overflowX: 'auto' }}>
          <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', gap: 4 }}>
            {tabs.map(t => {
              const a = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)} style={{ position: 'relative', padding: '14px 18px', border: 'none', background: 'transparent', color: a ? t.color : C.muted, fontSize: 13, fontWeight: a ? 700 : 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', transition: 'all .2s', borderBottom: a ? '2px solid ' + t.color : '2px solid transparent', marginBottom: -1 }}>
                  <span style={{ fontSize: 16 }}>{t.icon}</span><span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <main style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 32px 40px' }}>
          <div style={{ animation: 'fadeInUp .4s ease-out' }}>{sections[tab]}</div>
        </main>
      </div>
    </Layout>
  );
}