import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import api from '../api';

const gold = '#f5a623';
const dark = '#0A0A0A';
const white = '#FFFFFF';
const gray = '#F5F5F5';
const textGray = '#666666';
const lightBorder = '#E5E5E5';

const ROLE_COLORS = {
  'ADMIN': { bg: '#FEE2E2', color: '#DC2626', label: 'Administrateur' },
  'RESPONSABLE_MARKETING': { bg: '#FEF3C7', color: '#D97706', label: 'Resp. Marketing' },
  'CLIENT': { bg: '#DBEAFE', color: '#2563EB', label: 'Client' }
};

const STATUS_CONFIG = {
  'active': { color: '#10B981', bg: '#ECFDF5', label: 'Actif' },
  'inactive': { color: '#6B7280', bg: '#F3F4F6', label: 'Inactif' },
  'en_attente': { color: '#F59E0B', bg: '#FEF3C7', label: 'En attente' },
  'PENDING': { color: '#F59E0B', bg: '#FEF3C7', label: 'En attente' },
  'acceptee': { color: '#10B981', bg: '#ECFDF5', label: 'Acceptée' },
  'ACCEPTED': { color: '#10B981', bg: '#ECFDF5', label: 'Acceptée' },
  'refusee': { color: '#EF4444', bg: '#FEE2E2', label: 'Refusée' },
  'REJECTED': { color: '#EF4444', bg: '#FEE2E2', label: 'Refusée' }
};

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ 
    totalUsers: 0, totalClients: 0, totalCampagnes: 0, totalInscriptions: 0, 
    activeUsers: 0, inactiveUsers: 0, publishedCampagnes: 0, pendingInscriptions: 0 
  });
  const [users, setUsers] = useState([]);
  const [campagnes, setCampagnes] = useState([]);
  const [inscriptions, setInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7j');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchDashboardData(); }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true); setError(null);

      // Récupérer les données avec gestion d'erreur individuelle
      let usersData = [], campagnesData = [], inscriptionsData = [];
      let fetchErrors = [];

      try {
        const usersRes = await api.get('/api/auth/users');
        usersData = usersRes.data || [];
      } catch (err) {
        console.warn('Erreur chargement utilisateurs:', err.message);
        fetchErrors.push('utilisateurs');
      }

      try {
        const campagnesRes = await api.get('/api/campagnes');
        campagnesData = campagnesRes.data || [];
      } catch (err) {
        console.warn('Erreur chargement campagnes:', err.message);
        fetchErrors.push('campagnes');
      }

      try {
        const inscriptionsRes = await api.get('/api/inscriptions');
        inscriptionsData = inscriptionsRes.data || [];
      } catch (err) {
        console.warn('Erreur chargement inscriptions (route non disponible):', err.message);
        fetchErrors.push('inscriptions');
        // Inscriptions non disponible — on continue avec tableau vide
      }

      const activeUsers = usersData.filter(u => u.status === 'active').length;
      const inactiveUsers = usersData.filter(u => u.status === 'inactive').length;
      const publishedCampagnes = campagnesData.filter(c => c.published).length;
      const pendingInscriptions = inscriptionsData.filter(i => i.status === 'en_attente' || i.status === 'PENDING').length;

      setStats({ 
        totalUsers: usersData.length, 
        totalClients: usersData.filter(u => u.role === 'CLIENT').length, 
        totalCampagnes: campagnesData.length, 
        totalInscriptions: inscriptionsData.length, 
        activeUsers, 
        inactiveUsers, 
        publishedCampagnes, 
        pendingInscriptions 
      });

      setUsers(usersData); 
      setCampagnes(campagnesData); 
      setInscriptions(inscriptionsData);

      // Afficher un message si certaines données sont manquantes
      if (fetchErrors.length > 0 && fetchErrors.length < 3) {
        setError(`Certaines données sont temporairement indisponibles (${fetchErrors.join(', ')}). Affichage partiel.`);
      } else if (fetchErrors.length === 3) {
        setError('Erreur lors du chargement des données. Veuillez réessayer.');
      }

    } catch (err) { 
      setError('Erreur lors du chargement des données'); 
    } finally { 
      setLoading(false); 
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const roleDistribution = [
    { label: 'Clients', value: users.filter(u => u.role === 'CLIENT').length, color: '#2563EB', icon: '🏢' }, 
    { label: 'Resp. Marketing', value: users.filter(u => u.role === 'RESPONSABLE_MARKETING').length, color: '#D97706', icon: '📊' }, 
    { label: 'Admins', value: users.filter(u => u.role === 'ADMIN').length, color: '#DC2626', icon: '🔐' }
  ].filter(i => i.value > 0);

  const campagneStatus = [
    { label: 'Publiées', value: stats.publishedCampagnes, color: '#10B981', icon: '✅' }, 
    { label: 'Brouillons', value: stats.totalCampagnes - stats.publishedCampagnes, color: '#6B7280', icon: '📝' }
  ].filter(i => i.value > 0);

  const inscriptionStatus = [
    { label: 'En attente', value: inscriptions.filter(i => i.status === 'en_attente' || i.status === 'PENDING').length, color: '#F59E0B', icon: '⏳' }, 
    { label: 'Acceptées', value: inscriptions.filter(i => i.status === 'acceptee' || i.status === 'ACCEPTED').length, color: '#10B981', icon: '✅' }, 
    { label: 'Refusées', value: inscriptions.filter(i => i.status === 'refusee' || i.status === 'REJECTED').length, color: '#EF4444', icon: '❌' }
  ].filter(i => i.value > 0);

  // ─── Stat Card améliorée ───
  const StatCard = ({ title, value, subtitle, icon, color, trend, onClick }) => (
    <div 
      onClick={onClick}
      style={{ 
        background: white, 
        borderRadius: 16, 
        padding: '24px', 
        border: `1px solid ${lightBorder}`, 
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)', 
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden'
      }} 
      onMouseEnter={e => { 
        e.currentTarget.style.transform = 'translateY(-4px)'; 
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)'; 
      }} 
      onMouseLeave={e => { 
        e.currentTarget.style.transform = 'translateY(0)'; 
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; 
      }}
    >
      {/* Ligne décorative colorée en haut */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        height: 3, 
        background: color, 
        borderRadius: '16px 16px 0 0' 
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, marginTop: 4 }}>
        <div style={{ 
          width: 48, 
          height: 48, 
          borderRadius: 12, 
          background: color + '15', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: '1.5rem' 
        }}>
          {icon}
        </div>
        {trend !== undefined && (
          <span style={{ 
            padding: '6px 10px', 
            borderRadius: 20, 
            background: trend > 0 ? '#ECFDF5' : '#FEE2E2', 
            color: trend > 0 ? '#047857' : '#DC2626', 
            fontSize: '0.8rem', 
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            {trend > 0 ? '↗' : '↘'} {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>

      <div style={{ fontSize: '2rem', fontWeight: 800, color: dark, marginBottom: 4, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: '0.9rem', color: textGray, fontWeight: 600, marginBottom: 2 }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: '0.8rem', color: '#9CA3AF', marginTop: 4, fontWeight: 500 }}>
          {subtitle}
        </div>
      )}
    </div>
  );

  // ─── Mini Bar Chart amélioré ───
  const MiniBarChart = ({ data, title }) => {
    const max = Math.max(...data.map(d => d.value), 1);
    const total = data.reduce((sum, d) => sum + d.value, 0);

    return (
      <div style={{ 
        background: white, 
        borderRadius: 16, 
        padding: '24px', 
        border: `1px solid ${lightBorder}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: dark, margin: 0 }}>{title}</h3>
          <span style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 600 }}>
            Total: {total}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {data.map((item, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                  <span style={{ fontSize: '0.875rem', color: dark, fontWeight: 600 }}>{item.label}</span>
                </div>
                <span style={{ fontSize: '0.875rem', color: textGray, fontWeight: 700 }}>
                  {item.value} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
                </span>
              </div>
              <div style={{ height: 8, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${(item.value / max) * 100}%`, 
                    background: item.color, 
                    borderRadius: 4, 
                    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative'
                  }} 
                />
              </div>
            </div>
          ))}
        </div>

        {data.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px', color: '#9CA3AF' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>📊</div>
            <div style={{ fontSize: '0.875rem' }}>Aucune donnée disponible</div>
          </div>
        )}
      </div>
    );
  };

  // ─── Recent Activity améliorée ───
  const RecentActivity = ({ title, items, type, viewAllLink }) => {
    const getTypeConfig = () => {
      switch(type) {
        case 'user': return { icon: '👤', bg: '#DBEAFE', color: '#2563EB' };
        case 'campagne': return { icon: '📢', bg: '#FEF3C7', color: '#D97706' };
        case 'inscription': return { icon: '📝', bg: '#ECFDF5', color: '#10B981' };
        default: return { icon: '📌', bg: '#F3F4F6', color: '#6B7280' };
      }
    };

    const typeConfig = getTypeConfig();

    return (
      <div style={{ 
        background: white, 
        borderRadius: 16, 
        padding: '24px', 
        border: `1px solid ${lightBorder}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: dark, margin: 0 }}>{title}</h3>
          {viewAllLink && (
            <button 
              onClick={() => navigate(viewAllLink)}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: gold, 
                fontSize: '0.8rem', 
                fontWeight: 600, 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              Voir tout →
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.slice(0, 5).map((item, i) => {
            const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG[item.published ? 'active' : 'inactive'];

            return (
              <div 
                key={i} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12, 
                  padding: '12px', 
                  background: gray, 
                  borderRadius: 12,
                  transition: 'background 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#E5E7EB'}
                onMouseLeave={e => e.currentTarget.style.background = gray}
              >
                <div style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  background: typeConfig.bg, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '1rem',
                  flexShrink: 0
                }}>
                  {typeConfig.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: 600, 
                    color: dark,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.name || item.title || item.email || 'Sans nom'}
                  </div>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: textGray, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 6,
                    marginTop: 2
                  }}>
                    {type === 'user' && (
                      <>
                        <span style={{ 
                          padding: '2px 8px', 
                          borderRadius: 10, 
                          background: ROLE_COLORS[item.role]?.bg || '#F3F4F6', 
                          color: ROLE_COLORS[item.role]?.color || '#6B7280',
                          fontWeight: 600,
                          fontSize: '0.7rem'
                        }}>
                          {ROLE_COLORS[item.role]?.label || item.role}
                        </span>
                      </>
                    )}
                    {type === 'campagne' && (
                      <span style={{ 
                        padding: '2px 8px', 
                        borderRadius: 10, 
                        background: item.published ? '#ECFDF5' : '#F3F4F6', 
                        color: item.published ? '#047857' : '#6B7280',
                        fontWeight: 600,
                        fontSize: '0.7rem'
                      }}>
                        {item.published ? '✅ Publiée' : '📝 Brouillon'}
                      </span>
                    )}
                    {type === 'inscription' && statusConfig && (
                      <span style={{ 
                        padding: '2px 8px', 
                        borderRadius: 10, 
                        background: statusConfig.bg, 
                        color: statusConfig.color,
                        fontWeight: 600,
                        fontSize: '0.7rem'
                      }}>
                        {statusConfig.label}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 500, flexShrink: 0 }}>
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : 'N/A'}
                </div>
              </div>
            );
          })}

          {items.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px', color: '#9CA3AF' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>📭</div>
              <div style={{ fontSize: '0.875rem' }}>Aucune activité récente</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ─── Loading State ───
  if (loading) return (
    <Layout>
      <div style={{ 
        minHeight: 'calc(100vh - 64px)', 
        background: '#f6f3ee', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: 48, 
            height: 48, 
            borderRadius: '50%', 
            border: `3px solid ${lightBorder}`, 
            borderTopColor: gold, 
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: textGray, fontWeight: 500 }}>Chargement du tableau de bord...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div style={{ 
        minHeight: 'calc(100vh - 64px)', 
        background: '#f6f3ee', 
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" 
      }}>

        {/* ═══ HEADER STICKY AMÉLIORÉ ═══ */}
        <div style={{ 
          background: white, 
          borderBottom: `1px solid ${lightBorder}`, 
          padding: '24px 32px',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{ 
            maxWidth: 1400, 
            margin: '0 auto', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16
          }}>
            {/* Titre + Sous-titre */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                <div style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: 10, 
                  background: gold + '20', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '1.25rem' 
                }}>
                  🎯
                </div>
                <div>
                  <h1 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 800, 
                    color: dark, 
                    margin: 0,
                    lineHeight: 1.2
                  }}>
                    Tableau de Bord
                  </h1>
                  <p style={{ 
                    color: textGray, 
                    margin: 0, 
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }}>
                    Vue d'ensemble de la plateforme DigiLab
                  </p>
                </div>
              </div>
            </div>

            {/* Filtres temps + Refresh */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {[
                { key: '7j', label: '7 jours' },
                { key: '30j', label: '30 jours' },
                { key: '90j', label: '90 jours' },
                { key: '1an', label: '1 an' }
              ].map(({ key, label }) => (
                <button 
                  key={key} 
                  onClick={() => setTimeRange(key)} 
                  style={{ 
                    padding: '8px 16px', 
                    borderRadius: 8, 
                    border: 'none', 
                    background: timeRange === key ? dark : '#F3F4F6', 
                    color: timeRange === key ? white : textGray, 
                    fontWeight: timeRange === key ? 700 : 600, 
                    cursor: 'pointer', 
                    fontSize: '0.85rem',
                    transition: 'all 0.2s'
                  }}
                >
                  {label}
                </button>
              ))}

              <div style={{ width: 1, height: 24, background: lightBorder, margin: '0 4px' }} />

              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                style={{ 
                  padding: '8px 12px', 
                  borderRadius: 8, 
                  border: `1px solid ${lightBorder}`, 
                  background: white, 
                  color: textGray, 
                  cursor: refreshing ? 'wait' : 'pointer', 
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.2s'
                }}
                title="Rafraîchir les données"
              >
                <span style={{ 
                  display: 'inline-block',
                  animation: refreshing ? 'spin 0.8s linear infinite' : 'none'
                }}>
                  🔄
                </span>
                {refreshing ? '...' : ''}
              </button>
            </div>
          </div>
        </div>

        {/* ═══ CONTENU PRINCIPAL ═══ */}
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 32px' }}>

          {/* Error Banner */}
          {error && (
            <div style={{ 
              padding: '16px 20px', 
              background: '#FEE2E2', 
              color: '#DC2626', 
              borderRadius: 12, 
              marginBottom: 24, 
              fontWeight: 600, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              border: '1px solid #FECACA'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                {error}
              </div>
              <button 
                onClick={() => { setError(null); fetchDashboardData(); }} 
                style={{ 
                  background: '#DC2626', 
                  color: white,
                  border: 'none', 
                  cursor: 'pointer', 
                  fontWeight: 700,
                  padding: '6px 14px',
                  borderRadius: 6,
                  fontSize: '0.85rem'
                }}
              >
                Réessayer
              </button>
            </div>
          )}

          {/* KPIs Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: 20, 
            marginBottom: 24 
          }}>
            <StatCard 
              title="Utilisateurs" 
              value={stats.totalUsers} 
              subtitle={`${stats.activeUsers} actifs · ${stats.inactiveUsers} inactifs`} 
              icon="👥" 
              color="#2563EB" 
              trend={12} 
              onClick={() => navigate('/admin/users')}
            />
            <StatCard 
              title="Campagnes" 
              value={stats.totalCampagnes} 
              subtitle={`${stats.publishedCampagnes} publiées · ${stats.totalCampagnes - stats.publishedCampagnes} brouillons`} 
              icon="📢" 
              color="#D97706" 
              trend={8} 
              onClick={() => navigate('/admin/campagnes')}
            />
            <StatCard 
              title="Inscriptions" 
              value={stats.totalInscriptions} 
              subtitle={`${stats.pendingInscriptions} en attente`} 
              icon="📝" 
              color="#10B981" 
              trend={-3} 
              onClick={() => navigate('/admin/inscriptions')}
            />
            <StatCard 
              title="Clients" 
              value={stats.totalClients} 
              subtitle="Comptes actifs" 
              icon="🏢" 
              color="#7C3AED" 
              trend={15} 
              onClick={() => navigate('/admin/clients')}
            />
          </div>

          {/* Charts Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: 20, 
            marginBottom: 24 
          }}>
            <MiniBarChart data={roleDistribution} title="Répartition des rôles" />
            <MiniBarChart data={campagneStatus} title="Statut des campagnes" />
            <MiniBarChart data={inscriptionStatus} title="Statut des inscriptions" />
          </div>

          {/* Activity Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: 20 
          }}>
            <RecentActivity 
              title="👤 Utilisateurs récents" 
              items={users} 
              type="user" 
              viewAllLink="/admin/users"
            />
            <RecentActivity 
              title="📢 Campagnes récentes" 
              items={campagnes} 
              type="campagne" 
              viewAllLink="/admin/campagnes"
            />
            <RecentActivity 
              title="📝 Inscriptions récentes" 
              items={inscriptions} 
              type="inscription" 
              viewAllLink="/admin/inscriptions"
            />
          </div>
        </div>

        <style>{`
          @keyframes spin { 
            from { transform: rotate(0deg); } 
            to { transform: rotate(360deg); } 
          }
        `}</style>
      </div>
    </Layout>
  );
}

export default AdminDashboard;