import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

/* ── Design tokens ── */
const T = {
  bg:        '#080d14',
  bgCard:    '#0d1520',
  bgCard2:   '#111c2b',
  border:    '#1a2d45',
  borderHi:  '#f5a623',
  gold:      '#f5a623',
  goldDim:   'rgba(245,166,35,0.15)',
  green:     '#22c55e',
  greenDim:  'rgba(34,197,94,0.12)',
  red:       '#ef4444',
  redDim:    'rgba(239,68,68,0.12)',
  blue:      '#38bdf8',
  blueDim:   'rgba(56,189,248,0.12)',
  purple:    '#a78bfa',
  purpleDim: 'rgba(167,139,250,0.12)',
  muted:     '#4a6380',
  text:      '#c8d8e8',
  textHi:    '#e8f4ff',
  font:      "'JetBrains Mono','Fira Code',monospace",
  fontUI:    "'Plus Jakarta Sans','Segoe UI',sans-serif",
};

const STATUS_CFG = {
  sent:      { label:'DEPLOYED', color:T.green,  bg:T.greenDim,  dot:'#22c55e', icon:'✓', pulse:true  },
  active:    { label:'LIVE',     color:T.green,  bg:T.greenDim,  dot:'#22c55e', icon:'●', pulse:true  },
  draft:     { label:'BUILDING', color:T.gold,   bg:T.goldDim,   dot:'#f5a623', icon:'◎', pulse:false },
  scheduled: { label:'QUEUED',   color:T.blue,   bg:T.blueDim,   dot:'#38bdf8', icon:'◷', pulse:false },
  failed:    { label:'FAILED',   color:T.red,    bg:T.redDim,    dot:'#ef4444', icon:'✕', pulse:false },
  paused:    { label:'PAUSED',   color:T.muted,  bg:'rgba(74,99,128,0.15)', dot:'#4a6380', icon:'⏸', pulse:false },
};

const TYPE_CFG = {
  email: { icon:'✉',  label:'Email', color:T.blue   },
  sms:   { icon:'💬', label:'SMS',   color:T.green  },
  push:  { icon:'🔔', label:'Push',  color:T.purple },
};

const PIPE_STEPS = ['Source','Build','Test','Preview','Deploy'];

function getPipelineStage(status) {
  if (status === 'sent' || status === 'active') return 5;
  if (status === 'draft')     return 2;
  if (status === 'scheduled') return 3;
  if (status === 'failed')    return 2;
  return 1;
}

function genMetrics(seed) {
  const h = n => ((seed * 17 + n * 31) % 100);
  return {
    cpu:      40 + h(1) % 50,
    mem:      30 + h(2) % 55,
    latency:  12 + h(3) % 88,
    uptime:   (99 + (h(4) % 2 === 0 ? 0.9 : 0.7)).toFixed(1),
    region:   ['eu-west-1','us-east-1','ap-south-1','eu-central-1'][h(5) % 4],
    replicas: 1 + h(6) % 3,
    buildMs:  800 + h(7) * 30,
    version:  `v${1 + h(8) % 4}.${h(9) % 10}.${h(10) % 20}`,
  };
}

/* ── Petits composants ── */
function PulseDot({ color, size = 8 }) {
  return (
    <span style={{ position:'relative', display:'inline-flex', width:size, height:size, flexShrink:0 }}>
      <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:color, opacity:0.4, animation:'ping 1.5s cubic-bezier(0,0,0.2,1) infinite' }} />
      <span style={{ width:size, height:size, borderRadius:'50%', background:color, display:'block' }} />
    </span>
  );
}

function MiniBar({ value, color }) {
  return (
    <div style={{ height:4, borderRadius:2, background:'rgba(255,255,255,0.06)', overflow:'hidden', flex:1 }}>
      <div style={{ height:'100%', borderRadius:2, width:`${Math.min(value,100)}%`, background: value>80 ? T.red : value>60 ? T.gold : color, transition:'width 1s ease' }} />
    </div>
  );
}

function StatChip({ label, value, color = T.muted }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:2, padding:'8px 12px', borderRadius:8, background:'rgba(255,255,255,0.03)', border:`1px solid ${T.border}` }}>
      <span style={{ fontSize:9, color:T.muted, fontFamily:T.font, textTransform:'uppercase', letterSpacing:1 }}>{label}</span>
      <span style={{ fontSize:13, fontWeight:700, color, fontFamily:T.font }}>{value}</span>
    </div>
  );
}

function LogLine({ text, type='info', delay=0 }) {
  const colors   = { info:T.muted, success:T.green, warn:T.gold, error:T.red, cmd:T.blue };
  const prefixes = { info:'  ', success:'✓ ', warn:'⚠ ', error:'✕ ', cmd:'$ ' };
  return (
    <div style={{ fontFamily:T.font, fontSize:11, color:colors[type], lineHeight:1.7, animation:`fadeIn 0.3s ease ${delay}ms both` }}>
      <span style={{ color:T.muted, marginRight:8, userSelect:'none' }}>{prefixes[type]}</span>{text}
    </div>
  );
}

/* ══════════════════════════════════════════════
   PREVIEW MODALE — aperçu campagne style Vercel
══════════════════════════════════════════════ */
function CampaignPreviewModal({ camp, onClose }) {
  const [detail, setDetail]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied]   = useState(false);

  const previewUrl = `https://${(camp.title||'campagne').toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')}-${String(camp.id||1).padStart(4,'0')}.digipip.app`;

  useEffect(() => {
    api.get(`/api/campagnes/${camp.id}`)
      .then(r => setDetail(r.data))
      .catch(() => setDetail(camp))
      .finally(() => setLoading(false));
  }, [camp.id]);

  const copy = () => {
    navigator.clipboard?.writeText(previewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const data = detail || camp;
  const status = STATUS_CFG[data.status] || STATUS_CFG.draft;
  const type   = TYPE_CFG[data.type?.toLowerCase()] || TYPE_CFG.email;
  const m      = genMetrics(camp.id || 1);
  const isDeployed = data.status === 'sent' || data.status === 'active';

  return (
    /* Overlay */
    <div
      onClick={onClose}
      style={{
        position:'fixed', inset:0, zIndex:1000,
        background:'rgba(5,10,18,0.85)',
        backdropFilter:'blur(6px)',
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:'24px',
        animation:'fadeIn 0.2s ease',
      }}
    >
      {/* Modal */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width:'100%', maxWidth:960, maxHeight:'90vh',
          background:T.bgCard, borderRadius:20,
          border:`1px solid ${T.border}`,
          boxShadow:'0 40px 120px rgba(0,0,0,0.7)',
          display:'flex', flexDirection:'column',
          overflow:'hidden',
          animation:'slideUp 0.3s ease',
          fontFamily:T.fontUI,
        }}
      >
        {/* ── Modal top bar : style browser/Vercel ── */}
        <div style={{
          padding:'14px 20px',
          background:'rgba(0,0,0,0.4)',
          borderBottom:`1px solid ${T.border}`,
          display:'flex', alignItems:'center', gap:12,
          flexShrink:0,
        }}>
          {/* Traffic lights */}
          <div style={{ display:'flex', gap:6 }}>
            {['#ef4444','#f5a623','#22c55e'].map((c,i) => (
              <div key={i} onClick={i===0 ? onClose : undefined}
                style={{ width:12, height:12, borderRadius:'50%', background:c, cursor:i===0?'pointer':'default', opacity:0.85 }} />
            ))}
          </div>

          {/* URL bar */}
          <div style={{
            flex:1, display:'flex', alignItems:'center', gap:8,
            background:'rgba(255,255,255,0.05)', borderRadius:8,
            padding:'6px 14px', border:`1px solid ${T.border}`,
          }}>
            <PulseDot color={isDeployed ? T.green : T.gold} size={7} />
            <span style={{ fontSize:12, color:T.text, fontFamily:T.font, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {previewUrl}
            </span>
            <button onClick={copy} style={{
              fontSize:9, color: copied ? T.green : T.muted,
              background:'none', border:'none', cursor:'pointer',
              fontFamily:T.font, padding:'0 4px', transition:'color 0.2s',
            }}>{copied ? '✓ COPIED' : 'COPY'}</button>
          </div>

          {/* Status badge */}
          <span style={{
            fontSize:10, fontWeight:800, fontFamily:T.font,
            color:status.color, background:status.bg,
            padding:'4px 12px', borderRadius:6,
            border:`1px solid ${status.color}33`,
          }}>{status.icon} {status.label}</span>

          {/* Close */}
          <button onClick={onClose} style={{
            width:30, height:30, borderRadius:8,
            background:'rgba(255,255,255,0.06)', border:`1px solid ${T.border}`,
            color:T.muted, cursor:'pointer', fontSize:14,
            display:'flex', alignItems:'center', justifyContent:'center',
            transition:'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color=T.red; e.currentTarget.style.borderColor=T.red; }}
            onMouseLeave={e => { e.currentTarget.style.color=T.muted; e.currentTarget.style.borderColor=T.border; }}
          >✕</button>
        </div>

        {/* ── Corps : 2 colonnes ── */}
        <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

          {/* COLONNE GAUCHE — aperçu de la campagne */}
          <div style={{
            flex:1, overflowY:'auto', padding:'32px 36px',
            borderRight:`1px solid ${T.border}`,
            background:'linear-gradient(160deg, #0d1520 0%, #080d14 100%)',
          }}>
            {loading ? (
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {[80,50,100,60,40].map((w,i) => (
                  <div key={i} style={{ height:14, width:`${w}%`, borderRadius:6, background:T.border, animation:'pulse 1.5s ease infinite' }} />
                ))}
              </div>
            ) : (
              <>
                {/* Type tag */}
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
                  <span style={{
                    fontSize:11, fontWeight:700, fontFamily:T.font,
                    color:type.color, background:`${type.color}18`,
                    padding:'3px 10px', borderRadius:4, border:`1px solid ${type.color}33`,
                  }}>{type.icon} {type.label.toUpperCase()}</span>
                  {data.client?.name && (
                    <span style={{ fontSize:11, color:T.muted, fontFamily:T.font }}>🏢 {data.client.name}</span>
                  )}
                </div>

                {/* Titre */}
                <h1 style={{ fontSize:28, fontWeight:800, color:T.textHi, lineHeight:1.2, margin:'0 0 16px' }}>
                  {data.title}
                </h1>

                {/* Date pill */}
                {(data.dateScheduled || data.date) && (
                  <div style={{
                    display:'inline-flex', alignItems:'center', gap:6,
                    padding:'6px 16px', borderRadius:20,
                    background:T.blueDim, border:`1px solid ${T.blue}33`,
                    marginBottom:20,
                  }}>
                    <span style={{ fontSize:12, color:T.blue }}>
                      📅 {new Date(data.dateScheduled || data.date).toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'})}
                    </span>
                  </div>
                )}

                {/* Description */}
                <p style={{ fontSize:15, lineHeight:1.8, color:'#8eacc8', marginBottom:28 }}>
                  {data.description || "Campagne marketing déployée sur la plateforme DigiPip. Experts, innovateurs et visionnaires réunis pour façonner l'avenir technologique."}
                </p>

                {/* Divider */}
                <div style={{ height:1, background:`linear-gradient(90deg, ${T.border}, transparent)`, marginBottom:24 }} />

                {/* Métriques campagne */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:24 }}>
                  {[
                    { label:'Type de canal',     value: (data.type||'Multi-canal').toUpperCase(), color:type.color },
                    { label:'Statut déploiement',value: status.label, color:status.color },
                    { label:'Audience estimée',  value:'12 500 contacts', color:T.text },
                    { label:'Places restantes',  value:'47 disponibles',  color:T.green },
                  ].map(({label,value,color}) => (
                    <div key={label} style={{
                      padding:'14px 16px', borderRadius:10,
                      background:'rgba(255,255,255,0.03)',
                      border:`1px solid ${T.border}`,
                    }}>
                      <div style={{ fontSize:10, color:T.muted, fontFamily:T.font, marginBottom:4, textTransform:'uppercase', letterSpacing:0.8 }}>{label}</div>
                      <div style={{ fontSize:14, fontWeight:700, color }}>{value}</div>
                    </div>
                  ))}
                </div>

                {/* CTA buttons */}
                <div style={{ display:'flex', gap:10 }}>
                  <button style={{
                    flex:1, padding:'14px', borderRadius:10,
                    background:T.gold, border:'none',
                    color:'#0d0a00', fontSize:13, fontWeight:800,
                    cursor:'pointer', fontFamily:T.fontUI,
                    transition:'opacity 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity='0.9'}
                    onMouseLeave={e => e.currentTarget.style.opacity='1'}
                  >S'inscrire à cette campagne</button>
                  <button style={{
                    flex:1, padding:'14px', borderRadius:10,
                    background:'rgba(255,255,255,0.05)',
                    border:`1px solid ${T.border}`,
                    color:T.text, fontSize:13, fontWeight:600,
                    cursor:'pointer', fontFamily:T.fontUI,
                    transition:'all 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor=T.muted; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor=T.border; }}
                  >Voir le programme</button>
                </div>
              </>
            )}
          </div>

          {/* COLONNE DROITE — infra / pipeline */}
          <div style={{ width:280, flexShrink:0, overflowY:'auto', padding:'24px 20px', display:'flex', flexDirection:'column', gap:16 }}>

            {/* Pipeline steps */}
            <div style={{ background:'rgba(0,0,0,0.2)', borderRadius:12, padding:'16px', border:`1px solid ${T.border}` }}>
              <div style={{ fontSize:10, color:T.muted, fontFamily:T.font, textTransform:'uppercase', letterSpacing:1, marginBottom:14 }}>
                ⚡ CI/CD Pipeline
              </div>
              {PIPE_STEPS.map((step, i) => {
                const stage = getPipelineStage(data.status);
                const done    = i < stage;
                const current = i === stage - 1 && !isDeployed;
                const failed  = data.status === 'failed' && i === stage - 1;
                return (
                  <div key={step} style={{ display:'flex', alignItems:'center', gap:10, marginBottom: i < PIPE_STEPS.length-1 ? 0 : 0 }}>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                      <div style={{
                        width:22, height:22, borderRadius:'50%', flexShrink:0,
                        background: failed ? T.redDim : done ? T.greenDim : current ? T.goldDim : 'rgba(255,255,255,0.04)',
                        border:`2px solid ${failed ? T.red : done ? T.green : current ? T.gold : T.border}`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:9, fontFamily:T.font, color: failed ? T.red : done ? T.green : current ? T.gold : T.muted,
                      }}>{failed ? '✕' : done ? '✓' : current ? '◎' : i+1}</div>
                      {i < PIPE_STEPS.length-1 && (
                        <div style={{ width:2, height:18, background: done ? T.green : T.border, transition:'background 0.5s' }} />
                      )}
                    </div>
                    <span style={{ fontSize:11, color: done ? T.green : current ? T.gold : T.muted, fontFamily:T.font }}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Cloud metrics */}
            <div style={{ background:'rgba(0,0,0,0.2)', borderRadius:12, padding:'16px', border:`1px solid ${T.border}` }}>
              <div style={{ fontSize:10, color:T.muted, fontFamily:T.font, textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>
                ☁ Cloud Infra
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <StatChip label="Region"   value={m.region}         color={T.blue}   />
                <StatChip label="Version"  value={m.version}        color={T.purple} />
                <StatChip label="Replicas" value={`×${m.replicas}`} color={T.gold}   />
                <StatChip label="Uptime"   value={`${m.uptime}%`}   color={T.green}  />
              </div>
              <div style={{ marginTop:12, display:'flex', flexDirection:'column', gap:8 }}>
                {[{label:'CPU',value:m.cpu,color:T.blue},{label:'MEM',value:m.mem,color:T.purple}].map(({label,value,color}) => (
                  <div key={label} style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:9, fontFamily:T.font, color:T.muted, width:24, flexShrink:0 }}>{label}</span>
                    <MiniBar value={value} color={color} />
                    <span style={{ fontSize:9, fontFamily:T.font, color: value>80 ? T.red : T.muted, width:28, textAlign:'right' }}>{value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Build logs */}
            <div style={{ background:'rgba(0,0,0,0.3)', borderRadius:12, padding:'16px', border:`1px solid ${T.border}`, flex:1 }}>
              <div style={{ fontSize:10, color:T.muted, fontFamily:T.font, textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>
                📋 Build logs
              </div>
              {(isDeployed ? [
                {text:`git checkout main`,type:'cmd'},
                {text:`Building "${data.title}"...`,type:'info'},
                {text:`Template engine OK`,type:'success'},
                {text:`Segments compiled`,type:'success'},
                {text:`Deploy → ${m.region}`,type:'info'},
                {text:`Latency ${m.latency}ms ✓`,type:'success'},
                {text:`Done in ${m.buildMs}ms`,type:'success'},
              ] : data.status === 'failed' ? [
                {text:`git checkout main`,type:'cmd'},
                {text:`Building "${data.title}"...`,type:'info'},
                {text:`ERROR: Template validation`,type:'error'},
                {text:`Rollback initiated`,type:'error'},
              ] : [
                {text:`Queued for build`,type:'warn'},
                {text:`Initializing env...`,type:'info'},
              ]).map((l,i) => <LogLine key={i} {...l} delay={i*40} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   CARD DÉPLOIEMENT (ligne dans la grille)
══════════════════════════════════════════════ */
function DeploymentCard({ camp, idx, onPreview }) {
  const [hovered, setHovered] = useState(false);
  const status = STATUS_CFG[camp.status] || STATUS_CFG.draft;
  const type   = TYPE_CFG[camp.type?.toLowerCase()] || TYPE_CFG.email;
  const m      = genMetrics(camp.id || idx+1);
  const isDeployed = camp.status === 'sent' || camp.status === 'active';
  const previewUrl = `https://${(camp.title||'campagne').toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')}-${String(camp.id||idx+1).padStart(4,'0')}.digipip.app`;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? T.bgCard2 : T.bgCard,
        borderRadius:16,
        border:`1px solid ${hovered ? T.borderHi : T.border}`,
        overflow:'hidden',
        transition:'all 0.25s',
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered ? `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,166,35,0.1)` : '0 4px 20px rgba(0,0,0,0.3)',
        animation:`slideUp 0.4s ease ${idx*80}ms both`,
        fontFamily:T.fontUI,
      }}
    >
      {/* Top bar */}
      <div style={{
        padding:'13px 18px', borderBottom:`1px solid ${T.border}`,
        display:'flex', alignItems:'center', gap:10,
        background:'rgba(0,0,0,0.2)',
      }}>
        <PulseDot color={status.dot} size={8} />
        <span style={{
          fontSize:10, fontWeight:700, fontFamily:T.font, color:type.color,
          background:`${type.color}18`, padding:'2px 8px', borderRadius:4,
          border:`1px solid ${type.color}22`,
        }}>{type.icon} {type.label.toUpperCase()}</span>
        <span style={{ flex:1, fontSize:13, fontWeight:700, color:T.textHi, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {camp.title}
        </span>
        <span style={{
          fontSize:10, fontWeight:800, fontFamily:T.font, color:status.color, background:status.bg,
          padding:'3px 10px', borderRadius:4, border:`1px solid ${status.color}33`,
        }}>{status.icon} {status.label}</span>
      </div>

      {/* Preview URL */}
      {isDeployed && (
        <div style={{
          padding:'8px 18px', borderBottom:`1px solid ${T.border}`,
          display:'flex', alignItems:'center', gap:8,
          background:'rgba(34,197,94,0.04)',
        }}>
          <span style={{ fontSize:10, color:T.green }}>🌐</span>
          <span style={{ fontSize:11, color:T.green, fontFamily:T.font, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {previewUrl}
          </span>
        </div>
      )}

      {/* Pipeline mini */}
      <div style={{ padding:'14px 18px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', gap:0 }}>
        {PIPE_STEPS.map((step, i) => {
          const stage   = getPipelineStage(camp.status);
          const done    = i < stage;
          const current = i === stage-1 && !isDeployed;
          const failed  = camp.status === 'failed' && i === stage-1;
          return (
            <React.Fragment key={step}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, flex:1 }}>
                <div style={{
                  width:22, height:22, borderRadius:'50%',
                  background: failed ? T.redDim : done ? T.greenDim : current ? T.goldDim : 'rgba(255,255,255,0.04)',
                  border:`2px solid ${failed ? T.red : done ? T.green : current ? T.gold : T.border}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:9, fontFamily:T.font,
                  color: failed ? T.red : done ? T.green : current ? T.gold : T.muted,
                  boxShadow: done ? `0 0 8px ${T.green}33` : 'none',
                }}>{failed ? '✕' : done ? '✓' : current ? '◎' : i+1}</div>
                <span style={{ fontSize:8, color: done ? T.green : current ? T.gold : T.muted, fontFamily:T.font }}>{step.toUpperCase()}</span>
              </div>
              {i < PIPE_STEPS.length-1 && (
                <div style={{ height:2, flex:1, marginBottom:14, background: i < stage-1 ? T.green : T.border }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Stats */}
      <div style={{ padding:'12px 18px', borderBottom:`1px solid ${T.border}`, display:'flex', gap:6, flexWrap:'wrap' }}>
        <StatChip label="Region"   value={m.region}         color={T.blue}   />
        <StatChip label="Version"  value={m.version}        color={T.purple} />
        <StatChip label="Replicas" value={`×${m.replicas}`} color={T.gold}   />
        <StatChip label="Uptime"   value={`${m.uptime}%`}   color={T.green}  />
      </div>

      {/* Footer */}
      <div style={{ padding:'13px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(0,0,0,0.15)' }}>
        <div style={{ fontSize:11, color:T.muted, fontFamily:T.font }}>
          {camp.client?.name && <span>🏢 {camp.client.name}</span>}
          {camp.dateScheduled && (
            <span style={{ marginLeft:8 }}>
              🕐 {new Date(camp.dateScheduled).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'})}
            </span>
          )}
        </div>
        {/* BOUTON PREVIEW — plus de navigation */}
        <button
          onClick={() => onPreview(camp)}
          style={{
            padding:'7px 16px', borderRadius:8,
            background: hovered ? 'rgba(245,166,35,0.15)' : 'rgba(255,255,255,0.05)',
            border:`1px solid ${hovered ? T.gold : T.border}`,
            color: hovered ? T.gold : T.muted,
            fontSize:11, fontWeight:700, fontFamily:T.font,
            cursor:'pointer', transition:'all 0.2s', letterSpacing:0.5,
            display:'flex', alignItems:'center', gap:6,
          }}
        >⊞ PREVIEW</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   INFRA PANEL
══════════════════════════════════════════════ */
function InfraPanel({ campagnes }) {
  const deployed = campagnes.filter(c => c.status==='sent'||c.status==='active').length;
  const building = campagnes.filter(c => c.status==='draft'||c.status==='scheduled').length;
  const failed   = campagnes.filter(c => c.status==='failed').length;
  const total    = campagnes.length;
  const uptime   = total > 0 ? (99.1 + (deployed/(total||1))*0.8).toFixed(2) : '—';
  const regions  = ['eu-west-1','us-east-1','ap-south-1'];

  return (
    <div style={{ background:T.bgCard, borderRadius:16, border:`1px solid ${T.border}`, padding:'20px 24px', marginBottom:24, fontFamily:T.fontUI }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
        <div style={{ width:32, height:32, borderRadius:8, background:T.blueDim, border:`1px solid ${T.blue}33`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>☁</div>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:T.textHi }}>Cloud Infrastructure</div>
          <div style={{ fontSize:11, color:T.muted, fontFamily:T.font }}>DigiPip Marketing Platform · Production</div>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6 }}>
          <PulseDot color={T.green} size={7} />
          <span style={{ fontSize:11, color:T.green, fontFamily:T.font }}>All systems operational</span>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:10, marginBottom:14 }}>
        {[
          {label:'Deployed', value:deployed, color:T.green,  icon:'✓'},
          {label:'Building', value:building, color:T.gold,   icon:'◎'},
          {label:'Failed',   value:failed,   color:failed>0?T.red:T.muted, icon:'✕'},
          {label:'Uptime',   value:`${uptime}%`, color:T.blue, icon:'↑'},
          {label:'Regions',  value:regions.length, color:T.purple, icon:'⊕'},
          {label:'Total',    value:total,    color:T.text,   icon:'#'},
        ].map(({label,value,color,icon}) => (
          <div key={label} style={{ padding:'12px 14px', borderRadius:10, background:'rgba(255,255,255,0.02)', border:`1px solid ${T.border}`, display:'flex', flexDirection:'column', gap:4 }}>
            <span style={{ fontSize:10, color:T.muted, fontFamily:T.font }}>{icon} {label.toUpperCase()}</span>
            <span style={{ fontSize:20, fontWeight:800, color, fontFamily:T.font, lineHeight:1 }}>{value}</span>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:8 }}>
        {regions.map(r => (
          <div key={r} style={{ flex:1, padding:'8px 12px', borderRadius:8, background:'rgba(34,197,94,0.05)', border:`1px solid rgba(34,197,94,0.15)`, display:'flex', alignItems:'center', gap:8 }}>
            <PulseDot color={T.green} size={6} />
            <span style={{ fontSize:10, color:T.green, fontFamily:T.font }}>{r}</span>
            <span style={{ fontSize:10, color:T.muted, fontFamily:T.font, marginLeft:'auto' }}>operational</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════════════════ */
export default function PipelineStatus() {
  const [campagnes, setCampagnes] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('all');
  const [search, setSearch]       = useState('');
  const [preview, setPreview]     = useState(null); // campagne en aperçu

  useEffect(() => {
    api.get('/api/campagnes')
      .then(res => setCampagnes(Array.isArray(res.data) ? res.data : res.data?.data || []))
      .catch(() => setCampagnes([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = campagnes.filter(c => {
    const mF = filter==='all'
      || (filter==='deployed' && (c.status==='sent'||c.status==='active'))
      || (filter==='building' && (c.status==='draft'||c.status==='scheduled'))
      || (filter==='failed'   && c.status==='failed');
    const mS = !search
      || c.title?.toLowerCase().includes(search.toLowerCase())
      || c.client?.name?.toLowerCase().includes(search.toLowerCase());
    return mF && mS;
  });

  return (
    <div style={{ padding:'32px 36px', background:T.bg, minHeight:'100vh', color:T.text, fontFamily:T.fontUI }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes ping    { 75%,100%{transform:scale(2);opacity:0} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px}
      `}</style>

      {/* Header */}
      <div style={{ marginBottom:24, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,rgba(245,166,35,0.2),rgba(245,166,35,0.05))', border:`1px solid rgba(245,166,35,0.3)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>⚡</div>
          <div>
            <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:T.textHi }}>Pipeline DevOps</h1>
            <div style={{ fontSize:11, color:T.muted, fontFamily:T.font }}>digipip-platform / marketing-engine · production</div>
          </div>
        </div>
        <div style={{ fontSize:11, color:T.muted, fontFamily:T.font }}>
          💡 Cliquez <span style={{ color:T.gold }}>⊞ PREVIEW</span> pour l'aperçu inline
        </div>
      </div>

      {/* Infra panel */}
      {!loading && <InfraPanel campagnes={campagnes} />}

      {/* Filters */}
      <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:22, padding:'11px 16px', background:T.bgCard, borderRadius:12, border:`1px solid ${T.border}` }}>
        <span style={{ fontSize:12, color:T.muted, fontFamily:T.font }}>$</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="filter deployments..."
          style={{ flex:1, background:'none', border:'none', outline:'none', color:T.text, fontFamily:T.font, fontSize:12 }} />
        <div style={{ width:1, height:20, background:T.border }} />
        {[['all','⊕ All',T.muted],['deployed','✓ Deployed',T.green],['building','◎ Building',T.gold],['failed','✕ Failed',T.red]].map(([v,l,c]) => (
          <button key={v} onClick={() => setFilter(v)} style={{
            padding:'5px 12px', borderRadius:6, fontSize:11, fontFamily:T.font,
            background: filter===v ? `${c}18` : 'none',
            border:`1px solid ${filter===v ? c : 'transparent'}`,
            color: filter===v ? c : T.muted,
            cursor:'pointer', transition:'all 0.15s', fontWeight: filter===v ? 700 : 400,
          }}>{l}</button>
        ))}
        <span style={{ fontSize:11, color:T.muted, fontFamily:T.font }}>{filtered.length} deployment{filtered.length!==1?'s':''}</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(440px,1fr))', gap:16 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ height:280, borderRadius:16, background:T.bgCard, border:`1px solid ${T.border}`, animation:'pulse 1.5s ease infinite' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding:'80px 24px', textAlign:'center', background:T.bgCard, borderRadius:16, border:`1px solid ${T.border}` }}>
          <div style={{ fontSize:40, marginBottom:12, opacity:0.2 }}>⚡</div>
          <p style={{ color:T.muted, fontFamily:T.font, fontSize:13 }}>No deployments found</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(440px,1fr))', gap:18 }}>
          {filtered.map((c,i) => (
            <DeploymentCard key={c.id} camp={c} idx={i} onPreview={setPreview} />
          ))}
        </div>
      )}

      {/* Modal preview */}
      {preview && <CampaignPreviewModal camp={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}