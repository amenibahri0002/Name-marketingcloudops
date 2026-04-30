import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const adminMenu = [
  { section: 'Principal', items: [
    { path: '/dashboard', icon: '⬛', label: 'Dashboard' },
    { path: '/users', icon: '👤', label: 'Utilisateurs' },
  ]},
  { section: 'Monitoring', items: [
    { path: '/monitoring', icon: '◎', label: 'Monitoring' },
    { path: '/reporting', icon: '📊', label: 'Reporting' },
    { path: '/analytics', icon: '📈', label: 'Analytics KPIs' },
  ]},
];

const marketingMenu = [
  { section: 'Campagnes', items: [
    { path: '/dashboard', icon: '⬛', label: 'Dashboard' },
    { path: '/campagnes', icon: '📧', label: 'Campagnes' },
  ]},
  { section: 'Gestion', items: [
    { path: '/contacts', icon: '👥', label: 'Contacts' },
    { path: '/clients', icon: '🏢', label: 'Clients' },
    { path: '/segments', icon: '🗺️', label: 'Segments' },
  ]},
  { section: 'Analytics', items: [
    { path: '/reporting', icon: '📊', label: 'Suivi campagnes' },
    { path: '/analytics', icon: '📈', label: 'Analytics KPIs' },
  ]},
];

const clientMenu = [
  { section: 'Menu', items: [
    { path: '/dashboard', icon: '⬛', label: 'Dashboard' },
  ]},
];

function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('USER');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role);
      } catch (err) {}
    }
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const u = JSON.parse(user);
        setUserName(u.name || '');
      } catch (err) {}
    }
  }, [location]);

  const menuGroups = userRole === 'ADMIN'
    ? adminMenu
    : userRole === 'RESPONSABLE_MARKETING'
      ? marketingMenu
      : clientMenu;

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getRoleInfo = () => {
    if (userRole === 'ADMIN') return { label: 'Administrateur', short: 'AD' };
    if (userRole === 'RESPONSABLE_MARKETING') return { label: 'Resp. Marketing', short: 'RM' };
    return { label: 'Client', short: 'CL' };
  };

  const roleInfo = getRoleInfo();
  const initials = userName ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : roleInfo.short;
  const currentLabel = menuGroups.flatMap(g => g.items).find(m => m.path === location.pathname)?.label || 'Dashboard';

  const gold = '#f5a623';
  const dark = '#16120d';
  const dark2 = '#1e1810';

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'Open Sans', sans-serif", background: '#f6f3ee' }}>

      {/* SIDEBAR */}
      <aside style={{
        width: 240, flexShrink: 0,
        background: dark,
        display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Glow effect */}
        <div style={{
          position: 'absolute', bottom: -80, left: -80,
          width: 260, height: 260, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* Logo */}
        <div style={{
          padding: '1.5rem 1.4rem 1.2rem',
          display: 'flex', alignItems: 'center', gap: 10,
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div style={{ width: 34, height: 34, position: 'relative', flexShrink: 0 }}>
            <div style={{
              position: 'absolute', top: 0, left: 0,
              width: 20, height: 20, background: gold, borderRadius: 4
            }} />
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 16, height: 16,
              background: 'rgba(245,166,35,0.35)', borderRadius: 3
            }} />
          </div>
          <div style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: '1.1rem', fontWeight: 800, color: 'white'
          }}>
            Digi<span style={{ color: gold }}>Pip</span>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
          {menuGroups.map(group => (
            <div key={group.section}>
              <div style={{
                padding: '1.2rem 1rem 0.3rem',
                fontSize: '0.58rem', fontWeight: 700,
                color: 'rgba(255,255,255,0.25)',
                textTransform: 'uppercase', letterSpacing: 2,
                fontFamily: "'Montserrat', sans-serif"
              }}>
                {group.section}
              </div>
              <ul style={{ listStyle: 'none', padding: '0 0.6rem' }}>
                {group.items.map(item => {
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path} style={{ marginBottom: 2 }}>
                      <Link to={item.path} style={{ textDecoration: 'none' }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '0.6rem 0.9rem', borderRadius: 8,
                          fontSize: '0.82rem', fontWeight: 500,
                          color: isActive ? gold : 'rgba(255,255,255,0.45)',
                          background: isActive ? 'rgba(245,166,35,0.18)' : 'transparent',
                          border: isActive ? '1px solid rgba(245,166,35,0.2)' : '1px solid transparent',
                          transition: 'all 0.18s', cursor: 'pointer'
                        }}>
                          <span style={{ fontSize: '0.9rem', width: 18, textAlign: 'center' }}>
                            {item.icon}
                          </span>
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

        {/* User footer */}
        <div style={{
          marginTop: 'auto', padding: '1.2rem',
          borderTop: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: gold, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Montserrat', sans-serif", fontSize: '0.72rem', fontWeight: 800,
              color: dark, flexShrink: 0
            }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'white' }}>{userName}</div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{roleInfo.label}</div>
            </div>
          </div>
          <button onClick={logout} style={{
            width: '100%', padding: '0.5rem',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 8, color: '#ef4444',
            fontSize: '0.75rem', fontWeight: 600,
            cursor: 'pointer', fontFamily: "'Montserrat', sans-serif"
          }}>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* TOPBAR */}
        <div style={{
          height: 60, background: 'white',
          borderBottom: '1px solid #ede8df',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.8rem', flexShrink: 0
        }}>
          <div>
            <div style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '1rem', fontWeight: 800, color: '#1a160e'
            }}>
              {currentLabel}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#9c8f7a', marginTop: 1 }}>
               DigiPip — {roleInfo.label}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#f6f3ee', border: '1px solid #ede8df',
              borderRadius: 8, padding: '0.4rem 0.9rem',
              fontSize: '0.78rem', color: '#9c8f7a'
            }}>
              🔍 Rechercher...
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                border: '1px solid #ede8df', background: 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: '0.85rem', color: '#9c8f7a'
              }}>🔔</div>
              <div style={{
                position: 'absolute', top: -3, right: -3,
                background: gold, color: dark,
                fontSize: '0.5rem', fontWeight: 800,
                width: 14, height: 14, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Montserrat', sans-serif"
              }}>3</div>
            </div>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: gold, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Montserrat', sans-serif", fontSize: '0.72rem', fontWeight: 800,
              color: dark, border: '2px solid rgba(245,166,35,0.3)', cursor: 'pointer'
            }}>
              {initials}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '1.4rem 1.8rem',
          scrollbarWidth: 'thin', scrollbarColor: '#ede8df transparent'
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;