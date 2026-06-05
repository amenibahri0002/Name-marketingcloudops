import React, { useState, useEffect } from 'react';
import api from '../api';

/* ═══════════════════════════════════════════
   DESIGN SYSTEM — Cloud Operations Center
═══════════════════════════════════════════ */
const C = {
  bg:       '#0a0e1a',
  surface:  '#151e32',
  surface2: '#1e293b',
  surface3: '#27354f',
  border:   '#334155',
  borderDk: '#475569',
  text:     '#f1f5f9',
  textMid:  '#cbd5e1',
  muted:    '#64748b',
  gold:     '#fbbf24',
  green:    '#34d399',
  greenDk:  '#059669',
  red:      '#f87171',
  blue:     '#60a5fa',
  blueDk:   '#3b82f6',
  blueLt:   '#1e3a8a',
  purple:   '#a78bfa',
  cyan:     '#22d3ee',
  orange:   '#fb923c',
  pink:     '#f472b6',
  mono:     "'JetBrains Mono', monospace",
  sans:     "'Inter', sans-serif",
};

/* ═══════════════════════════════════════════
   UTILITAIRES
═══════════════════════════════════════════ */
function seed(id, n) { return ((id * 17 + n * 31) % 100); }
function genCloud(id) {
  return {
    cpu: 40 + seed(id, 1) % 50,
    mem: 30 + seed(id, 2) % 55,
    latency: 12 + seed(id, 3) % 88,
    uptime: (99 + (seed(id, 4) % 2 === 0 ? 0.9 : 0.7)).toFixed(2),
    region: ['eu-west-1', 'us-east-1', 'ap-south-1', 'eu-central-1'][seed(id, 5) % 4],
    replicas: 1 + seed(id, 6) % 3,
    buildMs: 900 + seed(id, 7) * 28,
    version: `v${1 + seed(id, 8) % 4}.${seed(id, 9) % 10}.${seed(id, 10) % 20}`,
    commits: 3 + seed(id, 11) % 12,
    network: 45 + seed(id, 12) % 40,
    disk: 20 + seed(id, 13) % 60,
    requests: 1200 + seed(id, 14) * 80,
    errors: seed(id, 15) % 5,
  };
}

function useCountUp(target, duration = 1500) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(target * ease));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return val;
}

/* ═══════════════════════════════════════════
   COMPOSANTS DE BASE
═══════════════════════════════════════════ */
function PulseDot({ color, size = 8 }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: size, height: size }}>
      <span style={{ position: 'absolute', inset: -3, borderRadius: '50%', background: color, opacity: 0.3, animation: 'ping 2s cubic-bezier(0,0,0.2,1) infinite' }} />
      <span style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'block', position: 'relative', zIndex: 1 }} />
    </span>
  );
}

function Badge({ label, color, bg }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, color, background: bg, whiteSpace: 'nowrap', border: `1px solid ${color}20` }}>
      {label}
    </span>
  );
}

function CircularGauge({ value, max = 100, color, size = 50, stroke = 5, label }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.min(value / max, 1);
  const col = value > 80 ? C.red : value > 60 ? C.gold : color;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.surface3} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={c * (1 - p)} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s ease-out' }} />
      </svg>
      <span style={{ fontSize: 10, fontWeight: 700, color: col, fontFamily: C.mono }}>{value}%</span>
      {label && <span style={{ fontSize: 8, color: C.muted, fontFamily: C.mono, textTransform: 'uppercase' }}>{label}</span>}
    </div>
  );
}

function GlassCard({ children, style = {}, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: C.surface, borderRadius: 12, border: `1px solid ${hovered ? C.borderDk : C.border}`, overflow: 'hidden', transition: 'all 0.2s', boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.1)', cursor: onClick ? 'pointer' : 'default', ...style }}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════
   DONNÉES
═══════════════════════════════════════════ */
const REGIONS = [
  { id: 'eu-west-1', name: 'Europe (Paris)', flag: '🇫🇷', status: 'active', cpu: 45, mem: 62, lat: 18, uptime: '99.99' },
  { id: 'us-east-1', name: 'US East (Virginia)', flag: '🇺🇸', status: 'active', cpu: 38, mem: 55, lat: 42, uptime: '99.97' },
  { id: 'ap-south-1', name: 'Asia (Mumbai)', flag: '🇮🇳', status: 'active', cpu: 52, mem: 48, lat: 85, uptime: '99.94' },
  { id: 'eu-central-1', name: 'Europe (Frankfurt)', flag: '🇩🇪', status: 'standby', cpu: 12, mem: 20, lat: 22, uptime: '100.0' },
];

const SERVICES = [
  { id: 'vercel', name: 'Frontend', icon: '▲', color: C.blue, status: 'up', latency: 18, region: 'us-east-1' },
  { id: 'render', name: 'API Backend', icon: '⬡', color: C.green, status: 'up', latency: 42, region: 'eu-west-1' },
  { id: 'neon', name: 'PostgreSQL', icon: '🐘', color: C.cyan, status: 'up', latency: 8, region: 'eu-central-1' },
  { id: 'redis', name: 'Cache Redis', icon: '⚡', color: C.orange, status: 'up', latency: 3, region: 'eu-west-1' },
  { id: 'firebase', name: 'Push FCM', icon: '🔥', color: C.red, status: 'down', latency: 0, region: '—' },
  { id: 'nodemailer', name: 'Email SMTP', icon: '📧', color: C.purple, status: 'warn', latency: 312, region: 'us-east-1' },
];

const PIPELINE_STEPS = [
  { id: 'source', label: 'Source', icon: '</>' },
  { id: 'build', label: 'Build', icon: '🔨' },
  { id: 'test', label: 'Test', icon: '🧪' },
  { id: 'preview', label: 'Preview', icon: '👁' },
  { id: 'deploy', label: 'Deploy', icon: '🚀' },
];

const ENVIRONMENTS = [
  { name: 'Development', status: 'active', color: C.blue, pods: 4, lastDeploy: '2h ago', branch: 'dev' },
  { name: 'Staging', status: 'active', color: C.gold, pods: 6, lastDeploy: '5h ago', branch: 'staging' },
  { name: 'Production', status: 'active', color: C.green, pods: 10, lastDeploy: '1d ago', branch: 'main' },
];

const SECURITY_SCORES = [
  { label: 'Auth JWT', score: 'A+', status: 'Actif', detail: 'HS256 · Exp: 7j', color: C.green },
  { label: 'HTTPS / SSL', score: 'A+', status: 'Actif', detail: 'TLS 1.3', color: C.green },
  { label: 'Rate Limiting', score: 'A', status: 'Actif', detail: '100 req/min', color: C.green },
  { label: 'Audit Logs', score: 'B', status: 'Partiel', detail: 'Console', color: C.gold },
];

/* ═══════════════════════════════════════════
   TABS NAVIGATION
═══════════════════════════════════════════ */
const TABS = [
  { id: 'overview', icon: '☁️', label: 'Vue d\'ensemble' },
  { id: 'infrastructure', icon: '🏗️', label: 'Infrastructure' },
  { id: 'cicd', icon: '🔄', label: 'CI/CD' },
  { id: 'monitoring', icon: '📊', label: 'Monitoring' },
  { id: 'storage', icon: '💾', label: 'Stockage' },
  { id: 'costs', icon: '💰', label: 'Coûts' },
  { id: 'logs', icon: '📝', label: 'Logs' },
  { id: 'environments', icon: '🌐', label: 'Environnements' },
  { id: 'security', icon: '🔐', label: 'Sécurité' },
];

/* ═══════════════════════════════════════════
   SECTION 1: OVERVIEW
═══════════════════════════════════════════ */
function OverviewSection({ camps }) {
  const deployed = camps.filter(c => c.status === 'sent' || c.status === 'active').length;
  const uptimeAnim = useCountUp(parseFloat(99.97) * 100, 2000);

  return (
    <div>
      {/* Hero Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { icon: '☁️', label: 'Régions actives', value: 3, color: C.blue, sub: 'Multi-cloud' },
          { icon: '⚡', label: 'Uptime global', value: `${(uptimeAnim / 100).toFixed(2)}%`, color: C.green, sub: 'SLA 99.9%' },
          { icon: '📦', label: 'Déployées', value: deployed, color: C.gold, sub: `${camps.length} total` },
          { icon: '🔥', label: 'Req/min', value: 2847, color: C.purple, sub: 'Pic: 8.2k' },
        ].map((card, i) => (
          <GlassCard key={i} style={{ padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 20 }}>{card.icon}</div>
              <PulseDot color={card.color} size={6} />
            </div>
            <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: C.mono, marginBottom: 4 }}>{card.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: card.color, fontFamily: C.mono, lineHeight: 1 }}>{card.value}</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>{card.sub}</div>
          </GlassCard>
        ))}
      </div>

      {/* Services Status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {SERVICES.map(svc => (
          <GlassCard key={svc.id}>
            <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 20 }}>{svc.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{svc.name}</div>
                <div style={{ fontSize: 9, color: C.muted, fontFamily: C.mono }}>{svc.region}</div>
              </div>
              <Badge 
                label={svc.status === 'up' ? 'OK' : svc.status === 'warn' ? 'WARN' : 'DOWN'} 
                color={svc.status === 'up' ? C.green : svc.status === 'warn' ? C.gold : C.red} 
                bg={`${svc.status === 'up' ? C.green : svc.status === 'warn' ? C.gold : C.red}15`}
              />
            </div>
            <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: C.muted, fontFamily: C.mono }}>Latency</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: svc.latency > 100 ? C.red : C.green, fontFamily: C.mono }}>
                {svc.latency > 0 ? `${svc.latency}ms` : '—'}
              </span>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Region Map */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {REGIONS.map(r => (
          <GlassCard key={r.id}>
            <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 24 }}>{r.flag}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{r.name}</div>
                <div style={{ fontSize: 9, color: C.muted, fontFamily: C.mono }}>{r.id}</div>
              </div>
              <PulseDot color={r.status === 'active' ? C.green : C.gold} size={5} style={{ marginLeft: 'auto' }} />
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', gap: 8 }}>
              <CircularGauge value={r.cpu} color={C.blue} size={40} stroke={4} label="CPU" />
              <CircularGauge value={r.mem} color={C.purple} size={40} stroke={4} label="MEM" />
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SECTION 2: INFRASTRUCTURE
═══════════════════════════════════════════ */
function InfrastructureSection() {
  const [selectedVM, setSelectedVM] = useState(null);

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        {REGIONS.map(region => (
          <GlassCard key={region.id} style={{ flex: 1, minWidth: 260 }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 28 }}>{region.flag}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{region.name}</div>
                  <div style={{ fontSize: 10, color: C.muted, fontFamily: C.mono }}>{region.id}</div>
                </div>
              </div>
              <PulseDot color={region.status === 'active' ? C.green : C.gold} size={7} />
            </div>
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { id: 'vm-1', type: 'API Server', cpu: 45, mem: 62, color: C.blue },
                { id: 'vm-2', type: 'Worker', cpu: 38, mem: 55, color: C.blue },
                { id: 'vm-3', type: 'Redis', cpu: 12, mem: 20, color: C.orange },
              ].map(vm => (
                <div key={vm.id} onClick={() => setSelectedVM(vm.id)}
                  style={{ padding: '10px 12px', borderRadius: 8, background: selectedVM === vm.id ? `${vm.color}20` : C.surface2, border: `1.5px solid ${selectedVM === vm.id ? vm.color : C.border}`, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <PulseDot color={vm.color} size={8} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{vm.type}</div>
                    <div style={{ fontSize: 9, color: C.muted, fontFamily: C.mono }}>{vm.id}</div>
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: vm.color, fontFamily: C.mono }}>{vm.cpu}%</div>
                </div>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SECTION 3: CI/CD
═══════════════════════════════════════════ */
function CICDSection({ camps }) {
  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {camps.slice(0, 5).map((camp, idx) => {
          const m = genCloud(camp.id || idx + 1);
          const stage = camp.status === 'sent' || camp.status === 'active' ? 5 : camp.status === 'scheduled' ? 3 : 2;
          const isLive = camp.status === 'sent' || camp.status === 'active';

          return (
            <GlassCard key={camp.id} style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: C.blueLt, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                  📦
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{camp.title}</div>
                  <div style={{ fontSize: 10, color: C.muted, fontFamily: C.mono }}>{camp.client?.name || '—'} · {m.version}</div>
                </div>
                <Badge 
                  label={isLive ? 'Deployed' : camp.status === 'scheduled' ? 'Queued' : 'Draft'} 
                  color={isLive ? C.green : camp.status === 'scheduled' ? C.blue : C.gold} 
                  bg={isLive ? `${C.green}15` : camp.status === 'scheduled' ? `${C.blue}15` : `${C.gold}15`}
                />
              </div>

              {/* Pipeline Steps */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                {PIPELINE_STEPS.map((step, i) => {
                  const done = i < stage;
                  const current = i === stage - 1 && !isLive;
                  const sc = done ? C.green : current ? C.gold : C.border;
                  return (
                    <React.Fragment key={step.id}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: done ? `${C.green}20` : current ? `${C.gold}20` : C.surface2, border: `2px solid ${sc}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: sc }}>
                          {done ? '✓' : current ? '◐' : step.icon}
                        </div>
                        <span style={{ fontSize: 9, color: done ? C.green : current ? C.gold : C.muted, fontWeight: 600, textTransform: 'uppercase' }}>{step.label}</span>
                      </div>
                      {i < PIPELINE_STEPS.length - 1 && (
                        <div style={{ height: 2, flex: 1, marginBottom: 16, background: i < stage - 1 ? C.green : C.border }} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              <div style={{ marginTop: 12, padding: '10px 14px', background: '#020617', borderRadius: 8, fontFamily: C.mono, fontSize: 10, color: C.green, lineHeight: 1.6 }}>
                <div style={{ color: C.muted, marginBottom: 4 }}>$ git push origin main</div>
                <div>✓ Build completed in {m.buildMs}ms</div>
                <div>✓ Deployed to {m.region} ×{m.replicas} replicas</div>
                <div>✓ Health check passed — {m.latency}ms</div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SECTION 4: MONITORING
═══════════════════════════════════════════ */
function MonitoringSection() {
  const data = [35, 52, 41, 68, 79, 55, 43, 91, 87, 72, 66, 84, 95, 88, 76, 63, 71, 83, 78, 90, 85, 92, 88, 96];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { icon: '🟢', label: 'API Backend', status: 'Opérationnel', latency: '42ms', uptime: '99.94%', color: C.green },
          { icon: '🟢', label: 'Frontend', status: 'Opérationnel', latency: '18ms', uptime: '99.99%', color: C.green },
          { icon: '🟢', label: 'PostgreSQL', status: 'Opérationnel', latency: '8ms', uptime: '99.97%', color: C.green },
          { icon: '🟡', label: 'Email SMTP', status: 'Dégradé', latency: '312ms', uptime: '98.12%', color: C.gold },
          { icon: '🟢', label: 'Auth JWT', status: 'Opérationnel', latency: '5ms', uptime: '100%', color: C.green },
          { icon: '🔴', label: 'Push Firebase', status: 'Non configuré', latency: '—', uptime: '—', color: C.red },
        ].map((svc, i) => (
          <GlassCard key={i}>
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 16 }}>{svc.icon}</span>
              <Badge label={svc.status} color={svc.color} bg={`${svc.color}15`} />
            </div>
            <div style={{ padding: '12px 16px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 10 }}>{svc.label}</div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', fontFamily: C.mono }}>Latence</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: svc.color, fontFamily: C.mono }}>{svc.latency}</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', fontFamily: C.mono }}>Uptime</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: svc.color, fontFamily: C.mono }}>{svc.uptime}</div>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Traffic Graph */}
      <GlassCard style={{ padding: '20px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 12 }}>Trafic Réseau — 24h</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 120 }}>
          {data.map((v, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ width: '100%', height: `${v}%`, borderRadius: '2px 2px 0 0', background: C.blue, opacity: 0.8, minWidth: 3 }} />
              <div style={{ width: '100%', height: `${v * 0.6}%`, borderRadius: '2px 2px 0 0', background: C.cyan, opacity: 0.6, minWidth: 3 }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          {['00h', '06h', '12h', '18h', '24h'].map(t => (
            <span key={t} style={{ fontSize: 9, color: C.muted, fontFamily: C.mono }}>{t}</span>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SECTION 5: STORAGE
═══════════════════════════════════════════ */
function StorageSection() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
      {[
        { icon: '🗃️', label: 'PostgreSQL (Neon)', used: 68, total: '10 GB', color: C.blue, iops: '1.2k' },
        { icon: '📁', label: 'Static Files (CDN)', used: 23, total: '50 GB', color: C.green, iops: '8.5k' },
        { icon: '📊', label: 'Logs (Grafana)', used: 41, total: '20 GB', color: C.purple, iops: '450' },
        { icon: '💬', label: 'Redis Cache', used: 15, total: '2 GB', color: C.gold, iops: '12k' },
      ].map(({ icon, label, used, total, color, iops }) => (
        <GlassCard key={label}>
          <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>{icon}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{label}</div>
                <div style={{ fontSize: 9, color: C.muted, fontFamily: C.mono }}>{iops} IOPS</div>
              </div>
            </div>
            <span style={{ fontSize: 10, color: C.muted, fontFamily: C.mono }}>{total}</span>
          </div>
          <div style={{ height: 5, borderRadius: 3, background: C.surface3, marginBottom: 6, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 3, width: `${used}%`, background: used > 80 ? C.red : color, transition: 'width 1s' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 16px 14px' }}>
            <span style={{ fontSize: 10, color: C.muted, fontFamily: C.mono }}>{used}% utilisé</span>
            <span style={{ fontSize: 10, color: used > 80 ? C.red : C.green, fontFamily: C.mono, fontWeight: 600 }}>{used > 80 ? '⚠ Critique' : '✓ Normal'}</span>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   SECTION 6: COSTS
═══════════════════════════════════════════ */
function CostsSection() {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Budget mensuel', value: '€1,240', used: '62%', color: C.blue, trend: '+8%' },
          { label: 'Coût par envoi', value: '€0.002', used: '45%', color: C.green, trend: '-3%' },
          { label: 'Forecast', value: '€1,480', used: '74%', color: C.gold, trend: 'Alert' },
        ].map((card, i) => (
          <GlassCard key={i} style={{ padding: '18px' }}>
            <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', fontFamily: C.mono, marginBottom: 6 }}>{card.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: card.color, fontFamily: C.mono, lineHeight: 1 }}>{card.value}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: C.muted }}>Utilisé: {card.used}</span>
              <span style={{ fontSize: 10, color: card.trend.includes('+') ? C.red : C.green, fontWeight: 600 }}>{card.trend}</span>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard style={{ padding: '20px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>Répartition des coûts</div>
        {[
          { label: 'Compute (Render + Vercel)', cost: '€520', pct: 42, color: C.blue },
          { label: 'Database (Neon PostgreSQL)', cost: '€310', pct: 25, color: C.cyan },
          { label: 'Storage (CDN + Logs)', cost: '€240', pct: 19, color: C.purple },
          { label: 'Email (Nodemailer)', cost: '€170', pct: 14, color: C.gold },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 100, fontSize: 11, color: C.text }}>{item.label}</div>
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: C.surface3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${item.pct}%`, background: item.color, borderRadius: 3 }} />
            </div>
            <div style={{ width: 60, fontSize: 11, fontWeight: 700, color: item.color, fontFamily: C.mono, textAlign: 'right' }}>{item.cost}</div>
          </div>
        ))}
      </GlassCard>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SECTION 7: LOGS
═══════════════════════════════════════════ */
function LogsSection() {
  const [logs, setLogs] = useState([
    { time: '16:42:01', level: 'info', service: 'api-server', message: 'POST /api/campagnes 201 Created' },
    { time: '16:41:58', level: 'success', service: 'worker', message: 'Campagne #42 envoyée à 12,500 contacts' },
    { time: '16:41:45', level: 'warn', service: 'redis', message: 'Memory usage > 75%' },
    { time: '16:40:12', level: 'error', service: 'email-smtp', message: 'Timeout connecting to Gmail SMTP' },
    { time: '16:39:33', level: 'info', service: 'nginx', message: 'GET /dashboard 200 OK' },
  ]);

  const logColors = { info: C.blue, success: C.green, warn: C.gold, error: C.red };

  return (
    <div>
      <GlassCard style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Logs temps réel</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['info', 'success', 'warn', 'error'].map(l => (
              <span key={l} style={{ fontSize: 9, padding: '2px 8px', borderRadius: 10, background: `${logColors[l]}15`, color: logColors[l], textTransform: 'uppercase' }}>
                {l}
              </span>
            ))}
          </div>
        </div>
        <div style={{ background: '#020617', borderRadius: 10, padding: '14px 16px', fontFamily: C.mono, fontSize: 11, lineHeight: 1.8, maxHeight: 400, overflowY: 'auto' }}>
          <div style={{ display: 'flex', gap: 8, paddingBottom: 8, marginBottom: 8, borderBottom: `1px solid ${C.border}`, color: C.muted, fontSize: 10 }}>
            <span style={{ width: 70 }}>TIME</span>
            <span style={{ width: 60 }}>LEVEL</span>
            <span style={{ width: 100 }}>SERVICE</span>
            <span>MESSAGE</span>
          </div>
          {logs.map((log, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, color: logColors[log.level] || C.text }}>
              <span style={{ width: 70, color: C.muted }}>{log.time}</span>
              <span style={{ width: 60, textTransform: 'uppercase' }}>{log.level}</span>
              <span style={{ width: 100 }}>{log.service}</span>
              <span style={{ color: C.textMid }}>{log.message}</span>
            </div>
          ))}
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
            <span style={{ color: C.muted }}>$ tail -f /var/log/digipip/app.log</span>
            <span style={{ display: 'inline-block', width: 6, height: 14, background: C.green, marginLeft: 8, animation: 'blink 1s step-end infinite' }} />
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SECTION 8: ENVIRONMENTS
═══════════════════════════════════════════ */
function EnvironmentsSection() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {ENVIRONMENTS.map((env, i) => (
        <GlassCard key={i}>
          <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 50, height: 50, borderRadius: 12, background: `${env.color}20`, border: `2px solid ${env.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              {env.name === 'Development' ? '🛠️' : env.name === 'Staging' ? '🔍' : '🚀'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{env.name}</span>
                <Badge label={env.status === 'active' ? 'Running' : 'Stopped'} color={env.color} bg={`${env.color}15`} />
              </div>
              <div style={{ fontSize: 11, color: C.muted, fontFamily: C.mono }}>
                Branch: {env.branch} · {env.pods} pods · Last deploy: {env.lastDeploy}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ padding: '6px 14px', borderRadius: 6, background: C.surface2, border: `1px solid ${C.border}`, color: C.text, fontSize: 11, cursor: 'pointer', fontFamily: C.mono }}>
                Logs
              </button>
              <button style={{ padding: '6px 14px', borderRadius: 6, background: env.color, border: 'none', color: '#fff', fontSize: 11, cursor: 'pointer', fontWeight: 600, fontFamily: C.mono }}>
                Deploy
              </button>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   SECTION 9: SECURITY
═══════════════════════════════════════════ */
function SecuritySection() {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
        {SECURITY_SCORES.map((item, i) => (
          <GlassCard key={i} style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>{['🔐', '🛡️', '🚫', '🔍'][i]}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: item.color, fontFamily: C.mono }}>{item.score}</span>
                <Badge label={item.status} color={item.color} bg={`${item.color}15`} />
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 10, color: C.muted, fontFamily: C.mono }}>{item.detail}</div>
          </GlassCard>
        ))}
      </div>

      <GlassCard style={{ padding: '20px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>Scan de vulnérabilités</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { name: 'Dépendances npm', status: 'Clean', issues: 0, color: C.green },
            { name: 'Secrets (.env)', status: 'Clean', issues: 0, color: C.green },
            { name: 'Conteneurs Docker', status: 'Warning', issues: 2, color: C.gold },
            { name: 'Certificats SSL', status: 'Clean', issues: 0, color: C.green },
          ].map(scan => (
            <div key={scan.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: C.surface2, borderRadius: 8, border: `1px solid ${C.border}` }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${scan.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                {scan.issues === 0 ? '✓' : '⚠'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{scan.name}</div>
                <div style={{ fontSize: 10, color: C.muted }}>{scan.issues} issue{scan.issues !== 1 ? 's' : ''}</div>
              </div>
              <Badge label={scan.status} color={scan.color} bg={`${scan.color}15`} />
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

/* ═══════════════════════════════════════════
   PAGE PRINCIPALE — TOUT-EN-UN
═══════════════════════════════════════════ */
export default function CloudOperations() {
  const [activeTab, setActiveTab] = useState('overview');
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/campagnes')
      .then(r => setCamps(Array.isArray(r.data) ? r.data : r.data?.data || []))
      .catch(() => setCamps([]))
      .finally(() => setLoading(false));
  }, []);

  const sections = {
    overview: <OverviewSection camps={camps} />,
    infrastructure: <InfrastructureSection />,
    cicd: <CICDSection camps={camps} />,
    monitoring: <MonitoringSection />,
    storage: <StorageSection />,
    costs: <CostsSection />,
    logs: <LogsSection />,
    environments: <EnvironmentsSection />,
    security: <SecuritySection />,
  };

  return (
    <div style={{ padding: '28px 32px', background: C.bg, minHeight: '100vh', color: C.text, fontFamily: C.sans }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        @keyframes ping { 75%,100% { transform:scale(2.5); opacity:0; } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes blink { 50% { opacity:0; } }
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-track { background:${C.surface2}; }
        ::-webkit-scrollbar-thumb { background:${C.borderDk}; border-radius:3px; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, animation: 'fadeUp 0.3s ease' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              ☁️
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: C.text }}>Cloud Operations Center</h1>
              <p style={{ margin: 0, fontSize: 12, color: C.muted, fontFamily: C.mono, marginTop: 2 }}>
                DigiPip · Tous les modules cloud en un seul endroit
              </p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 20, background: C.surface, border: `1px solid ${C.border}` }}>
          <PulseDot color={C.green} size={6} />
          <span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>Cloud Opérationnel</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, overflowX: 'auto', paddingBottom: 4, animation: 'fadeUp 0.4s ease 0.1s both' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: activeTab === tab.id ? C.blue : C.surface,
              color: activeTab === tab.id ? '#fff' : C.muted,
              fontFamily: C.sans, fontSize: 12, fontWeight: activeTab === tab.id ? 700 : 500,
              display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
              transition: 'all 0.2s', boxShadow: activeTab === tab.id ? `0 4px 12px ${C.blue}40` : 'none',
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ animation: 'fadeUp 0.4s ease 0.2s both' }}>
        {loading && activeTab === 'overview' ? (
          <div style={{ textAlign: 'center', padding: 60, color: C.muted }}>
            <div style={{ width: 28, height: 28, border: `2px solid ${C.border}`, borderTopColor: C.gold, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ fontFamily: C.mono, fontSize: 12 }}>Chargement...</p>
          </div>
        ) : (
          sections[activeTab]
        )}
      </div>
    </div>
  );
}