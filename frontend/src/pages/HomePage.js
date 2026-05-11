import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const G = {
  gold:     '#f5a623',
  goldDark: '#d4881a',
  dark:     '#0d0b08',
  dark2:    '#111',
  dark3:    '#1a1a1a',
  font:     "'Syne','Montserrat',sans-serif",
};

const TYPE = {
  email: { label: 'Email', icon: '✉', color: '#60a5fa' },
  sms:   { label: 'SMS',   icon: '💬', color: '#34d399' },
  push:  { label: 'Push',  icon: '🔔', color: '#f5a623' },
};

const CAMP_IMGS = {
  email: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&q=80',
  sms:   'https://images.unsplash.com/photo-1512941937938-a27bc91e2d4f?w=600&q=80',
  push:  'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&q=80',
};

/* ── Modal ── */
function Modal({ camp, onClose }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const tc = TYPE[camp.type?.toLowerCase()] || TYPE.email;

  const handleInscription = async () => {
    if (!token) { navigate('/login'); return; }
    setLoading(true);
    try {
      await api.post(`/api/campagnes/${camp.id}/inscrire`);
      setDone(true);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally { setLoading(false); }
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, zIndex: 3000,
      background: 'rgba(13,11,8,0.92)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: 'linear-gradient(145deg,#1a1410,#0f0c08)',
        border: '1px solid rgba(245,166,35,0.35)',
        borderRadius: 24, width: '100%', maxWidth: 520,
        boxShadow: '0 30px 80px rgba(0,0,0,0.7)', overflow: 'hidden',
        animation: 'modalPop 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <div style={{ padding: '28px 32px', borderBottom: '1px solid rgba(245,166,35,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: G.gold, fontSize: 12, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>{tc.icon} {tc.label}</div>
            <h2 style={{ fontSize: 22, marginTop: 6, fontWeight: 800, color: '#fff' }}>{camp.title}</h2>
          </div>
          <button onClick={onClose} style={{ fontSize: 26, color: '#777', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ padding: 32 }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
            <div style={{ flex: 1, background: 'rgba(245,166,35,0.08)', padding: 18, borderRadius: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 32 }}>📈</div>
              <div style={{ fontSize: 14, marginTop: 8, fontWeight: 600, color: '#fff' }}>Taux d'ouverture</div>
              <div style={{ fontSize: 26, color: G.gold, fontWeight: 800 }}>28–45%</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(52,211,153,0.08)', padding: 18, borderRadius: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 32 }}>🎯</div>
              <div style={{ fontSize: 14, marginTop: 8, fontWeight: 600, color: '#fff' }}>Audience</div>
              <div style={{ fontSize: 26, color: '#34d399', fontWeight: 800 }}>5 000+</div>
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ color: G.gold, marginBottom: 10 }}>Description</h4>
            <p style={{ lineHeight: 1.7, color: 'rgba(255,255,255,0.8)', fontSize: 15 }}>
              {camp.description || "Campagne marketing multi-canal avec suivi complet des performances et optimisation en temps réel."}
            </p>
          </div>
          <div style={{ background: 'rgba(245,166,35,0.05)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 16, padding: 20, marginBottom: 28 }}>
            <h4 style={{ color: G.gold, marginBottom: 12 }}>🚀 Infrastructure DevOps</h4>
            <ul style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.9, listStyle: 'none', paddingLeft: 0 }}>
              <li>✓ Déploiement automatique (CI/CD)</li>
              <li>✓ Scalabilité cloud (Neon + Vercel)</li>
              <li>✓ Monitoring en temps réel</li>
              <li>✓ Backup automatique</li>
            </ul>
          </div>
          {!done ? (
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: 12, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#aaa', cursor: 'pointer', fontFamily: G.font }}>Fermer</button>
              <button onClick={handleInscription} disabled={loading} style={{ flex: 2, padding: '14px', borderRadius: 12, background: G.gold, color: '#111', fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: G.font }}>
                {loading ? 'Inscription...' : "✓ Je m'inscris"}
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: 56 }}>🎉</div>
              <h3 style={{ color: '#34d399', margin: '16px 0' }}>Inscription réussie !</h3>
              <button onClick={onClose} style={{ padding: '12px 32px', background: G.gold, color: '#111', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>Retour</button>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes modalPop { from { opacity:0; transform:scale(0.88) translateY(40px); } to { opacity:1; transform:none; } }`}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [campagnes, setCampagnes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const s = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', s);
    return () => window.removeEventListener('scroll', s);
  }, []);

  useEffect(() => {
    api.get('/api/campagnes/public')
      .then(r => setCampagnes(Array.isArray(r.data) ? r.data : []))
      .catch(() => setCampagnes([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ fontFamily: G.font, background: G.dark, color: '#fff', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        html { scroll-behavior:smooth; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:rgba(245,166,35,0.4); border-radius:2px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:none; } }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
        .nav-a { color:#ccc; text-decoration:none; font-size:15px; font-weight:500; transition:color .2s; }
        .nav-a:hover { color:#fff; }
        .pillar-card { transition:all 0.35s cubic-bezier(0.4,0,0.2,1); }
        .pillar-card:hover { transform:translateY(-12px) !important; }
        .feature-row:hover { background:rgba(255,255,255,0.04) !important; }
        .camp-card:hover { transform:translateY(-6px) !important; box-shadow:0 24px 60px rgba(0,0,0,0.4) !important; }
        .btn-cta:hover { background:#d4881a !important; transform:translateY(-2px); box-shadow:0 12px 36px rgba(245,166,35,0.4) !important; }
        .btn-outline:hover { background:rgba(255,255,255,0.08) !important; }
        .tech-badge { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:20px; font-size:12px; font-weight:600; border:1px solid; white-space:nowrap; }
      `}</style>

      {/* ══ NAVBAR ══ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, height: 72,
        background: scrolled ? 'rgba(13,11,8,0.98)' : 'rgba(13,11,8,0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${scrolled ? 'rgba(245,166,35,0.25)' : 'rgba(245,166,35,0.1)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 6%', transition: 'all 0.3s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, background: G.gold, borderRadius: 9, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 4, left: 4, width: 16, height: 16, background: 'rgba(255,255,255,0.9)', borderRadius: 3 }} />
            <div style={{ position: 'absolute', bottom: 4, right: 4, width: 12, height: 12, background: 'rgba(255,255,255,0.5)', borderRadius: 2 }} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>Digi<span style={{ color: G.gold }}>Pip</span></div>
            <div style={{ fontSize: 10, color: '#888', letterSpacing: '0.08em' }}>by DigiLab Solutions</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 36 }}>
          <a className="nav-a" href="#marketing">Marketing</a>
          <a className="nav-a" href="#devops">Cloud & DevOps</a>
          <a className="nav-a" href="#campagnes">Campagnes</a>
        </div>

        <button className="btn-cta" onClick={() => navigate(token ? '/dashboard' : '/login')} style={{
          background: G.gold, color: '#111', padding: '11px 26px',
          borderRadius: 10, fontWeight: 700, border: 'none',
          fontSize: 14, cursor: 'pointer', fontFamily: G.font, transition: 'all 0.2s',
        }}>
          {token ? 'Dashboard →' : 'Se connecter →'}
        </button>
      </nav>

      {/* ══ HERO ══ */}
      <section style={{
        height: '100vh', position: 'relative', overflow: 'hidden',
        backgroundImage: 'linear-gradient(rgba(13,11,8,0.7), rgba(13,11,8,0.88)), url("https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069")',
        backgroundSize: 'cover', backgroundPosition: 'center',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Animated grid overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(245,166,35,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(245,166,35,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

        <div style={{ textAlign: 'center', maxWidth: 960, padding: '0 6%', animation: 'fadeUp 0.9s ease both', position: 'relative', zIndex: 1 }}>

          {/* 3 Pillar badges */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 36, flexWrap: 'wrap' }}>
            <span className="tech-badge" style={{ color: '#60a5fa', borderColor: 'rgba(96,165,250,0.3)', background: 'rgba(96,165,250,0.08)' }}>📊 Marketing Digital</span>
            <span className="tech-badge" style={{ color: '#a78bfa', borderColor: 'rgba(167,139,250,0.3)', background: 'rgba(167,139,250,0.08)' }}>☁️ Cloud Infrastructure</span>
            <span className="tech-badge" style={{ color: G.gold, borderColor: 'rgba(245,166,35,0.3)', background: 'rgba(245,166,35,0.08)' }}>⚙️ DevOps Automation</span>
          </div>

          <div style={{ fontSize: 13, color: G.gold, fontWeight: 700, letterSpacing: '3px', marginBottom: 20, textTransform: 'uppercase' }}>DigiLab Solutions</div>

          <h1 style={{ fontSize: 'clamp(48px,8vw,92px)', fontWeight: 800, lineHeight: 1.03, marginBottom: 28, letterSpacing: '-0.02em' }}>
            La plateforme cloud<br />
            dédiée aux <span style={{ color: G.gold }}>agences marketing</span>
          </h1>

          <p style={{ fontSize: 19, color: 'rgba(255,255,255,0.65)', maxWidth: 700, margin: '0 auto 48px', lineHeight: 1.75 }}>
            DigiPip centralise votre <strong style={{ color: '#fff' }}>stratégie marketing</strong>, votre <strong style={{ color: '#fff' }}>infrastructure cloud</strong> et votre <strong style={{ color: '#fff' }}>pipeline DevOps</strong> dans une seule plateforme multi-tenant.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-cta" onClick={() => navigate('/login')} style={{
              background: G.gold, color: '#111', padding: '17px 48px',
              borderRadius: 14, fontSize: 17, fontWeight: 700, border: 'none',
              cursor: 'pointer', fontFamily: G.font, transition: 'all 0.2s',
              boxShadow: '0 8px 32px rgba(245,166,35,0.3)',
            }}>Accéder à la plateforme</button>
            <button className="btn-outline" onClick={() => document.getElementById('campagnes')?.scrollIntoView({ behavior: 'smooth' })} style={{
              background: 'transparent', border: '1.5px solid rgba(255,255,255,0.3)', color: '#fff',
              padding: '17px 48px', borderRadius: 14, fontSize: 17, cursor: 'pointer',
              fontFamily: G.font, transition: 'all 0.2s',
            }}>Voir les campagnes</button>
          </div>

          {/* Tech stack */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 56, flexWrap: 'wrap' }}>
            {[
              ['React', 'rgba(96,165,250,0.15)', '#60a5fa'],
              ['Node.js', 'rgba(52,211,153,0.15)', '#34d399'],
              ['Firebase', 'rgba(245,166,35,0.15)', '#f5a623'],
              ['Vercel', 'rgba(255,255,255,0.08)', '#fff'],
              ['Render', 'rgba(139,92,246,0.15)', '#a78bfa'],
              ['Prisma', 'rgba(255,255,255,0.06)', '#aaa'],
              ['Twilio', 'rgba(239,68,68,0.15)', '#f87171'],
            ].map(([t, bg, c]) => (
              <span key={t} style={{ fontSize: 11, fontWeight: 600, color: c, background: bg, border: `1px solid ${c}20`, padding: '5px 14px', borderRadius: 20, letterSpacing: '0.04em' }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, animation: 'pulse 2s infinite' }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em' }}>SCROLL</span>
          <div style={{ width: 1, height: 36, background: 'linear-gradient(to bottom, rgba(245,166,35,0.5), transparent)' }} />
        </div>
      </section>

      {/* ══ 3 PILLARS INTRO ══ */}
      <section style={{ padding: '0 6%', marginTop: -60, position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {[
            { icon: '📊', label: 'Marketing Digital', color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)', desc: 'Email, SMS, Push — Campagnes multicanales pilotées par la data.' },
            { icon: '☁️', label: 'Cloud Infrastructure', color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)', desc: 'Vercel + Render + Neon DB — scalabilité et haute disponibilité.' },
            { icon: '⚙️', label: 'DevOps Automation', color: G.gold, bg: 'rgba(245,166,35,0.08)', border: 'rgba(245,166,35,0.2)', desc: 'CI/CD GitHub Actions — déploiement continu, monitoring et alertes.' },
          ].map((p, i) => (
            <div key={i} className="pillar-card" style={{
              background: p.bg, border: `1px solid ${p.border}`,
              borderRadius: 20, padding: '32px 28px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{p.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: p.color, marginBottom: 10 }}>{p.label}</div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ MARKETING SECTION ══ */}
      <section id="marketing" style={{ padding: '140px 6% 100px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* Section header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center', marginBottom: 80 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.25)', borderRadius: 30, padding: '8px 20px', marginBottom: 24 }}>
                <span style={{ fontSize: 14 }}>📊</span>
                <span style={{ color: '#60a5fa', fontWeight: 700, fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase' }}>Marketing Digital</span>
              </div>
              <h2 style={{ fontSize: 'clamp(36px,5vw,52px)', fontWeight: 800, lineHeight: 1.08, marginBottom: 20 }}>
                Campagnes qui<br /><span style={{ color: G.gold }}>convertissent vraiment</span>
              </h2>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>
                Pilotez vos campagnes Email, SMS et Push depuis un seul dashboard. Analytics temps réel, segmentation avancée et automatisation complète pour maximiser votre ROI.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: '📧', title: 'Email Marketing', desc: 'Templates HTML, automation, A/B testing et tracking en temps réel.', color: '#60a5fa' },
                { icon: '📱', title: 'SMS & Push', desc: 'Notifications instantanées via Twilio et Firebase FCM.', color: '#34d399' },
                { icon: '📊', title: 'Analytics & KPIs', desc: 'Taux d\'ouverture, clics, conversions et ROI par campagne.', color: G.gold },
                { icon: '🎯', title: 'Segmentation', desc: 'Audiences dynamiques et ciblage comportemental intelligent.', color: '#a78bfa' },
              ].map((f, i) => (
                <div key={i} className="feature-row" style={{
                  display: 'flex', gap: 16, alignItems: 'center',
                  padding: '16px 20px', borderRadius: 14,
                  background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)',
                  transition: 'background 0.2s',
                }}>
                  <div style={{ width: 42, height: 42, borderRadius: 11, background: f.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{f.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 3 }}>{f.title}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{f.desc}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', color: f.color, fontSize: 18, opacity: 0.6 }}>›</div>
                </div>
              ))}
            </div>
          </div>

          {/* Marketing service cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {[
              { icon: '📲', title: 'Social Media Management', desc: 'Gestion complète des réseaux sociaux, création de contenu viral et community management.', color: '#a78bfa', img: 'https://images.unsplash.com/photo-1611162616305-c69b3037c7bb?w=400&q=60' },
              { icon: '🎯', title: 'Publicité Payante', desc: 'Google Ads, Meta Ads, LinkedIn — optimisation ROAS continue avec reporting détaillé.', color: '#fb7185', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=60' },
              { icon: '🔍', title: 'SEO & Content', desc: 'Stratégie de contenu, référencement naturel et croissance organique durable.', color: '#2dd4bf', img: 'https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293?w=400&q=60' },
            ].map((item, i) => (
              <div key={i} style={{
                borderRadius: 20, overflow: 'hidden', background: G.dark3,
                border: '1px solid rgba(255,255,255,0.07)',
                transition: 'transform 0.3s, box-shadow 0.3s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 24px 60px rgba(0,0,0,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ height: 160, overflow: 'hidden', position: 'relative' }}>
                  <img src={item.img} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, transparent, ${G.dark3}aa)` }} />
                </div>
                <div style={{ padding: '24px 24px 28px' }}>
                  <div style={{ width: 28, height: 3, background: item.color, borderRadius: 2, marginBottom: 14 }} />
                  <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: '#fff' }}>{item.title}</h3>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CLOUD & DEVOPS ══ */}
      <section id="devops" style={{ padding: '120px 6%', background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* Two column intro */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center', marginBottom: 80 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 30, padding: '8px 20px', marginBottom: 24 }}>
                <span style={{ fontSize: 14 }}>☁️</span>
                <span style={{ color: '#a78bfa', fontWeight: 700, fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase' }}>Cloud & DevOps</span>
              </div>
              <h2 style={{ fontSize: 'clamp(36px,5vw,52px)', fontWeight: 800, lineHeight: 1.08, marginBottom: 20 }}>
                Infrastructure cloud<br /><span style={{ color: G.gold }}>pensée pour les agences</span>
              </h2>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: 32 }}>
                Architecture multi-tenant isolée, déploiement automatisé et monitoring en temps réel — pour que votre agence se concentre sur l'essentiel.
              </p>

              {/* DevOps pipeline steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { step: '01', title: 'Code & Version', desc: 'GitHub — branches, pull requests et code review.', color: '#60a5fa' },
                  { step: '02', title: 'CI — Tests auto', desc: 'GitHub Actions — lint, tests unitaires, build.', color: '#34d399' },
                  { step: '03', title: 'CD — Déploiement', desc: 'Vercel (frontend) + Render (backend) — automatique.', color: G.gold },
                  { step: '04', title: 'Monitoring & Alertes', desc: 'Surveillance des services + alertes email/Slack.', color: '#a78bfa' },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 20, padding: '16px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: s.color, opacity: 0.7, minWidth: 28, paddingTop: 2, letterSpacing: '0.05em' }}>{s.step}</div>
                    <div style={{ width: 3, background: s.color, borderRadius: 2, opacity: 0.4 }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 3 }}>{s.title}</div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cloud infra visual */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { title: 'Hébergement Cloud', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=70', desc: 'Vercel · Render · Neon DB', color: '#60a5fa' },
                { title: 'CI/CD Automatisé', img: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=600&q=70', desc: 'GitHub Actions · Deploy automatique', color: '#34d399' },
                { title: 'Monitoring 24/7', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=70', desc: 'Alertes · Logs · Dashboard live', color: G.gold },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 0, borderRadius: 16, overflow: 'hidden',
                  background: G.dark3, border: '1px solid rgba(255,255,255,0.07)',
                  transition: 'transform 0.3s',
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateX(6px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                  <div style={{ width: 4, background: item.color, flexShrink: 0 }} />
                  <img src={item.img} alt={item.title} style={{ width: 100, height: 80, objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 4 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats devops */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { val: '99.9%', label: 'Uptime garanti', icon: '🟢', color: '#34d399' },
              { val: '< 2s',  label: 'Temps de build CI', icon: '⚡', color: G.gold },
              { val: '100%',  label: 'Tests automatisés', icon: '✅', color: '#60a5fa' },
              { val: '0',     label: 'Downtime production', icon: '🛡', color: '#a78bfa' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#0a0a0a', padding: '36px 28px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{s.icon}</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: s.color, letterSpacing: '-0.03em', marginBottom: 8 }}>{s.val}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CAMPAGNES ══ */}
      <section id="campagnes" style={{ padding: '120px 6%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.25)', borderRadius: 30, padding: '8px 20px', marginBottom: 20 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'block', boxShadow: '0 0 6px #22c55e' }} />
              <span style={{ color: G.gold, fontWeight: 700, fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase' }}>Live — Campagnes Actives</span>
            </div>
            <h2 style={{ fontSize: 'clamp(36px,5vw,52px)', fontWeight: 800, marginBottom: 16 }}>Inscrivez-vous à nos campagnes</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
              Parcourez les campagnes actives de nos agences partenaires et rejoignez celles qui vous intéressent.
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#555' }}>
              <div style={{ width: 36, height: 36, border: '3px solid rgba(245,166,35,0.2)', borderTop: `3px solid ${G.gold}`, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
              Chargement...
            </div>
          ) : campagnes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 80, color: '#555' }}>
              <div style={{ fontSize: 52, marginBottom: 16, opacity: 0.2 }}>📢</div>
              <p style={{ fontSize: 16 }}>Aucune campagne disponible pour le moment.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 28 }}>
              {campagnes.map(c => {
                const imgSrc = CAMP_IMGS[c.type?.toLowerCase()] || CAMP_IMGS.email;
                return (
                  <div key={c.id} className="camp-card" onClick={() => setSelected(c)} style={{
                    borderRadius: 20, overflow: 'hidden', background: G.dark3,
                    cursor: 'pointer', transition: 'transform 0.3s, box-shadow 0.3s',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}>
                    <div style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
                      <img src={imgSrc} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(26,26,26,0.9))' }} />
                    </div>
                    <div style={{ padding: '22px 24px 28px' }}>
                      {c.client?.name && <div style={{ fontSize: 12, color: '#777', marginBottom: 8 }}>🏢 {c.client.name}</div>}
                      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 18, color: '#fff', lineHeight: 1.4 }}>{c.title}</h3>
                      <button style={{
                        width: '100%', padding: '13px', background: G.gold, color: '#111',
                        border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14,
                        cursor: 'pointer', fontFamily: G.font, transition: 'background 0.2s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = G.goldDark}
                        onMouseLeave={e => e.currentTarget.style.background = G.gold}
                      >
                        Voir détails & s'inscrire
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ══ CTA FINAL ══ */}
      <section style={{
        padding: '120px 6%', textAlign: 'center',
        background: 'linear-gradient(135deg, #110e08 0%, #0d0b08 100%)',
        borderTop: '1px solid rgba(245,166,35,0.1)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto' }}>
          {/* 3 pillars mini recap */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 40, flexWrap: 'wrap' }}>
            {[['📊','Marketing','#60a5fa'], ['☁️','Cloud','#a78bfa'], ['⚙️','DevOps','#f5a623']].map(([icon, label, color]) => (
              <span key={label} style={{ fontSize: 13, fontWeight: 600, color, background: color + '12', border: `1px solid ${color}30`, padding: '7px 18px', borderRadius: 20 }}>{icon} {label}</span>
            ))}
          </div>
          <h2 style={{ fontSize: 'clamp(36px,5vw,60px)', fontWeight: 800, marginBottom: 20, lineHeight: 1.1 }}>
            Prêt à unifier votre<br /><span style={{ color: G.gold }}>marketing cloud ?</span>
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.4)', lineHeight: 1.75, marginBottom: 48, maxWidth: 520, margin: '0 auto 48px' }}>
            Rejoignez DigiPip et pilotez votre stratégie marketing, votre infrastructure cloud et votre pipeline DevOps depuis une seule plateforme.
          </p>
          <button className="btn-cta" onClick={() => navigate('/login')} style={{
            background: G.gold, color: '#111', padding: '18px 52px',
            borderRadius: 14, fontSize: 17, fontWeight: 700, border: 'none',
            cursor: 'pointer', fontFamily: G.font, transition: 'all 0.2s',
            boxShadow: '0 12px 40px rgba(245,166,35,0.3)',
          }}>
            Accéder à la plateforme →
          </button>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ background: '#080806', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '36px 6%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: G.gold, borderRadius: 8 }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>Digi<span style={{ color: G.gold }}>Pip</span></div>
              <div style={{ fontSize: 10, color: '#555' }}>by DigiLab Solutions</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {[['Marketing','#marketing'], ['Cloud & DevOps','#devops'], ['Campagnes','#campagnes']].map(([l, h]) => (
              <a key={l} href={h} style={{ fontSize: 13, color: '#555', textDecoration: 'none', transition: 'color .2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = '#555'}
              >{l}</a>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <span style={{ fontSize: 12, color: '#444' }}>© 2026 DigiPip — DigiLab Solutions</span>
            <button onClick={() => navigate('/login')} style={{ background: 'transparent', color: G.gold, border: `1px solid rgba(245,166,35,0.3)`, padding: '8px 18px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: G.font }}>
              Se connecter →
            </button>
          </div>
        </div>
      </footer>

      {selected && <Modal camp={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
