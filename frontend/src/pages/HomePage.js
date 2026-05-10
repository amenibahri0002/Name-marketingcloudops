import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const DP = {
  gold:     '#f5a623',
  goldDark: '#d4881a',
  goldGlow: 'rgba(245,166,35,0.12)',
  dark:     '#16120d',
  bg:       '#f6f3ee',
  card:     '#ffffff',
  text:     '#1a160e',
  muted:    '#9c8f7a',
  border:   '#ede8df',
  blue:     '#3b82f6',
  green:    '#22c55e',
  red:      '#ef4444',
  font:     "'Montserrat', 'Open Sans', sans-serif",
};

const TYPE = {
  email: { label: 'Email', icon: '📧', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  sms:   { label: 'SMS',   icon: '📱', color: '#22c55e', bg: 'rgba(34,197,94,0.1)'  },
  push:  { label: 'Push',  icon: '🔔', color: '#f5a623', bg: 'rgba(245,166,35,0.1)' },
};

const FEATURES = [
  { icon: '📧', title: 'Campagnes Multi-Canal',  desc: 'Créez et envoyez des campagnes Email, SMS et Push depuis une seule plateforme.', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)'  },
  { icon: '📊', title: 'Analytics & KPIs',        desc: 'Suivez vos performances en temps réel avec des tableaux de bord détaillés.',      color: '#f5a623', bg: 'rgba(245,166,35,0.08)'  },
  { icon: '🎯', title: 'Segmentation Avancée',    desc: 'Ciblez précisément vos audiences avec des segments dynamiques.',                   color: '#22c55e', bg: 'rgba(34,197,94,0.08)'   },
  { icon: '🔒', title: 'Multi-Tenant Sécurisé',   desc: 'Architecture isolée par client avec gestion des rôles et permissions.',           color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)'  },
  { icon: '⚡', title: 'Automatisation',           desc: 'Planifiez vos campagnes et automatisez vos workflows marketing.',                 color: '#ec4899', bg: 'rgba(236,72,153,0.08)'  },
  { icon: '📋', title: 'Gestion des Contacts',    desc: 'Importez et gérez vos listes de contacts avec des outils puissants.',             color: '#14b8a6', bg: 'rgba(20,184,166,0.08)'  },
];

const STATS = [
  { value: '3',    label: 'Apps déployées',   icon: '🚀' },
  { value: '24',   label: 'Villes actives',   icon: '🏙️' },
  { value: '100%', label: 'Satisfaction CDC', icon: '✅' },
  { value: '3',    label: 'Canaux marketing', icon: '📡' },
];

const ROLES = [
  { icon: '👑', title: 'Administrateur',  desc: 'Gestion complète de la plateforme, des utilisateurs et des clients.',      color: '#f5a623', bg: 'rgba(245,166,35,0.08)', border: 'rgba(245,166,35,0.2)'  },
  { icon: '🎯', title: 'Resp. Marketing', desc: 'Création et suivi des campagnes, gestion des contacts et segments.',        color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)'  },
  { icon: '👤', title: 'Client',          desc: 'Dashboard personnalisé et inscription aux campagnes disponibles.',          color: '#22c55e', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.2)'   },
];

function useCountUp(target, duration = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const num = parseInt(target);
    if (isNaN(num)) { setCount(target); return; }
    let start = 0;
    const step = num / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start) + (target.toString().includes('%') ? '%' : ''));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function StatCard({ value, label, icon }) {
  const count = useCountUp(value);
  return (
    <div style={{ textAlign: 'center', padding: '24px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(245,166,35,0.15)', borderRadius: 14, transition: 'all 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,166,35,0.06)'; e.currentTarget.style.borderColor = 'rgba(245,166,35,0.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(245,166,35,0.15)'; }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 36, fontWeight: 900, color: DP.gold, lineHeight: 1, marginBottom: 6 }}>{count}</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
    </div>
  );
}

/* ── Modal inscription ── */
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
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(22,18,13,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#1e1810', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 20, width: '100%', maxWidth: 460, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>

        <div style={{ background: DP.dark, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: DP.gold, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 4 }}>Inscription campagne</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>{campagne.title}</div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>

        <div style={{ padding: '24px' }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Inscription réussie !</div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: 24 }}>
                Vous êtes inscrit à <strong style={{ color: '#fff' }}>{campagne.title}</strong>.<br />
                Canal : <strong style={{ color: tc.color }}>{tc.label}</strong>
              </p>
              <button onClick={onClose} style={{ background: DP.gold, color: DP.dark, border: 'none', padding: '11px 28px', borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>Fermer</button>
            </div>
          ) : (
            <>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: tc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{tc.icon}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{campagne.title}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                      Canal : <span style={{ color: tc.color, fontWeight: 700 }}>{tc.label}</span>
                      {campagne.client?.name && <> · {campagne.client.name}</>}
                    </div>
                  </div>
                </div>
              </div>

              {!token ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: 20 }}>
                    Vous devez être <strong style={{ color: '#fff' }}>connecté</strong> pour vous inscrire à cette campagne.
                  </p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'none', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>Annuler</button>
                    <button onClick={() => navigate('/login')} style={{ flex: 2, padding: '11px', borderRadius: 10, border: 'none', background: DP.gold, fontSize: 13, fontWeight: 800, color: DP.dark, cursor: 'pointer' }}>Se connecter →</button>
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: 20 }}>
                    Vous recevrez les communications de cette campagne via <strong style={{ color: tc.color }}>{tc.label}</strong>.
                  </p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'none', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>Annuler</button>
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
  const token    = localStorage.getItem('token');

  const [scrolled,       setScrolled]       = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [hoveredRole,    setHoveredRole]    = useState(null);
  const [hoveredCard,    setHoveredCard]    = useState(null);
  const [campagnes,      setCampagnes]      = useState([]);
  const [loadingCamp,    setLoadingCamp]    = useState(true);
  const [typeFilter,     setTypeFilter]     = useState('all');
  const [search,         setSearch]         = useState('');
  const [selected,       setSelected]       = useState(null);

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
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: scrolled ? 'rgba(22,18,13,0.95)' : 'transparent', backdropFilter: scrolled ? 'blur(12px)' : 'none', borderBottom: scrolled ? '1px solid rgba(245,166,35,0.1)' : '1px solid transparent', transition: 'all 0.3s', padding: '0 5%', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, position: 'relative', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 20, height: 20, background: DP.gold, borderRadius: 5 }} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, background: 'rgba(245,166,35,0.35)', borderRadius: 4 }} />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 900 }}>Digi<span style={{ color: DP.gold }}>Pip</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {[['#campagnes','Campagnes'], ['#services','Services'], ['#roles','Rôles']].map(([href, lbl]) => (
            <a key={lbl} href={href} style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>{lbl}</a>
          ))}
        </div>
        <button onClick={() => navigate('/login')} style={{ background: DP.gold, color: DP.dark, border: 'none', padding: '9px 22px', borderRadius: 9, fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: DP.font }}
          onMouseEnter={e => { e.currentTarget.style.background = '#d4881a'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = DP.gold; e.currentTarget.style.transform = 'none'; }}>
          Se connecter →
        </button>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '100px 5% 60px', textAlign: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.25)', borderRadius: 30, padding: '6px 18px', marginBottom: 28 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: DP.green, display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: DP.gold, textTransform: 'uppercase', letterSpacing: '2px' }}>Plateforme Marketing Cloud</span>
          </div>
          <h1 style={{ fontSize: 'clamp(38px, 6vw, 72px)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 20px', letterSpacing: '-2px' }}>
            Gérez vos campagnes<br /><span style={{ color: DP.gold }}>marketing</span> intelligemment
          </h1>
          <div style={{ width: 50, height: 3, background: `linear-gradient(to right, ${DP.gold}, rgba(245,166,35,0.2))`, borderRadius: 2, margin: '0 auto 24px' }} />
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, maxWidth: 560, margin: '0 auto 40px' }}>
            DigiPip est une plateforme multi-tenant de gestion des campagnes Email, SMS et Push.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/login')} style={{ background: DP.gold, color: DP.dark, border: 'none', padding: '14px 32px', borderRadius: 11, fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: DP.font, boxShadow: '0 8px 28px rgba(245,166,35,0.3)' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
              Accéder à la plateforme →
            </button>
            <button onClick={() => document.getElementById('campagnes').scrollIntoView({ behavior: 'smooth' })} style={{ background: 'transparent', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)', padding: '14px 32px', borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: DP.font }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,166,35,0.4)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}>
              Voir les campagnes ↓
            </button>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: '60px 5%', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {STATS.map(s => <StatCard key={s.label} {...s} />)}
        </div>
      </section>

      {/* ── CAMPAGNES ── */}
      <section id="campagnes" style={{ padding: '80px 5%', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: DP.gold, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: 12 }}>Campagnes disponibles</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, margin: '0 0 12px', letterSpacing: '-1px' }}>Inscrivez-vous à nos campagnes</h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', maxWidth: 480, margin: '0 auto' }}>
              Parcourez les campagnes actives et rejoignez celles qui vous intéressent.
            </p>
          </div>

          {/* Filtres */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 24, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px 16px' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher une campagne..."
              style={{ flex: 1, minWidth: 180, padding: '9px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 13, color: '#fff', fontFamily: DP.font, outline: 'none', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 6 }}>
              {[['all','Tous'], ['email','📧 Email'], ['sms','📱 SMS'], ['push','🔔 Push']].map(([val, lbl]) => (
                <button key={val} onClick={() => setTypeFilter(val)} style={{ padding: '7px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, border: `1px solid ${typeFilter === val ? DP.gold : 'rgba(255,255,255,0.12)'}`, background: typeFilter === val ? 'rgba(245,166,35,0.1)' : 'transparent', color: typeFilter === val ? DP.gold : 'rgba(255,255,255,0.45)', cursor: 'pointer', fontFamily: DP.font }}>{lbl}</button>
              ))}
            </div>
          </div>

          {/* Grille */}
          {loadingCamp ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)' }}>Chargement des campagnes...</div>
          ) : filteredCamp.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: 44, opacity: 0.3, marginBottom: 12 }}>📢</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>Aucune campagne disponible pour le moment</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {filteredCamp.map(c => {
                const tc = TYPE[c.type?.toLowerCase()] || TYPE.email;
                const h  = hoveredCard === c.id;
                return (
                  <div key={c.id} onMouseEnter={() => setHoveredCard(c.id)} onMouseLeave={() => setHoveredCard(null)}
                    style={{ background: h ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${h ? 'rgba(245,166,35,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 16, padding: '22px', transition: 'all 0.2s', transform: h ? 'translateY(-3px)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                      <span style={{ background: tc.bg, color: tc.color, padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{tc.icon} {tc.label}</span>
                      <span style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>Active</span>
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>{c.title}</h3>
                    {c.client?.name && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>🏢 {c.client.name}</div>}
                    {c.dateScheduled && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>🕐 {new Date(c.dateScheduled).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</div>}
                    <button onClick={() => setSelected(c)} style={{ width: '100%', padding: '10px', borderRadius: 9, background: h ? DP.gold : 'rgba(245,166,35,0.1)', color: h ? DP.dark : DP.gold, border: `1px solid ${h ? DP.gold : 'rgba(245,166,35,0.25)'}`, fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: DP.font, transition: 'all 0.2s' }}>
                      🔒 S'inscrire à cette campagne
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" style={{ padding: '80px 5%', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: DP.gold, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: 12 }}>Nos Services</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, margin: '0 0 12px', letterSpacing: '-1px' }}>Tout ce que DigiPip offre</h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', maxWidth: 460, margin: '0 auto' }}>Une plateforme complète pour gérer vos campagnes marketing de A à Z.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {FEATURES.map((f, i) => (
              <div key={f.title} onMouseEnter={() => setHoveredFeature(i)} onMouseLeave={() => setHoveredFeature(null)}
                style={{ background: hoveredFeature === i ? f.bg : 'rgba(255,255,255,0.02)', border: `1px solid ${hoveredFeature === i ? f.color + '40' : 'rgba(255,255,255,0.07)'}`, borderRadius: 16, padding: '28px 24px', transition: 'all 0.25s', transform: hoveredFeature === i ? 'translateY(-4px)' : 'none' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 18 }}>{f.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 10px', color: '#fff' }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RÔLES ── */}
      <section id="roles" style={{ padding: '80px 5%', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: DP.gold, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: 12 }}>Accès & Rôles</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, margin: '0 0 12px', letterSpacing: '-1px' }}>Une plateforme pour chaque profil</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {ROLES.map((r, i) => (
              <div key={r.title} onMouseEnter={() => setHoveredRole(i)} onMouseLeave={() => setHoveredRole(null)}
                style={{ background: hoveredRole === i ? r.bg : 'rgba(255,255,255,0.02)', border: `1px solid ${hoveredRole === i ? r.border : 'rgba(255,255,255,0.07)'}`, borderRadius: 16, padding: '32px 24px', textAlign: 'center', transition: 'all 0.25s', transform: hoveredRole === i ? 'translateY(-4px)' : 'none' }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{r.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 10px', color: r.color }}>{r.title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, margin: 0 }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ padding: '80px 5%', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 580, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, margin: '0 0 16px', letterSpacing: '-1px' }}>
            Prêt à rejoindre<br /><span style={{ color: DP.gold }}>DigiPip ?</span>
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', lineHeight: 1.8, marginBottom: 36 }}>
            Connectez-vous et inscrivez-vous aux campagnes qui vous intéressent.
          </p>
          <button onClick={() => navigate('/login')} style={{ background: DP.gold, color: DP.dark, border: 'none', padding: '15px 36px', borderRadius: 11, fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: DP.font, boxShadow: '0 8px 28px rgba(245,166,35,0.3)' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            Accéder à la plateforme →
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '28px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 14, height: 14, background: DP.gold, borderRadius: 3 }} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, background: 'rgba(245,166,35,0.35)', borderRadius: 2 }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 800 }}>Digi<span style={{ color: DP.gold }}>Pip</span></span>
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', margin: 0 }}>© 2026 DigiPip — DigiLab Solutions.</p>
        <button onClick={() => navigate('/login')} style={{ background: 'transparent', color: DP.gold, border: '1px solid rgba(245,166,35,0.25)', padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: DP.font }}>Se connecter</button>
      </footer>

      {selected && <InscriptionModal campagne={selected} onClose={() => setSelected(null)} />}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        input::placeholder { color: rgba(255,255,255,0.3); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #16120d; }
        ::-webkit-scrollbar-thumb { background: rgba(245,166,35,0.3); border-radius: 3px; }
      `}</style>
    </div>
  );
}