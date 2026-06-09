import React, { useState, useMemo , useEffect } from 'react';

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    .cloud-ops * { box-sizing: border-box; font-family: 'Inter', sans-serif; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .5; } }
    .anim-fade { animation: fadeInUp .4s ease-out forwards; }
    .card-hover { transition: all .3s cubic-bezier(.4,0,.2,1); }
    .card-hover:hover { transform: translateY(-3px); box-shadow: 0 20px 40px -12px rgba(0,0,0,.12); }
    ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
  `}</style>
);

const C = {
  bg: '#f8fafc', surface: '#ffffff', surface2: '#f1f5f9',
  border: '#e2e8f0', border2: '#cbd5e1',
  text: '#0f172a', text2: '#475569', muted: '#94a3b8',
  gold: '#f5a623', goldL: '#fef3c7', goldD: '#d4881a',
  green: '#10b981', greenL: '#d1fae5', greenD: '#059669',
  red: '#ef4444', redL: '#fee2e2', redD: '#dc2626',
  blue: '#3b82f6', blueL: '#dbeafe', blueD: '#2563eb',
  orange: '#f59e0b', orangeL: '#fef3c7',
  purple: '#8b5cf6', purpleL: '#ede9fe',
  mono: "'Inter', sans-serif"
};

/* ═══════════════════════════════════════════════════════════════
   DONNÉES MÉTIER — Pas de jargon technique
   ═══════════════════════════════════════════════════════════════ */
const DATA = {
  overview: {
    clientsActive: 142, clientsTotal: 156,
    formations: 847, formationsGrowth: 12,
    satisfaction: 94.2, satisfactionGrowth: 2.3,
    revenue: 847500, revenueGrowth: 8.5,
  },

  clients: [
    { id: 1, name: 'Ahmed Ben Ali', email: 'ahmed@digilab.tn', role: 'CLIENT', status: 'active', formations: 2, spent: 1250, lastActive: '2026-06-08T14:23', alerts: 0 },
    { id: 2, name: 'Fatima Trabelsi', email: 'fatima@digilab.tn', role: 'CLIENT', status: 'active', formations: 1, spent: 850, lastActive: '2026-06-08T11:45', alerts: 1 },
    { id: 3, name: 'Karim Mansour', email: 'karim@digilab.tn', role: 'RESPONSABLE_MARKETING', status: 'active', formations: 0, spent: 0, lastActive: '2026-06-08T16:02', alerts: 0 },
    { id: 4, name: 'Leila Ben Ammar', email: 'leila@digilab.tn', role: 'CLIENT', status: 'inactive', formations: 0, spent: 0, lastActive: '2026-05-20T09:15', alerts: 0 },
    { id: 5, name: 'Sami Ben Salah', email: 'sami@digilab.tn', role: 'CLIENT', status: 'active', formations: 3, spent: 2100, lastActive: '2026-06-07T18:30', alerts: 2 },
    { id: 6, name: 'Admin Principal', email: 'admin@digilab.tn', role: 'ADMIN', status: 'active', formations: 0, spent: 0, lastActive: '2026-06-08T17:45', alerts: 0 },
    { id: 7, name: 'Nadia Ferjani', email: 'nadia@digilab.tn', role: 'CLIENT', status: 'active', formations: 1, spent: 950, lastActive: '2026-06-08T10:15', alerts: 0 },
    { id: 8, name: 'Mohamed Gharbi', email: 'mohamed@digilab.tn', role: 'CLIENT', status: 'pending', formations: 0, spent: 0, lastActive: '2026-06-06T14:20', alerts: 1 },
  ],

  services: [
    { name: 'Site Web DigiLab', status: 'up', health: 99.99, speed: 'Rapide', region: 'Tunis', users: 12500 },
    { name: 'Plateforme DigiPip', status: 'up', health: 99.97, speed: 'Rapide', region: 'Sfax', users: 8400 },
    { name: 'Base de Données', status: 'up', health: 99.95, speed: 'Rapide', region: 'Sfax', users: 6200 },
    { name: 'Email Marketing', status: 'warn', health: 99.82, speed: 'Lent', region: 'Tunis', users: 4500 },
    { name: 'Notifications', status: 'down', health: 98.50, speed: '—', region: '—', users: 0 },
    { name: 'Dashboard Admin', status: 'up', health: 99.91, speed: 'Rapide', region: 'Sfax', users: 12 },
    { name: 'Sauvegardes', status: 'up', health: 99.98, speed: 'Normal', region: 'Tunis', users: 0 },
    { name: 'Déploiements', status: 'up', health: 99.99, speed: 'Rapide', region: 'Tunis', users: 0 },
  ],

  storage: {
    total: 500, used: 287, unit: 'GB',
    byType: [
      { type: 'Données Clients', used: 98, total: 200, color: C.blue, growth: 12 },
      { type: 'Médias & Fichiers', used: 76, total: 150, color: C.green, growth: 8 },
      { type: 'Archives & Logs', used: 69, total: 100, color: C.orange, growth: 15 },
      { type: 'Cache & Temporaire', used: 44, total: 50, color: C.purple, growth: 5 },
    ],
    history: [
      { month: 'Jan', used: 180 }, { month: 'Fév', used: 195 }, { month: 'Mar', used: 210 },
      { month: 'Avr', used: 235 }, { month: 'Mai', used: 258 }, { month: 'Juin', used: 287 },
    ]
  },

  costs: {
    current: 2840, forecast: 3200, budget: 3500, currency: 'TND',
    byCategory: [
      { name: 'Serveurs & Calcul', cost: 980, pct: 34.5, trend: 5, color: C.blue },
      { name: 'Stockage Fichiers', cost: 620, pct: 21.8, trend: 12, color: C.green },
      { name: 'Base de Données', cost: 540, pct: 19.0, trend: 8, color: C.orange },
      { name: 'Réseau & Accès', cost: 380, pct: 13.4, trend: -3, color: C.purple },
      { name: 'Sécurité', cost: 220, pct: 7.7, trend: 2, color: C.red },
      { name: 'Supervision', cost: 100, pct: 3.5, trend: 0, color: C.muted },
    ],
    optimizations: [
      { title: 'Réduction Nocturne', desc: 'Moins de ressources la nuit (20h-8h)', savings: 420, status: 'active' },
      { title: 'Compression Auto', desc: 'Fichiers plus légers automatiquement', savings: 180, status: 'active' },
      { title: 'Archivage Ancien', desc: 'Vieilles données vers stockage économique', savings: 240, status: 'planned' },
      { title: 'Cache Intelligent', desc: 'Pages plus rapides avec mémoire cache', savings: 95, status: 'active' },
      { title: 'Instances Spot', desc: 'Serveurs temporaires pour traitements', savings: 310, status: 'planned' },
    ],
    monthly: [
      { month: 'Jan', actual: 2100, optimized: 1950 }, { month: 'Fév', actual: 2280, optimized: 2100 },
      { month: 'Mar', actual: 2450, optimized: 2200 }, { month: 'Avr', actual: 2620, optimized: 2350 },
      { month: 'Mai', actual: 2750, optimized: 2420 }, { month: 'Juin', actual: 2840, optimized: 2480 },
    ]
  },

  crm: {
    pipeline: [
      { stage: 'Prospect', count: 45, value: 0, color: '#94a3b8' },
      { stage: 'Qualifié', count: 31, value: 15500, color: '#64748b' },
      { stage: 'Proposition', count: 16, value: 24800, color: C.blue },
      { stage: 'Négociation', count: 12, value: 31200, color: C.orange },
      { stage: 'Gagné', count: 9, value: 28500, color: C.green },
    ],
    interactions: [
      { client: 'Société Alpha', type: 'Email', action: 'Devis envoyé', date: '2026-06-08 14:30', status: 'pending', value: 4500 },
      { client: 'Entreprise Beta', type: 'Appel', action: 'Démonstration produit', date: '2026-06-08 11:00', status: 'completed', value: 8200 },
      { client: 'Startup Gamma', type: 'Réunion', action: 'Signature contrat', date: '2026-06-07 16:00', status: 'completed', value: 12000 },
      { client: 'Groupe Delta', type: 'Email', action: 'Relance paiement', date: '2026-06-07 09:15', status: 'urgent', value: 3800 },
      { client: 'Société Epsilon', type: 'Support', action: 'Ticket résolu', date: '2026-06-06 15:45', status: 'completed', value: 0 },
    ],
    metrics: { total: 156, active: 142, new: 18, churn: 2.3, revenue: 847500, mrr: 70500 }
  },

  security: {
    score: 94, grade: 'A+', lastAudit: '2026-06-01', nextAudit: '2026-09-01',
    protections: [
      { name: 'Accès Sécurisé', status: 'active', score: 98, desc: 'Connexions protégées et vérifiées' },
      { name: 'Chiffrement Données', status: 'active', score: 100, desc: 'Données illisibles sans clé' },
      { name: 'Protection Attaques', status: 'active', score: 96, desc: 'Filtre des connexions dangereuses' },
      { name: 'Journal Activités', status: 'active', score: 92, desc: 'Historique de toutes les actions' },
      { name: 'Gestion Secrets', status: 'active', score: 95, desc: 'Mots de passe et clés protégés' },
      { name: 'Conformité SOC2', status: 'review', score: 88, desc: 'Normes internationales de sécurité' },
    ],
    events: [
      { id: 'EVT-001', type: 'Tentative intrusion', level: 'medium', source: 'IP externe', status: 'bloqué', time: '2026-06-08 03:12', detail: '45 tentatives en 2 min · Bloqué auto' },
      { id: 'EVT-002', type: 'Requête anormale', level: 'high', source: 'Pare-feu', status: 'bloqué', time: '2026-06-07 14:23', detail: 'Requête suspecte détectée et nettoyée' },
      { id: 'EVT-003', type: 'Dépassement limite', level: 'low', source: 'Monitoring', status: 'résolu', time: '2026-06-07 09:45', detail: 'Limite dépassée · Ralentissement appliqué' },
    ]
  },

  incidents: [
    { id: 'INC-005', level: 'critical', title: 'Perte connexion principale', service: 'Base de Données', status: 'resolved', duration: '3 min', started: '2026-06-04 22:18', resolved: '2026-06-04 22:21', impact: 'Basculement transparent · 0 interruption', category: 'Infrastructure' },
    { id: 'INC-004', level: 'high', title: 'Email marketing ralenti', service: 'Email Marketing', status: 'resolved', duration: '1h 12min', started: '2026-06-05 11:15', resolved: '2026-06-05 12:27', impact: '1240 messages en attente', category: 'Performance' },
    { id: 'INC-003', level: 'medium', title: 'Mémoire cache pleine', service: 'Cache Système', status: 'active', duration: '—', started: '2026-06-05 16:42', resolved: null, impact: 'Extension en cours (+2GB)', category: 'Capacité' },
    { id: 'INC-002', level: 'low', title: 'Sauvegarde retardée', service: 'Sauvegardes', status: 'resolved', duration: '2h 15min', started: '2026-06-05 03:00', resolved: '2026-06-05 05:15', impact: 'Aucun · Retry automatique', category: 'Maintenance' },
    { id: 'INC-001', level: 'high', title: 'Indisponibilité temporaire', service: 'Site Web', status: 'resolved', duration: '24 min', started: '2026-06-05 14:23', resolved: '2026-06-05 14:47', impact: '23 requêtes retardées', category: 'Infrastructure' },
  ]
};

const TABS = [
  { id: 'dashboard', label: 'Tableau de Bord', icon: '☁️' },
  { id: 'clients', label: 'Clients', icon: '👥' },
  { id: 'services', label: 'Services', icon: '🔧' },
  { id: 'storage', label: 'Espace Cloud', icon: '💾' },
  { id: 'costs', label: 'Coûts', icon: '💰' },
  { id: 'crm', label: 'CRM', icon: '🤝' },
  { id: 'security', label: 'Sécurité', icon: '🔐' },
  { id: 'incidents', label: 'Incidents', icon: '📝' },
];

/* ═══════════════════════════════════════════════════════════════
   COMPOSANTS UTILITAIRES
   ═══════════════════════════════════════════════════════════════ */
const Card = ({ children, style = {}, onClick }) => {
  const [hover, setHover] = useState(false);
  return (
    <div 
      onClick={onClick}
      onMouseEnter={() => setHover(true)} 
      onMouseLeave={() => setHover(false)}
      style={{
        background: C.surface, borderRadius: 14, border: '1px solid ' + C.border,
        overflow: 'hidden', transition: 'all .3s cubic-bezier(.4,0,.2,1)',
        boxShadow: hover ? '0 20px 40px -12px rgba(0,0,0,.12)' : '0 1px 3px rgba(0,0,0,.05)',
        transform: hover ? 'translateY(-3px)' : 'translateY(0)',
        cursor: onClick ? 'pointer' : 'default',
        ...style
      }}
    >
      {children}
    </div>
  );
};

const Badge = ({ label, color, bg }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '4px 12px', borderRadius: 20, fontSize: 11,
    fontWeight: 700, color, background: bg, whiteSpace: 'nowrap',
    letterSpacing: '0.02em'
  }}>
    {label}
  </span>
);

const StatusBadge = ({ status }) => {
  const cfg = {
    active: { bg: C.greenL, color: C.greenD, label: 'Actif', dot: C.green },
    inactive: { bg: C.surface2, color: C.muted, label: 'Inactif', dot: C.muted },
    pending: { bg: C.orangeL, color: C.goldD, label: 'En attente', dot: C.orange },
    up: { bg: C.greenL, color: C.greenD, label: 'Opérationnel', dot: C.green },
    warn: { bg: C.orangeL, color: C.goldD, label: 'Ralenti', dot: C.orange },
    down: { bg: C.redL, color: C.redD, label: 'Indisponible', dot: C.red },
    resolved: { bg: C.greenL, color: C.greenD, label: 'Résolu', dot: C.green },
    active_incident: { bg: C.redL, color: C.redD, label: 'En cours', dot: C.red },
    completed: { bg: C.greenL, color: C.greenD, label: 'Terminé', dot: C.green },
    urgent: { bg: C.redL, color: C.redD, label: 'Urgent', dot: C.red },
    pending_crm: { bg: C.blueL, color: C.blueD, label: 'En attente', dot: C.blue },
    blocked: { bg: C.greenL, color: C.greenD, label: 'Bloqué', dot: C.green },
  };
  const c = cfg[status] || cfg.inactive;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: c.bg, color: c.color }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, boxShadow: '0 0 6px ' + c.dot + '60' }} />
      {c.label}
    </span>
  );
};

const KPICard = ({ title, value, subtitle, trend, icon, color, delay = 0 }) => {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <Card style={{ padding: 24, opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(16px)', transition: `all .5s ease ${delay}ms` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
          {icon}
        </div>
        {trend && (
          <span style={{ 
            padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            background: trend.startsWith('+') ? C.greenL : C.redL,
            color: trend.startsWith('+') ? C.greenD : C.redD,
            fontFamily: C.mono
          }}>
            {trend.startsWith('+') ? '↗' : '↘'} {trend.replace('+', '')}
          </span>
        )}
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: '-0.02em', marginBottom: 4 }}>{value}</div>
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
      <span style={{ fontSize: 11, fontWeight: 700, color: C.text2, fontFamily: C.mono, minWidth: 36, textAlign: 'right' }}>{pct.toFixed(0)}%</span>
    </div>
  );
};

const SectionHeader = ({ title, subtitle, action }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
    <div>
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text, letterSpacing: '-0.01em' }}>{title}</h2>
      {subtitle && <p style={{ margin: '4px 0 0', fontSize: 13, color: C.muted }}>{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

const MiniChart = ({ data, color, height = 40, width = 100 }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`g-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${points} ${width},${height}`} fill={`url(#g-${color.replace('#', '')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD
   ═══════════════════════════════════════════════════════════════ */
function DashboardSection() {
  const servicesUp = DATA.services.filter(s => s.status === 'up').length;
  const storagePct = (DATA.storage.used / DATA.storage.total * 100).toFixed(1);
  const totalAlerts = DATA.clients.reduce((a, c) => a + c.alerts, 0);

  return (
    <div className="anim-fade">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <KPICard title="Clients Actifs" value={DATA.overview.clientsActive} subtitle={DATA.overview.clientsTotal + ' total'} trend="+12" icon="👥" color={C.blue} delay={0} />
        <KPICard title="Formations" value={DATA.overview.formations} subtitle="Inscriptions totales" trend="+12" icon="🎓" color={C.green} delay={100} />
        <KPICard title="Satisfaction" value={DATA.overview.satisfaction + '%'} subtitle="Score moyen" trend="+2.3" icon="⭐" color={C.gold} delay={200} />
        <KPICard title="Revenus" value={DATA.overview.revenue.toLocaleString() + ' TND'} subtitle={"MRR: " + DATA.crm.metrics.mrr.toLocaleString() + ' TND'} trend="+8.5" icon="💰" color={C.green} delay={300} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16, marginBottom: 24 }}>
        <Card style={{ padding: 24 }}>
          <SectionHeader title="État des Services" subtitle={servicesUp + ' opérationnels sur ' + DATA.services.length} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DATA.services.map((svc, i) => {
              const isUp = svc.status === 'up';
              const isWarn = svc.status === 'warn';
              const color = isUp ? C.green : isWarn ? C.orange : C.red;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 10, background: isUp ? C.greenL : isWarn ? C.orangeL : C.redL, border: '1px solid ' + color + '20' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, boxShadow: '0 0 8px ' + color + '60', animation: !isUp ? 'pulse 2s infinite' : 'none' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{svc.name}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{svc.region} · {svc.users.toLocaleString()} utilisateurs</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: color, fontFamily: C.mono }}>{svc.health}%</div>
                    <div style={{ fontSize: 10, color: C.muted }}>{svc.speed}</div>
                  </div>
                  <MiniChart data={[svc.health - 0.5, svc.health - 0.2, svc.health - 0.1, svc.health]} color={color} height={30} width={80} />
                </div>
              );
            })}
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card style={{ padding: 24, flex: 1 }}>
            <SectionHeader title="Espace Cloud" subtitle={DATA.storage.used + ' / ' + DATA.storage.total + ' ' + DATA.storage.unit} />
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <span style={{ fontSize: 32, fontWeight: 800, color: C.text }}>{storagePct}<span style={{ fontSize: 16, color: C.muted }}>%</span></span>
                <span style={{ fontSize: 12, color: C.muted }}>+12% ce mois</span>
              </div>
              <ProgressBar value={DATA.storage.used} max={DATA.storage.total} color={storagePct > 80 ? C.red : storagePct > 60 ? C.orange : C.blue} height={10} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {DATA.storage.byType.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: item.color }} />
                  <span style={{ flex: 1, fontSize: 12, color: C.text }}>{item.type}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: item.color, fontFamily: C.mono }}>{item.used} {DATA.storage.unit}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        <Card style={{ padding: 24 }}>
          <SectionHeader title="Alertes en Temps Réel" subtitle={totalAlerts + ' nécessitent attention'} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DATA.clients.filter(c => c.alerts > 0).map((client, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: C.redL, borderRadius: 10, border: '1px solid ' + C.red + '20' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.red + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: C.red }}>{client.name.charAt(0)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{client.name}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{client.email}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: C.red + '15', color: C.red, fontSize: 11, fontWeight: 700 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red, animation: 'pulse 2s infinite' }} />
                  {client.alerts} alerte{client.alerts > 1 ? 's' : ''}
                </div>
              </div>
            ))}
            {DATA.clients.filter(c => c.alerts > 0).length === 0 && (
              <div style={{ textAlign: 'center', padding: 32, color: C.muted }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                <p style={{ fontSize: 13, margin: 0 }}>Système stable · Aucune alerte</p>
              </div>
            )}
          </div>
        </Card>

        <Card style={{ padding: 24 }}>
          <SectionHeader title="Coûts & Budget" subtitle={DATA.costs.currency + ' · Année 2026'} />
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: C.text }}>{DATA.costs.current.toLocaleString()}<span style={{ fontSize: 14, color: C.muted, marginLeft: 4 }}>TND</span></span>
              <span style={{ fontSize: 12, color: DATA.costs.current > DATA.costs.budget * 0.9 ? C.red : C.muted, fontWeight: 600 }}>{((DATA.costs.current / DATA.costs.budget) * 100).toFixed(0)}% du budget</span>
            </div>
            <ProgressBar value={DATA.costs.current} max={DATA.costs.budget} color={DATA.costs.current > DATA.costs.budget * 0.9 ? C.red : DATA.costs.current > DATA.costs.budget * 0.7 ? C.orange : C.green} height={10} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {DATA.costs.byCategory.slice(0, 4).map((cat, i) => (
              <div key={i} style={{ padding: 10, background: C.surface2, borderRadius: 8, border: '1px solid ' + C.border }}>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{cat.name}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: C.mono }}>{cat.cost.toLocaleString()} TND</div>
                <div style={{ fontSize: 10, color: cat.trend > 0 ? C.red : C.green, marginTop: 2 }}>{cat.trend > 0 ? '↗' : '↘'} {Math.abs(cat.trend)}%</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CLIENTS
   ═══════════════════════════════════════════════════════════════ */
function ClientsSection() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let data = [...DATA.clients];
    if (filter !== 'all') data = data.filter(c => c.status === filter);
    if (search) data = data.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));
    return data;
  }, [filter, search]);

  const roleColors = { ADMIN: C.red, RESPONSABLE_MARKETING: C.orange, CLIENT: C.blue };
  const roleLabels = { ADMIN: 'Admin', RESPONSABLE_MARKETING: 'Marketing', CLIENT: 'Client' };

  return (
    <div className="anim-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.text }}>Gestion des Clients</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: C.muted }}>{filtered.length} résultat{filtered.length > 1 ? 's' : ''} sur {DATA.clients.length}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid ' + C.border, background: C.surface, color: C.muted, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>📥 Exporter</button>
          <button style={{ padding: '8px 14px', borderRadius: 10, border: 'none', background: C.gold, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>➕ Nouveau</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="Rechercher par nom ou email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, maxWidth: 320, padding: '10px 14px', borderRadius: 10, border: '1px solid ' + C.border, fontSize: 13, outline: 'none' }}
        />
        <div style={{ display: 'flex', gap: 4, padding: 4, background: C.surface2, borderRadius: 10, border: '1px solid ' + C.border }}>
          {['all', 'active', 'inactive', 'pending'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '6px 14px', borderRadius: 8, border: 'none',
              background: filter === f ? C.surface : 'transparent',
              color: filter === f ? C.text : C.muted,
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              boxShadow: filter === f ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
            }}>{f === 'all' ? 'Tous' : f === 'active' ? 'Actifs' : f === 'inactive' ? 'Inactifs' : 'En attente'}</button>
          ))}
        </div>
      </div>

      <div style={{ background: C.surface, borderRadius: 14, border: '1px solid ' + C.border, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr 1fr 1fr', padding: '12px 20px', background: C.surface2, borderBottom: '1px solid ' + C.border, gap: 16 }}>
          {['Client', 'Contact', 'Rôle', 'Statut', 'Formations', 'Dépenses', 'Activité', 'Actions'].map((h, i) => (
            <div key={i} style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
          ))}
        </div>
        {filtered.map(client => (
          <div key={client.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr 1fr 1fr', padding: '14px 20px', borderBottom: '1px solid ' + C.border, gap: 16, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: roleColors[client.role] + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: roleColors[client.role], border: '2px solid ' + roleColors[client.role] + '30' }}>
                {client.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{client.name}</div>
                <div style={{ fontSize: 11, color: C.muted }}>ID: #{String(client.id).padStart(4, '0')}</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: C.text2 }}>{client.email}</div>
            <Badge label={roleLabels[client.role]} color={roleColors[client.role]} bg={roleColors[client.role] + '15'} />
            <StatusBadge status={client.status} />
            <div style={{ fontSize: 13, fontWeight: 700, color: C.blue, fontFamily: C.mono }}>{client.formations}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: C.mono }}>{client.spent > 0 ? client.spent.toLocaleString() + ' TND' : '—'}</div>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: C.mono }}>{new Date(client.lastActive).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid ' + C.border, background: C.surface, cursor: 'pointer', fontSize: 12 }}>👁</button>
              <button style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid ' + C.border, background: C.surface, cursor: 'pointer', fontSize: 12 }}>✏️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SERVICES
   ═══════════════════════════════════════════════════════════════ */
function ServicesSection() {
  const upCount = DATA.services.filter(s => s.status === 'up').length;
  const warnCount = DATA.services.filter(s => s.status === 'warn').length;
  const downCount = DATA.services.filter(s => s.status === 'down').length;

  return (
    <div className="anim-fade">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <KPICard title="Opérationnels" value={upCount} subtitle={DATA.services.length + ' services total'} icon="✅" color={C.green} trend="+2" />
        <KPICard title="Ralentis" value={warnCount} subtitle="Performance réduite" icon="⚠️" color={C.orange} trend="-1" />
        <KPICard title="Indisponibles" value={downCount} subtitle="Intervention requise" icon="❌" color={C.red} trend="+1" />
        <KPICard title="Santé Moyenne" value={(DATA.services.reduce((a, s) => a + s.health, 0) / DATA.services.length).toFixed(2) + '%'} subtitle="Objectif: 99.95%" icon="💚" color={C.blue} />
      </div>

      <Card style={{ padding: 24 }}>
        <SectionHeader title="Surveillance des Services" subtitle="Santé · Vitesse · Utilisateurs" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {DATA.services.map((svc, i) => {
            const isUp = svc.status === 'up';
            const isWarn = svc.status === 'warn';
            const color = isUp ? C.green : isWarn ? C.orange : C.red;
            const label = isUp ? 'Opérationnel' : isWarn ? 'Ralenti' : 'Hors service';
            return (
              <div key={i} style={{ padding: 20, borderRadius: 12, background: isUp ? C.greenL : isWarn ? C.orangeL : C.redL, border: '1px solid ' + color + '25' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                      {isUp ? '✅' : isWarn ? '⚠️' : '❌'}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{svc.name}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{svc.region}</div>
                    </div>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: color + '20', color }}>{label}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                  <div style={{ textAlign: 'center', padding: 10, background: 'rgba(255,255,255,0.5)', borderRadius: 8 }}>
                    <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Santé</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: C.text, fontFamily: C.mono }}>{svc.health}%</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: 10, background: 'rgba(255,255,255,0.5)', borderRadius: 8 }}>
                    <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Vitesse</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: svc.speed === 'Lent' ? C.orange : C.text, fontFamily: C.mono }}>{svc.speed}</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: 10, background: 'rgba(255,255,255,0.5)', borderRadius: 8 }}>
                    <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Utilisateurs</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: C.text, fontFamily: C.mono }}>{svc.users > 0 ? (svc.users / 1000).toFixed(1) + 'k' : '—'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <MiniChart data={[svc.health - 0.8, svc.health - 0.4, svc.health - 0.2, svc.health - 0.1, svc.health]} color={color} height={35} width={200} />
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, fontFamily: C.mono }}>24h</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STOCKAGE CLOUD
   ═══════════════════════════════════════════════════════════════ */
function StorageSection() {
  const [selected, setSelected] = useState(null);
  const pct = (DATA.storage.used / DATA.storage.total * 100).toFixed(1);
  const remaining = DATA.storage.total - DATA.storage.used;

  return (
    <div className="anim-fade">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <KPICard title="Capacité Totale" value={DATA.storage.total + ' ' + DATA.storage.unit} subtitle="Provisionné" icon="💾" color={C.blue} />
        <KPICard title="Utilisé" value={DATA.storage.used + ' ' + DATA.storage.unit} subtitle={pct + '% · ' + remaining + ' ' + DATA.storage.unit + ' libre'} icon="📦" color={pct > 80 ? C.red : pct > 60 ? C.orange : C.green} trend="+10" />
        <KPICard title="Croissance" value="+12%" subtitle="Moyenne mensuelle" icon="📈" color={C.gold} trend="+2.3" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card style={{ padding: 24 }}>
          <SectionHeader title="Répartition par Type" subtitle="Cliquez pour les détails" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {DATA.storage.byType.map((item, i) => {
              const p = ((item.used / item.total) * 100).toFixed(0);
              const isSel = selected === i;
              return (
                <div key={i} onClick={() => setSelected(isSel ? null : i)} style={{ padding: 16, borderRadius: 10, background: isSel ? item.color + '08' : C.surface2, border: '1px solid ' + (isSel ? item.color + '40' : C.border), cursor: 'pointer', transition: 'all .2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{item.type}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: C.text, fontFamily: C.mono }}>{item.used} <span style={{ fontSize: 12, color: C.muted }}>/ {item.total}</span></div>
                      <div style={{ fontSize: 11, color: item.color, fontWeight: 600 }}>{p}%</div>
                    </div>
                  </div>
                  <ProgressBar value={item.used} max={item.total} color={item.color} height={6} />
                  {isSel && (
                    <div style={{ marginTop: 12, padding: 12, background: C.surface, borderRadius: 8, border: '1px solid ' + C.border, fontSize: 12, color: C.text2, lineHeight: 1.6 }}>
                      <div>📈 Prévision: <strong>{(item.used * 1.12).toFixed(1)} {DATA.storage.unit}</strong> dans 30j</div>
                      <div>💡 Recommandation: <strong>Extension</strong> si &gt;85%</div>
                      <div>🔄 Réplication: <strong>Active</strong> (multi-zone)</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card style={{ padding: 24, flex: 1 }}>
            <SectionHeader title="Évolution Mensuelle" subtitle="6 derniers mois" />
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 200, padding: '10px 0' }}>
              {DATA.storage.history.map((h, i) => {
                const max = Math.max(...DATA.storage.history.map(x => x.used));
                const height = (h.used / max) * 160;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.text, fontFamily: C.mono }}>{h.used}</div>
                    <div style={{ width: '100%', height: height, background: i === DATA.storage.history.length - 1 ? C.gold : C.blue, borderRadius: '4px 4px 0 0', transition: 'height 1s', opacity: i === DATA.storage.history.length - 1 ? 1 : 0.6 }} />
                    <div style={{ fontSize: 10, color: C.muted }}>{h.month}</div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card style={{ padding: 24 }}>
            <SectionHeader title="Alertes de Capacité" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: C.orangeL, borderRadius: 10, border: '1px solid ' + C.orange + '25' }}>
                <span style={{ fontSize: 18 }}>⚠️</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Seuil d'alerte à 80%</div>
                  <div style={{ fontSize: 11, color: C.muted }}>Base de données: 98/200 GB (49%)</div>
                </div>
                <span style={{ fontSize: 11, color: C.orange, fontWeight: 700 }}>7j restants</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: C.blueL, borderRadius: 10, border: '1px solid ' + C.blue + '25' }}>
                <span style={{ fontSize: 18 }}>ℹ️</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Archivage automatique</div>
                  <div style={{ fontSize: 11, color: C.muted }}>Données &gt;90j archivées le 15 juin</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COÛTS
   ═══════════════════════════════════════════════════════════════ */
function CostsSection() {
  const [showOpt, setShowOpt] = useState(false);
  const savings = DATA.costs.optimizations.reduce((a, o) => a + o.savings, 0);

  return (
    <div className="anim-fade">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <KPICard title="Coûts Actuels" value={DATA.costs.current.toLocaleString() + ' TND'} subtitle={"Budget: " + DATA.costs.budget.toLocaleString() + ' TND'} icon="💰" color={C.blue} trend="+5.2" />
        <KPICard title="Prévision" value={DATA.costs.forecast.toLocaleString() + ' TND'} subtitle={"+" + ((DATA.costs.forecast - DATA.costs.current) / DATA.costs.current * 100).toFixed(0) + "% vs actuel"} icon="📊" color={C.orange} />
        <KPICard title="Économies Potentielles" value={savings.toLocaleString() + ' TND'} subtitle={"Soit " + ((savings / DATA.costs.current) * 100).toFixed(0) + "% de réduction"} icon="✅" color={C.green} trend="+8" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16, marginBottom: 24 }}>
        <Card style={{ padding: 24 }}>
          <SectionHeader title="Répartition des Coûts" subtitle="Par catégorie de service" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {DATA.costs.byCategory.map((cat, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: cat.color }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{cat.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 11, color: cat.trend > 0 ? C.red : C.green, fontWeight: 600, fontFamily: C.mono }}>{cat.trend > 0 ? '↗' : '↘'} {Math.abs(cat.trend)}%</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: C.mono, minWidth: 70, textAlign: 'right' }}>{cat.cost.toLocaleString()} TND</span>
                    <span style={{ fontSize: 11, color: C.muted, minWidth: 40, textAlign: 'right' }}>({cat.pct}%)</span>
                  </div>
                </div>
                <ProgressBar value={cat.pct} max={100} color={cat.color} height={6} />
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ padding: 24 }}>
          <SectionHeader title="Évolution" subtitle="Coûts réels vs optimisés" />
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 180, padding: '10px 0', marginBottom: 16 }}>
            {DATA.costs.monthly.map((h, i) => {
              const max = Math.max(...DATA.costs.monthly.map(x => x.actual));
              const h1 = (h.actual / max) * 140;
              const h2 = (h.optimized / max) * 140;
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
        <SectionHeader title="Optimisations Recommandées" subtitle={savings.toLocaleString() + ' TND/mois d\'économies'} action={<button onClick={() => setShowOpt(!showOpt)} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid ' + C.border, background: C.surface, color: C.muted, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{showOpt ? '▼' : '▶'} {showOpt ? 'Réduire' : 'Développer'}</button>} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {DATA.costs.optimizations.map((opt, i) => (
            <div key={i} style={{ padding: 18, background: opt.status === 'active' ? C.greenL : C.surface2, borderRadius: 10, border: '1px solid ' + (opt.status === 'active' ? C.green + '30' : C.border) }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{opt.title}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{opt.desc}</div>
                </div>
                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: opt.status === 'active' ? C.green + '15' : C.orange + '15', color: opt.status === 'active' ? C.greenD : C.goldD }}>{opt.status === 'active' ? '✓ Actif' : '○ Planifié'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: C.surface, borderRadius: 8, border: '1px solid ' + C.border }}>
                <span style={{ fontSize: 11, color: C.muted }}>Économies mensuelles</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: C.green, fontFamily: C.mono }}>{opt.savings.toLocaleString()} TND</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CRM
   ═══════════════════════════════════════════════════════════════ */
function CRMSection() {
  const [stage, setStage] = useState(null);
  const totalVal = DATA.crm.pipeline.reduce((a, p) => a + p.value, 0);

  return (
    <div className="anim-fade">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <KPICard title="Clients Total" value={DATA.crm.metrics.total} subtitle={DATA.crm.metrics.active + ' actifs'} icon="👥" color={C.blue} trend="+12" />
        <KPICard title="Nouveaux (30j)" value={DATA.crm.metrics.new} subtitle="+28% vs mois dernier" icon="🆕" color={C.green} trend="+28" />
        <KPICard title="Revenus" value={DATA.crm.metrics.revenue.toLocaleString() + ' TND'} subtitle={"MRR: " + DATA.crm.metrics.mrr.toLocaleString() + ' TND'} icon="💰" color={C.gold} trend="+8.5" />
        <KPICard title="Churn Rate" value={DATA.crm.metrics.churn + '%'} subtitle="Objectif: <3%" icon="📉" color={DATA.crm.metrics.churn > 3 ? C.red : C.green} trend="-0.5" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16 }}>
        <Card style={{ padding: 24 }}>
          <SectionHeader title="Pipeline Commercial" subtitle={totalVal.toLocaleString() + ' TND en cours'} />
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, height: 48 }}>
            {DATA.crm.pipeline.map((s, i) => {
              const w = (s.count / DATA.crm.metrics.total) * 100;
              const isA = stage === i;
              return (
                <div key={i} onClick={() => setStage(isA ? null : i)} style={{ flex: w, minWidth: 50, cursor: 'pointer' }}>
                  <div style={{ height: '100%', background: s.color, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, boxShadow: isA ? '0 0 0 3px ' + s.color + '40' : 'none' }}>{s.count}</div>
                  <div style={{ textAlign: 'center', marginTop: 8, fontSize: 11, fontWeight: 600, color: isA ? s.color : C.muted }}>{s.stage}</div>
                </div>
              );
            })}
          </div>
          {stage !== null && (
            <div style={{ padding: 16, background: C.surface2, borderRadius: 10, border: '1px solid ' + C.border, animation: 'fadeInUp .3s ease' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>{DATA.crm.pipeline[stage].stage}</div>
              <div style={{ fontSize: 13, color: C.text2 }}>{DATA.crm.pipeline[stage].count} opportunités · Valeur: {DATA.crm.pipeline[stage].value.toLocaleString()} TND</div>
            </div>
          )}
        </Card>

        <Card style={{ padding: 24 }}>
          <SectionHeader title="Interactions Récentes" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DATA.crm.interactions.map((inter, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: 14, borderRadius: 10, background: inter.status === 'completed' ? C.greenL : inter.status === 'urgent' ? C.redL : C.blueL, border: '1px solid ' + (inter.status === 'completed' ? C.green : inter.status === 'urgent' ? C.red : C.blue) + '20' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: inter.status === 'completed' ? C.green + '15' : inter.status === 'urgent' ? C.red + '15' : C.blue + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>
                  {inter.type === 'Email' ? '📧' : inter.type === 'Appel' ? '📞' : '📅'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{inter.client}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{inter.action}</div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 4, fontFamily: C.mono }}>{inter.date}</div>
                </div>
                {inter.value > 0 && <div style={{ fontSize: 12, fontWeight: 700, color: C.gold, fontFamily: C.mono, flexShrink: 0 }}>{inter.value.toLocaleString()} TND</div>}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SÉCURITÉ
   ═══════════════════════════════════════════════════════════════ */
function SecuritySection() {
  const [sel, setSel] = useState(null);
  const sc = DATA.security.score >= 90 ? C.green : DATA.security.score >= 70 ? C.orange : C.red;

  return (
    <div className="anim-fade">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <Card style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Score de Sécurité</div>
          <div style={{ fontSize: 56, fontWeight: 800, color: sc, lineHeight: 1 }}>{DATA.security.score}<span style={{ fontSize: 24, color: C.muted }}>/100</span></div>
          <div style={{ marginTop: 8, fontSize: 14, fontWeight: 700, color: sc }}>Grade {DATA.security.grade}</div>
          <div style={{ marginTop: 4, fontSize: 11, color: C.muted }}>Audit: {DATA.security.lastAudit}</div>
        </Card>
        <KPICard title="Protections Actives" value={DATA.security.protections.filter(p => p.status === 'active').length + '/' + DATA.security.protections.length} subtitle="Toutes les couches critiques" icon="🛡️" color={C.green} />
        <KPICard title="Menaces Bloquées" value={DATA.security.events.filter(e => e.status === 'bloqué').length.toString()} subtitle={DATA.security.events.length + ' total (24h)'} icon="🔒" color={C.blue} trend="+3" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card style={{ padding: 24 }}>
          <SectionHeader title="Couches de Protection" subtitle="Cliquez pour les détails" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DATA.security.protections.map((p, i) => {
              const isA = sel === i;
              const pc = p.score >= 95 ? C.green : p.score >= 85 ? C.orange : C.red;
              return (
                <div key={i} onClick={() => setSel(isA ? null : i)} style={{ padding: 14, borderRadius: 10, background: isA ? pc + '08' : C.surface2, border: '1px solid ' + (isA ? pc + '40' : C.border), cursor: 'pointer', transition: 'all .2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18 }}>{['🔐', '🛡️', '🚫', '🔍', '🔑', '✅'][i]}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{p.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: pc, fontFamily: C.mono }}>{p.score}</span>
                      <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: p.status === 'active' ? C.greenL : C.orangeL, color: p.status === 'active' ? C.greenD : C.goldD }}>{p.status === 'active' ? '✓' : '○'}</span>
                    </div>
                  </div>
                  <ProgressBar value={p.score} max={100} color={pc} height={4} />
                  {isA && (
                    <div style={{ marginTop: 12, padding: 12, background: C.surface, borderRadius: 8, border: '1px solid ' + C.border, fontSize: 12, color: C.text2, lineHeight: 1.6 }}>
                      <div>{p.desc}</div>
                      <div style={{ marginTop: 4 }}>📅 Prochain audit: <strong>{DATA.security.nextAudit}</strong></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <Card style={{ padding: 24 }}>
          <SectionHeader title="Événements Récentes" subtitle="24 dernières heures" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DATA.security.events.map((evt, i) => {
              const ec = evt.level === 'high' ? C.red : evt.level === 'medium' ? C.orange : C.blue;
              return (
                <div key={i} style={{ padding: 14, borderRadius: 10, background: ec + '08', border: '1px solid ' + ec + '25' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{evt.id} · {evt.type}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 2, fontFamily: C.mono }}>{evt.source} · {evt.time}</div>
                    </div>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: ec + '15', color: ec }}>{evt.level}</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.text2, marginBottom: 8 }}>{evt.detail}</div>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: evt.status === 'bloqué' ? C.greenL : C.orangeL, color: evt.status === 'bloqué' ? C.greenD : C.goldD }}>{evt.status === 'bloqué' ? '✓ Bloqué' : '⚠ Détecté'}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   INCIDENTS
   ═══════════════════════════════════════════════════════════════ */
function LogsSection() {
  const [sevFilter, setSevFilter] = useState('all');
  const [statFilter, setStatFilter] = useState('all');

  const filtered = useMemo(() => {
    let d = [...DATA.incidents];
    if (sevFilter !== 'all') d = d.filter(i => i.level === sevFilter);
    if (statFilter !== 'all') d = d.filter(i => i.status === statFilter);
    return d;
  }, [sevFilter, statFilter]);

  const cats = [
    { name: 'Infrastructure', count: DATA.incidents.filter(i => i.category === 'Infrastructure').length, color: C.red },
    { name: 'Performance', count: DATA.incidents.filter(i => i.category === 'Performance').length, color: C.orange },
    { name: 'Capacité', count: DATA.incidents.filter(i => i.category === 'Capacité').length, color: C.gold },
    { name: 'Maintenance', count: DATA.incidents.filter(i => i.category === 'Maintenance').length, color: C.blue },
    { name: 'Service', count: DATA.incidents.filter(i => i.category === 'Service').length, color: C.green },
  ];

  const sevCfg = {
    critical: { color: C.red, bg: C.redL, label: 'Critique' },
    high: { color: C.orange, bg: C.orangeL, label: 'Élevée' },
    medium: { color: C.gold, bg: C.goldL, label: 'Moyenne' },
    low: { color: C.blue, bg: C.blueL, label: 'Faible' },
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
        <KPICard title="Incidents (30j)" value={DATA.incidents.length.toString()} subtitle="-40% vs mois dernier" icon="📝" color={C.orange} trend="-40" />
        <KPICard title="Temps Résolution" value="52 min" subtitle="Moyenne de résolution" icon="⏱️" color={C.blue} trend="-15" />
        <KPICard title="Disponibilité" value="99.97%" subtitle="Objectif: 99.95%" icon="✅" color={C.green} trend="+0.02" />
        <KPICard title="Sauvegardes" value="98%" subtitle="24/24 ce mois" icon="💾" color={C.gold} trend="+2" />
      </div>

      <Card style={{ padding: 24 }}>
        <SectionHeader 
          title="Journal des Incidents" 
          subtitle={filtered.length + ' résultat' + (filtered.length > 1 ? 's' : '')}
          action={
            <div style={{ display: 'flex', gap: 8 }}>
              <select value={sevFilter} onChange={e => setSevFilter(e.target.value)} style={{ padding: '6px 12px', borderRadius: 10, border: '1px solid ' + C.border, fontSize: 12, color: C.muted, background: C.surface }}>
                <option value="all">Toutes sévérités</option>
                <option value="critical">Critique</option>
                <option value="high">Élevée</option>
                <option value="medium">Moyenne</option>
                <option value="low">Faible</option>
              </select>
              <select value={statFilter} onChange={e => setStatFilter(e.target.value)} style={{ padding: '6px 12px', borderRadius: 10, border: '1px solid ' + C.border, fontSize: 12, color: C.muted, background: C.surface }}>
                <option value="all">Tous statuts</option>
                <option value="resolved">Résolu</option>
                <option value="active">En cours</option>
              </select>
            </div>
          }
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((inc, i) => {
            const s = sevCfg[inc.level];
            return (
              <div key={i} style={{ padding: 18, borderRadius: 10, background: s.bg, border: '1px solid ' + s.color + '25' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: s.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: s.color }}>
                      {inc.level === 'critical' ? '!' : inc.level === 'high' ? 'H' : inc.level === 'medium' ? 'M' : 'L'}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{inc.id} · {inc.title}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 2, fontFamily: C.mono }}>{inc.service} · {inc.category}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Badge label={s.label} color={s.color} bg={s.color + '15'} />
                    <Badge label={inc.status === 'resolved' ? 'Résolu' : 'En cours'} color={inc.status === 'resolved' ? C.greenD : C.redD} bg={inc.status === 'resolved' ? C.greenL : C.redL} />
                  </div>
                </div>
                <div style={{ fontSize: 12, color: C.text2, marginBottom: 10, lineHeight: 1.5 }}>{inc.impact}</div>
                <div style={{ display: 'flex', gap: 16, fontSize: 11, color: C.muted, fontFamily: C.mono, flexWrap: 'wrap' }}>
                  <span>🕐 {inc.started}</span>
                  <span>⏱️ {inc.duration}</span>
                  {inc.resolved && <span>✅ {inc.resolved}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════════════════════════ */
export default function CloudOperations() {
  const [tab, setTab] = useState('dashboard');
  const [time, setTime] = useState(new Date());

  useEffect(() => { const i = setInterval(() => setTime(new Date()), 30000); return () => clearInterval(i); }, []);

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

  const tabs = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: '☁️', color: C.gold },
    { id: 'clients', label: 'Clients', icon: '👥', color: C.blue },
    { id: 'services', label: 'Services', icon: '🔧', color: C.green },
    { id: 'storage', label: 'Espace Cloud', icon: '💾', color: C.orange },
    { id: 'costs', label: 'Coûts', icon: '💰', color: C.red },
    { id: 'crm', label: 'CRM', icon: '🤝', color: C.purple },
    { id: 'security', label: 'Sécurité', icon: '🔐', color: C.green },
    { id: 'logs', label: 'Incidents', icon: '📝', color: C.orange },
  ];

  return (
    <div className="cloud-ops" style={{ minHeight: '100vh', background: C.bg, color: C.text }}>
      <GlobalStyles />

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(248,250,252,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid ' + C.border, padding: '0 32px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, ' + C.gold + ' 0%, ' + C.goldD + ' 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 4px 12px ' + C.gold + '40' }}>☁️</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: '-0.02em' }}>Centre de Contrôle Cloud</h1>
              <p style={{ margin: 0, fontSize: 11, color: C.muted, marginTop: 1 }}>DigiLab Solutions · Sfax, Tunisie · {time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 20, background: C.greenL, border: '1px solid ' + C.green + '30' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.green, boxShadow: '0 0 8px ' + C.green + '60', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: C.greenD }}>Cloud Opérationnel</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 20, background: C.goldL, border: '1px solid ' + C.gold + '30' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.goldD }}>👤 Admin</span>
            </div>
            <button onClick={() => setTime(new Date())} style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid ' + C.border, background: C.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14 }}>🔄</button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav style={{ background: C.surface, borderBottom: '1px solid ' + C.border, padding: '0 32px', overflowX: 'auto' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', gap: 4 }}>
          {tabs.map(t => {
            const a = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  position: 'relative', padding: '14px 18px', border: 'none', background: 'transparent',
                  color: a ? t.color : C.muted, fontSize: 13, fontWeight: a ? 700 : 500,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                  whiteSpace: 'nowrap', transition: 'all .2s',
                  borderBottom: a ? '2px solid ' + t.color : '2px solid transparent',
                  marginBottom: -1,
                }}
              >
                <span style={{ fontSize: 16 }}>{t.icon}</span>
                <span>{t.label}</span>
                {t.id === 'logs' && DATA.incidents.filter(i => i.status === 'active').length > 0 && (
                  <span style={{ padding: '2px 6px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: C.red, color: '#fff' }}>{DATA.incidents.filter(i => i.status === 'active').length}</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Content */}
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 32px 40px' }}>
        <div style={{ animation: 'fadeInUp .4s ease-out' }}>{sections[tab]}</div>
      </main>
    </div>
  );
}