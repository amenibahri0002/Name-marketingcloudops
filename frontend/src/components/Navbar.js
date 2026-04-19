import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav style={{ background: '#1a1a2e', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
      <div style={{ fontWeight: 'bold', fontSize: '18px' }}>MarketingCloudOps</div>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
        <Link to="/campagnes" style={{ color: 'white', textDecoration: 'none' }}>Campagnes</Link>
        <Link to="/contacts" style={{ color: 'white', textDecoration: 'none' }}>Contacts</Link>
        <span style={{ color: '#aaa' }}>{user.name}</span>
        <button onClick={handleLogout} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Déconnexion</button>
      </div>
    </nav>
  );
}

export default Navbar