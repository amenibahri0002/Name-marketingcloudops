import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DP = {
  gold:    '#f5a623',
  goldDark:'#d4881a',
  dark:    '#16120d',
  dark2:   '#1e1810',
  dark3:   '#28200f',
  bg:      '#f6f3ee',
  card:    '#ffffff',
  text:    '#1a160e',
  muted:   '#9c8f7a',
  border:  '#ede8df',
  font:    "'Montserrat', 'Open Sans', sans-serif",
};

const FEATURES = [
  { icon: '📧', label: 'Campagnes Email, SMS & Push' },
  { icon: '📊', label: 'Analytics & KPIs en temps réel' },
  { icon: '🎯', label: 'Segmentation avancée' },
  { icon: '🔒', label: 'Multi-tenant sécurisé' },
];

const STATS = [
  ['3',    'Apps déployées'],
  ['24',   'Villes TN'],
  ['100%', 'CDC'],
];

export default function Login() {
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [showPass,     setShowPass]     = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [btnHover,     setBtnHover]     = useState(false);
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
    } catch {
      setError('Email ou mot de passe incorrect');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: DP.font }}>

      {/* ════════ LEFT — Dark Hero Panel (centré) ════════ */}
      <div style={{
        width: '48%',
        background: DP.dark,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 40px 80px',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
      }}>

        {/* Background glows */}
        <div style={{ position:'absolute', bottom:-120, left:-120, width:450, height:450, borderRadius:'50%', background:'radial-gradient(circle, rgba(245,166,35,0.13) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:-80, right:-60, width:320, height:320, borderRadius:'50%', background:'radial-gradient(circle, rgba(245,166,35,0.07) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'40%', right:'10%', width:180, height:180, borderRadius:'50%', background:'radial-gradient(circle, rgba(200,120,10,0.18) 0%, transparent 70%)', pointerEvents:'none' }} />

        {/* Grid pattern */}
        <div style={{
          position:'absolute', inset:0, pointerEvents:'none',
          backgroundImage:'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize:'40px 40px',
        }} />

        {/* Contenu centré */}
        <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', alignItems:'center', maxWidth:300, width:'100%' }}>

          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:36 }}>
            <div style={{ width:40, height:40, position:'relative', flexShrink:0 }}>
              <div style={{ position:'absolute', top:0, left:0, width:24, height:24, background:DP.gold, borderRadius:6, boxShadow:'0 4px 12px rgba(245,166,35,0.4)' }} />
              <div style={{ position:'absolute', bottom:0, right:0, width:18, height:18, background:'rgba(245,166,35,0.35)', borderRadius:4 }} />
            </div>
            <div style={{ fontSize:'1.4rem', fontWeight:900, color:'#fff', letterSpacing:'-0.5px' }}>
              Digi<span style={{ color:DP.gold }}>Pip</span>
            </div>
          </div>

          {/* Badge pill */}
          <div style={{
            display:'inline-flex', alignItems:'center', gap:8,
            background:'rgba(245,166,35,0.1)',
            border:'1px solid rgba(245,166,35,0.25)',
            borderRadius:30, padding:'5px 16px',
            marginBottom:24,
          }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:DP.gold, display:'inline-block', animation:'pulse 2s infinite' }} />
            <span style={{ fontSize:10, fontWeight:700, color:DP.gold, textTransform:'uppercase', letterSpacing:2 }}>
              Plateforme Marketing Cloud
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize:36, fontWeight:900, color:'#fff',
            lineHeight:1.15, margin:'0 0 16px', letterSpacing:'-1px',
            whiteSpace:'pre-line', wordBreak:'keep-all',
          }}>
            {'Gérez vos\n'}<span style={{ color:DP.gold }}>{'campagnes\n'}</span>{'intelligemment'}
          </h1>

          {/* Ligne décorative */}
          <div style={{ width:40, height:2, background:`linear-gradient(to right, ${DP.gold}, rgba(245,166,35,0.2))`, borderRadius:2, margin:'0 auto 18px' }} />

          <p style={{
            color:'rgba(255,255,255,0.4)', fontSize:13, lineHeight:1.75,
            margin:'0 0 36px', maxWidth:290,
          }}>
            Plateforme multi-tenant de gestion des campagnes marketing digitales — Email, SMS et Push.
          </p>

          {/* Feature list */}
          <div style={{ display:'flex', flexDirection:'column', gap:10, width:'100%' }}>
            {FEATURES.map(f => (
              <div key={f.label} style={{
                display:'flex', alignItems:'center', gap:12,
                background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(245,166,35,0.1)',
                borderRadius:10, padding:'9px 14px',
                textAlign:'left',
                transition:'background 0.2s, border-color 0.2s',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(245,166,35,0.06)';
                  e.currentTarget.style.borderColor = 'rgba(245,166,35,0.25)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.borderColor = 'rgba(245,166,35,0.1)';
                }}
              >
                <div style={{
                  width:30, height:30, borderRadius:8, flexShrink:0,
                  background:'rgba(245,166,35,0.12)',
                  border:'1px solid rgba(245,166,35,0.2)',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:13,
                }}>{f.icon}</div>
                <span style={{ color:'rgba(255,255,255,0.55)', fontSize:12, fontWeight:500 }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stats strip */}
        <div style={{
          position:'absolute', bottom:0, left:0, right:0,
          borderTop:'1px solid rgba(255,255,255,0.06)',
          padding:'14px 48px',
          display:'flex', justifyContent:'center', gap:40,
        }}>
          {STATS.map(([v, l]) => (
            <div key={l} style={{ textAlign:'center' }}>
              <div style={{ fontSize:15, fontWeight:900, color:DP.gold, lineHeight:1 }}>{v}</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:2, textTransform:'uppercase', letterSpacing:'0.5px' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ════════ RIGHT — Form Panel ════════ */}
      <div style={{
        flex:1, background:DP.bg,
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:'60px 40px', position:'relative',
      }}>
        {/* Top accent line */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${DP.gold}, ${DP.goldDark})` }} />

        <div style={{ width:'100%', maxWidth:400 }}>

          {/* Header */}
          <div style={{ marginBottom:32 }}>
            <div style={{
              display:'inline-flex', alignItems:'center', gap:6,
              background:DP.card, border:`1px solid ${DP.border}`,
              borderRadius:999, padding:'4px 12px', marginBottom:16,
            }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', animation:'pulse 2s infinite' }} />
              <span style={{ fontSize:10, fontWeight:700, color:DP.muted, textTransform:'uppercase', letterSpacing:'1px' }}>Système en ligne</span>
            </div>
            <h2 style={{ fontSize:26, fontWeight:900, color:DP.text, margin:'0 0 6px', letterSpacing:'-0.5px' }}>
              Connexion
            </h2>
            <p style={{ color:DP.muted, fontSize:13, margin:0 }}>
              Accédez à votre espace DigiPip
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.18)',
              borderRadius:10, padding:'10px 14px', marginBottom:18,
              color:'#ef4444', fontSize:12, fontWeight:600,
              display:'flex', alignItems:'center', gap:8,
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Email */}
            <div>
              <label style={{ fontSize:10, fontWeight:700, color:DP.muted, textTransform:'uppercase', letterSpacing:'1.5px', display:'block', marginBottom:7 }}>
                Email
              </label>
              <div style={{ position:'relative' }}>
                <input
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)} required
                  placeholder="votre@email.com"
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    width:'100%', padding:'12px 14px 12px 40px',
                    border:`1.5px solid ${focusedField === 'email' ? DP.gold : DP.border}`,
                    borderRadius:10, fontSize:13, background:DP.card, color:DP.text,
                    outline:'none', boxSizing:'border-box', fontFamily:DP.font,
                    transition:'border-color 0.2s, box-shadow 0.2s',
                    boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(245,166,35,0.1)' : 'none',
                  }}
                />
                <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', fontSize:14, opacity:0.5 }}>📧</span>
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize:10, fontWeight:700, color:DP.muted, textTransform:'uppercase', letterSpacing:'1.5px', display:'block', marginBottom:7 }}>
                Mot de passe
              </label>
              <div style={{ position:'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    width:'100%', padding:'12px 42px 12px 40px',
                    border:`1.5px solid ${focusedField === 'password' ? DP.gold : DP.border}`,
                    borderRadius:10, fontSize:13, background:DP.card, color:DP.text,
                    outline:'none', boxSizing:'border-box', fontFamily:DP.font,
                    transition:'border-color 0.2s, box-shadow 0.2s',
                    boxShadow: focusedField === 'password' ? '0 0 0 3px rgba(245,166,35,0.1)' : 'none',
                  }}
                />
                <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', fontSize:14, opacity:0.5 }}>🔒</span>
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', border:'none', background:'transparent', cursor:'pointer', fontSize:13, color:DP.muted, padding:0, lineHeight:1 }}
                >{showPass ? '🙈' : '👁️'}</button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              onMouseEnter={() => setBtnHover(true)}
              onMouseLeave={() => setBtnHover(false)}
              style={{
                width:'100%', padding:'13px',
                background: loading ? 'rgba(245,166,35,0.5)' : btnHover ? DP.goldDark : DP.gold,
                color:DP.dark, border:'none', borderRadius:10,
                fontSize:13, fontWeight:800,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily:DP.font, letterSpacing:'0.5px',
                transition:'all 0.2s', marginTop:6,
                boxShadow: btnHover && !loading ? '0 6px 20px rgba(245,166,35,0.35)' : 'none',
                transform: btnHover && !loading ? 'translateY(-1px)' : 'none',
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              }}
            >
              {loading ? (
                <>
                  <span style={{ width:14, height:14, border:`2px solid ${DP.dark}`, borderTop:'2px solid transparent', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite' }} />
                  Connexion en cours...
                </>
              ) : 'Se connecter →'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:12, margin:'24px 0' }}>
            <div style={{ flex:1, height:1, background:DP.border }} />
            <span style={{ fontSize:10, color:DP.muted, fontWeight:600, textTransform:'uppercase', letterSpacing:'1px' }}>Accès sécurisé</span>
            <div style={{ flex:1, height:1, background:DP.border }} />
          </div>

          {/* Role badges */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:24 }}>
            {[
              { role:'Admin',     color:DP.gold,     bg:'rgba(245,166,35,0.08)' },
              { role:'Marketing', color:'#3b82f6',   bg:'rgba(59,130,246,0.08)' },
              { role:'Client',    color:'#22c55e',   bg:'rgba(34,197,94,0.08)'  },
            ].map(r => (
              <div key={r.role} style={{
                background:r.bg, border:`1px solid ${r.color}22`,
                borderRadius:8, padding:'7px',
                textAlign:'center', fontSize:11, fontWeight:700, color:r.color,
              }}>{r.role}</div>
            ))}
          </div>

          {/* Footer */}
          <p style={{ textAlign:'center', fontSize:11, color:DP.muted, margin:0 }}>
            <a href="/" style={{ color:DP.gold, textDecoration:'none', fontWeight:700 }}>
             ← Retour à l'accueil
            </a>
            {' '}· DigiPip © 2026 — DigiLab Solutions
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}