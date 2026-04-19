import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

function Home() {
  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: 'white', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '100px 40px 80px',
        display: 'flex', alignItems: 'center', gap: 80
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'inline-block', background: '#f1f5f9',
            padding: '6px 16px', borderRadius: 20, fontSize: 13,
            color: '#475569', marginBottom: 24, letterSpacing: 1
          }}>
            TUNIS · 20 MAI 2026
          </div>
          <h1 style={{
            fontSize: 56, fontWeight: 700, lineHeight: 1.15,
            color: '#0a0a0a', margin: '0 0 24px', letterSpacing: -1
          }}>
            Conférence<br />
            Intelligence<br />
            <span style={{ color: '#4f46e5' }}>Artificielle 2026</span>
          </h1>
          <p style={{
            fontSize: 18, color: '#64748b', lineHeight: 1.8,
            maxWidth: 480, margin: '0 0 40px'
          }}>
            Le grand rendez-vous de l'IA en Tunisie. Experts, innovateurs et visionnaires réunis pour façonner l'avenir technologique.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <button style={{
                background: '#0a0a0a', color: 'white',
                border: 'none', padding: '16px 32px',
                borderRadius: 8, fontSize: 15, fontWeight: 600,
                cursor: 'pointer'
              }}>
                Réserver ma place →
              </button>
            </Link>
            <Link to="/events" style={{ textDecoration: 'none' }}>
              <button style={{
                background: 'white', color: '#0a0a0a',
                border: '1.5px solid #e2e8f0', padding: '16px 32px',
                borderRadius: 8, fontSize: 15, fontWeight: 600,
                cursor: 'pointer'
              }}>
                Voir le programme
              </button>
            </Link>
          </div>
        </div>

        {/* Info card */}
        <div style={{ flex: 1, maxWidth: 420 }}>
          <div style={{
            background: '#0a0a0a', borderRadius: 16,
            padding: 40, color: 'white'
          }}>
            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 24, letterSpacing: 2 }}>
              DÉTAILS DE L'ÉVÉNEMENT
            </div>
            {[
              { label: 'Date', value: '20 Mai 2026' },
              { label: 'Heure', value: '09:00 — 18:00' },
              { label: 'Lieu', value: 'Palais des Congrès, Tunis' },
              { label: 'Tarif Early Bird', value: '50 TND' },
              { label: 'Inclus', value: 'Déjeuner + Cocktail' },
            ].map(item => (
              <div key={item.label} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '14px 0', borderBottom: '1px solid #1e293b'
              }}>
                <span style={{ color: '#94a3b8', fontSize: 14 }}>{item.label}</span>
                <span style={{ color: 'white', fontSize: 14, fontWeight: 500 }}>{item.value}</span>
              </div>
            ))}
            <div style={{
              marginTop: 24, background: '#4f46e5',
              borderRadius: 8, padding: '12px 20px',
              textAlign: 'center', fontSize: 14, color: 'white'
            }}>
              Il reste <strong>47 places</strong> au tarif Early Bird
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '48px 40px',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40
        }}>
          {[
            { value: '50+', label: 'Speakers' },
            { value: '500+', label: 'Participants' },
            { value: '20+', label: 'Sessions' },
            { value: '8h', label: 'De contenu' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, fontWeight: 700, color: '#0a0a0a' }}>{s.value}</div>
              <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Topics */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 40px' }}>
        <h2 style={{ fontSize: 36, fontWeight: 700, color: '#0a0a0a', textAlign: 'center', marginBottom: 16 }}>
          Les grands thèmes
        </h2>
        <p style={{ color: '#64748b', textAlign: 'center', marginBottom: 48, fontSize: 16 }}>
          Explorez les sujets qui façonnent l'avenir de l'IA
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {[
            { icon: '🤖', title: 'IA Générative', desc: 'LLMs, ChatGPT, Claude et les modèles de demain' },
            { icon: '🔬', title: 'IA & Recherche', desc: 'Les dernières avancées scientifiques en ML' },
            { icon: '🏢', title: 'IA en Entreprise', desc: 'Automatisation et transformation digitale' },
            { icon: '🛡️', title: 'IA & Éthique', desc: 'Responsabilité, biais et réglementation' },
            { icon: '🌍', title: 'IA en Tunisie', desc: 'Écosystème local et opportunités' },
            { icon: '💡', title: 'Startups IA', desc: 'Innovation, financement et scaling' },
          ].map(t => (
            <div key={t.title} style={{
              background: 'white', border: '1px solid #e2e8f0',
              borderRadius: 12, padding: 28,
              transition: 'border-color 0.2s'
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{t.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0a0a0a', margin: '0 0 8px' }}>{t.title}</h3>
              <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.6 }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: '#0a0a0a', padding: '80px 40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 40, fontWeight: 700, color: 'white', margin: '0 0 16px' }}>
          Prêt à rejoindre l'aventure ?
        </h2>
        <p style={{ color: '#94a3b8', fontSize: 18, margin: '0 0 40px' }}>
          Ne manquez pas l'événement tech de l'année en Tunisie
        </p>
        <Link to="/register" style={{ textDecoration: 'none' }}>
          <button style={{
            background: '#4f46e5', color: 'white',
            border: 'none', padding: '18px 48px',
            borderRadius: 8, fontSize: 16, fontWeight: 600,
            cursor: 'pointer'
          }}>
            S'inscrire maintenant — 50 TND
          </button>
        </Link>
      </div>

      {/* Footer */}
      <div style={{ background: '#0a0a0a', borderTop: '1px solid #1e293b', padding: '24px 40px', textAlign: 'center' }}>
        <p style={{ color: '#475569', fontSize: 13, margin: 0 }}>
          © 2026 TechEvent — Tous droits réservés · Tunis, Tunisie
        </p>
      </div>
    </div>
  );
}

export default Home;