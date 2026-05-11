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

/* ====================== MODAL ====================== */
function Modal({ camp, onClose }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const tc = TYPE[camp.type?.toLowerCase()] || TYPE.email;

  const handleInscription = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      await api.post(`/api/campagnes/${camp.id}/inscrire`);
      setDone(true);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, zIndex: 3000,
      background: 'rgba(13,11,8,0.92)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: 'linear-gradient(145deg, #1a1410, #0f0c08)',
        border: '1px solid rgba(245,166,35,0.35)',
        borderRadius: 24, width: '100%', maxWidth: 520,
        boxShadow: '0 30px 80px rgba(0,0,0,0.7)', overflow: 'hidden',
        animation: 'modalPop 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <div style={{ padding: '28px 32px', borderBottom: '1px solid rgba(245,166,35,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: G.gold, fontSize: 12, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
              {tc.icon} {tc.label}
            </div>
            <h2 style={{ fontSize: 22, marginTop: 6, fontWeight: 800, color: '#fff' }}>{camp.title}</h2>
          </div>
          <button onClick={onClose} style={{ fontSize: 26, color: '#777', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ padding: 32 }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
            <div style={{ flex: 1, background: 'rgba(245,166,35,0.08)', padding: 18, borderRadius: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 32 }}>📈</div>
              <div style={{ fontSize: 14, marginTop: 8, fontWeight: 600 }}>Taux d'ouverture</div>
              <div style={{ fontSize: 26, color: G.gold, fontWeight: 800 }}>28–45%</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(52,211,153,0.08)', padding: 18, borderRadius: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 32 }}>🎯</div>
              <div style={{ fontSize: 14, marginTop: 8, fontWeight: 600 }}>Audience</div>
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
              <button onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: 12, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#aaa', cursor: 'pointer' }}>Fermer</button>
              <button 
                onClick={handleInscription} 
                disabled={loading}
                style={{ 
                  flex: 2, padding: '14px', borderRadius: 12, background: G.gold, color: '#111', 
                  fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', 
                  opacity: loading ? 0.7 : 1 
                }}
              >
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

/* ====================== HOMEPAGE ====================== */
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
        * { box-sizing: border-box; margin:0; padding:0; }
        html { scroll-behavior: smooth; }
        .nav-a { color:#ccc; text-decoration:none; font-size:15px; font-weight:500; transition:color .2s; }
        .nav-a:hover { color:#fff; }
        .pillar-card:hover { transform:translateY(-12px) !important; }
        .camp-card:hover { transform:translateY(-6px) !important; box-shadow:0 24px 60px rgba(0,0,0,0.4) !important; }
        .btn-cta:hover { background:#d4881a !important; transform:translateY(-2px); box-shadow:0 12px 36px rgba(245,166,35,0.4) !important; }
      `}</style>

      {/* NAVBAR */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, height: 72,
        background: scrolled ? 'rgba(13,11,8,0.98)' : 'rgba(13,11,8,0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${scrolled ? 'rgba(245,166,35,0.25)' : 'rgba(245,166,35,0.1)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6%', transition: 'all 0.3s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, background: G.gold, borderRadius: 9, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 4, left: 4, width: 16, height: 16, background: 'rgba(255,255,255,0.9)', borderRadius: 3 }} />
            <div style={{ position: 'absolute', bottom: 4, right: 4, width: 12, height: 12, background: 'rgba(255,255,255,0.5)', borderRadius: 2 }} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>Digi<span style={{ color: G.gold }}>Pip</span></div>
            <div style={{ fontSize: 10, color: '#888' }}>by DigiLab Solutions</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 36 }}>
          <a className="nav-a" href="#marketing">Marketing</a>
          <a className="nav-a" href="#devops">Cloud & DevOps</a>
          <a className="nav-a" href="#campagnes">Campagnes</a>
        </div>

        <button onClick={() => navigate(token ? '/dashboard' : '/login')} style={{
          background: G.gold, color: '#111', padding: '11px 26px', borderRadius: 10,
          fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: G.font
        }}>
          {token ? 'Dashboard →' : 'Se connecter →'}
        </button>
      </nav>

      {/* HERO */}
      <section style={{
        height: '100vh', position: 'relative', overflow: 'hidden',
        backgroundImage: 'linear-gradient(rgba(13,11,8,0.75), rgba(13,11,8,0.9)), url("https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069")',
        backgroundSize: 'cover', backgroundPosition: 'center',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 960, padding: '0 6%', zIndex: 2 }}>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 36, flexWrap: 'wrap' }}>
            <span style={{ padding: '6px 16px', borderRadius: 30, fontSize: 13, fontWeight: 600, background: 'rgba(96,165,250,0.1)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' }}>📊 Marketing Digital</span>
            <span style={{ padding: '6px 16px', borderRadius: 30, fontSize: 13, fontWeight: 600, background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' }}>☁️ Cloud</span>
            <span style={{ padding: '6px 16px', borderRadius: 30, fontSize: 13, fontWeight: 600, background: 'rgba(245,166,35,0.1)', color: G.gold, border: '1px solid rgba(245,166,35,0.3)' }}>⚙️ DevOps</span>
          </div>

          <h1 style={{ fontSize: 'clamp(48px, 8vw, 88px)', fontWeight: 800, lineHeight: 1.05, marginBottom: 24 }}>
            La plateforme cloud<br />dédiée aux <span style={{ color: G.gold }}>agences marketing</span>
          </h1>

          <p style={{ fontSize: 19, color: 'rgba(255,255,255,0.7)', maxWidth: 720, margin: '0 auto 48px', lineHeight: 1.6 }}>
            Marketing Digital • Infrastructure Cloud • Automatisation DevOps<br />
            Tout en un pour votre agence.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/login')} style={{ background: G.gold, color: '#111', padding: '17px 48px', borderRadius: 14, fontSize: 17, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
              Accéder à la plateforme
            </button>
            <button onClick={() => document.getElementById('campagnes')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: 'transparent', border: '1.5px solid rgba(255,255,255,0.4)', color: '#fff', padding: '17px 48px', borderRadius: 14, fontSize: 17, cursor: 'pointer' }}>
              Voir les campagnes
            </button>
          </div>
        </div>
      </section>

      {/* 3 PILLARS */}
      <section style={{ padding: '0 6%', marginTop: -60, position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {[
            { icon: '📊', label: 'Marketing Digital', color: '#60a5fa', desc: 'Campagnes multicanales performantes' },
            { icon: '☁️', label: 'Cloud Infrastructure', color: '#a78bfa', desc: 'Scalable & sécurisé' },
            { icon: '⚙️', label: 'DevOps Automation', color: G.gold, desc: 'CI/CD & monitoring continu' },
          ].map((p, i) => (
            <div key={i} className="pillar-card" style={{
              background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.08)`,
              borderRadius: 20, padding: '32px 28px', textAlign: 'center'
            }}>
              <div style={{ fontSize: 42, marginBottom: 16 }}>{p.icon}</div>
              <h3 style={{ color: p.color, fontSize: 18, marginBottom: 12 }}>{p.label}</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)' }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MARKETING SECTION */}
      <section id="marketing" style={{ padding: '140px 6% 100px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center', marginBottom: 80 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.25)', borderRadius: 30, padding: '8px 20px', marginBottom: 24 }}>
                <span style={{ fontSize: 14 }}>📊</span>
                <span style={{ color: '#60a5fa', fontWeight: 700, fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase' }}>MARKETING DIGITAL</span>
              </div>
              <h2 style={{ fontSize: 'clamp(36px,5vw,52px)', fontWeight: 800, lineHeight: 1.08, marginBottom: 20 }}>
                Campagnes qui<br /><span style={{ color: G.gold }}>convertissent vraiment</span>
              </h2>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>
                Pilotez vos campagnes Email, SMS et Push depuis un seul dashboard avec analytics en temps réel.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: '📧', title: 'Email Marketing', desc: 'Templates HTML, automation, A/B testing' },
                { icon: '📱', title: 'SMS & Push', desc: 'Notifications instantanées via Twilio' },
                { icon: '📊', title: 'Analytics & KPIs', desc: 'Taux d\'ouverture, clics et ROI' },
                { icon: '🎯', title: 'Segmentation', desc: 'Audiences dynamiques et ciblage intelligent' },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, padding: '16px 20px', borderRadius: 14, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 11, background: '#60a5fa18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{f.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{f.title}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Service Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
            {[
              { icon: '📲', title: 'Social Media Management', desc: 'Gestion complète des réseaux sociaux', color: '#a78bfa', img: 'https://images.unsplash.com/photo-1611162616305-c69b3037c7bb?w=400&q=60' },
              { icon: '🎯', title: 'Publicité Payante', desc: 'Google Ads, Meta Ads, LinkedIn', color: '#fb7185', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=60' },
              { icon: '🔍', title: 'SEO & Content', desc: 'Référencement naturel et stratégie de contenu', color: '#2dd4bf', img: 'https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293?w=400&q=60' },
            ].map((item, i) => (
              <div key={i} style={{ borderRadius: 20, overflow: 'hidden', background: G.dark3, border: '1px solid rgba(255,255,255,0.07)', transition: 'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 24px 60px rgba(0,0,0,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <img src={item.img} alt={item.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
                <div style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLOUD & DEVOPS */}
      <section id="devops" style={{ padding: '120px 6%', background: '#0a0a0a' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(36px,5vw,52px)', fontWeight: 800, textAlign: 'center', marginBottom: 80 }}>
            Infrastructure <span style={{ color: G.gold }}>Cloud & DevOps</span>
          </h2>
          {/* Pipeline + Stats ici (tu peux les remettre si besoin) */}
        </div>
      </section>

      {/* CAMPAGNES */}
      <section id="campagnes" style={{ padding: '120px 6%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 'clamp(36px,5vw,52px)', fontWeight: 800, marginBottom: 16 }}>Campagnes Actives</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 17 }}>Inscrivez-vous aux campagnes de nos agences partenaires</p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 80 }}>Chargement des campagnes...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 28 }}>
              {campagnes.map(c => {
                const imgSrc = CAMP_IMGS[c.type?.toLowerCase()] || CAMP_IMGS.email;
                return (
                  <div key={c.id} className="camp-card" onClick={() => setSelected(c)} style={{
                    borderRadius: 20, overflow: 'hidden', background: G.dark3, cursor: 'pointer',
                    border: '1px solid rgba(255,255,255,0.07)'
                  }}>
                    <img src={imgSrc} alt={c.title} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                    <div style={{ padding: '24px' }}>
                      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{c.title}</h3>
                      <button style={{ width: '100%', padding: '14px', background: G.gold, color: '#111', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>
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

      {/* FINAL CTA */}
      <section style={{ padding: '140px 6%', textAlign: 'center', background: 'linear-gradient(135deg, #110e08, #0d0b08)' }}>
        <h2 style={{ fontSize: 'clamp(38px,6vw,58px)', fontWeight: 800, marginBottom: 24 }}>
          Prêt à booster votre agence ?
        </h2>
        <button onClick={() => navigate('/login')} style={{ background: G.gold, color: '#111', padding: '18px 56px', borderRadius: 14, fontSize: 18, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          Commencer maintenant →
        </button>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#080806', padding: '50px 6% 30px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, background: G.gold, borderRadius: 8 }} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>Digi<span style={{ color: G.gold }}>Pip</span></div>
              <div style={{ fontSize: 11, color: '#555' }}>by DigiLab Solutions © 2026</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 30 }}>
            <a href="#marketing" style={{ color: '#777', textDecoration: 'none' }}>Marketing</a>
            <a href="#devops" style={{ color: '#777', textDecoration: 'none' }}>Cloud & DevOps</a>
            <a href="#campagnes" style={{ color: '#777', textDecoration: 'none' }}>Campagnes</a>
          </div>

          <button onClick={() => navigate('/login')} style={{ background: 'transparent', color: G.gold, border: `1px solid ${G.gold}40`, padding: '10px 24px', borderRadius: 10, cursor: 'pointer' }}>
            Se connecter
          </button>
        </div>
      </footer>

      {selected && <Modal camp={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}