import React, { useState } from 'react';

const C = {
  bg: '#f8fafc',
  card: '#ffffff',
  navy: '#0f172a',
  gold: '#f5a623',
  green: '#10b981',
  blue: '#3b82f6',
  textMuted: '#64748b',
};

export default function CampaignManagement() {
  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      name: "Ramadan 2026 - Grande Distribution",
      status: "live",
      channel: "Email • SMS • Push",
      infra: "Vercel + Render",
      scale: "Auto Scaling",
      traffic: "12.8k",
      roi: "4.85x",
      lastDeploy: "Il y a 2h"
    },
    {
      id: 2,
      name: "Conférence IA 2026 - B2B",
      status: "deploying",
      channel: "LinkedIn + Email",
      infra: "Render",
      scale: "Manual",
      traffic: "3.2k",
      roi: "2.4x",
      lastDeploy: "En cours..."
    },
    {
      id: 3,
      name: "Promo Printemps Fashion",
      status: "draft",
      channel: "SMS + Push",
      infra: "Vercel",
      scale: "Auto",
      traffic: "840",
      roi: "-",
      lastDeploy: "—"
    },
  ]);

  const deployCampaign = (id) => {
    setCampaigns(prev => prev.map(c => 
      c.id === id ? { ...c, status: "deploying", lastDeploy: "Déploiement en cours..." } : c
    ));

    setTimeout(() => {
      setCampaigns(prev => prev.map(c => 
        c.id === id ? { ...c, status: "live", lastDeploy: "À l'instant" } : c
      ));
      alert("✅ Campagne déployée avec succès sur l'infrastructure Cloud !");
    }, 1600);
  };

  return (
    <div style={{ background: C.bg, minHeight: '100vh', padding: '40px 32px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      <h1 style={{ fontSize: 32, fontWeight: 800, color: C.navy }}>Gestion & Déploiement des Campagnes</h1>
      <p style={{ color: C.textMuted, fontSize: 18 }}>Cloud Multi-Tenant • CI/CD • Scalabilité Automatique</p>

      <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* Liste des Campagnes */}
        <div>
          <h2 style={{ marginBottom: 20 }}>📋 Mes Campagnes</h2>
          {campaigns.map(camp => (
            <div key={camp.id} style={{
              background: C.card,
              padding: 24,
              borderRadius: 20,
              marginBottom: 16,
              border: camp.status === 'live' ? `2px solid ${C.green}` : '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0 }}>{camp.name}</h3>
                  <p style={{ color: C.textMuted, marginTop: 6 }}>{camp.channel}</p>
                </div>
                <span style={{
                  padding: '6px 18px',
                  borderRadius: 30,
                  fontWeight: 700,
                  background: camp.status === 'live' ? '#d1fae5' : camp.status === 'deploying' ? '#fef3c7' : '#f1f5f9',
                  color: camp.status === 'live' ? C.green : '#d97706'
                }}>
                  {camp.status.toUpperCase()}
                </span>
              </div>

              <div style={{ margin: '16px 0', fontSize: 14 }}>
                Infrastructure : <strong>{camp.infra}</strong> | Scalabilité : <strong style={{ color: C.blue }}>{camp.scale}</strong>
              </div>

              <div style={{ display: 'flex', gap: 20, fontSize: 14 }}>
                <div>Trafic : <strong>{camp.traffic}</strong></div>
                <div>ROI : <strong style={{ color: C.green }}>{camp.roi}</strong></div>
              </div>

              {camp.status !== 'live' && (
                <button 
                  onClick={() => deployCampaign(camp.id)}
                  style={{
                    marginTop: 16,
                    width: '100%',
                    padding: '14px',
                    background: C.gold,
                    color: '#111',
                    border: 'none',
                    borderRadius: 12,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  🚀 Déployer sur Cloud
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Statut Cloud & DevOps */}
        <div>
          <h2 style={{ marginBottom: 20 }}>☁️ Statut Infrastructure Cloud</h2>
          
          <div style={{ background: C.card, padding: 28, borderRadius: 20, marginBottom: 24 }}>
            <h3>Resources Actuelles</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
              <div>CPU Usage : <strong>37%</strong></div>
              <div>Mémoire : <strong>64%</strong></div>
              <div>Instances : <strong>Auto Scaling</strong></div>
              <div>Uptime : <strong style={{ color: C.green }}>99.92%</strong></div>
            </div>
          </div>

          <div style={{ background: C.card, padding: 28, borderRadius: 20 }}>
            <h3>Avantages DevOps</h3>
            <ul style={{ lineHeight: 2.4, marginTop: 12 }}>
              <li>✅ Déploiement en moins de 60 secondes</li>
              <li>✅ Scalabilité automatique selon le trafic</li>
              <li>✅ Isolation multi-tenant sécurisée</li>
              <li>✅ Rollback automatique</li>
              <li>✅ Monitoring Grafana en temps réel</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}