import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MENUS } from './config/menuConfig';
import SidebarMenuItem from './components/SidebarMenuItem';

function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [userRole, setUserRole] = useState('USER');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role || 'USER');
      } catch (error) {
        setUserRole('USER');
      }
    }

    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setUserName(parsedUser.name || '');
      } catch (error) {
        setUserName('');
      }
    }
  }, [location]);

  const menuItems = MENUS[userRole] || MENUS.USER;

  const roleInfo = useMemo(() => {
    if (userRole === 'ADMIN') {
      return {
        label: 'Admin',
        color: '#7c3aed',
        bg: '#f5f3ff',
        border: '#ddd6fe',
      };
    }

    if (userRole === 'RESPONSABLE_MARKETING') {
      return {
        label: 'Responsable Marketing',
        color: '#0891b2',
        bg: '#ecfeff',
        border: '#bae6fd',
      };
    }

    return {
      label: 'Client',
      color: '#059669',
      bg: '#ecfdf5',
      border: '#a7f3d0',
    };
  }, [userRole]);

  const initials = userName
    ? userName
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const currentPage =
    menuItems.find((item) => item.path === location.pathname)?.label || 'Dashboard';

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#f8fafc',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <aside
        style={{
          width: collapsed ? 76 : 260,
          background: '#ffffff',
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: 100,
          transition: 'all 0.25s ease',
          boxShadow: '0 0 20px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div
          style={{
            padding: collapsed ? '18px 14px' : '18px 18px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            minHeight: 72,
          }}
        >
          {!collapsed ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 14,
                    boxShadow: '0 8px 18px rgba(124, 58, 237, 0.18)',
                  }}
                >
                  M
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                    MarketingCloudOps
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    Cloud Marketing Platform
                  </div>
                </div>
              </div>

              <button
                onClick={() => setCollapsed(true)}
                style={{
                  border: '1px solid #e5e7eb',
                  background: '#fff',
                  borderRadius: 10,
                  width: 32,
                  height: 32,
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                ←
              </button>
            </>
          ) : (
            <button
              onClick={() => setCollapsed(false)}
              style={{
                border: 'none',
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                color: '#fff',
                width: 40,
                height: 40,
                borderRadius: 12,
                cursor: 'pointer',
                fontWeight: 700,
                boxShadow: '0 8px 18px rgba(124, 58, 237, 0.18)',
              }}
            >
              M
            </button>
          )}
        </div>

        {!collapsed && (
          <div style={{ padding: '14px 18px 8px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                borderRadius: 999,
                background: roleInfo.bg,
                color: roleInfo.color,
                border: `1px solid ${roleInfo.border}`,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: roleInfo.color,
                }}
              />
              {roleInfo.label}
            </div>
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px 16px' }}>
          {!collapsed && (
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#94a3b8',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '10px 10px 12px',
              }}
            >
              Navigation
            </div>
          )}

          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <SidebarMenuItem
                key={item.path}
                item={item}
                isActive={isActive}
                collapsed={collapsed}
              />
            );
          })}
        </div>

        <div
          style={{
            padding: '14px 12px',
            borderTop: '1px solid #f1f5f9',
            background: '#fff',
          }}
        >
          {!collapsed && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 12,
                borderRadius: 16,
                background: '#f8fafc',
                border: '1px solid #e5e7eb',
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: roleInfo.bg,
                  color: roleInfo.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 12,
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#0f172a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {userName || 'Utilisateur'}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{roleInfo.label}</div>
              </div>
            </div>
          )}

          <button
            onClick={logout}
            style={{
              width: '100%',
              border: '1px solid #fecaca',
              background: '#fff5f5',
              color: '#dc2626',
              borderRadius: 12,
              padding: collapsed ? '10px' : '10px 14px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 8,
            }}
          >
            <span>⎋</span>
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      <main
        style={{
          marginLeft: collapsed ? 76 : 260,
          width: '100%',
          transition: 'all 0.25s ease',
          minHeight: '100vh',
        }}
      >
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 90,
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid #e5e7eb',
            height: 68,
            padding: '0 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 2 }}>
              MarketingCloudOps / Espace {roleInfo.label}
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
              {currentPage}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                padding: '6px 12px',
                borderRadius: 999,
                background: '#f5f3ff',
                color: '#7c3aed',
                border: '1px solid #ddd6fe',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              v2.0
            </div>

            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: roleInfo.bg,
                color: roleInfo.color,
                border: `1px solid ${roleInfo.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 12,
              }}
            >
              {initials}
            </div>
          </div>
        </header>

        <section style={{ padding: 28 }}>
          <div
            style={{
              maxWidth: 1440,
              margin: '0 auto',
            }}
          >
            {children}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Layout;