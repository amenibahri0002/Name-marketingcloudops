import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DP = {
  gold:  '#f5a623',
  dark:  '#16120d',
  dark2: '#1e1810',
  bg:    '#f6f3ee',
  text:  '#1a160e',
  muted: '#9c8f7a',
  border:'#ede8df',
  font:  "'Montserrat', 'Open Sans', sans-serif",
};

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL || 'https://marketingcloudops-backend.onrender.com'}/api/auth/login`,
        { email, password }
      );
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError('Email ou mot de passe incorrect');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: DP.font }}>

      {/* LEFT — dark panel */}
      <div style={{
        width: '45%', background: DP.dark,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '60px 56px',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Glow */}
        <div style={{
          position: 'absolute', bottom: -100, left: -100,
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,166,35,0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 56 }}>
          <div style={{ width: 38, height: 38, position: 'relative', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 22, height: 22, background: DP.gold, borderRadius: 5 }} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 18, height: 18, background: 'rgba(245,166,35,0.35)', borderRadius: 4 }} />
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'white' }}>
            Digi<span style={{ color: DP.gold }}>Pip</span>
          </div>
        </div>

        <div style={{ fontSize: 10, fontWeight: 700, color: DP.gold, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 20, height: 2, background: DP.gold, display: 'inline-block' }} />
          Plateforme Marketing Cloud
        </div>

        <h1 style={{ fontSize: 36, fontWeight: 900, color: 'white', lineHeight: 1.15, margin: '0 0 20px' }}>
          Gérez vos<br />
          <span style={{ color: DP.gold }}>campagnes</span><br />
          intelligemment
        </h1>

        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.7, margin: '0 0 40px', maxWidth: 320 }}>
          Plateforme multi-tenant de gestion des campagnes marketing digitales — Email, SMS et Push.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { icon: '📧', label: 'Campagnes Email, SMS & Push' },
            { icon: '📊', label: 'Analytics & KPIs en temps réel' },
            { icon: '🎯', label: 'Segmentation avancée' },
            { icon: '🔒', label: 'Multi-tenant sécurisé' },
          ].map(f => (
            <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7,
                background: 'rgba(245,166,35,0.12)',
                border: '1px solid rgba(245,166,35,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12
              }}>
                {f.icon}
              </div>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 500 }}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — form */}
      <div style={{
        flex: 1, background: DP.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '60px 40px'
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: DP.text, margin: '0 0 6px' }}>
              Connexion
            </h2>
            <p style={{ color: DP.muted, fontSize: 13, margin: 0 }}>
              Accédez à votre espace DigiPip
        
            </p>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 10, padding: '10px 14px', marginBottom: 20,
              color: '#ef4444', fontSize: 13, fontWeight: 500
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: DP.muted, textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)} required
                placeholder="votre@email.com"
                style={{
                  width: '100%', padding: '11px 14px',
                  border: `1px solid ${DP.border}`, borderRadius: 10,
                  fontSize: 13, background: 'white', color: DP.text,
                  outline: 'none', boxSizing: 'border-box',
                  fontFamily: DP.font, transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = DP.gold}
                onBlur={e => e.target.style.borderColor = DP.border}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: DP.muted, textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 6 }}>
                Mot de passe
              </label>
              <input
                type="password" value={password}
                onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '11px 14px',
                  border: `1px solid ${DP.border}`, borderRadius: 10,
                  fontSize: 13, background: 'white', color: DP.text,
                  outline: 'none', boxSizing: 'border-box',
                  fontFamily: DP.font, transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = DP.gold}
                onBlur={e => e.target.style.borderColor = DP.border}
              />
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', padding: '13px',
                background: loading ? 'rgba(245,166,35,0.5)' : DP.gold,
                color: DP.dark, border: 'none', borderRadius: 10,
                fontSize: 13, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: DP.font, letterSpacing: '0.5px',
                transition: 'all 0.2s', marginTop: 4
              }}
            >
              {loading ? 'Connexion...' : 'Se connecter →'}
            </button>
          </form>

          <p style={{ marginTop: 28, textAlign: 'center', fontSize: 11, color: DP.muted }}>
            DigiPip © 2026 — DigiLab Solutions
          </p>
        </div>
      </div>
    </div>
  );
}