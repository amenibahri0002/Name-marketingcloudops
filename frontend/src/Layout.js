import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from './components/Logo';
import SidebarMenuItem from './components/SidebarMenuItem';

const gold = '#f5a623';
const dark = '#16120d';

/* ═══════════════════════════════════════════
   MENUS PAR RÔLE
═══════════════════════════════════════════ */

const adminMenu = [
  { section: 'Principal', items: [
    { path: '/dashboard', icon: '⬛', label: 'Dashboard' },
    { path: '/users', icon: '👤', label: 'Utilisateurs' },
  ]},
  { section: 'Cloud Operations', items: [
    { path: '/Cloud-Operations', icon: '☁️', label: 'Cloud Operations Center' },
  ]},
  { section: 'Analytics', items: [
    { path: '/reporting', icon: '📊', label: 'Reporting' },
    { path: '/monitoring', icon: '📈', label: 'Monitoring' },
  ]},
];

const marketingMenu = [
  { section: 'Campagnes', items: [
    { path: '/dashboard', icon: '⬛', label: 'Dashboard' },
    { path: '/gestion-campagnes-marketing', icon: '📢', label: 'Gestion des Campagnes' },
  ]},
  { section: 'Gestion', items: [
    { path: '/clients', icon: '🏢', label: 'Clients' },
    { path: '/segments', icon: '🎯', label: 'Segments' },
  ]},
  { section: 'Analytics', items: [
    { path: '/analytics', icon: '📉', label: 'KPIs' },
  ]},
];

const clientMenu = [
  { section: 'Accueil', items: [
    { path: '/dashboard', icon: '⬛', label: 'Dashboard' },
  ]},
  { section: 'Mes Campagnes', items: [
    { path: '/campagnes', icon: '📢', label: 'Mes Campagnes' },
    { path: '/MesCampagnes', icon: '📊', label: 'Mes Inscriptions' },
  ]},
  { section: 'Mes Données', items: [
    { path: '/Paiements', icon: '💰', label: 'Mes Paiements' },
    {path: '/Certificats', icon: '📜', label: 'Mes Certificats' },
  ]},
  
  { section: 'Compte', items: [
    { path: '/profil', icon: '👤', label: 'Mon Profil' },
{ path: '/notifications', icon: '🔔', label: 'Notifications', isToggle : true },
  ]},
];

const NOTIFS = [
  { id:1, icon:'☁️', text:'Déploiement cloud "Promo Été" terminé', time:'Il y a 2 min', unread:true, type:'cloud' },
  { id:2, icon:'🔄', text:'Pipeline CI/CD campagne #42 en cours', time:'Il y a 5 min', unread:true, type:'cicd' },
  { id:3, icon:'📊', text:'Alerte: CPU > 80% sur cluster EU', time:'Il y a 12 min', unread:true, type:'alert' },
  { id:4, icon:'💰', text:'Budget mensuel à 65% consommé', time:'Il y a 1h', unread:false, type:'cost' },
  { id:5, icon:'🔐', text:'Scan sécurité: 0 vulnérabilité trouvée', time:'Il y a 2h', unread:false, type:'security' },
];

function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [userRole, setUserRole] = useState('CLIENT');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifs, setNotifs] = useState(NOTIFS);
  const [pushEnabled, setPushEnabled] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role || 'CLIENT');
      } catch (e) {}
    }

    const user = localStorage.getItem('user');
    if (user) {
      try {
        const u = JSON.parse(user);
        setUserName(u.name || 'Utilisateur');
        setUserEmail(u.email || '');
      } catch (e) {}
    }
  }, [location]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
   useEffect(() => {
    setPushEnabled(Notification.permission === 'granted');
  }, []);
   const togglePushNotifications = async () => {
    if (pushEnabled) {
      // Déjà activé, rien à faire
      return;
    }
     try {
      const { requestNotificationPermission } = await import('./firebase');
      const token = await requestNotificationPermission();
      
      if (token) {
        setPushEnabled(true);
         // Envoyer au backend

        const response = await fetch('https://marketingcloudops-backend.onrender.com/api/users/fcm-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ fcmToken: token })
        });
         if (response.ok) {
        console.log('✅ Token FCM sauvegardé dans le backend');
      } else {
        console.error('❌ Erreur sauvegarde token:', await response.text());
      }
      }
    } catch (err) {
      console.error('Erreur push:', err);
    }
  };

  const menuGroups = userRole === 'ADMIN' 
    ? adminMenu 
    : userRole === 'RESPONSABLE_MARKETING' 
      ? marketingMenu 
      : clientMenu;

  const allPages = menuGroups.flatMap(g => g.items);

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const roleInfo = userRole === 'ADMIN' ? { label: 'Administrateur', short: 'AD' }
                 : userRole === 'RESPONSABLE_MARKETING' ? { label: 'Resp. Marketing', short: 'RM' }
                 : { label: 'Client', short: 'CL' };

  const displayName = userRole === 'ADMIN' ? 'Administrateur' : userName;
  const displayInitials = userRole === 'ADMIN' ? 'AD' : (userName ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : roleInfo.short);

  const currentPage = allPages.find(m => m.path === location.pathname);
  const currentLabel = currentPage?.label || 'Dashboard';
  const unreadCount = notifs.filter(n => n.unread).length;

  const markAllRead = () => setNotifs(n => n.map(x => ({ ...x, unread: false })));

  // Breadcrumb
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/Admin/dashboard') return ['Admin', 'Dashboard'];
    if (path === '/users') return ['Admin', 'Utilisateurs'];
    if (path === '/Cloud-Operations') return ['Admin', 'Cloud Operations'];
    if (path === '/monitoring') return ['Admin', 'Monitoring'];
    if (path === '/reporting') return ['Admin', 'Reporting'];
    if (path === '/dashboard') return ['Marketing', 'Dashboard'];
    if (path === '/gestion-campagnes-marketing') return ['Marketing', 'Campagnes'];
    if (path === '/clients') return ['Marketing', 'Clients'];
    if (path === '/segments') return ['Marketing', 'Segments'];
    if (path === '/analytics') return ['Marketing', 'KPIs'];
    return ['Accueil', currentLabel];
  };

  const [crumbMain, crumbCurrent] = getBreadcrumb();

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'Inter', 'Open Sans', sans-serif", background: '#f6f3ee' }}>

      {/* ═══════ SIDEBAR ═══════ */}
      <aside style={{ 
        width: sidebarCollapsed ? 72 : 260, 
        flexShrink: 0, 
        background: dark, 
        display: 'flex', 
        flexDirection: 'column', 
        position: 'relative', 
        overflow: 'hidden',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 100,
      }}>

        {/* TOGGLE BUTTON - POSITIONNÉ EN DEHORS DU LOGO */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{
            position: 'absolute',
            top: 80,
            right: -12,
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: gold,
            border: '3px solid ' + dark,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            color: dark,
            fontWeight: 900,
            zIndex: 101,
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            transition: 'all 0.2s ease',
          }}
          title={sidebarCollapsed ? 'Étendre' : 'Réduire'}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.15)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 166, 35, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
          }}
        >
          {sidebarCollapsed ? '›' : '‹'}
        </button>

        {/* LOGO */}
        <div style={{ 
          padding: sidebarCollapsed ? '1.5rem 0.5rem 1rem' : '1.5rem 1.2rem 1rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          gap: 12, 
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          minHeight: 70,
        }}>
          <Logo size={sidebarCollapsed ? 36 : 42} showText={true} collapsed={sidebarCollapsed} />
        </div>

        {/* MENU */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.8rem 0' }}>
          {menuGroups.map(group => (
            <div key={group.section}>
              {!sidebarCollapsed && (
                <div style={{ 
                  padding: '1rem 1.2rem 0.4rem', 
                  fontSize: '0.65rem', 
                  fontWeight: 700, 
                  color: 'rgba(255,255,255,0.35)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '1.8px',
                  display: 'flex', alignItems: 'center', gap: 8
                }}>
                  {group.section === 'Cloud Operations' && (
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
                  )}
                  {group.section}
                </div>
              )}
              <ul style={{ listStyle: 'none', padding: sidebarCollapsed ? '0 0.4rem' : '0 0.8rem' }}>
                {group.items.map(item => (
                  <li key={item.path} style={{ marginBottom: 3 }}>
                    {item.isToggle ? (
                      <div 
        onClick={togglePushNotifications}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: sidebarCollapsed ? '0.7rem' : '0.7rem 1rem',
          borderRadius: 10,
          cursor: 'pointer',
          transition: 'all 0.2s',
          color: pushEnabled ? '#10b981' : 'rgba(255,255,255,0.6)',
          background: pushEnabled ? 'rgba(16,185,129,0.1)' : 'transparent',
        }}
      >
        <span style={{ fontSize: '1.1rem', width: 24, textAlign: 'center' }}>
          {pushEnabled ? '🔔' : '🔕'}
        </span>
        {!sidebarCollapsed && (
          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
            {pushEnabled ? 'Notifs activées' : item.label}
          </span>
        )}
        {!sidebarCollapsed && pushEnabled && (
          <span style={{ 
            marginLeft: 'auto', 
            width: 8, 
            height: 8, 
            borderRadius: '50%', 
            background: '#10b981',
            boxShadow: '0 0 6px #10b981'
          }} />
        )}
      </div>
    ) : (
                    <SidebarMenuItem 
                      item={item} 
                      isActive={location.pathname === item.path}
                      collapsed={sidebarCollapsed}
                    />
    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CLOUD STATUS */}
        <div style={{ padding: sidebarCollapsed ? '0.8rem 0.4rem' : '0.8rem 1.2rem', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: sidebarCollapsed ? '0.6rem' : '0.6rem 0.8rem', 
            borderRadius: 8,
            background: 'rgba(34,197,94,0.1)', 
            border: '1px solid rgba(34,197,94,0.2)',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80', animation: 'pulse 2s infinite', flexShrink: 0 }} />
            {!sidebarCollapsed && (
              <>
                <span style={{ fontSize: 11, color: '#4ade80', fontWeight: 600 }}>Cloud Opérationnel</span>
                <span style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>99.97%</span>
              </>
            )}
          </div>
        </div>

        {/* USER SECTION */}
        <div style={{ padding: sidebarCollapsed ? '1.2rem 0.4rem' : '1.2rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
            <div style={{ 
              width: 38, height: 38, borderRadius: '50%', 
              background: gold, display: 'flex', alignItems: 'center', 
              justifyContent: 'center', fontWeight: 800, color: dark, 
              fontSize: '0.8rem',
              flexShrink: 0
            }}>
              {displayInitials}
            </div>
            {!sidebarCollapsed && (
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontWeight: 600, color: 'white', fontSize: '0.9rem' }}>
                  {displayName}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>
                  {roleInfo.label}
                </div>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <button onClick={logout} style={{ 
              width: '100%', padding: '0.6rem', 
              background: 'rgba(239,68,68,0.1)', 
              border: '1px solid rgba(239,68,68,0.3)', 
              borderRadius: 8, color: '#ef4444', 
              fontWeight: 600, cursor: 'pointer',
              fontSize: '0.8rem',
              transition: 'all 0.2s'
            }}>
              Déconnexion
            </button>
          )}
        </div>
      </aside>

      {/* ═══════ MAIN ═══════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* HEADER AMÉLIORÉ */}
        <div style={{ 
          height: 66, 
          background: 'white', 
          borderBottom: '1px solid #ede8df', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '0 2rem',
          flexShrink: 0,
          zIndex: 50,
        }}>
          {/* GAUCHE: Breadcrumb + Titre */}
          <div>
            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: '0.7rem', color: '#9c8f7a', fontWeight: 500 }}>{crumbMain}</span>
              <span style={{ fontSize: '0.7rem', color: '#d1c7b7' }}>/</span>
              <span style={{ fontSize: '0.7rem', color: gold, fontWeight: 600 }}>{crumbCurrent}</span>
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1a160e', letterSpacing: '-0.01em' }}>
              {currentLabel}
            </div>
          </div>

          {/* DROITE: Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>

            {/* Search */}
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Rechercher..."
                style={{
                  padding: '8px 12px 8px 32px',
                  borderRadius: 10,
                  border: '1px solid #e4e0d8',
                  background: '#faf9f7',
                  fontSize: '0.8rem',
                  width: 200,
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
              />
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#9c8f7a' }}>🔍</span>
            </div>

            {/* Notifications */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button onClick={() => setShowNotifs(!showNotifs)} style={{ 
                width: 38, height: 38, borderRadius: 10, 
                border: '1px solid #e4e0d8', background: 'white', 
                cursor: 'pointer', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', position: 'relative',
                transition: 'all 0.2s'
              }}>
                🔔
                {unreadCount > 0 && (
                  <span style={{ 
                    position: 'absolute', top: -2, right: -2, 
                    width: 18, height: 18, borderRadius: '50%', 
                    background: '#ef4444', color: 'white', 
                    fontSize: 10, fontWeight: 700, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'pulse 2s infinite'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifs && (
                <div style={{ 
                  position: 'absolute', top: 'calc(100% + 12px)', right: 0, 
                  width: 360, background: 'white', borderRadius: 16, 
                  boxShadow: '0 16px 48px rgba(0,0,0,0.15)', 
                  border: '1px solid #e4e0d8', zIndex: 50, overflow: 'hidden' 
                }}>
                  <div style={{ 
                    padding: '1rem 1.2rem', 
                    borderBottom: '1px solid #f0ede8', 
                    display: 'flex', justifyContent: 'space-between', 
                    alignItems: 'center' 
                  }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      Notifications Cloud
                    </span>
                    <button onClick={markAllRead} style={{ 
                      fontSize: '0.75rem', color: gold, 
                      background: 'none', border: 'none', 
                      cursor: 'pointer', fontWeight: 600 
                    }}>
                      Tout marquer lu
                    </button>
                  </div>
                  <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                    {notifs.map((notif, i) => (
                      <div key={notif.id} style={{ 
                        padding: '0.9rem 1.2rem', 
                        borderBottom: i < notifs.length - 1 ? '1px solid #f0ede8' : 'none', 
                        display: 'flex', alignItems: 'flex-start', gap: 12, 
                        background: notif.unread ? 'rgba(245,166,35,0.03)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}>
                        <div style={{ 
                          width: 36, height: 36, borderRadius: 10, 
                          background: notif.type === 'alert' ? 'rgba(239,68,68,0.1)' : 'rgba(245,166,35,0.1)', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          fontSize: 16, flexShrink: 0 
                        }}>
                          {notif.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1a160e', marginBottom: 2 }}>
                            {notif.text}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#9c8f7a' }}>
                            {notif.time}
                          </div>
                        </div>
                        {notif.unread && (
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: gold, flexShrink: 0, marginTop: 4 }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div ref={profileRef} style={{ position: 'relative' }}>
              <button onClick={() => setShowProfile(!showProfile)} style={{ 
                width: 38, height: 38, borderRadius: '50%', 
                background: gold, border: 'none', cursor: 'pointer', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontWeight: 800, color: dark, fontSize: '0.85rem',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(245, 166, 35, 0.3)'
              }}>
                {displayInitials}
              </button>
              {showProfile && (
                <div style={{ 
                  position: 'absolute', top: 'calc(100% + 12px)', right: 0, 
                  width: 240, background: 'white', borderRadius: 16, 
                  boxShadow: '0 16px 48px rgba(0,0,0,0.15)', 
                  border: '1px solid #e4e0d8', zIndex: 50, overflow: 'hidden' 
                }}>
                  <div style={{ padding: '1.2rem', borderBottom: '1px solid #f0ede8', textAlign: 'center' }}>
                    <div style={{ 
                      width: 48, height: 48, borderRadius: '50%', 
                      background: gold, display: 'flex', alignItems: 'center', 
                      justifyContent: 'center', fontWeight: 800, 
                      color: dark, fontSize: '1.1rem', 
                      margin: '0 auto 0.6rem',
                      boxShadow: '0 2px 8px rgba(245, 166, 35, 0.3)'
                    }}>
                      {displayInitials}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      {displayName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9c8f7a', marginTop: 2 }}>
                      {userEmail}
                    </div>
                    <div style={{ 
                      marginTop: 6, display: 'inline-block', 
                      padding: '2px 10px', borderRadius: 12, 
                      background: 'rgba(245,166,35,0.1)', color: gold, 
                      fontSize: '0.7rem', fontWeight: 700 
                    }}>
                      {roleInfo.label}
                    </div>
                  </div>
                  <div style={{ padding: '0.6rem' }}>
                    <button onClick={() => { setShowProfile(false); navigate('/profile'); }} style={{ 
                      width: '100%', padding: '0.6rem', textAlign: 'left', 
                      background: 'none', border: 'none', cursor: 'pointer', 
                      borderRadius: 8, fontSize: '0.85rem', color: '#1a160e',
                      transition: 'background 0.2s'
                    }}>
                      👤 Mon Profil
                    </button>
                    <button onClick={() => { setShowProfile(false); navigate('/cloud-operations'); }} style={{ 
                      width: '100%', padding: '0.6rem', textAlign: 'left', 
                      background: 'none', border: 'none', cursor: 'pointer', 
                      borderRadius: 8, fontSize: '0.85rem', color: '#1a160e',
                      transition: 'background 0.2s'
                    }}>
                      ☁️ Cloud Operations
                    </button>
                    <div style={{ height: 1, background: '#f0ede8', margin: '4px 0' }} />
                    <button onClick={logout} style={{ 
                      width: '100%', padding: '0.6rem', textAlign: 'left', 
                      background: 'none', border: 'none', cursor: 'pointer', 
                      borderRadius: 8, fontSize: '0.85rem', 
                      color: '#ef4444', fontWeight: 600,
                      transition: 'background 0.2s'
                    }}>
                      🚪 Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CONTENT - SCROLLBAR COHÉRENTE */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '2rem', 
          background: '#f6f3ee',
          scrollbarWidth: 'thin',
          scrollbarColor: '#d1c7b7 transparent',
        }}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 
          0%, 100% { opacity: 1; } 
          50% { opacity: 0.5; } 
        }

        /* Scrollbar cohérente pour tout le layout */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: #d1c7b7;
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #b8a99a;
        }

        /* Pour Firefox */
        * {
          scrollbar-width: thin;
          scrollbar-color: #d1c7b7 transparent;
        }
      `}</style>
    </div>
  );
}

export default Layout;