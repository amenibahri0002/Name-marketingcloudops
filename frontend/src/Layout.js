import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const adminMenu = [
  { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/users', icon: '👤', label: 'Utilisateurs' },
  { path: '/monitoring', icon: '🔍', label: 'Monitoring' },
  { path: '/reporting', icon: '📊', label: 'Reporting' },
  { path: '/analytics', icon: '📈', label: 'Analytics KPIs' },
];

const marketingMenu = [
  { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/campagnes', icon: '📢', label: 'Campagnes' },
  { path: '/contacts', icon: '📋', label: 'Contacts' },
  { path: '/clients', icon: '👥', label: 'Clients' },
  { path: '/segments', icon: '🎯', label: 'Segments' },
  { path: '/reporting', icon: '📊', label: 'Suivi campagnes' },
  { path: '/analytics', icon: '📈', label: 'Analytics KPIs' },
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

  const menuItems = userRole === 'ADMIN' ? adminMenu : marketingMenu;

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getRoleInfo = () => {
    if (userRole === 'ADMIN') return { label: 'Administrateur', color: '#dc2626', bg: '#fee2e2' };
    if (userRole === 'MARKETER') return { label: 'Responsable Marketing', color: '#0891b2', bg: '#e0f2fe' };
    return { label: 'Utilisateur', color: '#6b7280', bg: '#f3f4f6' };
  };

  const roleInfo = getRoleInfo();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9ff', fontFamily: 'Inter, sans-serif' }}>

      {/* Sidebar */}
      <div style={{
        width: collapsed ? 70 : 240,
        background: 'white',
        borderRight: '1px solid #e8e8f0',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s',
        position: 'fixed',
        height: '100vh',
        zIndex: 100
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #e8e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {!collapsed && (
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#4f46e5' }}>MarketingCloudOps</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>Ops Platform</div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} style={{
            background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#6b7280', padding: 4
          }}>
            {collapsed ? '>' : '<'}
          </button>
        </div>

        {/* Role badge */}
        {!collapsed && (
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e8e8f0' }}>
            <span style={{
              background: roleInfo.bg, color: roleInfo.color,
              padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600
            }}>
              {roleInfo.label}
            </span>
          </div>
        )}

        {/* Menu */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {menuItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 8, marginBottom: 4,
                  background: isActive ? '#eef2ff' : 'transparent',
                  color: isActive ? '#4f46e5' : '#6b7280',
                  fontWeight: isActive ? 600 : 400, fontSize: 14,
                  transition: 'all 0.2s'
                }}>
                  <span style={{ fontSize: 18, minWidth: 20 }}>{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && isActive && (
                    <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#4f46e5' }} />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid #e8e8f0' }}>
          <button onClick={logout} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            width: '100%', padding: '10px 12px', borderRadius: 8,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#ef4444', fontSize: 14, fontWeight: 500
          }}>
            <span style={{ fontSize: 18 }}>🚪</span>
            {!collapsed && <span>Deconnexion</span>}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ marginLeft: collapsed ? 70 : 240, flex: 1, transition: 'margin-left 0.3s' }}>

        {/* Topbar */}
        <div style={{
          background: 'white', borderBottom: '1px solid #e8e8f0',
          padding: '0 24px', height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 99
        }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#1f2937' }}>
            {menuItems.find(m => m.path === location.pathname)?.label || 'Dashboard'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>{userName}</span>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: roleInfo.bg, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 600, color: roleInfo.color
            }}>
              {userRole === 'ADMIN' ? 'A' : 'M'}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ padding: 24 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;