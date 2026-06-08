import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, LogOut, Home, GraduationCap, BookOpen, 
  ChevronLeft, ChevronRight, Award, CreditCard, 
  Menu, X, Bell, Settings, HelpCircle
} from 'lucide-react';

// ============================================================
// COULEURS DIGILAB
// ============================================================
const COLORS = {
  primary: '#F5A623',
  primaryLight: '#FFF8E7',
  primaryDark: '#D48A1A',
  dark: '#0A0A0A',
  darkLight: '#1A1A2E',
  gray: '#666666',
  grayLight: '#F5F5F5',
  grayBorder: '#E5E5E5',
  white: '#FFFFFF',
  green: '#10B981',
  red: '#EF4444',
};

// ============================================================
// SIDEBAR CLIENT - DYNAMIQUE POUR TOUS LES CLIENTS
// ============================================================
export default function SidebarClient() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger l'utilisateur connecte depuis le localStorage ou l'API
  useEffect(() => {
    const loadUser = () => {
      try {
        // Essayer de recuperer depuis localStorage
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser({
            nom: parsedUser.nom || parsedUser.name || parsedUser.username || parsedUser.prenom || 'Utilisateur',
            email: parsedUser.email || parsedUser.mail || '',
            avatar: parsedUser.avatar || parsedUser.photo || parsedUser.image || null,
            role: parsedUser.role || parsedUser.type || 'client',
            inscriptions: parsedUser.inscriptions || parsedUser.formations || 0,
            formationsCompletees: parsedUser.formationsCompletees || parsedUser.certificats || 0,
            notifications: parsedUser.notifications || 0,
          });
        } else if (storedToken) {
          // Si token existe mais pas de user, creer un user minimal
          setUser({
            nom: 'Client',
            email: '',
            avatar: null,
            role: 'client',
            inscriptions: 0,
            formationsCompletees: 0,
            notifications: 0,
          });
        } else {
          // Pas de session - sidebar masque ou user anonyme
          setUser(null);
        }
      } catch (error) {
        console.error('Erreur chargement user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // Ecouter les changements de localStorage (connexion/deconnexion)
    const handleStorageChange = () => {
      loadUser();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Si pas d'utilisateur, ne pas afficher le sidebar
  if (!user && !loading) {
    return null;
  }

  const menuItems = [
    { id: 'home', label: 'Accueil', icon: Home, path: '/' },
    { id: 'formations', label: 'Formations', icon: GraduationCap, path: '/campagnes' },
    { id: 'mes-formations', label: 'Mes Inscriptions', icon: BookOpen, path: '/mescampagnes', badge: user?.inscriptions || 0 },
    { id: 'certificats', label: 'Mes Certificats', icon: Award, path: '/certificats', badge: user?.formationsCompletees || 0 },
    { id: 'paiements', label: 'Paiements', icon: CreditCard, path: '/paiements' },
    { id: 'profil', label: 'Mon Profil', icon: User, path: '/profil' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    // Supprimer toutes les donnees de session
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    sessionStorage.clear();

    // Redirection vers login
    window.location.href = '/login';
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = user?.nom || 'Client';
  const displayEmail = user?.email || '';
  const displayRole = user?.role || 'client';
  const displayAvatar = user?.avatar || null;

  return (
    <>
      {/* BOUTON MOBILE */}
      <button 
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* OVERLAY MOBILE */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            className="sidebar-mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <motion.aside 
        className={"sidebar-client " + (collapsed ? 'collapsed' : '') + (mobileOpen ? ' mobile-open' : '')}
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <style>{`
          .sidebar-client {
            position: fixed;
            left: 0;
            top: 0;
            height: 100vh;
            background: ${COLORS.dark};
            color: ${COLORS.white};
            display: flex;
            flex-direction: column;
            z-index: 1000;
            box-shadow: 4px 0 20px rgba(0,0,0,0.15);
          }

          .sidebar-header {
            padding: 24px 20px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .sidebar-logo {
            width: 40px;
            height: 40px;
            background: ${COLORS.primary};
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 1.1rem;
            color: ${COLORS.white};
            flex-shrink: 0;
          }

          .sidebar-brand {
            font-size: 1.1rem;
            font-weight: 700;
            color: ${COLORS.white};
            white-space: nowrap;
            overflow: hidden;
          }

          .sidebar-brand span {
            color: ${COLORS.primary};
          }

          .sidebar-toggle {
            position: absolute;
            right: -12px;
            top: 70px;
            width: 24px;
            height: 24px;
            background: ${COLORS.primary};
            border: 2px solid ${COLORS.dark};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: ${COLORS.white};
            z-index: 1001;
            transition: transform 0.3s;
          }

          .sidebar-toggle:hover {
            transform: scale(1.1);
            background: ${COLORS.primaryDark};
          }

          .sidebar-toggle svg {
            width: 14px;
            height: 14px;
          }

          .sidebar-profile {
            padding: 20px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
          }

          .profile-card {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            background: rgba(255,255,255,0.05);
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.1);
            transition: all 0.3s;
            cursor: pointer;
            width: 100%;
            border: none;
            color: inherit;
            font-family: inherit;
            text-align: left;
          }

          .profile-card:hover {
            background: rgba(255,255,255,0.1);
            border-color: ${COLORS.primary}40;
          }

          .profile-avatar {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: ${COLORS.primary};
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.9rem;
            color: ${COLORS.white};
            flex-shrink: 0;
            border: 2px solid ${COLORS.primary}40;
            overflow: hidden;
          }

          .profile-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .profile-info {
            flex: 1;
            min-width: 0;
            overflow: hidden;
          }

          .profile-name {
            font-size: 0.9rem;
            font-weight: 600;
            color: ${COLORS.white};
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .profile-email {
            font-size: 0.75rem;
            color: ${COLORS.gray};
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .profile-role {
            display: inline-block;
            background: ${COLORS.primary}30;
            color: ${COLORS.primary};
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 0.7rem;
            font-weight: 600;
            text-transform: uppercase;
            margin-top: 4px;
          }

          .sidebar-nav {
            flex: 1;
            padding: 16px 12px;
            overflow-y: auto;
          }

          .sidebar-nav::-webkit-scrollbar { width: 4px; }
          .sidebar-nav::-webkit-scrollbar-track { background: transparent; }
          .sidebar-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

          .nav-section-title {
            font-size: 0.7rem;
            font-weight: 600;
            color: ${COLORS.gray};
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 0 8px;
            margin-bottom: 8px;
            white-space: nowrap;
            overflow: hidden;
          }

          .nav-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 14px;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s;
            margin-bottom: 4px;
            position: relative;
            color: ${COLORS.gray};
            text-decoration: none;
            border: none;
            background: none;
            width: 100%;
            font-size: 0.9rem;
            font-family: inherit;
            text-align: left;
          }

          .nav-item:hover {
            background: rgba(255,255,255,0.05);
            color: ${COLORS.white};
          }

          .nav-item.active {
            background: ${COLORS.primary}20;
            color: ${COLORS.primary};
            border: 1px solid ${COLORS.primary}30;
          }

          .nav-item.active::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 3px;
            height: 20px;
            background: ${COLORS.primary};
            border-radius: 0 3px 3px 0;
          }

          .nav-item svg {
            width: 20px;
            height: 20px;
            flex-shrink: 0;
          }

          .nav-item-label {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex: 1;
          }

          .nav-badge {
            background: ${COLORS.primary};
            color: ${COLORS.white};
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 0.7rem;
            font-weight: 700;
            flex-shrink: 0;
          }

          .sidebar-footer {
            padding: 16px;
            border-top: 1px solid rgba(255,255,255,0.1);
          }

          .logout-btn {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 14px;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s;
            color: ${COLORS.gray};
            background: none;
            border: 1px solid transparent;
            width: 100%;
            font-size: 0.9rem;
            font-family: inherit;
            text-align: left;
          }

          .logout-btn:hover {
            background: ${COLORS.red}15;
            color: ${COLORS.red};
            border-color: ${COLORS.red}30;
          }

          .logout-btn svg {
            width: 20px;
            height: 20px;
            flex-shrink: 0;
          }

          /* COLLAPSED */
          .sidebar-client.collapsed .sidebar-brand,
          .sidebar-client.collapsed .profile-info,
          .sidebar-client.collapsed .nav-item-label,
          .sidebar-client.collapsed .nav-section-title,
          .sidebar-client.collapsed .nav-badge {
            display: none;
          }

          .sidebar-client.collapsed .sidebar-header {
            justify-content: center;
            padding: 24px 10px;
          }

          .sidebar-client.collapsed .profile-card {
            justify-content: center;
            padding: 8px;
          }

          .sidebar-client.collapsed .nav-item {
            justify-content: center;
            padding: 12px;
          }

          .sidebar-client.collapsed .logout-btn {
            justify-content: center;
            padding: 12px;
          }

          .sidebar-client.collapsed .sidebar-toggle svg {
            transform: rotate(180deg);
          }

          /* TOOLTIP */
          .sidebar-client.collapsed .nav-item:hover::after,
          .sidebar-client.collapsed .logout-btn:hover::after,
          .sidebar-client.collapsed .profile-card:hover::after {
            content: attr(data-label);
            position: absolute;
            left: 70px;
            background: ${COLORS.darkLight};
            color: ${COLORS.white};
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 0.8rem;
            white-space: nowrap;
            z-index: 1002;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          }

          /* MOBILE */
          .sidebar-mobile-toggle {
            position: fixed;
            top: 16px;
            left: 16px;
            z-index: 999;
            width: 44px;
            height: 44px;
            background: ${COLORS.dark};
            border: none;
            border-radius: 10px;
            color: ${COLORS.white};
            cursor: pointer;
            display: none;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          }

          .sidebar-mobile-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 998;
          }

          .sidebar-client.mobile-open {
            transform: translateX(0) !important;
          }

          @media (max-width: 1024px) {
            .sidebar-client {
              transform: translateX(-100%);
              transition: transform 0.3s ease;
            }

            .sidebar-mobile-toggle {
              display: flex !important;
            }

            .sidebar-toggle {
              display: none;
            }
          }

          @media (min-width: 1025px) {
            .sidebar-mobile-toggle {
              display: none !important;
            }

            .sidebar-mobile-overlay {
              display: none !important;
            }
          }
        `}</style>

        {/* HEADER */}
        <div className="sidebar-header">
          <div className="sidebar-logo">D</div>
          <div className="sidebar-brand">
            Digi<span>Lab</span>
          </div>
        </div>

        {/* TOGGLE COLLAPSE */}
        <button 
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Développer' : 'Réduire'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* PROFIL - DYNAMIQUE */}
        <div className="sidebar-profile">
          <button 
            className="profile-card"
            onClick={() => { navigate('/profil'); setMobileOpen(false); }}
            data-label={displayName}
            title="Voir mon profil"
          >
            <div className="profile-avatar">
              {displayAvatar ? (
                <img src={displayAvatar} alt={displayName} />
              ) : (
                getInitials(displayName)
              )}
            </div>
            <div className="profile-info">
              <div className="profile-name">{displayName}</div>
              {displayEmail && <div className="profile-email">{displayEmail}</div>}
              <span className="profile-role">{displayRole}</span>
            </div>
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="sidebar-nav">
          <div className="nav-section-title">Menu Principal</div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.id}
                className={"nav-item " + (active ? 'active' : '')}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                data-label={item.label}
                title={collapsed ? item.label : ''}
              >
                <Icon size={20} />
                <span className="nav-item-label">{item.label}</span>
                {item.badge > 0 && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* FOOTER - DÉCONNEXION */}
        <div className="sidebar-footer">
          <button 
            className="logout-btn"
            onClick={handleLogout}
            data-label="Déconnexion"
            title={collapsed ? 'Déconnexion' : ''}
          >
            <LogOut size={20} />
            <span className="nav-item-label">Déconnexion</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}