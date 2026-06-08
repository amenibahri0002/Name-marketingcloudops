import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const gold = '#f5a623';
const dark = '#16120d';

/* ═══════════════════════════════════════════
   MENUS PAR RÔLE
═══════════════════════════════════════════ */

const adminMenu = [
  { section: 'Principal', items: [
    { path: '/admin/dashboard', icon: '⬛', label: 'Dashboard' },
    { path: '/users', icon: '👤', label: 'Utilisateurs' },
  ]},
  { section: 'Cloud Operations', items: [
    { path: '/cloud-operations', icon: '☁️', label: 'Cloud Operations Center' },
  ]},
  { section: 'Analytics', items: [
    { path: '/reporting', icon: '📊', label: 'Reporting' },
    { path: '/analytics', icon: '📈', label: 'Analytics' },
  ]},
];

const marketingMenu = [
  { section: 'Campagnes', items: [
    { path: '/dashboard', icon: '⬛', label: 'Dashboard' },
    { path: '/campagnes', icon: '📢', label: 'Campagnes' },
  ]},
  { section: 'Gestion', items: [
    { path: '/clients', icon: '🏢', label: 'Clients' },
    { path: '/segments', icon: '🎯', label: 'Segments' },
  ]},
  
  { section: 'Analytics', items: [
    { path: '/reporting', icon: '📈', label: 'Suivi' },
    { path: '/analytics', icon: '📉', label: 'KPIs' },
  ]},
];

const clientMenu = [
  { section: 'Accueil', items: [
    { path: '/dashboard', icon: '⬛', label: 'Dashboard' },
  ]},
  { section: 'Mes Campagnes', items: [
    { path: '/campagnes', icon: '📢', label: 'Mes Campagnes' },
    { path: '/reporting', icon: '📊', label: 'Résultats' },
  ]},
  { section: 'Mes Données', items: [
    { path: '/segments', icon: '🎯', label: 'Mes Segments' },
  ]},
  { section: 'Cloud', items: [
    { path: '/cloud-operations', icon: '☁️', label: 'Mon Cloud' },
  ]},
  { section: 'Compte', items: [
    { path: '/profil', icon: '👤', label: 'Mon Profil' },
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

  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifs, setNotifs] = useState(NOTIFS);

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

  // Pour l'admin, on affiche "Administrateur" au lieu du nom réel
  const displayName = userRole === 'ADMIN' ? 'Administrateur' : userName;
  const displayInitials = userRole === 'ADMIN' ? 'AD' : (userName ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : roleInfo.short);
  
  const currentLabel = allPages.find(m => m.path === location.pathname)?.label || 'Dashboard';
  const unreadCount = notifs.filter(n => n.unread).length;

  const markAllRead = () => setNotifs(n => n.map(x => ({ ...x, unread: false })));

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'Open Sans', sans-serif", background: '#f6f3ee' }}>

      {/* ═══════ SIDEBAR ═══════ */}
      <aside style={{ width: 260, flexShrink: 0, background: dark, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        
        {/* LOGO */}
        <div style={{ padding: '1.8rem 1.5rem 1.4rem', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{
            width: 42, height: 42,
            background: 'linear-gradient(135deg, #f5a623, #d97706)',
            borderRadius: '50% 40% 65% 45%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, color: 'white',
            boxShadow: '0 4px 15px rgba(14, 165, 233, 0.5)',
            flexShrink: 0, position: 'relative'
          }}>
            ☁️
            <div style={{ position: 'absolute', top: 6, left: 8, width: 12, height: 12, background: 'rgba(255,255,255,0.6)', borderRadius: '50%', filter: 'blur(2px)' }} />
          </div>

          <div>
            <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '1.45rem', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>
              Digi<span style={{ color: '#f5a623' }}>Pip</span>
            </div>
            <div style={{ fontSize: 10.5, color: '#f5a623', marginTop: -2, fontFamily: 'monospace', fontWeight: 500 }}>
              CLOUD MARKETING
            </div>
          </div>
        </div>

        {/* MENU */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.8rem 0' }}>
          {menuGroups.map(group => (
            <div key={group.section}>
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
              <ul style={{ listStyle: 'none', padding: '0 0.8rem' }}>
                {group.items.map(item => {
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path} style={{ marginBottom: 3 }}>
                      <Link to={item.path} style={{ textDecoration: 'none' }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '0.75rem 1rem', borderRadius: 10,
                          color: isActive ? gold : 'rgba(255,255,255,0.55)',
                          background: isActive ? 'rgba(245,166,35,0.15)' : 'transparent',
                          border: isActive ? `1px solid rgba(245,166,35,0.25)` : 'none',
                          transition: 'all 0.2s',
                          fontSize: '0.85rem', fontWeight: 500
                        }}>
                          <span style={{ width: 20, fontSize: '1rem' }}>{item.icon}</span>
                          <span>{item.label}</span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* CLOUD STATUS */}
        <div style={{ padding: '0.8rem 1.2rem', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '0.6rem 0.8rem', borderRadius: 8,
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 11, color: '#4ade80', fontWeight: 600 }}>Cloud Opérationnel</span>
            <span style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>99.97%</span>
          </div>
        </div>

        {/* ═══════ USER SECTION — Admin masqué ═══════ */}
        <div style={{ padding: '1.2rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ 
              width: 38, height: 38, borderRadius: '50%', 
              background: gold, display: 'flex', alignItems: 'center', 
              justifyContent: 'center', fontWeight: 800, color: dark, 
              fontSize: '0.8rem' 
            }}>
              {displayInitials}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, color: 'white', fontSize: '0.9rem' }}>
                {displayName}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>
                {roleInfo.label}
              </div>
            </div>
          </div>
          <button onClick={logout} style={{ 
            width: '100%', padding: '0.6rem', 
            background: 'rgba(239,68,68,0.1)', 
            border: '1px solid rgba(239,68,68,0.3)', 
            borderRadius: 8, color: '#ef4444', 
            fontWeight: 600, cursor: 'pointer' 
          }}>
            Déconnexion
          </button>
        </div>
      </aside>  {/* ← BALISE FERMANTE AJOUTÉE */}

      {/* ═══════ MAIN ═══════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* HEADER */}
        <div style={{ 
          height: 66, background: 'white', 
          borderBottom: '1px solid #ede8df', 
          display: 'flex', alignItems: 'center', 
          justifyContent: 'space-between', padding: '0 2rem' 
        }}>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a160e' }}>
              {currentLabel}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#9c8f7a' }}>
              Espace {roleInfo.label}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Notifications */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button onClick={() => setShowNotifs(!showNotifs)} style={{ 
                width: 38, height: 38, borderRadius: 10, 
                border: '1px solid #e4e0d8', background: 'white', 
                cursor: 'pointer', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', position: 'relative' 
              }}>
                🔔
                {unreadCount > 0 && (
                  <span style={{ 
                    position: 'absolute', top: -2, right: -2, 
                    width: 18, height: 18, borderRadius: '50%', 
                    background: '#ef4444', color: 'white', 
                    fontSize: 10, fontWeight: 700, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center' 
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
                        background: notif.unread ? 'rgba(245,166,35,0.03)' : 'transparent' 
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
                          <div style={{ 
                            fontSize: '0.85rem', fontWeight: 600, 
                            color: '#1a160e', marginBottom: 2 
                          }}>
                            {notif.text}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#9c8f7a' }}>
                            {notif.time}
                          </div>
                        </div>
                        {notif.unread && (
                          <span style={{ 
                            width: 8, height: 8, borderRadius: '50%', 
                            background: gold, flexShrink: 0, marginTop: 4 
                          }} />
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
                fontWeight: 800, color: dark, fontSize: '0.85rem' 
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
                  <div style={{ 
                    padding: '1.2rem', 
                    borderBottom: '1px solid #f0ede8', 
                    textAlign: 'center' 
                  }}>
                    <div style={{ 
                      width: 48, height: 48, borderRadius: '50%', 
                      background: gold, display: 'flex', alignItems: 'center', 
                      justifyContent: 'center', fontWeight: 800, 
                      color: dark, fontSize: '1.1rem', 
                      margin: '0 auto 0.6rem' 
                    }}>
                      {displayInitials}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      {displayName}
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', color: '#9c8f7a', marginTop: 2 
                    }}>
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
                    <button onClick={() => navigate('/profile')} style={{ 
                      width: '100%', padding: '0.6rem', textAlign: 'left', 
                      background: 'none', border: 'none', cursor: 'pointer', 
                      borderRadius: 8, fontSize: '0.85rem', color: '#1a160e' 
                    }}>
                      👤 Mon Profil
                    </button>
                    <button onClick={() => navigate('/cloud-operations')} style={{ 
                      width: '100%', padding: '0.6rem', textAlign: 'left', 
                      background: 'none', border: 'none', cursor: 'pointer', 
                      borderRadius: 8, fontSize: '0.85rem', color: '#1a160e' 
                    }}>
                      ☁️ Cloud Operations
                    </button>
                    <button onClick={logout} style={{ 
                      width: '100%', padding: '0.6rem', textAlign: 'left', 
                      background: 'none', border: 'none', cursor: 'pointer', 
                      borderRadius: 8, fontSize: '0.85rem', 
                      color: '#ef4444', fontWeight: 600 
                    }}>
                      🚪 Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', background: '#f6f3ee' }}>
          {children}
        </div>
      </div>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );
}

export default Layout;