import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

/* ─── Palette ────────────────────────────────────────────────── */
const DP = {
  gold:     '#f5a623',
  goldDark: '#d4881a',
  goldGlow: 'rgba(245,166,35,0.12)',
  dark:     '#16120d',
  dark2:    '#1c1814',
  card:     'rgba(255,255,255,0.03)',
  cardHov:  'rgba(255,255,255,0.06)',
  border:   'rgba(255,255,255,0.07)',
  borderG:  'rgba(245,166,35,0.25)',
  text:     '#ffffff',
  muted:    'rgba(255,255,255,0.42)',
  muted2:   'rgba(255,255,255,0.22)',
  blue:     '#3b82f6',
  green:    '#22c55e',
  red:      '#ef4444',
  font:     "'Montserrat','Plus Jakarta Sans','Segoe UI',sans-serif",
};

const TYPE = {
  email: { label: 'Email', icon: '📧', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)'  },
  sms:   { label: 'SMS',   icon: '📱', color: '#22c55e', bg: 'rgba(34,197,94,0.12)'   },
  push:  { label: 'Push',  icon: '🔔', color: '#f5a623', bg: 'rgba(245,166,35,0.12)'  },
};

const FEATURES = [
  { icon: '📧', title: 'Campagnes Multi-Canal',  desc: 'Email, SMS et Push depuis une seule plateforme unifiée.',                color: '#3b82f6', bg: 'rgba(59,130,246,0.08)'  },
  { icon: '📊', title: 'Analytics & KPIs',        desc: 'Suivez vos performances en temps réel avec des dashboards détaillés.', color: '#f5a623', bg: 'rgba(245,166,35,0.08)'  },
  { icon: '🎯', title: 'Segmentation Avancée',    desc: 'Ciblez précisément vos audiences avec des segments dynamiques.',        color: '#22c55e', bg: 'rgba(34,197,94,0.08)'   },
  { icon: '🔒', title: 'Multi-Tenant Sécurisé',   desc: 'Architecture isolée par client avec gestion des rôles et droits.',     color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)'  },
  { icon: '⚡', title: 'Automatisation',           desc: 'Planifiez vos campagnes et automatisez vos workflows marketing.',      color: '#ec4899', bg: 'rgba(236,72,153,0.08)'  },
  { icon: '📋', title: 'Gestion des Contacts',    desc: 'Importez et gérez vos listes de contacts avec des outils puissants.',  color: '#14b8a6', bg: 'rgba(20,184,166,0.08)'  },
];

const STATS = [
  { value: '3',    label: 'Apps déployées',   icon: '🚀' },
  { value: '24',   label: 'Villes actives',   icon: '🏙️' },
  { value: '100%', label: 'Uptime garanti',   icon: '✅' },
  { value: '3',    label: 'Canaux marketing', icon: '📡' },
];

const ROLES = [
  { icon: '👑', title: 'Administrateur',  desc: 'Gestion complète : utilisateurs, clients, campagnes, analytics.',   color: '#f5a623', bg: 'rgba(245,166,35,0.07)', border: 'rgba(245,166,35,0.22)'  },
  { icon: '🎯', title: 'Resp. Marketing', desc: 'Création et suivi des campagnes, contacts, segments et reporting.',  color: '#3b82f6', bg: 'rgba(59,130,246,0.07)', border: 'rgba(59,130,246,0.22)'  },
  { icon: '👤', title: 'Client',          desc: 'Dashboard personnalisé et inscription aux campagnes disponibles.',   color: '#22c55e', bg: 'rgba(34,197,94,0.07)',  border: 'rgba(34,197,94,0.22)'   },
];

/* ─── Count-up hook ──────────────────────────────────────────── */
function useCountUp(target, duration = 1400) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const num = parseInt(target);
    if (isNaN(num)) { setCount(target); return; }
    let current = 0;
    const step = num / (duration / 16);
    const timer = setInterval(() => {
      current += step;
      if (current >= num) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current) + (String(target).includes('%') ? '%' : ''));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

/* ─── StatCard ───────────────────────────────────────────────── */
function StatCard({ value, label, icon }) {
  const count = useCountUp(value);
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        textAlign: 'center', padding: '26px 16px',
        background: hov ? 'rgba(245,166,35,0.07)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hov ? 'rgba(245,166,35,0.3)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 16, transition: 'all 0.25s',
        transform: hov ? 'translateY(-3px)' : 'none',
      }}>
      <div style={{ fontSize: 30, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 38, fontWeight: 900, color: DP.gold, lineHeight: 1, marginBottom: 8 }}>{count}</div>
      <div style={{ fontSize: 11, color: DP.muted, textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>{label}</div>
    </div>
  );
}

/* ─── Modal inscription ──────────────────────────────────────── */
function InscriptionModal({ campagne, onClose }) {
  const navigate = useNavigate();
  const token    = localStorage.getItem('token');
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const tc = TYPE[campagne.type?.toLowerCase()] || TYPE.email;

  const handleInscription = async () => {
    if (!token) { navigate('/login'); return; }
    setLoading(true);
    try {
      await api.post(`/api/campagnes/${campagne.id}/inscrire`);
      setDone(true);
    } catch (err) {
      alert('Erreur: ' + (err.response?.data?.message || err.message));
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(10,8,5,0.88)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#1c1814', border: '1px solid rgba(245,166,35,0.2)',
        borderRadius: 22, width: '100%', maxWidth: 460,
        overflow: 'hidden', boxShadow: '0 28px 70px rgba(0,0,0,0.6)',
      }}>
        {/* header */}
        <div style={{ background: DP.dark, padding: '20px 26px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: DP.gold, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 5 }}>Inscription campagne</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>{campagne.title}</div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: DP.muted, cursor: 'pointer', fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <div style={{ padding: 26 }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
              <div style={{ fontSize: 19, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Inscription réussie !</div>
              <p style={{ fontSize: 13, color: DP.muted, lineHeight: 1.7, marginBottom: 24 }}>
                Vous êtes inscrit à <strong style={{ color: '#fff' }}>{campagne.title}</strong>.<br />
                Canal : <strong style={{ color: tc.color }}>{tc.label}</strong>
              </p>
              <button onClick={onClose} style={{ background: DP.gold, color: DP.dark, border: 'none', padding: '11px 28px', borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>Fermer</button>
            </div>
          ) : (
            <>
              {/* campagne info */}
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 22 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 46, height: 46, borderRadius: 11, background: tc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{tc.icon}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 3 }}>{campagne.title}</div>
                    <div style={{ fontSize: 12, color: DP.muted }}>
                      Canal : <span style={{ color: tc.color, fontWeight: 700 }}>{tc.label}</span>
                      {campagne.client?.name && <> · <span style={{ color: DP.muted2 }}>{campagne.client.name}</span></>}
                    </div>
                  </div>
                </div>
              </div>

              {!token ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
                  <p style={{ fontSize: 13, color: DP.muted, lineHeight: 1.7, marginBottom: 22 }}>
                    Vous devez être <strong style={{ color: '#fff' }}>connecté</strong> pour vous inscrire.
                  </p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'none', fontSize: 13, fontWeight: 700, color: DP.muted, cursor: 'pointer' }}>Annuler</button>
                    <button onClick={() => navigate('/login')} style={{ flex: 2, padding: '11px', borderRadius: 10, border: 'none', background: DP.gold, fontSize: 13, fontWeight: 800, color: DP.dark, cursor: 'pointer' }}>Se connecter →</button>
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: 13, color: DP.muted, lineHeight: 1.7, marginBottom: 22 }}>
                    Vous recevrez les communications via <strong style={{ color: tc.color }}>{tc.label}</strong>.
                  </p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'none', fontSize: 13, fontWeight: 700, color: DP.muted, cursor: 'pointer' }}>Annuler</button>
                    <button onClick={handleInscription} disabled={loading} style={{ flex: 2, padding: '11px', borderRadius: 10, border: 'none', background: DP.gold, fontSize: 13, fontWeight: 800, color: DP.dark, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                      {loading ? 'Inscription...' : "✓ S'inscrire"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const navigate = useNavigate();
  // ⚠️ FIX : on ne redirige plus automatiquement — l'utilisateur peut visiter la home même connecté
  const token = localStorage.getItem('token');

  const [scrolled,    setScrolled]    = useState(false);
  const [campagnes,   setCampagnes]   = useState([]);
  const [loadingCamp, setLoadingCamp] = useState(true);
  const [typeFilter,  setTypeFilter]  = useState('all');
  const [search,      setSearch]      = useState('');
  const [selected,    setSelected]    = useState(null);
  const [menuOpen,    setMenuOpen]    = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    api.get('/api/campagnes/public')
      .then(r => setCampagnes(Array.isArray(r.data) ? r.data : r.data.data || []))
      .catch(() => setCampagnes([]))
      .finally(() => setLoadingCamp(false));
  }, []);

  const filteredCamp = campagnes.filter(c => {
    const mT = typeFilter === 'all' || c.type?.toLowerCase() === typeFilter;
    const mQ = !search || c.title?.toLowerCase().includes(search.toLowerCase());
    return mT && mQ;
  });

  return (
    <div style={{ fontFamily: DP.font, background: DP.dark, color: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(22,18,13,0.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(245,166,35,0.12)' : '1px solid transparent',
        transition: 'all 0.3s', padding: '0 5%', height: 66,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div style={{ width: 34, height: 34, position: 'relative', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 22, height: 22, background: DP.gold, borderRadius: 6 }} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, background: 'rgba(245,166,35,0.35)', borderRadius: 4 }} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.5px' }}>
            Digi<span style={{ color: DP.gold }}>Pip</span>
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
          {[['#campagnes','Campagnes'], ['#services','Services'], ['#roles','Rôles']].map(([href, lbl]) => (
            <a key={lbl} href={href} style={{ fontSize: 13, fontWeight: 600, color: DP.muted, textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = DP.muted}>{lbl}</a>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {token && (
            <button onClick={() => navigate('/dashboard')} style={{
              background: 'rgba(245,166,35,0.1)', color: DP.gold,
              border: '1px solid rgba(245,166,35,0.25)',
              padding: '8px 18px', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}>Dashboard</button>
          )}
          <button onClick={() => navigate('/login')} style={{
            background: DP.gold, color: DP.dark, border: 'none',
            padding: '9px 22px', borderRadius: 9, fontSize: 13, fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(245,166,35,0.3)', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = DP.goldDark; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = DP.gold; e.currentTarget.style.transform = 'none'; }}>
            {token ? 'Mon compte →' : 'Se connecter →'}
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden', padding: '100px 5% 60px', textAlign: 'center',
      }}>
        {/* Grid bg */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,255,255,0.014) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.014) 1px, transparent 1px)', backgroundSize: '52px 52px' }} />
        {/* Glow */}
        <div style={{ position: 'absolute', top: '18%', left: '50%', transform: 'translateX(-50%)', width: 750, height: 750, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.09) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 820 }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.22)', borderRadius: 30, padding: '7px 20px', marginBottom: 30 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: DP.green, display: 'inline-block', boxShadow: '0 0 8px rgba(34,197,94,0.6)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: DP.gold, textTransform: 'uppercase', letterSpacing: '2px' }}>Plateforme Marketing Cloud</span>
          </div>

          <h1 style={{ fontSize: 'clamp(36px, 5.5vw, 70px)', fontWeight: 900, lineHeight: 1.08, margin: '0 0 22px', letterSpacing: '-2px' }}>
            Gérez vos campagnes<br /><span style={{ color: DP.gold }}>marketing</span> intelligemment
          </h1>

          <div style={{ width: 52, height: 3, background: `linear-gradient(to right, ${DP.gold}, rgba(245,166,35,0.15))`, borderRadius: 2, margin: '0 auto 26px' }} />

          <p style={{ fontSize: 16, color: DP.muted, lineHeight: 1.8, maxWidth: 560, margin: '0 auto 44px' }}>
            DigiPip est la plateforme multi-tenant de DigiLab Solutions pour gérer vos campagnes <strong style={{ color: 'rgba(255,255,255,0.7)' }}>Email, SMS et Push</strong> depuis un seul endroit.
          </p>

          {/* Canaux badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 36, flexWrap: 'wrap' }}>
            {Object.entries(TYPE).map(([key, t]) => (
              <span key={key} style={{ background: t.bg, color: t.color, border: `1px solid ${t.color}30`, padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
                {t.icon} {t.label}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/login')} style={{
              background: DP.gold, color: DP.dark, border: 'none',
              padding: '14px 34px', borderRadius: 11, fontSize: 14, fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 8px 28px rgba(245,166,35,0.32)', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(245,166,35,0.42)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(245,166,35,0.32)'; }}>
              Accéder à la plateforme →
            </button>
            <button onClick={() => document.getElementById('campagnes')?.scrollIntoView({ behavior: 'smooth' })} style={{
              background: 'transparent', color: DP.muted, border: '1px solid rgba(255,255,255,0.14)',
              padding: '14px 34px', borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,166,35,0.4)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = DP.muted; }}>
              Voir les campagnes ↓
            </button>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: '64px 5%', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 920, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {STATS.map(s => <StatCard key={s.label} {...s} />)}
        </div>
      </section>

      {/* ── CAMPAGNES ── */}
      <section id="campagnes" style={{ padding: '80px 5%', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: DP.gold, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: 14 }}>Campagnes disponibles</div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 900, margin: '0 0 14px', letterSpacing: '-1px' }}>Inscrivez-vous à nos campagnes</h2>
            <p style={{ fontSize: 15, color: DP.muted, maxWidth: 460, margin: '0 auto' }}>Parcourez les campagnes actives et rejoignez celles qui vous intéressent.</p>
          </div>

          {/* Filtres */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 26, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 13, padding: '12px 16px' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, opacity: 0.35 }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une campagne..."
                style={{ width: '100%', padding: '9px 14px 9px 36px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 13, color: '#fff', fontFamily: DP.font, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[['all','Tous'], ['email','📧 Email'], ['sms','📱 SMS'], ['push','🔔 Push']].map(([val, lbl]) => (
                <button key={val} onClick={() => setTypeFilter(val)} style={{
                  padding: '7px 14px', borderRadius: 20, fontSize: 11.5, fontWeight: 700,
                  border: `1px solid ${typeFilter === val ? DP.gold : 'rgba(255,255,255,0.12)'}`,
                  background: typeFilter === val ? 'rgba(245,166,35,0.12)' : 'transparent',
                  color: typeFilter === val ? DP.gold : DP.muted, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}>{lbl}</button>
              ))}
            </div>
          </div>

          {/* Grille campagnes */}
          {loadingCamp ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 22, height: 180 }}>
                  <div style={{ width: '60%', height: 22, background: 'rgba(255,255,255,0.06)', borderRadius: 6, marginBottom: 12 }} />
                  <div style={{ width: '40%', height: 16, background: 'rgba(255,255,255,0.04)', borderRadius: 4, marginBottom: 8 }} />
                  <div style={{ width: '80%', height: 14, background: 'rgba(255,255,255,0.04)', borderRadius: 4 }} />
                </div>
              ))}
            </div>
          ) : filteredCamp.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '52px 20px' }}>
              <div style={{ fontSize: 48, opacity: 0.2, marginBottom: 14 }}>📢</div>
              <div style={{ fontSize: 15, color: DP.muted, fontWeight: 500 }}>Aucune campagne disponible pour le moment</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {filteredCamp.map(c => {
                const tc = TYPE[c.type?.toLowerCase()] || TYPE.email;
                return (
                  <CampagneCard key={c.id} c={c} tc={tc} onSelect={() => setSelected(c)} />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" style={{ padding: '80px 5%', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: DP.gold, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: 14 }}>Nos Services</div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 900, margin: '0 0 14px', letterSpacing: '-1px' }}>Tout ce que DigiPip offre</h2>
            <p style={{ fontSize: 15, color: DP.muted, maxWidth: 440, margin: '0 auto' }}>Une plateforme complète pour gérer vos campagnes marketing de A à Z.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {FEATURES.map((f, i) => <FeatureCard key={i} f={f} />)}
          </div>
        </div>
      </section>

      {/* ── RÔLES ── */}
      <section id="roles" style={{ padding: '80px 5%', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 920, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: DP.gold, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: 14 }}>Accès & Rôles</div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 900, margin: '0 0 14px', letterSpacing: '-1px' }}>Une plateforme pour chaque profil</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {ROLES.map((r, i) => <RoleCard key={i} r={r} />)}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '90px 5%', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 650, height: 650, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 50px)', fontWeight: 900, margin: '0 0 18px', letterSpacing: '-1px' }}>
            Prêt à rejoindre<br /><span style={{ color: DP.gold }}>DigiPip ?</span>
          </h2>
          <p style={{ fontSize: 15, color: DP.muted, lineHeight: 1.8, marginBottom: 38 }}>
            Connectez-vous et inscrivez-vous aux campagnes qui vous intéressent.
          </p>
          <button onClick={() => navigate('/login')} style={{
            background: DP.gold, color: DP.dark, border: 'none',
            padding: '15px 38px', borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(245,166,35,0.32)', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(245,166,35,0.42)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(245,166,35,0.32)'; }}>
            Accéder à la plateforme →
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '28px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 15, height: 15, background: DP.gold, borderRadius: 4 }} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 11, height: 11, background: 'rgba(245,166,35,0.35)', borderRadius: 3 }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 900 }}>Digi<span style={{ color: DP.gold }}>Pip</span></span>
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)', margin: 0 }}>
          © 2026 DigiPip — <a href="https://digilabsolutions.tn" target="_blank" rel="noreferrer" style={{ color: DP.gold, textDecoration: 'none' }}>DigiLab Solutions</a>
        </p>
        <button onClick={() => navigate('/login')} style={{ background: 'transparent', color: DP.gold, border: '1px solid rgba(245,166,35,0.25)', padding: '7px 18px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Se connecter</button>
      </footer>

      {selected && <InscriptionModal campagne={selected} onClose={() => setSelected(null)} />}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        input::placeholder { color: rgba(255,255,255,0.28); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #16120d; }
        ::-webkit-scrollbar-thumb { background: rgba(245,166,35,0.28); border-radius: 3px; }
      `}</style>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────── */
function CampagneCard({ c, tc, onSelect }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'rgba(255,255,255,0.055)' : 'rgba(255,255,255,0.025)',
        border: `1px solid ${hov ? 'rgba(245,166,35,0.32)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 16, padding: 22, transition: 'all 0.22s',
        transform: hov ? 'translateY(-4px)' : 'none',
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <span style={{ background: tc.bg, color: tc.color, padding: '4px 12px', borderRadius: 20, fontSize: 11.5, fontWeight: 700 }}>{tc.icon} {tc.label}</span>
        <span style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>Active</span>
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: '0 0 8px', lineHeight: 1.4 }}>{c.title}</h3>
      {c.client?.name && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.32)', marginBottom: 6 }}>🏢 {c.client.name}</div>}
      {c.dateScheduled && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.32)', marginBottom: 14 }}>🕐 {new Date(c.dateScheduled).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' })}</div>}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '14px 0' }} />
      <button onClick={onSelect} style={{
        width: '100%', padding: '10px', borderRadius: 9,
        background: hov ? 'rgba(245,166,35,1)' : 'rgba(245,166,35,0.1)',
        color: hov ? '#16120d' : '#f5a623',
        border: `1px solid ${hov ? '#f5a623' : 'rgba(245,166,35,0.25)'}`,
        fontSize: 12.5, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s',
      }}>S'inscrire à cette campagne →</button>
    </div>
  );
}

function FeatureCard({ f }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? f.bg : 'rgba(255,255,255,0.02)',
        border: `1px solid ${hov ? f.color + '40' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 16, padding: '28px 24px', transition: 'all 0.25s',
        transform: hov ? 'translateY(-4px)' : 'none',
      }}>
      <div style={{ width: 50, height: 50, borderRadius: 13, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 18 }}>{f.icon}</div>
      <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 10px', color: '#fff' }}>{f.title}</h3>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
    </div>
  );
}

function RoleCard({ r }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? r.bg : 'rgba(255,255,255,0.02)',
        border: `1px solid ${hov ? r.border : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 16, padding: '34px 24px', textAlign: 'center', transition: 'all 0.25s',
        transform: hov ? 'translateY(-4px)' : 'none',
      }}>
      <div style={{ fontSize: 38, marginBottom: 16 }}>{r.icon}</div>
      <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 10px', color: r.color }}>{r.title}</h3>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, margin: 0 }}>{r.desc}</p>
    </div>
  );
}