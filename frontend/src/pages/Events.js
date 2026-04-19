import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

function Events() {
  const speakers = [
    { name: 'Dr. Ahmed Ben Ali', role: 'Expert IA, Google', initials: 'AB' },
    { name: 'Sarah Mansouri', role: 'CEO StartupAI Tunisia', initials: 'SM' },
    { name: 'Prof. Karim Jebali', role: 'Université de Tunis', initials: 'KJ' },
    { name: 'Leila Trabelsi', role: 'Head of ML, Microsoft', initials: 'LT' },
  ]

  const programme = [
    { time: '09:00', title: 'Accueil & Networking', type: 'networking', duration: '30 min' },
    { time: '09:30', title: 'Ouverture officielle', type: 'keynote', duration: '30 min' },
    { time: '10:00', title: 'IA Générative : état de l\'art', type: 'conference', duration: '45 min' },
    { time: '10:45', title: 'Pause café', type: 'break', duration: '15 min' },
    { time: '11:00', title: 'IA en entreprise tunisienne', type: 'conference', duration: '45 min' },
    { time: '11:45', title: 'Table ronde : Éthique & IA', type: 'panel', duration: '60 min' },
    { time: '13:00', title: 'Déjeuner networking', type: 'networking', duration: '90 min' },
    { time: '14:30', title: 'Workshop : Prompt Engineering', type: 'workshop', duration: '60 min' },
    { time: '15:30', title: 'Startups IA : pitches', type: 'pitch', duration: '60 min' },
    { time: '16:30', title: 'Pause café', type: 'break', duration: '15 min' },
    { time: '16:45', title: 'Keynote de clôture', type: 'keynote', duration: '45 min' },
    { time: '17:30', title: 'Cocktail & Networking', type: 'networking', duration: '60 min' },
  ]

  const typeStyle = (type) => {
    const styles = {
      keynote: { bg: '#0a0a0a', color: 'white' },
      conference: { bg: '#eef2ff', color: '#4f46e5' },
      panel: { bg: '#f0fdf4', color: '#059669' },
      workshop: { bg: '#fff7ed', color: '#ea580c' },
      networking: { bg: '#f8fafc', color: '#64748b' },
      break: { bg: '#f8fafc', color: '#94a3b8' },
      pitch: { bg: '#fdf4ff', color: '#9333ea' },
    }
    return styles[type] || styles.conference
  }

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: 'white', minHeight: '100vh' }}>
      <Navbar />

      {/* Header */}
      <div style={{ background: '#0a0a0a', padding: '80px 40px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block', background: '#1e293b',
          padding: '6px 16px', borderRadius: 20, fontSize: 12,
          color: '#94a3b8', marginBottom: 20, letterSpacing: 2
        }}>
          PROGRAMME COMPLET
        </div>
        <h1 style={{ fontSize: 48, fontWeight: 700, color: 'white', margin: '0 0 16px' }}>
          Conférence IA 2026
        </h1>
        <p style={{ color: '#64748b', fontSize: 18, margin: '0 0 32px' }}>
          20 Mai 2026 · Palais des Congrès, Tunis
        </p>
        <Link to="/register" style={{ textDecoration: 'none' }}>
          <button style={{
            background: '#4f46e5', color: 'white',
            border: 'none', padding: '14px 32px',
            borderRadius: 8, fontSize: 15, fontWeight: 600,
            cursor: 'pointer'
          }}>
            S'inscrire maintenant — 50 TND
          </button>
        </Link>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 40px' }}>

        {/* Speakers */}
        <div style={{ marginBottom: 80 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: '#0a0a0a', margin: '0 0 8px' }}>
            Les speakers
          </h2>
          <p style={{ color: '#64748b', margin: '0 0 40px' }}>
            Des experts reconnus internationalement
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {speakers.map(s => (
              <div key={s.name} style={{
                border: '1px solid #e2e8f0', borderRadius: 12,
                padding: 24, textAlign: 'center'
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: '#0a0a0a', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, fontWeight: 700, margin: '0 auto 16px'
                }}>
                  {s.initials}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#0a0a0a', marginBottom: 4 }}>{s.name}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>{s.role}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Programme */}
        <div>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: '#0a0a0a', margin: '0 0 8px' }}>
            Programme de la journée
          </h2>
          <p style={{ color: '#64748b', margin: '0 0 40px' }}>
            Une journée dense et inspirante
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {programme.map((item, i) => {
              const ts = typeStyle(item.type)
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 20,
                  padding: '16px 20px', border: '1px solid #e2e8f0',
                  borderRadius: 10, background: 'white'
                }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', minWidth: 50 }}>
                    {item.time}
                  </div>
                  <div style={{ flex: 1, fontSize: 15, fontWeight: 500, color: '#0a0a0a' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{item.duration}</div>
                  <div style={{
                    background: ts.bg, color: ts.color,
                    padding: '4px 12px', borderRadius: 20,
                    fontSize: 12, fontWeight: 500, minWidth: 80, textAlign: 'center'
                  }}>
                    {item.type}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA */}
        <div style={{
          marginTop: 64, background: '#f8fafc',
          border: '1px solid #e2e8f0', borderRadius: 16,
          padding: 48, textAlign: 'center'
        }}>
          <h3 style={{ fontSize: 28, fontWeight: 700, color: '#0a0a0a', margin: '0 0 12px' }}>
            Rejoignez-nous !
          </h3>
          <p style={{ color: '#64748b', margin: '0 0 32px', fontSize: 16 }}>
            Il reste encore des places disponibles au tarif Early Bird
          </p>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <button style={{
              background: '#0a0a0a', color: 'white',
              border: 'none', padding: '16px 40px',
              borderRadius: 8, fontSize: 15, fontWeight: 600,
              cursor: 'pointer'
            }}>
              Réserver ma place — 50 TND
            </button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#0a0a0a', padding: '24px 40px', textAlign: 'center' }}>
        <p style={{ color: '#475569', fontSize: 13, margin: 0 }}>
          © 2026 TechEvent — Tous droits réservés · Tunis, Tunisie
        </p>
      </div>
    </div>
  );
}

export default Events;