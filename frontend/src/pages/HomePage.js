import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const DP = {
  gold:     '#f5a623',
  goldDark: '#d4881a',
  goldGlow: 'rgba(245,166,35,0.12)',
  dark:     '#16120d',
  dark2:    '#1e1810',
  dark3:    '#28200f',
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

const FEATURES = [
  {
    icon: '📧',
    title: 'Campagnes Multi-Canal',
    desc: 'Créez et envoyez des campagnes Email, SMS et Push notification depuis une seule plateforme unifiée.',
    color: DP.blue,
    bg: 'rgba(59,130,246,0.08)',
  },
  {
    icon: '📊',
    title: 'Analytics & KPIs',
    desc: "Suivez vos performances en temps réel avec des tableaux de bord détaillés et des métriques clés.",
    color: DP.gold,
    bg: DP.goldGlow,
  },
  {
    icon: '🎯',
    title: 'Segmentation Avancée',
    desc: 'Ciblez les bons contacts avec des segments dynamiques basés sur le comportement et les données.',
    color: DP.green,
    bg: 'rgba(34,197,94,0.08)',
  },
  {
    icon: '🔒',
    title: 'Multi-Tenant Sécurisé',
    desc: 'Architecture isolée par client avec gestion des rôles : Admin, Marketing, Client.',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.08)',
  },
  {
    icon: '⚡',
    title: 'Automatisation',
    desc: 'Planifiez vos campagnes, automatisez les envois et optimisez vos workflows marketing.',
    color: '#ec4899',
    bg: 'rgba(236,72,153,0.08)',
  },
  {
    icon: '📋',
    title: 'Gestion des Contacts',
    desc: "Importez, organisez et gérez vos listes de contacts avec des outils de filtrage puissants.",
    color: '#14b8a6',
    bg: 'rgba(20,184,166,0.08)',
  },
];

const STATS = [
  { value: '3',    label: 'Apps déployées',    icon: '🚀' },
  { value: '24',   label: 'Villes actives',    icon: '🏙️' },
  { value: '100%', label: 'Satisfaction CDC',  icon: '✅' },
  { value: '3',    label: 'Canaux marketing',  icon: '📡' },
];

const ROLES = [
  {
    icon: '👑',
    title: 'Administrateur',
    desc: 'Gestion complète de la plateforme, des utilisateurs et des clients.',
    color: DP.gold,
    bg: DP.goldGlow,
    border: 'rgba(245,166,35,0.2)',
  },
  {
    icon: '🎯',
    title: 'Resp. Marketing',
    desc: "Création et suivi des campagnes, gestion des contacts et segments.",
    color: DP.blue,
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.2)',
  },
  {
    icon: '👤',
    title: 'Client',
    desc: 'Accès au dashboard personnalisé et suivi de ses propres campagnes.',
    color: DP.green,
    bg: 'rgba(34,197,94,0.08)',
    border: 'rgba(34,197,94,0.2)',
  },
];

function useCountUp(target, duration = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
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
    <div style={{
      textAlign: 'center',
      padding: '24px 16px',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(245,166,35,0.15)',
      borderRadius: 14,
      transition: 'background 0.2s, border-color 0.2s',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(245,166,35,0.06)';
        e.currentTarget.style.borderColor = 'rgba(245,166,35,0.3)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
        e.currentTarget.style.borderColor = 'rgba(245,166,35,0.15)';
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 36, fontWeight: 900, color: DP.gold, lineHeight: 1, marginBottom: 6 }}>{count}</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [hoveredRole, setHoveredRole] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) navigate('/dashboard');
  }, [navigate]);

  return (
    <div style={{ fontFamily: DP.font, background: DP.dark, color: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(22,18,13,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(245,166,35,0.1)' : '1px solid transparent',
        transition: 'all 0.3s',
        padding: '0 5%',
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, position: 'relative', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 20, height: 20, background: DP.gold, borderRadius: 5 }} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, background: 'rgba(245,166,35,0.35)', borderRadius: 4 }} />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff' }}>
            Digi<span style={{ color: DP.gold }}>Pip</span>
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {['Fonctionnalités', 'Statistiques', 'Rôles'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{
              fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)',
              textDecoration: 'none', transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
            >{l}</a>
          ))}
        </div>

        {/* CTA */}
        <button onClick={() => navigate('/login')} style={{
          background: DP.gold, color: DP.dark, border: 'none',
          padding: '9px 22px', borderRadius: 9, fontSize: 13, fontWeight: 800,
          cursor: 'pointer', fontFamily: DP.font, transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = DP.goldDark; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = DP.gold; e.currentTarget.style.transform = 'none'; }}
        >
          Se connecter →
        </button>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        padding: '100px 5% 60px',
        textAlign: 'center',
      }}>
        {/* Background effects */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '50px 50px' }} />
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '10%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.25)',
            borderRadius: 30, padding: '6px 18px', marginBottom: 28,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: DP.green, display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: DP.gold, textTransform: 'uppercase', letterSpacing: '2px' }}>
              Plateforme Marketing Cloud
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(38px, 6vw, 72px)',
            fontWeight: 900, lineHeight: 1.1,
            margin: '0 0 20px', letterSpacing: '-2px',
            color: '#fff',
          }}>
            Gérez vos campagnes<br />
            <span style={{ color: DP.gold }}>marketing</span> intelligemment
          </h1>

          {/* Divider */}
          <div style={{ width: 50, height: 3, background: `linear-gradient(to right, ${DP.gold}, rgba(245,166,35,0.2))`, borderRadius: 2, margin: '0 auto 24px' }} />

          <p style={{
            fontSize: 16, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8,
            maxWidth: 560, margin: '0 auto 40px',
          }}>
            DigiPip est une plateforme multi-tenant de gestion des campagnes Email, SMS et Push — conçue pour les équipes marketing qui veulent des résultats.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/login')} style={{
              background: DP.gold, color: DP.dark, border: 'none',
              padding: '14px 32px', borderRadius: 11, fontSize: 14, fontWeight: 800,
              cursor: 'pointer', fontFamily: DP.font, transition: 'all 0.2s',
              boxShadow: '0 8px 28px rgba(245,166,35,0.3)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(245,166,35,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(245,166,35,0.3)'; }}
            >
              Accéder à la plateforme →
            </button>
            <button onClick={() => document.getElementById('fonctionnalités').scrollIntoView({ behavior: 'smooth' })} style={{
              background: 'transparent', color: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(255,255,255,0.15)',
              padding: '14px 32px', borderRadius: 11, fontSize: 14, fontWeight: 700,
              cursor: 'pointer', fontFamily: DP.font, transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,166,35,0.4)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
            >
              Découvrir les fonctionnalités
            </button>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 48, flexWrap: 'wrap' }}>
            {[
              { icon: '🔒', text: 'Sécurisé & isolé' },
              { icon: '⚡', text: 'Temps réel' },
              { icon: '🌍', text: 'Multi-tenant' },
            ].map(b => (
              <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
                <span>{b.icon}</span><span>{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section id="statistiques" style={{ padding: '60px 5%', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {STATS.map(s => <StatCard key={s.label} {...s} />)}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="fonctionnalités" style={{ padding: '80px 5%', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Section header */}
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: DP.gold, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: 14 }}>
              Fonctionnalités
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, margin: '0 0 16px', letterSpacing: '-1px' }}>
              Tout ce dont vous avez besoin
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
              Une suite complète d'outils pour gérer, analyser et optimiser vos campagnes marketing.
            </p>
          </div>

          {/* Features grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {FEATURES.map((f, i) => (
              <div key={f.title}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
                style={{
                  background: hoveredFeature === i ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${hoveredFeature === i ? f.color + '40' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 16, padding: '28px 24px',
                  transition: 'all 0.25s', cursor: 'default',
                  transform: hoveredFeature === i ? 'translateY(-4px)' : 'none',
                }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: f.bg, border: `1px solid ${f.color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, marginBottom: 18,
                }}>{f.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 10px', color: '#fff' }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLES ── */}
      <section id="rôles" style={{ padding: '80px 5%', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: DP.gold, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: 14 }}>
              Accès & Rôles
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, margin: '0 0 16px', letterSpacing: '-1px' }}>
              Une plateforme pour chaque profil
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {ROLES.map((r, i) => (
              <div key={r.title}
                onMouseEnter={() => setHoveredRole(i)}
                onMouseLeave={() => setHoveredRole(null)}
                style={{
                  background: hoveredRole === i ? r.bg : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${hoveredRole === i ? r.border : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 16, padding: '32px 24px', textAlign: 'center',
                  transition: 'all 0.25s', cursor: 'default',
                  transform: hoveredRole === i ? 'translateY(-4px)' : 'none',
                }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{r.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 10px', color: r.color }}>{r.title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, margin: 0 }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{
        padding: '80px 5%',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 580, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, margin: '0 0 16px', letterSpacing: '-1px' }}>
            Prêt à optimiser vos<br /><span style={{ color: DP.gold }}>campagnes marketing ?</span>
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', lineHeight: 1.8, marginBottom: 36 }}>
            Connectez-vous à DigiPip et accédez à tous vos outils marketing en un seul endroit.
          </p>
          <button onClick={() => navigate('/login')} style={{
            background: DP.gold, color: DP.dark, border: 'none',
            padding: '15px 36px', borderRadius: 11, fontSize: 15, fontWeight: 800,
            cursor: 'pointer', fontFamily: DP.font, transition: 'all 0.2s',
            boxShadow: '0 8px 28px rgba(245,166,35,0.3)',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(245,166,35,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(245,166,35,0.3)'; }}
          >
            Accéder à la plateforme →
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '28px 5%',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 14, height: 14, background: DP.gold, borderRadius: 3 }} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, background: 'rgba(245,166,35,0.35)', borderRadius: 2 }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>Digi<span style={{ color: DP.gold }}>Pip</span></span>
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', margin: 0 }}>
          © 2026 DigiPip — DigiLab Solutions. Tous droits réservés.
        </p>
        <button onClick={() => navigate('/login')} style={{
          background: 'transparent', color: DP.gold,
          border: '1px solid rgba(245,166,35,0.25)',
          padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700,
          cursor: 'pointer', fontFamily: DP.font,
        }}>
          Se connecter
        </button>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${DP.dark}; }
        ::-webkit-scrollbar-thumb { background: rgba(245,166,35,0.3); border-radius: 3px; }
      `}</style>
    </div>
  );
}