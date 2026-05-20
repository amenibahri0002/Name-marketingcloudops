import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const gold = '#f5a623';
const dark = '#16120d';

const adminMenu = [
  { section: 'Principal', items: [
    { path: '/dashboard', icon: '⬛', label: 'Dashboard' },
    { path: '/users', icon: '👤', label: 'Utilisateurs' },
  ]},
  { section: 'Monitoring & DevOps', items: [
    { path: '/monitoring', icon: '◎', label: 'Monitoring' },
    { path: '/pipeline', icon: '⚙️', label: 'Pipeline DevOps' },
    { path: '/reporting', icon: '📊', label: 'Reporting' },
    { path: '/analytics', icon: '📈', label: 'Analytics' },
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
    { path: '/segments', icon: '🎯', label: 'Segments' },
  ]},
  { section: 'Analytics', items: [
    { path: '/reporting', icon: '📊', label: 'Suivi' },
    { path: '/analytics', icon: '📈', label: 'KPIs' },
  ]},
];

const clientMenu = [
  { section: 'Accueil', items: [
    { path: '/dashboard', icon: '⬛', label: 'Dashboard' },
  ]},
  { section: 'Mes Campagnes', items: [
    { path: '/mes-campagnes', icon: '📢', label: 'Mes Campagnes' },    { path: '/campagnes', icon: '📧', label: 'Mes Campagnes' },
    { path: '/reporting', icon: '📊', label: 'Résultats' },

  ]},
  { section: 'Mes Données', items: [
    { path: '/contacts', icon: '👥', label: 'Mes Contacts' },
    { path: '/segments', icon: '🎯', label: 'Mes Segments' },
  ]},
  { section: 'Compte', items: [
    { path: '/profile', icon: '👤', label: 'Mon Profil' },
  ]},
];

const NOTIFS = [
  { id:1, icon:'📢', text:'Nouvelle campagne créée', time:'Il y a 2 min', unread:true },
  { id:2, icon:'👥', text:'3 nouveaux contacts ajoutés', time:'Il y a 15 min', unread:true },
  { id:3, icon:'✅', text:'Campagne "Promo Mai" envoyée', time:'Il y a 1h', unread:false },
];

function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [userRole, setUserRole] = useState('CLIENT');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const [search, setSearch] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifs, setNotifs] = useState(NOTIFS);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Récupération rôle + infos utilisateur
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

  // Fermeture dropdowns
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

  const searchResults = search.length > 1 
    ? allPages.filter(p => p.label.toLowerCase().includes(search.toLowerCase())) 
    : [];

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const roleInfo = userRole === 'ADMIN' ? { label: 'Administrateur', short: 'AD' }
                 : userRole === 'RESPONSABLE_MARKETING' ? { label: 'Resp. Marketing', short: 'RM' }
                 : { label: 'Client', short: 'CL' };

  const initials = userName ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : roleInfo.short;
  const currentLabel = allPages.find(m => m.path === location.pathname)?.label || 'Dashboard';
  const unreadCount = notifs.filter(n => n.unread).length;

  const markAllRead = () => setNotifs(n => n.map(x => ({ ...x, unread: false })));

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'Open Sans', sans-serif", background: '#f6f3ee' }}>

      {/* ==================== SIDEBAR ==================== */}
      <aside style={{ width: 248, flexShrink: 0, background: dark, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        
        {/* Logo */}
        <div style={{ padding: '1.8rem 1.5rem 1.4rem', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width: 36, height: 36, position: 'relative', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 22, height: 22, background: gold, borderRadius: 5 }} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, background: 'rgba(245,166,35,0.4)', borderRadius: 4 }} />
          </div>
          <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>
            Digi<span style={{ color: gold }}>Pip</span>
          </div>
        </div>

        {/* Menu */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.8rem 0' }}>
          {menuGroups.map(group => (
            <div key={group.section}>
              <div style={{ padding: '1rem 1.2rem 0.4rem', fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
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
                          fontSize: '0.85rem',
                          fontWeight: 500
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

        {/* User Info */}
        <div style={{ padding: '1.2rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: dark, fontSize: '0.8rem' }}>
              {initials}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, color: 'white', fontSize: '0.9rem' }}>{userName}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{roleInfo.label}</div>
            </div>
          </div>

          <button onClick={logout} style={{ width: '100%', padding: '0.6rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#ef4444', fontWeight: 600, cursor: 'pointer' }}>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ==================== MAIN AREA ==================== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top Bar */}
        <div style={{ height: 66, background: 'white', borderBottom: '1px solid #ede8df', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem' }}>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a160e' }}>{currentLabel}</div>
            <div style={{ fontSize: '0.7rem', color: '#9c8f7a' }}>Espace {roleInfo.label}</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Search, Notifications, Profile ... (code complet disponible si besoin) */}
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', background: '#f6f3ee' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;