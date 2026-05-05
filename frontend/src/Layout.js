import React, { useState, useEffect, useRef } from 'react';
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

const gold = '#f5a623';
const dark = '#16120d';

const NOTIFS = [
  { id:1, icon:'📢', text:'Nouvelle campagne créée',       time:'Il y a 2 min',  unread:true },
  { id:2, icon:'👥', text:'3 nouveaux contacts ajoutés',   time:'Il y a 15 min', unread:true },
  { id:3, icon:'✅', text:'Campagne "Promo Mai" envoyée',  time:'Il y a 1h',     unread:true },
  { id:4, icon:'🏢', text:'Nouveau client enregistré',     time:'Il y a 3h',     unread:false },
];

function Layout({ children }) {
  const location = useLocation();
  const navigate  = useNavigate();
  const [userRole,  setUserRole]  = useState('USER');
  const [userName,  setUserName]  = useState('');
  const [userEmail, setUserEmail] = useState('');

  // Search
  const [search,       setSearch]       = useState('');
  const [searchFocus,  setSearchFocus]  = useState(false);

  // Notifications
  const [showNotifs,  setShowNotifs]  = useState(false);
  const [notifs,      setNotifs]      = useState(NOTIFS);
  const notifRef = useRef(null);

  // Profile
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role);
      } catch(err) {}
    }
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const u = JSON.parse(user);
        setUserName(u.name  || '');
        setUserEmail(u.email || '');
      } catch(err) {}
    }
  }, [location]);

  // Fermer dropdowns au clic extérieur
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setShowNotifs(false);
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

  // Recherche — filtre les pages
  const searchResults = search.length > 1
    ? allPages.filter(p => p.label.toLowerCase().includes(search.toLowerCase()))
    : [];

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getRoleInfo = () => {
    if (userRole === 'ADMIN')                  return { label: 'Administrateur',   short: 'AD' };
    if (userRole === 'RESPONSABLE_MARKETING')  return { label: 'Resp. Marketing',  short: 'RM' };
    return { label: 'Client', short: 'CL' };
  };

  const roleInfo    = getRoleInfo();
  const initials    = userName ? userName.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) : roleInfo.short;
  const currentLabel = allPages.find(m => m.path === location.pathname)?.label || 'Dashboard';
  const unreadCount  = notifs.filter(n => n.unread).length;

  const markAllRead = () => setNotifs(n => n.map(x => ({ ...x, unread: false })));

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', fontFamily:"'Open Sans', sans-serif", background:'#f6f3ee' }}>

      {/* SIDEBAR */}
      <aside style={{ width:240, flexShrink:0, background:dark, display:'flex', flexDirection:'column', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', bottom:-80, left:-80, width:260, height:260, borderRadius:'50%', background:'radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 70%)', pointerEvents:'none' }} />

        {/* Logo */}
        <div style={{ padding:'1.5rem 1.4rem 1.2rem', display:'flex', alignItems:'center', gap:10, borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width:34, height:34, position:'relative', flexShrink:0 }}>
            <div style={{ position:'absolute', top:0, left:0, width:20, height:20, background:gold, borderRadius:4 }} />
            <div style={{ position:'absolute', bottom:0, right:0, width:16, height:16, background:'rgba(245,166,35,0.35)', borderRadius:3 }} />
          </div>
          <div style={{ fontFamily:"'Montserrat', sans-serif", fontSize:'1.1rem', fontWeight:800, color:'white' }}>
            Digi<span style={{ color:gold }}>Pip</span>
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex:1, overflowY:'auto', padding:'0.5rem 0' }}>
          {menuGroups.map(group => (
            <div key={group.section}>
              <div style={{ padding:'1.2rem 1rem 0.3rem', fontSize:'0.58rem', fontWeight:700, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:2, fontFamily:"'Montserrat', sans-serif" }}>
                {group.section}
              </div>
              <ul style={{ listStyle:'none', padding:'0 0.6rem' }}>
                {group.items.map(item => {
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path} style={{ marginBottom:2 }}>
                      <Link to={item.path} style={{ textDecoration:'none' }}>
                        <div style={{
                          display:'flex', alignItems:'center', gap:10,
                          padding:'0.6rem 0.9rem', borderRadius:8,
                          fontSize:'0.82rem', fontWeight:500,
                          color: isActive ? gold : 'rgba(255,255,255,0.45)',
                          background: isActive ? 'rgba(245,166,35,0.18)' : 'transparent',
                          border: isActive ? '1px solid rgba(245,166,35,0.2)' : '1px solid transparent',
                          transition:'all 0.18s'
                        }}>
                          <span style={{ fontSize:'0.9rem', width:18, textAlign:'center' }}>{item.icon}</span>
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
        <div style={{ marginTop:'auto', padding:'1.2rem', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <div style={{ width:34, height:34, borderRadius:'50%', background:gold, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Montserrat', sans-serif", fontSize:'0.72rem', fontWeight:800, color:dark, flexShrink:0 }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize:'0.78rem', fontWeight:600, color:'white' }}>{userName}</div>
              <div style={{ fontSize:'0.65rem', color:'rgba(255,255,255,0.3)', marginTop:1 }}>{roleInfo.label}</div>
            </div>
          </div>
          <button onClick={logout} style={{ width:'100%', padding:'0.5rem', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, color:'#ef4444', fontSize:'0.75rem', fontWeight:600, cursor:'pointer', fontFamily:"'Montserrat', sans-serif" }}>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* TOPBAR */}
        <div style={{ height:60, background:'white', borderBottom:'1px solid #ede8df', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 1.8rem', flexShrink:0 }}>
          <div>
            <div style={{ fontFamily:"'Montserrat', sans-serif", fontSize:'1rem', fontWeight:800, color:'#1a160e' }}>{currentLabel}</div>
            <div style={{ fontSize:'0.68rem', color:'#9c8f7a', marginTop:1 }}>DigiPip — {roleInfo.label}</div>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:'0.8rem' }}>

            {/* 🔍 SEARCH */}
            <div style={{ position:'relative' }}>
              <div style={{
                display:'flex', alignItems:'center', gap:8,
                background: searchFocus ? 'white' : '#f6f3ee',
                border: `1px solid ${searchFocus ? gold : '#ede8df'}`,
                borderRadius:8, padding:'0.4rem 0.9rem',
                transition:'all 0.2s', minWidth:180
              }}>
                <span style={{ fontSize:'0.8rem', color:'#9c8f7a' }}>🔍</span>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onFocus={() => setSearchFocus(true)}
                  onBlur={() => setTimeout(() => { setSearchFocus(false); setSearch(''); }, 200)}
                  placeholder="Rechercher..."
                  style={{ border:'none', background:'transparent', outline:'none', fontSize:'0.78rem', color:'#1a160e', width:'100%', fontFamily:"'Open Sans', sans-serif" }}
                />
              </div>
              {/* Résultats */}
              {searchResults.length > 0 && (
                <div style={{
                  position:'absolute', top:'calc(100% + 6px)', left:0, right:0,
                  background:'white', border:'1px solid #ede8df', borderRadius:10,
                  boxShadow:'0 8px 24px rgba(0,0,0,0.08)', zIndex:1000, overflow:'hidden'
                }}>
                  {searchResults.map(p => (
                    <div key={p.path} onMouseDown={() => navigate(p.path)} style={{
                      padding:'10px 14px', display:'flex', alignItems:'center', gap:10,
                      fontSize:'0.82rem', fontWeight:500, color:'#1a160e',
                      cursor:'pointer', transition:'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background='#f6f3ee'}
                    onMouseLeave={e => e.currentTarget.style.background='white'}>
                      <span>{p.icon}</span><span>{p.label}</span>
                    </div>
                  ))}
                </div>
              )}
              {search.length > 1 && searchResults.length === 0 && (
                <div style={{ position:'absolute', top:'calc(100% + 6px)', left:0, right:0, background:'white', border:'1px solid #ede8df', borderRadius:10, padding:'12px 14px', fontSize:'0.78rem', color:'#9c8f7a', zIndex:1000 }}>
                  Aucun résultat
                </div>
              )}
            </div>

            {/* 🔔 NOTIFICATIONS */}
            <div style={{ position:'relative' }} ref={notifRef}>
              <div onClick={() => { setShowNotifs(v => !v); setShowProfile(false); }} style={{
                width:34, height:34, borderRadius:8,
                border:`1px solid ${showNotifs ? gold : '#ede8df'}`,
                background: showNotifs ? 'rgba(245,166,35,0.08)' : 'transparent',
                display:'flex', alignItems:'center', justifyContent:'center',
                cursor:'pointer', fontSize:'0.85rem', position:'relative', transition:'all 0.2s'
              }}>
                🔔
                {unreadCount > 0 && (
                  <div style={{ position:'absolute', top:-4, right:-4, background:gold, color:dark, fontSize:'0.5rem', fontWeight:800, width:15, height:15, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Montserrat', sans-serif" }}>
                    {unreadCount}
                  </div>
                )}
              </div>

              {showNotifs && (
                <div style={{ position:'absolute', top:'calc(100% + 8px)', right:0, width:300, background:'white', border:'1px solid #ede8df', borderRadius:12, boxShadow:'0 12px 32px rgba(0,0,0,0.1)', zIndex:1000, overflow:'hidden' }}>
                  <div style={{ padding:'12px 16px', borderBottom:'1px solid #ede8df', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:'0.82rem', fontWeight:800, color:'#1a160e' }}>Notifications</span>
                    <span onClick={markAllRead} style={{ fontSize:'0.72rem', color:gold, cursor:'pointer', fontWeight:700 }}>Tout lire</span>
                  </div>
                  {notifs.map(n => (
                    <div key={n.id} onClick={() => setNotifs(ns => ns.map(x => x.id===n.id ? {...x, unread:false} : x))} style={{
                      padding:'11px 16px', display:'flex', alignItems:'flex-start', gap:10,
                      background: n.unread ? 'rgba(245,166,35,0.04)' : 'white',
                      borderBottom:'1px solid #f6f3ee', cursor:'pointer', transition:'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background='#faf8f4'}
                    onMouseLeave={e => e.currentTarget.style.background = n.unread ? 'rgba(245,166,35,0.04)' : 'white'}>
                      <div style={{ width:30, height:30, borderRadius:8, background:'#f6f3ee', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.85rem', flexShrink:0 }}>{n.icon}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:'0.78rem', fontWeight: n.unread ? 700 : 500, color:'#1a160e' }}>{n.text}</div>
                        <div style={{ fontSize:'0.68rem', color:'#9c8f7a', marginTop:2 }}>{n.time}</div>
                      </div>
                      {n.unread && <div style={{ width:7, height:7, borderRadius:'50%', background:gold, flexShrink:0, marginTop:4 }} />}
                    </div>
                  ))}
                  <div style={{ padding:'10px 16px', textAlign:'center' }}>
                    <span style={{ fontSize:'0.75rem', color:gold, fontWeight:700, cursor:'pointer' }}>Voir toutes les notifications</span>
                  </div>
                </div>
              )}
            </div>

            {/* 👤 PROFILE */}
            <div style={{ position:'relative' }} ref={profileRef}>
              <div onClick={() => { setShowProfile(v => !v); setShowNotifs(false); }} style={{
                width:34, height:34, borderRadius:'50%',
                background:gold, display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily:"'Montserrat', sans-serif", fontSize:'0.72rem', fontWeight:800,
                color:dark, border:`2px solid ${showProfile ? 'rgba(245,166,35,0.6)' : 'rgba(245,166,35,0.3)'}`,
                cursor:'pointer', transition:'all 0.2s',
                boxShadow: showProfile ? '0 0 0 3px rgba(245,166,35,0.15)' : 'none'
              }}>
                {initials}
              </div>

              {showProfile && (
                <div style={{ position:'absolute', top:'calc(100% + 8px)', right:0, width:220, background:'white', border:'1px solid #ede8df', borderRadius:12, boxShadow:'0 12px 32px rgba(0,0,0,0.1)', zIndex:1000, overflow:'hidden' }}>
                  {/* Header profil */}
                  <div style={{ padding:'14px 16px', borderBottom:'1px solid #ede8df', display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:38, height:38, borderRadius:'50%', background:gold, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', fontWeight:800, color:dark, flexShrink:0 }}>
                      {initials}
                    </div>
                    <div>
                      <div style={{ fontSize:'0.82rem', fontWeight:800, color:'#1a160e' }}>{userName}</div>
                      <div style={{ fontSize:'0.68rem', color:'#9c8f7a', marginTop:1 }}>{userEmail}</div>
                      <div style={{ display:'inline-block', marginTop:3, background:'rgba(245,166,35,0.12)', color:'#d97706', fontSize:'0.6rem', fontWeight:700, padding:'1px 7px', borderRadius:10 }}>{roleInfo.label}</div>
                    </div>
                  </div>
                  {/* Actions */}
                  {[
                    { icon:'👤', label:'Mon profil',  path:'/profile'  },
                    { icon:'⚙️', label:'Paramètres',  path:'/settings' },
                  ].map(a => (
                    <div key={a.label} style={{ padding:'10px 16px', display:'flex', alignItems:'center', gap:10, fontSize:'0.8rem', color:'#1a160e', cursor:'pointer', transition:'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background='#f6f3ee'}
                      onMouseLeave={e => e.currentTarget.style.background='white'}
                      onMouseDown={() => { navigate(a.path); setShowProfile(false); }}>
                      <span>{a.icon}</span><span>{a.label}</span>
                    </div>
                  ))}
                  <div style={{ borderTop:'1px solid #ede8df', padding:'10px 16px' }}>
                    <div onClick={logout} style={{ display:'flex', alignItems:'center', gap:10, fontSize:'0.8rem', color:'#ef4444', cursor:'pointer', fontWeight:600 }}
                      onMouseEnter={e => e.currentTarget.style.opacity='0.7'}
                      onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                      <span>🚪</span><span>Déconnexion</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* CONTENT */}
        <div style={{ flex:1, overflowY:'auto', padding:'1.4rem 1.8rem', scrollbarWidth:'thin', scrollbarColor:'#ede8df transparent' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;