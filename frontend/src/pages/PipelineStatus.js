import React, { useState } from 'react';

const C = {
  bg: '#f8fafc',
  card: '#ffffff',
  navy: '#0f172a',
  gold: '#f5a623',
  green: '#10b981',
  blue: '#3b82f6',
  textMuted: '#64748b',
  border: '#e2e8f0',
};

const pipelineStages = [
  { id: 1, name: "PLAN",    label: "Planification",       icon: "📋", color: "#3b82f6" },
  { id: 2, name: "BUILD",   label: "Build & Tests",        icon: "🔨", color: "#8b5cf6" },
  { id: 3, name: "TEST",    label: "Tests Automatisés",    icon: "🧪", color: "#eab308" },
  { id: 4, name: "DEPLOY",  label: "Déploiement",          icon: "🚀", color: "#f5a623" },
  { id: 5, name: "MONITOR", label: "Monitoring",           icon: "📡", color: "#10b981" },
];

export default function PipelineStatus() {
  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      name: "Ramadan 2026 - Grande Distribution",
      status: "live",
      channel: "Email • SMS • Push",
      progress: 100,
      currentStage: 5,
      lastDeploy: "Il y a 2h",
      traffic: "12.8k",
      roi: "4.85x"
    },
    {
      id: 2,
      name: "Conférence IA 2026 - B2B",
      status: "draft",
      channel: "LinkedIn + Email",
      progress: 0,
      currentStage: 0,
      lastDeploy: "—",
      traffic: "—",
      roi: "—"
    },
    {
      id: 3,
      name: "Promo Printemps Fashion",
      status: "deploying",
      channel: "SMS + Push",
      progress: 65,
      currentStage: 3,
      lastDeploy: "En cours...",
      traffic: "2.4k",
      roi: "—"
    },
  ]);

  const [isDeploying, setIsDeploying] = useState(false);

  const startDeployment = (camp) => {
    if (isDeploying) return;
    setIsDeploying(true);

    let progress = camp.progress || 0;
    const interval = setInterval(() => {
      progress += Math.random() * 18 + 8;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setCampaigns(prev => prev.map(c =>
            c.id === camp.id
              ? { ...c, status: "live", progress: 100, currentStage: 5, lastDeploy: "À l'instant" }
              : c
          ));
          setIsDeploying(false);
          alert(`✅ Campagne "${camp.name}" déployée avec succès !`);
        }, 800);
      }
      setCampaigns(prev => prev.map(c =>
        c.id === camp.id
          ? { ...c, progress: Math.floor(progress), currentStage: Math.min(Math.floor(progress / 20) + 1, 5) }
          : c
      ));
    }, 280);
  };

  return (
    <div style={{ background: C.bg, minHeight: '100vh', padding: '40px 32px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: C.navy, margin: 0 }}>
          Pipeline DevOps &amp; Déploiements
        </h1>
        <p style={{ color: C.textMuted, fontSize: 15, marginTop: 6 }}>
          Cycle complet : Plan → Build → Test → Deploy → Monitor
        </p>
      </div>

      {/* CI/CD visual bar */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '18px 24px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          ['git push', '#3b82f6'],
          ['npm test ✓', '#8b5cf6'],
          ['npm build ✓', '#10b981'],
          ['vercel deploy ✓', '#f5a623'],
          ['🟢 Live', '#10b981'],
        ].map(([label, color], i) => (
          <React.Fragment key={i}>
            <div style={{ background: color + '14', border: `1px solid ${color}40`, borderRadius: 8, padding: '10px 18px', textAlign: 'center' }}>
              <code style={{ fontSize: 13, color, fontWeight: 700 }}>{label}</code>
            </div>
            {i < 4 && <span style={{ color: '#cbd5e1', padding: '0 10px', fontSize: 18 }}>→</span>}
          </React.Fragment>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28 }}>

        {/* Campagnes */}
        <div>
          <h2 style={{ marginBottom: 20, fontSize: 20, fontWeight: 700, color: C.navy }}>📋 Campagnes</h2>

          {campaigns.map(camp => (
            <div key={camp.id} style={{
              background: C.card,
              padding: 24,
              borderRadius: 20,
              marginBottom: 16,
              border: camp.status === 'live' ? `2px solid ${C.green}` : `1px solid ${C.border}`,
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.navy }}>{camp.name}</h3>
                  <p style={{ color: C.textMuted, marginTop: 4, fontSize: 13 }}>{camp.channel}</p>
                </div>
                <span style={{
                  padding: '5px 14px', borderRadius: 30, fontSize: 12, fontWeight: 700,
                  background: camp.status === 'live' ? '#d1fae5' : camp.status === 'deploying' ? '#fef3c7' : '#f1f5f9',
                  color: camp.status === 'live' ? C.green : camp.status === 'deploying' ? '#d97706' : C.textMuted,
                }}>
                  {camp.status.toUpperCase()}
                </span>
              </div>

              {/* Pipeline stages */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
                {pipelineStages.map(stage => (
                  <div key={stage.id} style={{
                    flex: 1, height: 6, borderRadius: 999,
                    background: camp.currentStage >= stage.id ? stage.color : '#e2e8f0',
                    transition: 'background 0.4s ease',
                  }} title={stage.label} />
                ))}
              </div>

              {camp.progress > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.textMuted, marginBottom: 12 }}>
                  <span>Étape {camp.currentStage}/5 — {camp.currentStage > 0 ? pipelineStages[Math.min(camp.currentStage - 1, 4)].label : '—'}</span>
                  <span style={{ fontWeight: 700 }}>{camp.progress}%</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: 24, fontSize: 13, color: C.textMuted }}>
                <div>Trafic : <strong style={{ color: C.navy }}>{camp.traffic}</strong></div>
                <div>ROI : <strong style={{ color: C.green }}>{camp.roi}</strong></div>
                <div>Déployé : <strong>{camp.lastDeploy}</strong></div>
              </div>

              {camp.status !== 'live' && (
                <button
                  onClick={() => startDeployment(camp)}
                  disabled={isDeploying}
                  style={{
                    marginTop: 18, width: '100%', padding: '13px',
                    background: isDeploying ? '#e2e8f0' : C.gold,
                    color: isDeploying ? C.textMuted : '#111',
                    border: 'none', borderRadius: 12, fontWeight: 700,
                    fontSize: 14, cursor: isDeploying ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {isDeploying ? '⏳ Déploiement en cours...' : '🚀 Lancer le Déploiement DevOps'}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Pipeline + Infra */}
        <div>
          <h2 style={{ marginBottom: 20, fontSize: 20, fontWeight: 700, color: C.navy }}>🔄 Pipeline en Temps Réel</h2>

          <div style={{ background: C.card, borderRadius: 20, padding: 24, border: `1px solid ${C.border}`, marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            {pipelineStages.map((stage, index) => (
              <div key={stage.id} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0',
                borderBottom: index < pipelineStages.length - 1 ? `1px solid ${C.border}` : 'none',
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: stage.color + '15',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0,
                }}>
                  {stage.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: C.navy }}>{stage.label}</div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{stage.name}</div>
                </div>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
              </div>
            ))}
          </div>

          {/* Infrastructure */}
          <div style={{ background: C.card, padding: 24, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 700, color: C.navy }}>🏗️ Infrastructure</h3>
            {[
              ['Frontend',    'Vercel (Edge Network)',       '#3b82f6'],
              ['Backend',     'Render + Node.js',            '#8b5cf6'],
              ['Base données','Neon Postgres (serverless)',  '#10b981'],
              ['Auth & Push', 'Firebase Auth + FCM',         '#f5a623'],
              ['SMS',         'Twilio API',                  '#ef4444'],
              ['CI/CD',       'GitHub Actions',              '#1a1a1a'],
            ].map(([key, val, color]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 13, color: C.textMuted }}>{key}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color, background: color + '12', padding: '3px 10px', borderRadius: 20 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}