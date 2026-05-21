import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

/* ── Design tokens ── */
const T = {
  bg:       '#080d14',
  bgCard:   '#0d1520',
  bgCard2:  '#111c2b',
  border:   '#1a2d45',
  borderHi: '#f5a623',
  gold:     '#f5a623',
  goldDim:  'rgba(245,166,35,0.15)',
  green:    '#22c55e',
  greenDim: 'rgba(34,197,94,0.12)',
  red:      '#ef4444',
  redDim:   'rgba(239,68,68,0.12)',
  blue:     '#38bdf8',
  blueDim:  'rgba(56,189,248,0.12)',
  purple:   '#a78bfa',
  purpleDim:'rgba(167,139,250,0.12)',
  muted:    '#4a6380',
  text:     '#c8d8e8',
  textHi:   '#e8f4ff',
  font:     "'JetBrains Mono', 'Fira Code', monospace",
  fontUI:   "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
};

/* ── Helpers status ── */
const STATUS_CFG = {
  sent:       { label: 'DEPLOYED',  color: T.green,  bg: T.greenDim,  dot: '#22c55e', icon: '✓', pulse: true  },
  active:     { label: 'LIVE',      color: T.green,  bg: T.greenDim,  dot: '#22c55e', icon: '●', pulse: true  },
  draft:      { label: 'BUILDING',  color: T.gold,   bg: T.goldDim,   dot: '#f5a623', icon: '◎', pulse: false },
  scheduled:  { label: 'QUEUED',    color: T.blue,   bg: T.blueDim,   dot: '#38bdf8', icon: '◷', pulse: false },
  failed:     { label: 'FAILED',    color: T.red,    bg: T.redDim,    dot: '#ef4444', icon: '✕', pulse: false },
  paused:     { label: 'PAUSED',    color: T.muted,  bg: 'rgba(74,99,128,0.15)', dot: '#4a6380', icon: '⏸', pulse: false },
};

const TYPE_CFG = {
  email: { icon: '✉', label: 'Email',  color: T.blue   },
  sms:   { icon: '💬', label: 'SMS',   color: T.green  },
  push:  { icon: '🔔', label: 'Push',  color: T.purple },
};

/* ── Fake cloud infra metrics (générés par campagne id) ── */
function genMetrics(seed) {
  const h = (n) => ((seed * 17 + n * 31) % 100);
  return {
    cpu:      40 + h(1) % 50,
    mem:      30 + h(2) % 55,
    latency:  12 + h(3) % 88,
    uptime:   99 + (h(4) % 2 === 0 ? 0.9 : 0.7),
    region:   ['eu-west-1','us-east-1','ap-south-1','eu-central-1'][h(5) % 4],
    replicas: 1 + (h(6) % 3),
    buildMs:  800 + h(7) * 30,
    version:  `v${1 + h(8) % 4}.${h(9) % 10}.${h(10) % 20}`,
  };
}

/* ── Pipeline steps ── */
const PIPE_STEPS = ['Source', 'Build', 'Test', 'Preview', 'Deploy'];

function getPipelineStage(status) {
  if (status === 'sent' || status === 'active') return 5;
  if (status === 'draft') return 2;
  if (status === 'scheduled') return 3;
  if (status === 'failed') return 2;
  return 1;
}

/* ─────────────────────────────────────────────
   COMPOSANTS UTILITAIRES
───────────────────────────────────────────── */

function PulseDot({ color, size = 8 }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: size, height: size }}>
      <span style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: color, opacity: 0.4,
        animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
      }} />
      <span style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'block' }} />
    </span>
  );
}

function MiniBar({ value, color, max = 100 }) {
  return (
    <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', flex: 1 }}>
      <div style={{
        height: '100%', borderRadius: 2,
        width: `${Math.min(value, max)}%`,
        background: value > 80 ? T.red : value > 60 ? T.gold : color,
        transition: 'width 1s ease',
      }} />
    </div>
  );
}

function StatChip({ label, value, color = T.muted }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 2,
      padding: '8px 12px', borderRadius: 8,
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid ${T.border}`,
    }}>
      <span style={{ fontSize: 9, color: T.muted, fontFamily: T.font, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: T.font }}>{value}</span>
    </div>
  );
}

function LogLine({ text, type = 'info', delay = 0 }) {
  const colors = { info: T.muted, success: T.green, warn: T.gold, error: T.red, cmd: T.blue };
  const prefixes = { info: '  ', success: '✓ ', warn: '⚠ ', error: '✕ ', cmd: '$ ' };
  return (
    <div style={{
      fontFamily: T.font, fontSize: 11, color: colors[type],
      lineHeight: 1.7, animation: `fadeIn 0.3s ease ${delay}ms both`,
    }}>
      <span style={{ color: T.muted, marginRight: 8, userSelect: 'none' }}>{prefixes[type]}</span>
      {text}
    </div>
  );
}

/* ─────────────────────────────────────────────
   CARD CAMPAGNE — style Vercel deployment
───────────────────────────────────────────── */
function DeploymentCard({ camp, idx, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CFG[camp.status] || STATUS_CFG.draft;
  const type   = TYPE_CFG[camp.type?.toLowerCase()] || TYPE_CFG.email;
  const m      = genMetrics(camp.id || idx + 1);
  const stage  = getPipelineStage(camp.status);
  const isDeployed = camp.status === 'sent' || camp.status === 'active';

  /* Fake preview URL */
  const previewUrl = `https://${camp.title?.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')}-${String(camp.id || idx+1).padStart(4,'0')}.digipip.app`;

  const logs = isDeployed ? [
    { text: `git checkout main`, type: 'cmd' },
    { text: `Building campaign "${camp.title}"...`, type: 'info' },
    { text: `Running ${camp.type?.toUpperCase()} template engine`, type: 'info' },
    { text: `Compiling audience segments... done`, type: 'success' },
    { text: `Deploying to ${m.region} (${m.replicas} replica${m.replicas>1?'s':''})`, type: 'info' },
    { text: `Health check passed — latency ${m.latency}ms`, type: 'success' },
    { text: `Deployment complete in ${m.buildMs}ms`, type: 'success' },
  ] : camp.status === 'failed' ? [
    { text: `git checkout main`, type: 'cmd' },
    { text: `Building campaign "${camp.title}"...`, type: 'info' },
    { text: `ERROR: Template validation failed`, type: 'error' },
    { text: `Retrying... (2/3)`, type: 'warn' },
    { text: `Build failed — rollback initiated`, type: 'error' },
  ] : [
    { text: `git checkout main`, type: 'cmd' },
    { text: `Queued — waiting for scheduler`, type: 'warn' },
    { text: `Initializing build environment...`, type: 'info' },
  ];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? T.bgCard2 : T.bgCard,
        borderRadius: 16,
        border: `1px solid ${hovered ? T.borderHi : T.border}`,
        overflow: 'hidden',
        transition: 'all 0.25s',
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered ? `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,166,35,0.1)` : '0 4px 20px rgba(0,0,0,0.3)',
        animation: `slideUp 0.4s ease ${idx * 80}ms both`,
        fontFamily: T.fontUI,
      }}
    >
      {/* ── Top bar : repo style ── */}
      <div style={{
        padding: '14px 20px',
        borderBottom: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'rgba(0,0,0,0.2)',
      }}>
        {/* Dot status */}
        <PulseDot color={status.dot} size={status.pulse ? 8 : 8} />
        {/* Type badge */}
        <span style={{
          fontSize: 10, fontWeight: 700, fontFamily: T.font,
          color: type.color, background: `rgba(${type.color === T.blue ? '56,189,248' : type.color === T.green ? '34,197,94' : '167,139,250'},0.12)`,
          padding: '2px 8px', borderRadius: 4, border: `1px solid ${type.color}22`,
        }}>{type.icon} {type.label.toUpperCase()}</span>
        {/* Title */}
        <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: T.textHi, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {camp.title}
        </span>
        {/* Status badge */}
        <span style={{
          fontSize: 10, fontWeight: 800, fontFamily: T.font,
          color: status.color, background: status.bg,
          padding: '3px 10px', borderRadius: 4,
          border: `1px solid ${status.color}33`,
          letterSpacing: 0.5,
        }}>{status.icon} {status.label}</span>
      </div>

      {/* ── Preview URL (Vercel style) ── */}
      {isDeployed && (
        <div style={{
          padding: '10px 20px',
          borderBottom: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(34,197,94,0.04)',
        }}>
          <span style={{ fontSize: 10, color: T.green, fontFamily: T.font }}>🌐</span>
          <span style={{
            fontSize: 11, color: T.green, fontFamily: T.font,
            flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{previewUrl}</span>
          <button
            onClick={e => { e.stopPropagation(); navigator.clipboard?.writeText(previewUrl); }}
            style={{
              fontSize: 9, color: T.muted, background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${T.border}`, borderRadius: 4, padding: '2px 8px',
              cursor: 'pointer', fontFamily: T.font, transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = T.textHi; e.currentTarget.style.borderColor = T.muted; }}
            onMouseLeave={e => { e.currentTarget.style.color = T.muted; e.currentTarget.style.borderColor = T.border; }}
          >COPY</button>
        </div>
      )}

      {/* ── Pipeline stages ── */}
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {PIPE_STEPS.map((step, i) => {
            const done    = i < stage;
            const current = i === stage - 1 && !isDeployed;
            const failed  = camp.status === 'failed' && i === stage - 1;
            return (
              <React.Fragment key={step}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: failed ? T.redDim : done ? T.greenDim : current ? T.goldDim : 'rgba(255,255,255,0.04)',
                    border: `2px solid ${failed ? T.red : done ? T.green : current ? T.gold : T.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontFamily: T.font,
                    color: failed ? T.red : done ? T.green : current ? T.gold : T.muted,
                    transition: 'all 0.3s',
                    boxShadow: done ? `0 0 10px ${T.green}33` : current ? `0 0 10px ${T.gold}33` : 'none',
                  }}>
                    {failed ? '✕' : done ? '✓' : current ? '◎' : String(i+1)}
                  </div>
                  <span style={{ fontSize: 9, color: done ? T.green : current ? T.gold : T.muted, fontFamily: T.font, letterSpacing: 0.5 }}>
                    {step.toUpperCase()}
                  </span>
                </div>
                {i < PIPE_STEPS.length - 1 && (
                  <div style={{
                    height: 2, flex: 1, marginBottom: 16,
                    background: i < stage - 1 ? T.green : T.border,
                    transition: 'background 0.5s',
                  }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── Cloud metrics ── */}
      <div style={{ padding: '14px 20px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <StatChip label="Region"   value={m.region}          color={T.blue}   />
          <StatChip label="Version"  value={m.version}         color={T.purple} />
          <StatChip label="Replicas" value={`×${m.replicas}`}  color={T.gold}   />
          <StatChip label="Build"    value={`${m.buildMs}ms`}  color={T.text}   />
          <StatChip label="Uptime"   value={`${m.uptime}%`}    color={T.green}  />
        </div>

        {/* CPU / Memory bars */}
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { label: 'CPU', value: m.cpu,  color: T.blue   },
            { label: 'MEM', value: m.mem,  color: T.purple },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 9, fontFamily: T.font, color: T.muted, width: 28, flexShrink: 0 }}>{label}</span>
              <MiniBar value={value} color={color} />
              <span style={{ fontSize: 10, fontFamily: T.font, color: value > 80 ? T.red : T.muted, width: 32, textAlign: 'right' }}>
                {value}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Logs (expand/collapse) ── */}
      <div>
        <button
          onClick={e => { e.stopPropagation(); setExpanded(x => !x); }}
          style={{
            width: '100%', padding: '10px 20px',
            background: 'none', border: 'none', borderBottom: expanded ? `1px solid ${T.border}` : 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            color: T.muted, fontFamily: T.font, fontSize: 11,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = T.text}
          onMouseLeave={e => e.currentTarget.style.color = T.muted}
        >
          <span>{expanded ? '▾' : '▸'}</span>
          <span>Build logs</span>
          <span style={{ marginLeft: 'auto', color: isDeployed ? T.green : camp.status === 'failed' ? T.red : T.gold }}>
            {isDeployed ? '✓ Success' : camp.status === 'failed' ? '✕ Failed' : '◎ In progress'}
          </span>
        </button>

        {expanded && (
          <div style={{
            padding: '12px 20px 16px',
            background: 'rgba(0,0,0,0.3)',
            maxHeight: 160, overflowY: 'auto',
          }}>
            {logs.map((l, i) => <LogLine key={i} {...l} delay={i * 50} />)}
          </div>
        )}
      </div>

      {/* ── Footer actions ── */}
      <div style={{
        padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(0,0,0,0.15)',
      }}>
        <div style={{ fontSize: 11, color: T.muted, fontFamily: T.font }}>
          {camp.client?.name && <span>🏢 {camp.client.name}</span>}
          {camp.dateScheduled && (
            <span style={{ marginLeft: 10 }}>
              🕐 {new Date(camp.dateScheduled).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'})}
            </span>
          )}
        </div>
        <button
          onClick={() => onClick(camp.id)}
          style={{
            padding: '7px 16px', borderRadius: 8,
            background: hovered ? T.goldDim : 'rgba(255,255,255,0.05)',
            border: `1px solid ${hovered ? T.gold : T.border}`,
            color: hovered ? T.gold : T.muted,
            fontSize: 11, fontWeight: 700, fontFamily: T.font,
            cursor: 'pointer', transition: 'all 0.2s', letterSpacing: 0.5,
          }}
        >VIEW DETAILS →</button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   INFRA PANEL (Cloud overview)
───────────────────────────────────────────── */
function InfraPanel({ campagnes }) {
  const deployed  = campagnes.filter(c => c.status === 'sent' || c.status === 'active').length;
  const building  = campagnes.filter(c => c.status === 'draft' || c.status === 'scheduled').length;
  const failed    = campagnes.filter(c => c.status === 'failed').length;
  const total     = campagnes.length;
  const uptime    = total > 0 ? (99.1 + (deployed / (total || 1)) * 0.8).toFixed(2) : '—';
  const regions   = ['eu-west-1','us-east-1','ap-south-1'];

  return (
    <div style={{
      background: T.bgCard, borderRadius: 16,
      border: `1px solid ${T.border}`,
      padding: '20px 24px', marginBottom: 28,
      fontFamily: T.fontUI,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'rgba(56,189,248,0.1)',
          border: `1px solid rgba(56,189,248,0.2)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
        }}>☁</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.textHi }}>Cloud Infrastructure</div>
          <div style={{ fontSize: 11, color: T.muted, fontFamily: T.font }}>DigiPip Marketing Platform · Production</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <PulseDot color={T.green} size={7} />
          <span style={{ fontSize: 11, color: T.green, fontFamily: T.font }}>All systems operational</span>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 10 }}>
        {[
          { label: 'Deployed',  value: deployed,          color: T.green,  icon: '✓' },
          { label: 'Building',  value: building,          color: T.gold,   icon: '◎' },
          { label: 'Failed',    value: failed,            color: failed > 0 ? T.red : T.muted, icon: '✕' },
          { label: 'Uptime',    value: `${uptime}%`,      color: T.blue,   icon: '↑' },
          { label: 'Regions',   value: regions.length,    color: T.purple, icon: '⊕' },
          { label: 'Total',     value: total,             color: T.text,   icon: '#' },
        ].map(({ label, value, color, icon }) => (
          <div key={label} style={{
            padding: '12px 14px', borderRadius: 10,
            background: 'rgba(255,255,255,0.02)',
            border: `1px solid ${T.border}`,
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <span style={{ fontSize: 10, color: T.muted, fontFamily: T.font }}>{icon} {label.toUpperCase()}</span>
            <span style={{ fontSize: 20, fontWeight: 800, color, fontFamily: T.font, lineHeight: 1 }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Region status */}
      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        {regions.map(r => (
          <div key={r} style={{
            flex: 1, padding: '8px 12px', borderRadius: 8,
            background: 'rgba(34,197,94,0.05)',
            border: `1px solid rgba(34,197,94,0.15)`,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <PulseDot color={T.green} size={6} />
            <span style={{ fontSize: 10, color: T.green, fontFamily: T.font }}>{r}</span>
            <span style={{ fontSize: 10, color: T.muted, fontFamily: T.font, marginLeft: 'auto' }}>operational</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE PRINCIPALE
───────────────────────────────────────────── */
export default function PipelineStatus() {
  const navigate = useNavigate();
  const [campagnes, setCampagnes]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('all');
  const [search, setSearch]         = useState('');
  const [viewMode, setViewMode]     = useState('grid'); // grid | list

  useEffect(() => {
    api.get('/api/campagnes')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setCampagnes(data);
      })
      .catch(() => setCampagnes([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = campagnes.filter(c => {
    const mF = filter === 'all'
      || (filter === 'deployed' && (c.status === 'sent' || c.status === 'active'))
      || (filter === 'building' && (c.status === 'draft' || c.status === 'scheduled'))
      || (filter === 'failed'   && c.status === 'failed');
    const mS = !search
      || c.title?.toLowerCase().includes(search.toLowerCase())
      || c.client?.name?.toLowerCase().includes(search.toLowerCase());
    return mF && mS;
  });

  return (
    <div style={{
      padding: '32px 36px', background: T.bg, minHeight: '100vh',
      color: T.text, fontFamily: T.fontUI,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes ping    { 75%,100%{transform:scale(2);opacity:0} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes scanline{ 0%{top:-10%} 100%{top:110%} }
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:${T.border}; border-radius:3px; }
        ::-webkit-scrollbar-thumb:hover { background:${T.muted}; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(245,166,35,0.2), rgba(245,166,35,0.05))',
              border: `1px solid rgba(245,166,35,0.3)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>⚡</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.textHi, fontFamily: T.fontUI }}>
                Pipeline DevOps
              </h1>
              <div style={{ fontSize: 11, color: T.muted, fontFamily: T.font, marginTop: 2 }}>
                digipip-platform / marketing-engine · production
              </div>
            </div>
          </div>
        </div>

        {/* View toggle */}
        <div style={{ display: 'flex', gap: 4, padding: 4, background: T.bgCard, borderRadius: 10, border: `1px solid ${T.border}` }}>
          {[['grid','⊞ Grid'],['list','≡ List']].map(([v,l]) => (
            <button key={v} onClick={() => setViewMode(v)} style={{
              padding: '6px 14px', borderRadius: 7, fontSize: 11, fontFamily: T.font,
              background: viewMode === v ? 'rgba(245,166,35,0.15)' : 'none',
              border: `1px solid ${viewMode === v ? T.gold : 'transparent'}`,
              color: viewMode === v ? T.gold : T.muted, cursor: 'pointer', transition: 'all 0.15s',
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* ── Infra Overview ── */}
      {!loading && <InfraPanel campagnes={campagnes} />}

      {/* ── Filters bar ── */}
      <div style={{
        display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24,
        padding: '12px 16px', background: T.bgCard,
        borderRadius: 12, border: `1px solid ${T.border}`,
      }}>
        <span style={{ fontSize: 12, color: T.muted, fontFamily: T.font }}>$</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="filter deployments..."
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            color: T.text, fontFamily: T.font, fontSize: 12,
          }}
        />
        <div style={{ width: 1, height: 20, background: T.border }} />
        {[
          ['all',      '⊕ All',       T.muted ],
          ['deployed', '✓ Deployed',  T.green ],
          ['building', '◎ Building',  T.gold  ],
          ['failed',   '✕ Failed',    T.red   ],
        ].map(([v, l, c]) => (
          <button key={v} onClick={() => setFilter(v)} style={{
            padding: '5px 12px', borderRadius: 6, fontSize: 11, fontFamily: T.font,
            background: filter === v ? `${c}18` : 'none',
            border: `1px solid ${filter === v ? c : 'transparent'}`,
            color: filter === v ? c : T.muted,
            cursor: 'pointer', transition: 'all 0.15s', fontWeight: filter === v ? 700 : 400,
          }}>{l}</button>
        ))}
        <span style={{ fontSize: 11, color: T.muted, fontFamily: T.font }}>
          {filtered.length} deployment{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: viewMode === 'list' ? '1fr' : 'repeat(auto-fill,minmax(440px,1fr))',
          gap: 16,
        }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{
              height: 280, borderRadius: 16, background: T.bgCard,
              border: `1px solid ${T.border}`,
              backgroundImage: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.03) 50%,transparent 100%)',
              backgroundSize: '500px 100%',
              animation: 'slideUp 1.5s ease infinite',
            }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          padding: '80px 24px', textAlign: 'center',
          background: T.bgCard, borderRadius: 16, border: `1px solid ${T.border}`,
        }}>
          <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.2 }}>⚡</div>
          <p style={{ color: T.muted, fontFamily: T.font, fontSize: 13 }}>No deployments found</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: viewMode === 'list' ? '1fr' : 'repeat(auto-fill,minmax(440px,1fr))',
          gap: viewMode === 'list' ? 10 : 18,
        }}>
          {filtered.map((c, i) => (
            <DeploymentCard
              key={c.id}
              camp={c}
              idx={i}
              onClick={(id) => navigate(`/campagne/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}