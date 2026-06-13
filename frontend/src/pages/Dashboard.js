import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Layout from '../Layout';

const THEME = {
  bg: '#f8fafc',
  bgCard: '#ffffff',
  bgHover: '#f1f5f9',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  primary: '#f59e0b',
  primaryLight: '#fbbf24',
  primaryDark: '#d97706',
  primaryBg: '#fffbeb',
  text: '#1e293b',
  textSecondary: '#475569',
  textMuted: '#64748b',
  textLight: '#94a3b8',
  success: '#10b981',
  successBg: '#ecfdf5',
  danger: '#ef4444',
  dangerBg: '#fef2f2',
  warning: '#f59e0b',
  warningBg: '#fffbeb',
  info: '#3b82f6',
  infoBg: '#eff6ff',
  chartColors: ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'],
  shadow: '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)',
  shadowMd: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
  shadowLg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
};

const KPICard = ({ title, value, change, changeType, icon, color, subtitle, loading, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: THEME.bgCard,
        border: `1px solid ${hovered ? color : THEME.border}`,
        borderRadius: '16px',
        padding: '24px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: hovered ? THEME.shadowLg : THEME.shadow,
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '4px', background: color, borderRadius: '16px 16px 0 0',
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '14px',
          background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '26px', border: `2px solid ${color}25`,
        }}>
          {icon}
        </div>
        {change !== undefined && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
            background: changeType === 'up' ? THEME.successBg : THEME.dangerBg,
            color: changeType === 'up' ? THEME.success : THEME.danger,
            border: `1px solid ${changeType === 'up' ? '#a7f3d0' : '#fecaca'}`,
          }}>
            {changeType === 'up' ? '↗' : '↘'} {Math.abs(change)}%
          </div>
        )}
      </div>
      <div style={{ fontSize: '32px', fontWeight: '800', color: THEME.text, marginBottom: '6px', letterSpacing: '-0.5px' }}>
        {loading ? (
          <div style={{
            width: '80px', height: '36px',
            background: `linear-gradient(90deg, ${THEME.border} 25%, ${THEME.borderLight} 50%, ${THEME.border} 75%)`,
            backgroundSize: '200% 100%', borderRadius: '8px',
            animation: 'shimmer 1.5s infinite',
          }} />
        ) : value}
      </div>
      <div style={{ fontSize: '14px', color: THEME.textSecondary, fontWeight: '600' }}>{title}</div>
      {subtitle && (
        <div style={{ fontSize: '12px', color: THEME.textMuted, marginTop: '6px', fontWeight: '500' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};

const SectionHeader = ({ title, subtitle, action }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
    <div>
      <h3 style={{ fontSize: '20px', fontWeight: '700', color: THEME.text, margin: 0, letterSpacing: '-0.3px' }}>{title}</h3>
      {subtitle && <p style={{ fontSize: '14px', color: THEME.textMuted, margin: '6px 0 0 0', fontWeight: '500' }}>{subtitle}</p>}
    </div>
    {action}
  </div>
);

const StatusBadge = ({ status }) => {
  const configs = {
    published: { bg: THEME.successBg, color: THEME.success, border: '#a7f3d0', label: 'Publiée' },
    draft: { bg: THEME.bgHover, color: THEME.textMuted, border: THEME.border, label: 'Brouillon' },
    active: { bg: THEME.infoBg, color: THEME.info, border: '#bfdbfe', label: 'Active' },
  };
  const config = configs[status] || configs.draft;
  return (
    <span style={{
      padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
      background: config.bg, color: config.color, border: `1px solid ${config.border}`,
      display: 'inline-flex', alignItems: 'center', gap: '6px',
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: config.color }} />
      {config.label}
    </span>
  );
};

const ProgressBar = ({ current, total }) => {
  const pct = total ? Math.round((current / total) * 100) : 0;
  const color = pct >= 80 ? THEME.success : pct >= 50 ? THEME.warning : THEME.primary;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ flex: 1, height: '8px', background: THEME.borderLight, borderRadius: '100px', overflow: 'hidden', border: `1px solid ${THEME.border}` }}>
        <div style={{
          width: `${pct}%`, height: '100%', background: color,
          borderRadius: '100px', transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />
      </div>
      <span style={{ fontSize: '12px', fontWeight: '700', color: THEME.textSecondary, minWidth: '36px', textAlign: 'right' }}>
        {pct}%
      </span>
    </div>
  );
};

export default function ResponsableDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);

  const [kpis, setKpis] = useState({});
  const [campagnes, setCampagnes] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [clients, setClients] = useState([]);
  const [inscriptions, setInscriptions] = useState([]);
  const [canauxStats, setCanauxStats] = useState([]);
  const [evolution, setEvolution] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [notifForm, setNotifForm] = useState({
    title: '', message: '', type: 'promotion', canal: 'email', campagneId: ''
  });
  const [sendingNotif, setSendingNotif] = useState(false);

  // Auth check
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) { navigate('/login'); return; }
    const u = JSON.parse(storedUser);
    if (u.role !== 'ADMIN' && u.role !== 'RESPONSABLE_MARKETING') {
      navigate('/'); return;
    }
    setUser(u);
  }, [navigate]);

  // Fetch all data
  useEffect(() => {
    if (!user) return;
    fetchAllData();
  }, [user]);

const fetchAllData = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Récupérer toutes les données en parallèle
    const [campagnesRes, inscRes, clientsRes, notifsRes] = await Promise.all([
      api.get('/api/campagnes').catch(() => null),
      api.get('/api/inscriptions').catch(() => null),
      api.get('/api/clients').catch(() => null),
      api.get('/api/notifications?limit=50').catch(() => null)
    ]);

    // Traiter les campagnes
    const campagnesData = Array.isArray(campagnesRes?.data) ? campagnesRes.data : [];
    setCampagnes(campagnesData);

    // Traiter les inscriptions
    const inscriptionsData = Array.isArray(inscRes?.data) ? inscRes.data : [];
    setInscriptions(inscriptionsData);

    // Traiter les clients
    const clientsData = Array.isArray(clientsRes?.data) ? clientsRes.data : [];
    setClients(clientsData);

    // Traiter les notifications
    const notifsData = Array.isArray(notifsRes?.data) ? notifsRes.data : [];
    setNotifications(notifsData);

    // === CALCULER LES KPIs DYNAMIQUEMENT ===
    const totalInscriptions = inscriptionsData.length;
    const totalRevenus = inscriptionsData.reduce((sum, i) => sum + (i.prixTotal || 0), 0);
    const totalClients = clientsData.length;
    const campagnesActives = campagnesData.length;
    const campagnesPubliees = campagnesData.filter(c => c.published).length;
    
    const placesTotal = campagnesData.reduce((sum, c) => sum + (c.placesTotal || 0), 0);
    const tauxRemplissage = placesTotal ? Math.round((totalInscriptions / placesTotal) * 100) : 0;
    const tauxConversion = totalClients ? Math.round((totalInscriptions / totalClients) * 100) : 0;

    setKpis({
      campagnesActives: campagnesActives,
      campagnesPubliees: campagnesPubliees,
      inscriptionsTotal: totalInscriptions,
      tauxRemplissage: tauxRemplissage,
      notificationsSent: notifsData.length,
      totalClients: totalClients,
      revenus: totalRevenus,
      tauxConversion: tauxConversion
    });

    // === DONNÉES POUR LES GRAPHIQUES ===
    const inscriptionsParCampagne = campagnesData.map(c => ({
      name: c.title,
      inscriptions: c.inscriptionsCount || c.inscriptions?.length || 0,
      revenus: c.revenusTotal || 0
    }));
    setChartData(inscriptionsParCampagne);

    // Activités récentes (dynamiques)
    const activites = [
      ...inscriptionsData.slice(0, 5).map(i => ({
        type: 'inscription',
        title: `${i.name || 'Un utilisateur'} s'est inscrit à ${i.campagne?.title || 'une formation'}`,
        time: i.createdAt ? new Date(i.createdAt).toLocaleDateString('fr-FR') : 'Récemment',
        icon: '👤',
        color: THEME.success
      })),
      ...campagnesData.slice(0, 3).map(c => ({
        type: 'campagne',
        title: `Campagne "${c.title}" ${c.published ? 'publiée' : 'créée'}`,
        time: 'Récemment',
        icon: '🚀',
        color: THEME.primary
      })),
      ...(notifsData?.slice(0, 2).map(n => ({
        type: 'notification',
        title: `Notification envoyée`,
        time: 'Récemment',
        icon: '🔔',
        color: THEME.info
      })) || [])
    ];
    setRecentActivities(activites);

    // Canaux stats
    const canauxCount = {};
    notifsData.forEach(n => {
      const type = n.type || 'Email';
      canauxCount[type] = (canauxCount[type] || 0) + 1;
    });
    setCanauxStats(Object.keys(canauxCount).map(name => ({
      name, value: canauxCount[name],
      color: THEME.chartColors[Object.keys(canauxCount).indexOf(name) % THEME.chartColors.length]
    })));

    // Évolution (données réelles si possible)
    const evoData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
      
      // Compter les inscriptions de ce jour
      const dayInscriptions = inscriptionsData.filter(i => {
        const iDate = new Date(i.createdAt);
        return iDate.toDateString() === date.toDateString();
      }).length;
      
      evoData.push({
        date: dateStr,
        inscriptions: dayInscriptions,
        campagnes: campagnesData.filter(c => {
          const cDate = new Date(c.createdAt);
          return cDate.toDateString() === date.toDateString();
        }).length,
        notifications: notifsData.filter(n => {
          const nDate = new Date(n.createdAt);
          return nDate.toDateString() === date.toDateString();
        }).length,
        revenus: inscriptionsData.filter(i => {
          const iDate = new Date(i.createdAt);
          return iDate.toDateString() === date.toDateString();
        }).reduce((sum, i) => sum + (i.prixTotal || 0), 0),
      });
    }
    setEvolution(evoData);

  } catch (err) {
    console.error('Erreur chargement dashboard:', err);
  } finally {
    setLoading(false);
  }
};
  const envoyerNotification = async () => {
    if (!notifForm.title || !notifForm.message) {
      alert('Veuillez remplir le titre et le message');
      return;
    }
    setSendingNotif(true);
    try {
      await api.post('/api/notifications', notifForm);
      alert('✅ Notification envoyée avec succès !');
      setNotifForm({ title: '', message: '', type: 'promotion', canal: 'email', campagneId: '' });
      fetchAllData();
    } catch (err) {
      alert('❌ Erreur: ' + (err.response?.data?.error || err.message));
    } finally {
      setSendingNotif(false);
    }
  };

  const togglePublish = async (id, current) => {
    try {
      await api.put(`/api/campagnes/${id}/publish`, { published: !current });
      fetchAllData();
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
  };

  const canauxConfig = [
    { id: 'email', label: 'Email', icon: '✉️', color: THEME.danger },
    { id: 'sms', label: 'SMS', icon: '💬', color: THEME.success },
    { id: 'push', label: 'Push', icon: '🔔', color: THEME.info },
    { id: 'whatsapp', label: 'WhatsApp', icon: '📱', color: '#25d366' },
    { id: 'social', label: 'Social', icon: '🌐', color: THEME.warning },
  ];

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
    { id: 'campagnes', label: 'Campagnes', icon: '🚀' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'clients', label: 'Clients', icon: '👥' },
    { id: 'envoyer', label: 'Envoyer Notif', icon: '📢' },
  ];

  if (!user) return null;

  const safeCampagnes = Array.isArray(campagnes) ? campagnes : [];
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const safeClients = Array.isArray(clients) ? clients : [];
  const safeInscriptions = Array.isArray(inscriptions) ? inscriptions : [];
  const safeCanaux = Array.isArray(canauxStats) ? canauxStats : [];
  const safeEvolution = Array.isArray(evolution) ? evolution : [];
  const safeActivities = Array.isArray(recentActivities) ? recentActivities : [];

  return (
    <Layout>
      <div style={{
        background: THEME.bg,
        minHeight: '100vh',
        color: THEME.text,
        fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
      }}>
        <style>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .animate-fade { animation: fadeIn 0.5s ease-out; }
          .animate-slide { animation: slideIn 0.4s ease-out; }
          ::-webkit-scrollbar { width: 8px; height: 8px; }
          ::-webkit-scrollbar-track { background: ${THEME.bg}; }
          ::-webkit-scrollbar-thumb { background: ${THEME.border}; border-radius: 4px; }
          ::-webkit-scrollbar-thumb:hover { background: ${THEME.textLight}; }
          * { scrollbar-width: thin; scrollbar-color: ${THEME.border} ${THEME.bg}; }
        `}</style>

        {/* TABS NAVIGATION */}
        <div style={{
          background: THEME.bgCard,
          borderBottom: `1px solid ${THEME.border}`,
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          <div style={{ maxWidth: '1600px', margin: '0 auto', display: 'flex', gap: '4px' }}>
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '16px 24px', border: 'none', background: 'none',
                    cursor: 'pointer', fontSize: '14px', fontWeight: isActive ? '700' : '600',
                    whiteSpace: 'nowrap', color: isActive ? THEME.primary : THEME.textMuted,
                    borderBottom: isActive ? `3px solid ${THEME.primary}` : '3px solid transparent',
                    transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = THEME.textSecondary; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = THEME.textMuted; }}
                >
                  <span style={{ fontSize: '16px' }}>{tab.icon}</span>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <main style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto' }}>

          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="animate-fade">
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '24px',
                marginBottom: '32px',
              }}>
                <KPICard
                  title="Campagnes Totales"
                  value={kpis.campagnesActives || 0}
                  change={12}
                  changeType="up"
                  icon="🚀"
                  color={THEME.primary}
                  subtitle={`${kpis.campagnesPubliees || 0} publiées • ${(kpis.campagnesActives || 0) - (kpis.campagnesPubliees || 0)} brouillons`}
                  loading={loading}
                  onClick={() => setActiveTab('campagnes')}
                />
                <KPICard
                  title="Inscriptions"
                  value={kpis.inscriptionsTotal || 0}
                  change={8}
                  changeType="up"
                  icon="👥"
                  color={THEME.info}
                  subtitle={`${kpis.tauxRemplissage || 0}% taux de remplissage`}
                  loading={loading}
                />
                <KPICard
                  title="Revenus (TND)"
                  value={`${(kpis.revenus || 0).toLocaleString()} TND`}
                  change={15}
                  changeType="up"
                  icon="💰"
                  color={THEME.success}
                  subtitle="Revenus estimés ce mois"
                  loading={loading}
                />
                <KPICard
                  title="Notifications"
                  value={kpis.notificationsSent || 0}
                  change={5}
                  changeType="up"
                  icon="🔔"
                  color={THEME.danger}
                  subtitle="Notifications envoyées"
                  loading={loading}
                  onClick={() => setActiveTab('notifications')}
                />
                <KPICard
                  title="Clients"
                  value={kpis.totalClients || 0}
                  change={3}
                  changeType="up"
                  icon="🆕"
                  color="#8b5cf6"
                  subtitle={`${kpis.tauxConversion || 0}% taux de conversion`}
                  loading={loading}
                  onClick={() => setActiveTab('clients')}
                />
              </div>

              {/* Recent Campagnes */}
              <div style={{
                background: THEME.bgCard, border: `1px solid ${THEME.border}`,
                borderRadius: '20px', padding: '28px', boxShadow: THEME.shadow,
                marginBottom: '32px',
              }}>
                <SectionHeader
                  title="Campagnes récentes"
                  subtitle="Dernières campagnes créées"
                  action={
                    <button
                      onClick={() => setActiveTab('campagnes')}
                      style={{
                        fontSize: '13px', color: THEME.primary, background: 'none',
                        border: 'none', cursor: 'pointer', fontWeight: '700',
                        display: 'flex', alignItems: 'center', gap: '4px',
                      }}
                    >
                      Voir tout →
                    </button>
                  }
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {safeCampagnes.slice(0, 5).map((camp, i) => (
                    <div
                      key={camp.id || i}
                      onClick={() => navigate(`/campagnes/${camp.slug}`)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '14px',
                        padding: '16px', background: THEME.bg,
                        borderRadius: '14px', cursor: 'pointer',
                        border: `1px solid ${THEME.borderLight}`,
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.background = THEME.primaryBg; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = THEME.borderLight; e.currentTarget.style.background = THEME.bg; }}
                    >
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '12px',
                        background: camp.published ? THEME.successBg : THEME.bgHover,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '22px', border: `2px solid ${camp.published ? '#a7f3d0' : THEME.border}`,
                        flexShrink: 0,
                      }}>
                        {camp.published ? '✅' : '📝'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: THEME.text, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {camp.title}
                        </div>
                        <div style={{ fontSize: '12px', color: THEME.textMuted, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '6px', background: THEME.bgHover, fontSize: '11px' }}>{camp.type}</span>
                        <span>•</span>
                        <span>{camp.inscriptionsCount || camp.inscriptions?.length || 0} inscrits</span>
                        <span>•</span>
                        <span>{camp.placesTotal || 0} places</span>
                        </div>
                      </div>
                      <StatusBadge status={camp.published ? 'published' : 'draft'} />
                    </div>
                  ))}
                  {safeCampagnes.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '48px', color: THEME.textMuted }}>
                      <div style={{ fontSize: '48px', marginBottom: '12px' }}>📝</div>
                      <div style={{ fontSize: '15px', fontWeight: '700' }}>Aucune campagne</div>
                      <div style={{ fontSize: '13px', marginTop: '4px' }}>Créez votre première campagne</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activities */}
              <div style={{
                background: THEME.bgCard, border: `1px solid ${THEME.border}`,
                borderRadius: '20px', padding: '28px', boxShadow: THEME.shadow,
              }}>
                <SectionHeader title="Activités récentes" subtitle="Dernières actions sur la plateforme" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {safeActivities.map((act, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex', gap: '16px', padding: '18px 0',
                        borderBottom: i < safeActivities.length - 1 ? `1px solid ${THEME.borderLight}` : 'none',
                        alignItems: 'flex-start',
                      }}
                    >
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '12px',
                        background: `${act.color}15`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '20px', border: `2px solid ${act.color}25`,
                        flexShrink: 0,
                      }}>
                        {act.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: THEME.text, marginBottom: '4px' }}>
                          {act.title}
                        </div>
                        <div style={{ fontSize: '12px', color: THEME.textMuted, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: act.color }}>●</span>
                          {act.time}
                        </div>
                      </div>
                    </div>
                  ))}
                  {safeActivities.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '48px', color: THEME.textMuted }}>
                      <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
                      <div style={{ fontSize: '15px', fontWeight: '700' }}>Aucune activité</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: CAMPAGNES */}
          {activeTab === 'campagnes' && (
            <div className="animate-fade">
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '24px', flexWrap: 'wrap', gap: '16px',
              }}>
                <SectionHeader
                  title="Gestion des Campagnes"
                  subtitle={`${safeCampagnes.length} campagnes au total`}
                />
                <button
                  onClick={() => navigate('/gestion-campagnes')}
                  style={{
                    background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.primaryDark})`,
                    border: 'none', color: '#fff', fontWeight: '700',
                    padding: '12px 24px', borderRadius: '12px', fontSize: '14px',
                    cursor: 'pointer', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                    transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.4)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)'; }}
                >
                  ➕ Nouvelle Campagne
                </button>
              </div>

              <div style={{
                background: THEME.bgCard, border: `1px solid ${THEME.border}`,
                borderRadius: '20px', padding: '24px', boxShadow: THEME.shadow,
                overflow: 'hidden',
              }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', fontSize: '14px' }}>
                    <thead>
                      <tr>
                        {['Campagne', 'Type', 'Inscrits', 'Places', 'Remplissage', 'Statut', 'Actions'].map((h, i) => (
                          <th key={h} style={{
                            textAlign: i === 0 ? 'left' : 'center',
                            padding: '16px 12px', color: THEME.textMuted, fontWeight: '700',
                            fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px',
                            borderBottom: `2px solid ${THEME.border}`, background: THEME.bgHover,
                            whiteSpace: 'nowrap',
                          }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {safeCampagnes.map((camp) => (
                        <tr
                          key={camp.id}
                          style={{ transition: 'background 0.2s' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = THEME.bgHover}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '16px 12px', borderBottom: `1px solid ${THEME.borderLight}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                width: '40px', height: '40px', borderRadius: '10px',
                                background: camp.image ? `url(${camp.image}) center/cover` : THEME.primaryBg,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '18px', border: `2px solid ${THEME.border}`, flexShrink: 0,
                              }}>
                                {!camp.image && '📷'}
                              </div>
                              <div>
                                <div style={{ fontWeight: '700', color: THEME.text, fontSize: '14px', marginBottom: '2px' }}>{camp.title}</div>
                                <div style={{ fontSize: '12px', color: THEME.textMuted, fontWeight: '600' }}>{camp.slug}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ textAlign: 'center', padding: '16px 12px', borderBottom: `1px solid ${THEME.borderLight}` }}>
                            <span style={{
                              padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                              background: THEME.bgHover, color: THEME.textSecondary, border: `1px solid ${THEME.border}`,
                            }}>
                              {camp.type}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center', padding: '16px 12px', borderBottom: `1px solid ${THEME.borderLight}`, color: THEME.text, fontWeight: '700', fontSize: '15px' }}>
                            {camp.inscriptionsCount || camp.inscriptions?.length || 0}
                          </td>
                          <td style={{ textAlign: 'center', padding: '16px 12px', borderBottom: `1px solid ${THEME.borderLight}`, color: THEME.text, fontWeight: '700', fontSize: '15px' }}>
                            {camp.placesTotal || 0}
                          </td>
                          <td style={{ padding: '16px 12px', borderBottom: `1px solid ${THEME.borderLight}`, minWidth: '140px' }}>
                            <ProgressBar current={camp.inscriptionsCount || 0} total={camp.placesTotal || 0} />
                          </td>
                          <td style={{ textAlign: 'center', padding: '16px 12px', borderBottom: `1px solid ${THEME.borderLight}` }}>
                            <StatusBadge status={camp.published ? 'published' : 'draft'} />
                          </td>
                          <td style={{ textAlign: 'center', padding: '16px 12px', borderBottom: `1px solid ${THEME.borderLight}` }}>
                            <button
                              onClick={() => togglePublish(camp.id, camp.published)}
                              style={{
                                background: camp.published ? THEME.dangerBg : THEME.successBg,
                                border: `1px solid ${camp.published ? '#fecaca' : '#a7f3d0'}`,
                                color: camp.published ? THEME.danger : THEME.success,
                                padding: '8px 16px', borderRadius: '10px',
                                fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                                transition: 'all 0.2s', whiteSpace: 'nowrap',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                            >
                              {camp.published ? 'Dépublier' : 'Publier'}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {safeCampagnes.length === 0 && !loading && (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '60px', color: THEME.textMuted }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                            <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>Aucune campagne</div>
                            <button
                              onClick={() => navigate('/gestion-campagnes')}
                              style={{ color: THEME.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}
                            >
                              Créer une campagne →
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="animate-fade">
              <SectionHeader
                title="Historique des Notifications"
                subtitle={`${safeNotifications.length} notifications envoyées`}
              />
              <div style={{
                background: THEME.bgCard, border: `1px solid ${THEME.border}`,
                borderRadius: '20px', padding: '24px', boxShadow: THEME.shadow,
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {safeNotifications.map((notif, i) => (
                    <div
                      key={notif.id || i}
                      style={{
                        display: 'flex', gap: '18px', padding: '20px',
                        borderRadius: '16px', background: THEME.bg,
                        border: `1px solid ${THEME.borderLight}`,
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = THEME.border; e.currentTarget.style.boxShadow = THEME.shadowMd; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = THEME.borderLight; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <div style={{
                        width: '52px', height: '52px', borderRadius: '14px',
                        background: (notif.type === 'EMAIL' ? THEME.dangerBg : notif.type === 'SMS' ? THEME.successBg : notif.type === 'PUSH' ? THEME.infoBg : THEME.warningBg),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '24px', border: `2px solid ${(notif.type === 'EMAIL' ? '#fecaca' : notif.type === 'SMS' ? '#a7f3d0' : notif.type === 'PUSH' ? '#bfdbfe' : '#fde68a')}`,
                        flexShrink: 0,
                      }}>
                        {notif.type === 'EMAIL' ? '✉️' : notif.type === 'SMS' ? '💬' : notif.type === 'PUSH' ? '🔔' : notif.type === 'WHATSAPP' ? '📱' : '🌐'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                          <span style={{ fontSize: '15px', fontWeight: '700', color: THEME.text }}>
                            {notif.title || notif.message?.substring(0, 50) + '...'}
                          </span>
                          <StatusBadge status={notif.status === 'SENT' ? 'published' : 'draft'} />
                        </div>
                        <div style={{ fontSize: '13px', color: THEME.textSecondary, marginBottom: '10px', lineHeight: '1.5' }}>
                          {notif.message}
                        </div>
                        <div style={{ fontSize: '12px', color: THEME.textMuted, fontWeight: '600', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ color: THEME.primary }}>📡</span> Canal: {notif.type}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ color: THEME.info }}>📅</span> {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                          </span>
                          {notif.campagneId && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ color: THEME.success }}>🚀</span> Campagne #{notif.campagneId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {safeNotifications.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '80px', color: THEME.textMuted }}>
                      <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
                      <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Aucune notification envoyée</div>
                      <div style={{ fontSize: '14px' }}>Envoyez votre première notification depuis l'onglet "Envoyer Notif"</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: CLIENTS */}
          {activeTab === 'clients' && (
            <div className="animate-fade">
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '24px', flexWrap: 'wrap', gap: '16px',
              }}>
                <SectionHeader
                  title="Liste des Clients"
                  subtitle={`${safeClients.length} clients inscrits`}
                />
                <button
                  onClick={() => navigate('/clients')}
                  style={{
                    background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.primaryDark})`,
                    border: 'none', color: '#fff', fontWeight: '700',
                    padding: '12px 24px', borderRadius: '12px', fontSize: '14px',
                    cursor: 'pointer', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                    transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px',
                  }}
                >
                  👥 Gérer les Clients
                </button>
              </div>

              <div style={{
                background: THEME.bgCard, border: `1px solid ${THEME.border}`,
                borderRadius: '20px', padding: '24px', boxShadow: THEME.shadow,
                overflow: 'hidden',
              }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', fontSize: '14px' }}>
                    <thead>
                      <tr>
                        {['Client', 'Email', 'Type', 'Inscriptions', 'Date d\'inscription', 'Statut'].map((h, i) => (
                          <th key={h} style={{
                            textAlign: i < 2 ? 'left' : 'center',
                            padding: '16px 12px', color: THEME.textMuted, fontWeight: '700',
                            fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px',
                            borderBottom: `2px solid ${THEME.border}`, background: THEME.bgHover,
                            whiteSpace: 'nowrap',
                          }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {safeClients.map((client, i) => (
                        <tr
                          key={client.id || i}
                          style={{ transition: 'background 0.2s' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = THEME.bgHover}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '16px 12px', borderBottom: `1px solid ${THEME.borderLight}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                width: '42px', height: '42px', borderRadius: '50%',
                                background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.primaryDark})`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '16px', fontWeight: '700', color: '#fff', flexShrink: 0,
                              }}>
                                {(client.nom || client.name || 'C').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: '700', color: THEME.text, fontSize: '14px' }}>
                                  {client.nom || client.name || 'Client ' + (i + 1)}
                                </div>
                                {client.entreprise && (
                                  <div style={{ fontSize: '12px', color: THEME.textMuted, fontWeight: '600' }}>
                                    {client.entreprise}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '16px 12px', borderBottom: `1px solid ${THEME.borderLight}`, color: THEME.textSecondary, fontWeight: '600' }}>
                            {client.email}
                          </td>
                          <td style={{ textAlign: 'center', padding: '16px 12px', borderBottom: `1px solid ${THEME.borderLight}` }}>
                            <span style={{
                              padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                              background: THEME.bgHover, color: THEME.textSecondary, border: `1px solid ${THEME.border}`,
                            }}>
                              {client.type || 'Particulier'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center', padding: '16px 12px', borderBottom: `1px solid ${THEME.borderLight}`, color: THEME.primary, fontWeight: '800', fontSize: '16px' }}>
                            {client.inscriptions?.length || 0}
                          </td>
                          <td style={{ textAlign: 'center', padding: '16px 12px', borderBottom: `1px solid ${THEME.borderLight}`, color: THEME.textMuted, fontWeight: '600', fontSize: '13px' }}>
                            {client.createdAt ? new Date(client.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                          </td>
                          <td style={{ textAlign: 'center', padding: '16px 12px', borderBottom: `1px solid ${THEME.borderLight}` }}>
                            <StatusBadge status="active" />
                          </td>
                        </tr>
                      ))}
                      {safeClients.length === 0 && !loading && (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: THEME.textMuted }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
                            <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>Aucun client</div>
                            <div style={{ fontSize: '14px' }}>Les clients apparaîtront ici après inscription</div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ENVOYER NOTIFICATION */}
          {activeTab === 'envoyer' && (
            <div className="animate-fade">
              <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <SectionHeader
                  title="Envoyer une Notification"
                  subtitle="Notifier vos clients sur tous les canaux disponibles"
                />

                <div style={{
                  background: THEME.bgCard, border: `1px solid ${THEME.border}`,
                  borderRadius: '20px', padding: '40px', boxShadow: THEME.shadow,
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

                    {/* Titre */}
                    <div>
                      <label style={{
                        display: 'block', fontSize: '14px', fontWeight: '700',
                        color: THEME.text, marginBottom: '10px',
                      }}>
                        Titre de la notification <span style={{ color: THEME.danger }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Nouvelle formation disponible !"
                        value={notifForm.title}
                        onChange={(e) => setNotifForm({...notifForm, title: e.target.value})}
                        style={{
                          width: '100%', padding: '14px 18px', borderRadius: '12px',
                          border: `2px solid ${notifForm.title ? THEME.border : '#fecaca'}`,
                          background: THEME.bg, color: THEME.text, fontSize: '15px',
                          outline: 'none', transition: 'all 0.2s', fontWeight: '500',
                        }}
                        onFocus={(e) => { e.target.style.borderColor = THEME.primary; e.target.style.boxShadow = `0 0 0 4px ${THEME.primary}15`; }}
                        onBlur={(e) => { e.target.style.borderColor = notifForm.title ? THEME.border : '#fecaca'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label style={{
                        display: 'block', fontSize: '14px', fontWeight: '700',
                        color: THEME.text, marginBottom: '10px',
                      }}>
                        Message <span style={{ color: THEME.danger }}>*</span>
                      </label>
                      <textarea
                        placeholder="Contenu de la notification..."
                        rows={6}
                        value={notifForm.message}
                        onChange={(e) => setNotifForm({...notifForm, message: e.target.value})}
                        style={{
                          width: '100%', padding: '14px 18px', borderRadius: '12px',
                          border: `2px solid ${notifForm.message ? THEME.border : '#fecaca'}`,
                          background: THEME.bg, color: THEME.text, fontSize: '15px',
                          outline: 'none', resize: 'vertical', transition: 'all 0.2s', fontWeight: '500',
                        }}
                        onFocus={(e) => { e.target.style.borderColor = THEME.primary; e.target.style.boxShadow = `0 0 0 4px ${THEME.primary}15`; }}
                        onBlur={(e) => { e.target.style.borderColor = notifForm.message ? THEME.border : '#fecaca'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>

                    {/* Type */}
                    <div>
                      <label style={{
                        display: 'block', fontSize: '14px', fontWeight: '700',
                        color: THEME.text, marginBottom: '12px',
                      }}>
                        Type de notification
                      </label>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {['promotion', 'nouvelle_campagne', 'rappel', 'alerte'].map(type => (
                          <button
                            key={type}
                            onClick={() => setNotifForm({...notifForm, type})}
                            style={{
                              padding: '12px 24px', borderRadius: '12px',
                              border: `2px solid ${notifForm.type === type ? THEME.primary : THEME.border}`,
                              background: notifForm.type === type ? THEME.primaryBg : THEME.bg,
                              color: notifForm.type === type ? THEME.primary : THEME.textMuted,
                              fontWeight: 700, cursor: 'pointer', fontSize: '14px',
                              textTransform: 'capitalize', transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => { if (notifForm.type !== type) e.currentTarget.style.borderColor = THEME.textLight; }}
                            onMouseLeave={(e) => { if (notifForm.type !== type) e.currentTarget.style.borderColor = THEME.border; }}
                          >
                            {type.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Canal */}
                    <div>
                      <label style={{
                        display: 'block', fontSize: '14px', fontWeight: '700',
                        color: THEME.text, marginBottom: '12px',
                      }}>
                        Canal de diffusion
                      </label>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {canauxConfig.map(canal => (
                          <button
                            key={canal.id}
                            onClick={() => setNotifForm({...notifForm, canal: canal.id})}
                            style={{
                              padding: '14px 24px', borderRadius: '14px',
                              border: `2px solid ${notifForm.canal === canal.id ? canal.color : THEME.border}`,
                              background: notifForm.canal === canal.id ? `${canal.color}10` : THEME.bg,
                              color: notifForm.canal === canal.id ? canal.color : THEME.textMuted,
                              fontWeight: 700, cursor: 'pointer', fontSize: '14px',
                              display: 'flex', alignItems: 'center', gap: '10px',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => { if (notifForm.canal !== canal.id) e.currentTarget.style.borderColor = THEME.textLight; }}
                            onMouseLeave={(e) => { if (notifForm.canal !== canal.id) e.currentTarget.style.borderColor = THEME.border; }}
                          >
                            <span style={{ fontSize: '20px' }}>{canal.icon}</span> {canal.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Campagne liée */}
                    <div>
                      <label style={{
                        display: 'block', fontSize: '14px', fontWeight: '700',
                        color: THEME.text, marginBottom: '10px',
                      }}>
                        Campagne liée (optionnel)
                      </label>
                      <select
                        value={notifForm.campagneId}
                        onChange={(e) => setNotifForm({...notifForm, campagneId: e.target.value})}
                        style={{
                          width: '100%', padding: '14px 18px', borderRadius: '12px',
                          border: `2px solid ${THEME.border}`, background: THEME.bg,
                          color: THEME.text, fontSize: '15px', outline: 'none',
                          cursor: 'pointer', fontWeight: '500',
                          transition: 'all 0.2s',
                        }}
                        onFocus={(e) => { e.target.style.borderColor = THEME.primary; e.target.style.boxShadow = `0 0 0 4px ${THEME.primary}15`; }}
                        onBlur={(e) => { e.target.style.borderColor = THEME.border; e.target.style.boxShadow = 'none'; }}
                      >
                        <option value="">Aucune campagne</option>
                        {safeCampagnes.map(c => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </div>

                    {/* Bouton Envoyer */}
                    <button
                      onClick={envoyerNotification}
                      disabled={sendingNotif}
                      style={{
                        width: '100%', padding: '18px', borderRadius: '14px',
                        background: sendingNotif ? THEME.border : `linear-gradient(135deg, ${THEME.primary}, ${THEME.primaryDark})`,
                        color: '#fff', fontWeight: '800', fontSize: '17px',
                        border: 'none', cursor: sendingNotif ? 'not-allowed' : 'pointer',
                        opacity: sendingNotif ? 0.7 : 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                        transition: 'all 0.2s',
                        boxShadow: sendingNotif ? 'none' : '0 4px 16px rgba(245, 158, 11, 0.3)',
                      }}
                      onMouseEnter={(e) => { if (!sendingNotif) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(245, 158, 11, 0.4)'; }}}
                      onMouseLeave={(e) => { if (!sendingNotif) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(245, 158, 11, 0.3)'; }}}
                    >
                      {sendingNotif ? (
                        <>
                          <span style={{ display: 'inline-block', width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          📢 Envoyer la Notification
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </Layout>
  );
}