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
  { id: 1, name: "PLAN", label: "Planification", icon: "📋", color: "#3b82f6" },
  { id: 2, name: "BUILD", label: "Build & Tests", icon: "🔨", color: "#8b5cf6" },
  { id: 3, name: "TEST", label: "Tests Automatisés", icon: "🧪", color: "#eab308" },
  { id: 4, name: "DEPLOY", label: "Déploiement", icon: "🚀", color: "#f5a623" },
  { id: 5, name: "MONITOR", label: "Monitoring", icon: "📡", color: "#10b981" },
];

export default function CampaignManagement() {
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

  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isDeploying, setIsDeploying] = useState(false);

  const startDeployment = (camp) => {
    setSelectedCampaign(camp);
    setIsDeploying(true);

    let progress = 0;
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
        c.id === camp.id ? { ...c, progress: Math.floor(progress), currentStage: Math.floor(progress / 20) + 1 } : c
      ));
    }, 280);
  };

  return (
    <div style={{ background: C.bg, minHeight: '100vh', padding: '40px 32px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: C.navy }}>Pipeline DevOps &amp; Déploiements</h1>
        <p style={{ color: C.textMuted, fontSize: 17 }}>Cycle complet : Plan → Build → Test → Deploy → Monitor</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28 }}>

        {/* Liste des Campagnes */}
        <div>
          <h2 style={{ marginBottom: 20, fontSize: 22 }}>📋 Campagnes Actives</h2>
          
          {campaigns.map(camp => (
            <div key={camp.id} style={{
              background: C.card,
              padding: 24,
              borderRadius: 20,
              marginBottom: 16,
              border: camp.status === 'live' ? `2px solid ${C.green}` : '1px solid #e2e8f0',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18 }}>{camp.name}</h3>
                  <p style={{ color: C.textMuted, marginTop: 4 }}>{camp.channel}</p>
                </div>
                <span style={{
                  padding: '6px 16px',
                  borderRadius: 30,
                  fontSize: 13,
                  fontWeight: 700,
                  background: camp.status === 'live' ? '#d1fae5' : camp.status === 'deploying' ? '#fef3c7' : '#f1f5f9',
                  color: camp.status === 'live' ? C.green : '#d97706'
                }}>
                  {camp.status.toUpperCase()}
                </span>
              </div>

              {/* Progress Bar */}
              {camp.progress > 0 && (
                <div style={{ margin: '18px 0' }}>
                  <div style={{ height: 6, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${camp.progress}%`,
                      background: C.gold,
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12 }}>
                    <span>Étape {camp.currentStage}/5</span>
                    <span style={{ fontWeight: 600 }}>{camp.progress}%</span>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 20, fontSize: 14, color: C.textMuted }}>
                <div>Trafic : <strong style={{ color: '#000' }}>{camp.traffic}</strong></div>
                <div>ROI : <strong style={{ color: C.green }}>{camp.roi}</strong></div>
                <div>Déployé : <strong>{camp.lastDeploy}</strong></div>
              </div>

              {camp.status !== 'live' && (
                <button 
                  onClick={() => startDeployment(camp)}
                  style={{
                    marginTop: 20,
                    width: '100%',
                    padding: '14px',
                    background: C.gold,
                    color: '#111',
                    border: 'none',
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: 'pointer'
                  }}
                >
                  🚀 Lancer le Déploiement DevOps
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Pipeline DevOps en direct */}
        <div>
          <h2 style={{ marginBottom: 20 }}>🔄 Pipeline DevOps en Temps Réel</h2>
          
          <div style={{ background: C.card, borderRadius: 20, padding: 28, border: '1px solid #e2e8f0' }}>
            {pipelineStages.map((stage, index) => (
              <div key={stage.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 16, 
                padding: '14px 0',
                borderBottom: index < pipelineStages.length - 1 ? '1px solid #f1f5f9' : 'none'
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: stage.color + '15',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  color: stage.color,
                  flexShrink: 0
                }}>
                  {stage.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{stage.label}</div>
                  <div style={{ fontSize: 13, color: C.textMuted }}>{stage.name}</div>
                </div>
                <div style={{ fontSize: 13, color: '#64748b' }}>→</div>
              </div>
            ))}
          </div>

          {/* Info Infrastructure */}
          <div style={{ marginTop: 24, background: C.card, padding: 24, borderRadius: 20 }}>
            <h3 style={{ marginBottom: 16 }}>Infrastructure Actuelle</h3>
            <div style={{ lineHeight: 2.1, fontSize: 14 }}>
              <div>Frontend : <strong>Vercel</strong> (Edge Network)</div>
              <div>Backend : <strong>Render</strong> + <strong>Neon Postgres</strong></div>
              <div>CI/CD : <strong>GitHub Actions</strong></div>
              <div>Monitoring : <strong>Grafana + Sentry</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}