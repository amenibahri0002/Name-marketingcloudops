import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const adminMenu = [
  { path: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { path: '/users', icon: '⊕', label: 'Utilisateurs' },
  { path: '/monitoring', icon: '◎', label: 'Monitoring' },
  { path: '/reporting', icon: '▦', label: 'Reporting' },
  { path: '/analytics', icon: '▲', label: 'Analytics KPIs' },
];

const marketingMenu = [
  { path: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { path: '/campagnes', icon: '◈', label: 'Campagnes' },
  { path: '/contacts', icon: '⊕', label: 'Contacts' },
  { path: '/clients', icon: '◉', label: 'Clients' },
  { path: '/segments', icon: '◎', label: 'Segments' },
  { path: '/reporting', icon: '▦', label: 'Suivi campagnes' },
  { path: '/analytics', icon: '▲', label: 'Analytics KPIs' },
];

const clientMenu = [
  { path: '/dashboard', icon: '⊞', label: 'Dashboard' },
];

function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
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

  const menuItems = userRole === 'ADMIN'
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
    if (userRole === 'ADMIN') return { label: 'Admin', color: '#7c3aed', bg: '#f5f3ff' };
    if (userRole === 'RESPONSABLE_MARKETING') return { label: 'Marketing', color: '#0891b2', bg: '#f0f9ff' };
    return { label: 'Client', color: '#059669', bg: '#f0fdf4' };
  };

  const roleInfo = getRoleInfo();
  const initials = userName ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fafafa', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* Sidebar */}
      <div style={{
        width: collapsed ? 64 : 240,
        background: '#ffffff',
        borderRight: '1px solid #f0f0f0',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 100,
        transition: 'width 0.2s ease',
        boxShadow: '1px 0 0 #f0f0f0'
      }}>
        {/* Logo */}
        <div style={{
          padding: collapsed ? '20px 16px' : '20px 20px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 64
        }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, color: 'white', fontWeight: 700
              }}>M</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111', letterSpacing: '-0.3px' }}>MarketingCloud</div>
                <div style={{ fontSize: 10, color: '#999', letterSpacing: '0.5px' }}>OPS PLATFORM</div>
              </div>
            </div>
          )}
          {collapsed && (
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, color: 'white', fontWeight: 700, margin: '0 auto'
            }}>M</div>
          )}
          {!collapsed && (
            <button onClick={() => setCollapsed(!collapsed)} style={{
              background: 'none', border: '1px solid #f0f0f0', cursor: 'pointer',
              fontSize: 11, color: '#999', padding: '4px 6px', borderRadius: 6,
              lineHeight: 1
            }}>←</button>
          )}
        </div>

        {collapsed && (
          <button onClick={() => setCollapsed(false)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 11, color: '#999', padding: '8px', margin: '4px 8px',
            borderRadius: 6, textAlign: 'center'
          }}>→</button>
        )}

        {/* Role badge */}
        {!collapsed && (
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
            <span style={{
              background: roleInfo.bg, color: roleInfo.color,
              padding: '4px 10px', borderRadius: 6, fontSize: 11,
              fontWeight: 600, letterSpacing: '0.3px'
            }}>
              {roleInfo.label}
            </span>
          </div>
        )}

        {/* Menu */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {!collapsed && (
            <div style={{ fontSize: 10, fontWeight: 600, color: '#bbb', letterSpacing: '1px', padding: '4px 8px 8px', textTransform: 'uppercase' }}>
              Navigation
            </div>
          )}
          {menuItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: collapsed ? '10px' : '9px 10px',
                  borderRadius: 8, marginBottom: 2,
                  background: isActive ? '#f5f3ff' : 'transparent',
                  color: isActive ? '#7c3aed' : '#555',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 13,
                  transition: 'all 0.15s',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  border: isActive ? '1px solid #ede9fe' : '1px solid transparent',
                }}>
                  <span style={{ fontSize: 14, minWidth: 16, textAlign: 'center', opacity: isActive ? 1 : 0.7 }}>
                    {item.icon}
                  </span>
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && isActive && (
                    <div style={{ marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%', background: '#7c3aed' }} />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid #f0f0f0' }}>
          {!collapsed && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 8,
              background: '#fafafa', marginBottom: 6,
              border: '1px solid #f0f0f0'
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: roleInfo.bg, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: roleInfo.color,
                flexShrink: 0
              }}>
                {initials}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {userName}
                </div>
                <div style={{ fontSize: 10, color: '#999' }}>{roleInfo.label}</div>
              </div>
            </div>
          )}
          <button onClick={logout} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            width: '100%', padding: '8px 10px', borderRadius: 8,
            background: 'none', border: '1px solid #fee2e2', cursor: 'pointer',
            color: '#ef4444', fontSize: 12, fontWeight: 500,
            justifyContent: collapsed ? 'center' : 'flex-start',
            transition: 'all 0.15s'
          }}>
            <span style={{ fontSize: 13 }}>⎋</span>
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: collapsed ? 64 : 240, flex: 1, transition: 'margin-left 0.2s ease', minHeight: '100vh' }}>

        {/* Topbar */}
        <div style={{
          background: '#ffffff',
          borderBottom: '1px solid #f0f0f0',
          padding: '0 28px',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 99
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#bbb' }}>MarketingCloudOps</span>
            <span style={{ color: '#ddd' }}>/</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>
              {menuItems.find(m => m.path === location.pathname)?.label || 'Dashboard'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              padding: '5px 12px',
              background: '#f5f3ff',
              borderRadius: 6,
              fontSize: 11,
              color: '#7c3aed',
              fontWeight: 600,
              border: '1px solid #ede9fe'
            }}>
              v2.0
            </div>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: roleInfo.bg, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: roleInfo.color,
              border: `2px solid ${roleInfo.color}20`
            }}>
              {initials}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '28px 28px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;