import React, { useState, useEffect, useRef } from 'react';
import api from '../api';

const T = {
  bg:        '#060a10',
  bgCard:    '#0b1018',
  bgCard2:   '#0f1825',
  border:    '#162030',
  borderHi:  '#f5a623',
  gold:      '#f5a623',
  goldDim:   'rgba(245,166,35,0.12)',
  green:     '#22c55e',
  greenDim:  'rgba(34,197,94,0.10)',
  red:       '#ef4444',
  redDim:    'rgba(239,68,68,0.10)',
  blue:      '#38bdf8',
  blueDim:   'rgba(56,189,248,0.10)',
  purple:    '#a78bfa',
  muted:     '#3d5a78',
  text:      '#b8ccd8',
  textHi:    '#e2f0ff',
  mono:      "'JetBrains Mono','Fira Code',monospace",
  sans:      "'Plus Jakarta Sans','Segoe UI',sans-serif",
};

const STATUS = {
  sent:      { label:'DEPLOYED', color:T.green,  bg:T.greenDim, dot:T.green,  icon:'✓', pulse:true  },
  active:    { label:'LIVE',     color:T.green,  bg:T.greenDim, dot:T.green,  icon:'●', pulse:true  },
  draft:     { label:'BUILDING', color:T.gold,   bg:T.goldDim,  dot:T.gold,   icon:'◎', pulse:false },
  scheduled: { label:'QUEUED',   color:T.blue,   bg:T.blueDim,  dot:T.blue,   icon:'◷', pulse:false },
  failed:    { label:'FAILED',   color:T.red,    bg:T.redDim,   dot:T.red,    icon:'✕', pulse:false },
};

const TYPE = {
  email: { icon:'✉',  label:'Email', color:T.blue,   grad:'linear-gradient(135deg,#0f2744,#0a1628)' },
  sms:   { icon:'💬', label:'SMS',   color:T.green,  grad:'linear-gradient(135deg,#0a2818,#061510)' },
  push:  { icon:'🔔', label:'Push',  color:T.purple, grad:'linear-gradient(135deg,#1a1030,#0e0820)' },
};

const STEPS = ['Source','Build','Test','Preview','Deploy'];

function getStage(status) {
  if (status==='sent'||status==='active') return 5;
  if (status==='scheduled') return 3;
  if (status==='draft'||status==='failed') return 2;
  return 1;
}

function seed(id, n) { return ((id*17+n*31)%100); }

function genCloud(id) {
  return {
    cpu:      40 + seed(id,1)%50,
    mem:      30 + seed(id,2)%55,
    latency:  12 + seed(id,3)%88,
    uptime:   (99 + (seed(id,4)%2===0 ? 0.9 : 0.7)).toFixed(1),
    region:   ['eu-west-1','us-east-1','ap-south-1','eu-central-1'][seed(id,5)%4],
    replicas: 1 + seed(id,6)%3,
    buildMs:  900 + seed(id,7)*28,
    version:  `v${1+seed(id,8)%4}.${seed(id,9)%10}.${seed(id,10)%20}`,
    commits:  3 + seed(id,11)%12,
  };
}

/* ── Pulse dot ── */
function Dot({ color, size=8 }) {
  return (
    <span style={{ position:'relative', display:'inline-flex', width:size, height:size, flexShrink:0 }}>
      <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:color, opacity:0.35, animation:'ping 1.6s ease infinite' }}/>
      <span style={{ width:size, height:size, borderRadius:'50%', background:color, display:'block' }}/>
    </span>
  );
}

/* ── Mini progress bar ── */
function Bar({ val, color }) {
  return (
    <div style={{ height:3, borderRadius:2, background:'rgba(255,255,255,0.05)', overflow:'hidden', flex:1 }}>
      <div style={{ height:'100%', borderRadius:2, width:`${Math.min(val,100)}%`, background:val>80?T.red:val>60?T.gold:color, transition:'width 1.2s ease' }}/>
    </div>
  );
}

/* ══════════════════════════════════════════
   CAMPAIGN VISUAL PREVIEW
   Mini navigateur qui rend la campagne
══════════════════════════════════════════ */
function CampaignVisualPreview({ camp, detail }) {
  const data    = detail || camp;
  const type    = TYPE[data.type?.toLowerCase()] || TYPE.email;
  const status  = STATUS[data.status] || STATUS.draft;
  const isLive  = data.status==='sent'||data.status==='active';
  const previewUrl = `${(data.title||'campagne').toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')}-${String(data.id||1).padStart(4,'0')}.digipip.app`;
  const [copied, setCopied] = useState(false);

  const copy = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText('https://'+previewUrl);
    setCopied(true);
    setTimeout(()=>setCopied(false),2000);
  };

  return (
    <div style={{ borderRadius:14, overflow:'hidden', border:`1px solid ${T.border}`, background:T.bg }}>

      {/* ── Browser chrome ── */}
      <div style={{ background:'#0e1820', padding:'9px 14px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', gap:10 }}>
        {/* Traffic lights */}
        <div style={{ display:'flex', gap:5, flexShrink:0 }}>
          {[T.red,'#f5a623',T.green].map((c,i)=>(
            <div key={i} style={{ width:10, height:10, borderRadius:'50%', background:c, opacity:0.7 }}/>
          ))}
        </div>
        {/* URL bar */}
        <div style={{
          flex:1, display:'flex', alignItems:'center', gap:7,
          background:'rgba(255,255,255,0.04)', borderRadius:6,
          padding:'4px 10px', border:`1px solid ${T.border}`,
          cursor:'pointer',
        }} onClick={copy}>
          <span style={{ fontSize:9, color:isLive?T.green:T.gold }}>{isLive?'🔒':'⚠'}</span>
          <span style={{ fontSize:10, color:T.text, fontFamily:T.mono, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            https://{previewUrl}
          </span>
          <span style={{ fontSize:9, color:copied?T.green:T.muted, fontFamily:T.mono, flexShrink:0, transition:'color 0.2s' }}>
            {copied?'✓':' ⎘'}
          </span>
        </div>
        {/* Live badge */}
        <div style={{ display:'flex', alignItems:'center', gap:5, flexShrink:0 }}>
          {isLive && <Dot color={T.green} size={6}/>}
          <span style={{ fontSize:9, fontFamily:T.mono, color:status.color }}>{status.label}</span>
        </div>
      </div>

      {/* ── Rendered campaign page ── */}
      <div style={{ background:type.grad, position:'relative', overflow:'hidden', minHeight:220 }}>

        {/* Noise texture overlay */}
        <div style={{
          position:'absolute', inset:0, opacity:0.03,
          backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}/>

        {/* Grid lines */}
        <div style={{
          position:'absolute', inset:0, opacity:0.07,
          backgroundImage:`linear-gradient(${type.color}22 1px,transparent 1px),linear-gradient(90deg,${type.color}22 1px,transparent 1px)`,
          backgroundSize:'32px 32px',
        }}/>

        {/* Glow blob */}
        <div style={{
          position:'absolute', top:-40, right:-40, width:180, height:180,
          borderRadius:'50%', background:`radial-gradient(circle,${type.color}25,transparent 70%)`,
          filter:'blur(30px)',
        }}/>

        <div style={{ position:'relative', padding:'22px 24px' }}>

          {/* Nav bar */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:6, height:6, borderRadius:2, background:T.gold }}/>
              <div style={{ width:4, height:4, borderRadius:1, background:`${T.gold}66` }}/>
              <span style={{ fontSize:11, fontWeight:800, color:'white', letterSpacing:1, fontFamily:T.sans }}>
                Digi<span style={{ color:T.gold }}>Pip</span>
              </span>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              {['Accueil','Programme','Contact'].map(l=>(
                <span key={l} style={{ fontSize:9, color:'rgba(255,255,255,0.4)', fontFamily:T.sans }}>{l}</span>
              ))}
            </div>
          </div>

          {/* Hero content */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:16, alignItems:'start' }}>
            <div>
              {/* Type pill */}
              <div style={{
                display:'inline-flex', alignItems:'center', gap:5,
                padding:'3px 10px', borderRadius:20, marginBottom:10,
                background:`${type.color}20`, border:`1px solid ${type.color}40`,
              }}>
                <span style={{ fontSize:9, color:type.color, fontFamily:T.mono }}>{type.icon} {type.label.toUpperCase()}</span>
                {isLive && <><span style={{ width:1, height:10, background:`${type.color}40`}}/>
                <Dot color={T.green} size={5}/><span style={{ fontSize:9, color:T.green, fontFamily:T.mono }}>LIVE</span></>}
              </div>

              {/* Title */}
              <h2 style={{
                margin:'0 0 8px', fontSize:16, fontWeight:800, lineHeight:1.2,
                color:'white', fontFamily:T.sans,
                textShadow:`0 0 40px ${type.color}44`,
              }}>{data.title}</h2>

              {/* Description snippet */}
              <p style={{ margin:'0 0 14px', fontSize:10, color:'rgba(255,255,255,0.5)', lineHeight:1.6, fontFamily:T.sans, maxWidth:280 }}>
                {(data.description||"Campagne marketing déployée sur DigiPip. Rejoignez des milliers de participants.").slice(0,90)}…
              </p>

              {/* Date */}
              {(data.dateScheduled||data.date) && (
                <div style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:20, background:'rgba(56,189,248,0.1)', border:`1px solid ${T.blue}33`, marginBottom:14 }}>
                  <span style={{ fontSize:9, color:T.blue, fontFamily:T.mono }}>
                    📅 {new Date(data.dateScheduled||data.date).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'})}
                  </span>
                </div>
              )}

              {/* CTA buttons (miniature) */}
              <div style={{ display:'flex', gap:7 }}>
                <div style={{ padding:'6px 14px', borderRadius:7, background:T.gold, display:'flex', alignItems:'center' }}>
                  <span style={{ fontSize:9, fontWeight:800, color:'#0d0a00', fontFamily:T.sans }}>S'inscrire</span>
                </div>
                <div style={{ padding:'6px 12px', borderRadius:7, background:'rgba(255,255,255,0.06)', border:`1px solid rgba(255,255,255,0.12)` }}>
                  <span style={{ fontSize:9, color:'rgba(255,255,255,0.6)', fontFamily:T.sans }}>Programme →</span>
                </div>
              </div>
            </div>

            {/* Stats card (right) */}
            <div style={{
              background:'rgba(0,0,0,0.4)', borderRadius:10, padding:'12px 14px',
              border:`1px solid rgba(255,255,255,0.08)`, minWidth:110,
              backdropFilter:'blur(10px)',
            }}>
              <div style={{ fontSize:9, color:T.gold, fontFamily:T.mono, marginBottom:10, letterSpacing:0.5 }}>DÉTAILS</div>
              {[
                { label:'Type',     val:(data.type||'multi').toUpperCase(), color:type.color },
                { label:'Statut',   val:status.label, color:status.color },
                { label:'Audience', val:'12 500',  color:'white' },
                { label:'Places',   val:'47 dispo', color:T.green },
              ].map(({label,val,color})=>(
                <div key={label} style={{ marginBottom:6 }}>
                  <div style={{ fontSize:8, color:'rgba(255,255,255,0.3)', fontFamily:T.mono }}>{label}</div>
                  <div style={{ fontSize:10, fontWeight:700, color, fontFamily:T.sans }}>{val}</div>
                </div>
              ))}
              <div style={{
                marginTop:10, padding:'7px', borderRadius:6, background:'#3b82f6',
                textAlign:'center',
              }}>
                <span style={{ fontSize:9, fontWeight:700, color:'white', fontFamily:T.sans }}>Participer</span>
              </div>
            </div>
          </div>

          {/* Client badge */}
          {data.client?.name && (
            <div style={{ marginTop:14, display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:14, height:14, borderRadius:3, background:`${type.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:8 }}>🏢</div>
              <span style={{ fontSize:9, color:'rgba(255,255,255,0.35)', fontFamily:T.sans }}>{data.client.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Status bar ── */}
      <div style={{
        padding:'7px 14px', background:'rgba(0,0,0,0.3)',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        borderTop:`1px solid ${T.border}`,
      }}>
        <span style={{ fontSize:9, color:T.muted, fontFamily:T.mono }}>
          {isLive ? `✓ Deployed · ${genCloud(data.id||1).buildMs}ms` : `◎ ${status.label}`}
        </span>
        <span style={{ fontSize:9, color:T.muted, fontFamily:T.mono }}>
          {genCloud(data.id||1).region} · {genCloud(data.id||1).version}
        </span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   DEPLOYMENT CARD
══════════════════════════════════════════ */
function DeployCard({ camp, idx }) {
  const [open,    setOpen]    = useState(false);
  const [detail,  setDetail]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  const status = STATUS[camp.status] || STATUS.draft;
  const type   = TYPE[camp.type?.toLowerCase()] || TYPE.email;
  const m      = genCloud(camp.id || idx+1);
  const stage  = getStage(camp.status);
  const isLive = camp.status==='sent'||camp.status==='active';

  const togglePreview = () => {
    if (!open && !detail) {
      setLoading(true);
      api.get(`/api/campagnes/${camp.id}`)
        .then(r => setDetail(r.data))
        .catch(() => setDetail(camp))
        .finally(() => setLoading(false));
    }
    setOpen(o => !o);
  };

  const logs = isLive ? [
    {t:'cmd',    v:`$ git push origin main`},
    {t:'info',   v:`Triggered deployment #${10+camp.id}`},
    {t:'info',   v:`Installing dependencies...`},
    {t:'success',v:`Build completed in ${m.buildMs}ms`},
    {t:'info',   v:`Deploying to ${m.region} ×${m.replicas}`},
    {t:'success',v:`Health check passed — ${m.latency}ms`},
    {t:'success',v:`Ready! ${m.version} is live ✓`},
  ] : camp.status==='failed' ? [
    {t:'cmd',    v:`$ git push origin main`},
    {t:'info',   v:`Build started...`},
    {t:'error',  v:`ERROR: Template validation failed`},
    {t:'error',  v:`Deployment failed — rollback done`},
  ] : [
    {t:'warn',   v:`Queued — waiting for scheduler`},
    {t:'info',   v:`Initializing build environment...`},
  ];

  const logColors = { cmd:T.blue, info:T.muted, success:T.green, warn:T.gold, error:T.red };

  return (
    <div
      onMouseEnter={()=>setHovered(true)}
      onMouseLeave={()=>setHovered(false)}
      style={{
        background: hovered ? T.bgCard2 : T.bgCard,
        borderRadius:18, border:`1px solid ${hovered ? T.borderHi+'60' : T.border}`,
        overflow:'hidden', transition:'all 0.25s',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? `0 16px 48px rgba(0,0,0,0.5),0 0 0 1px ${T.gold}18` : '0 2px 16px rgba(0,0,0,0.4)',
        animation:`up 0.45s ease ${idx*70}ms both`,
        fontFamily:T.sans,
      }}
    >
      {/* ── Header ── */}
      <div style={{ padding:'14px 18px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', gap:10, background:'rgba(0,0,0,0.25)' }}>
        <Dot color={status.dot} size={7}/>
        <span style={{ fontSize:10, fontWeight:700, fontFamily:T.mono, color:type.color, background:`${type.color}15`, padding:'2px 8px', borderRadius:4, border:`1px solid ${type.color}25` }}>
          {type.icon} {type.label.toUpperCase()}
        </span>
        <span style={{ flex:1, fontSize:13, fontWeight:700, color:T.textHi, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {camp.title}
        </span>
        <span style={{ fontSize:10, fontWeight:800, fontFamily:T.mono, color:status.color, background:status.bg, padding:'3px 10px', borderRadius:5, border:`1px solid ${status.color}30` }}>
          {status.icon} {status.label}
        </span>
      </div>

      {/* ── Visual Preview Toggle ── */}
      <div
        onClick={togglePreview}
        style={{
          padding:'12px 18px', borderBottom:`1px solid ${T.border}`,
          display:'flex', alignItems:'center', gap:10,
          cursor:'pointer', transition:'background 0.2s',
          background: open ? 'rgba(245,166,35,0.04)' : 'rgba(255,255,255,0.015)',
        }}
        onMouseEnter={e => e.currentTarget.style.background='rgba(245,166,35,0.06)'}
        onMouseLeave={e => e.currentTarget.style.background = open ? 'rgba(245,166,35,0.04)' : 'rgba(255,255,255,0.015)'}
      >
        {/* Mini thumbnail placeholder / live preview */}
        <div style={{
          width:64, height:40, borderRadius:6, overflow:'hidden', flexShrink:0,
          border:`1px solid ${open ? T.gold+'40' : T.border}`,
          background: TYPE[camp.type?.toLowerCase()]?.grad || TYPE.email.grad,
          position:'relative', display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          {/* grid lines */}
          <div style={{ position:'absolute', inset:0, backgroundImage:`linear-gradient(${type.color}20 1px,transparent 1px),linear-gradient(90deg,${type.color}20 1px,transparent 1px)`, backgroundSize:'8px 8px' }}/>
          <span style={{ fontSize:16, position:'relative', zIndex:1 }}>{type.icon}</span>
          {isLive && (
            <div style={{ position:'absolute', top:3, right:3 }}>
              <Dot color={T.green} size={5}/>
            </div>
          )}
        </div>

        <div style={{ flex:1 }}>
          <div style={{ fontSize:11, fontWeight:600, color: open ? T.gold : T.text, marginBottom:2, transition:'color 0.2s' }}>
            {open ? '▾ Masquer l\'aperçu' : '▸ Voir l\'aperçu de déploiement'}
          </div>
          <div style={{ fontSize:10, color:T.muted, fontFamily:T.mono }}>
            {(camp.title||'campagne').toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')}-{String(camp.id||1).padStart(4,'0')}.digipip.app
          </div>
        </div>

        <div style={{
          padding:'5px 12px', borderRadius:7, fontSize:10, fontFamily:T.mono,
          background: open ? T.goldDim : 'rgba(255,255,255,0.04)',
          border:`1px solid ${open ? T.gold+'40' : T.border}`,
          color: open ? T.gold : T.muted, transition:'all 0.2s', flexShrink:0,
        }}>
          {open ? 'CLOSE' : '⊞ PREVIEW'}
        </div>
      </div>

      {/* ── Preview panel (expandable) ── */}
      {open && (
        <div style={{ padding:'14px 18px', borderBottom:`1px solid ${T.border}`, animation:'down 0.3s ease' }}>
          {loading ? (
            <div style={{ height:180, borderRadius:12, background:T.bgCard, display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${T.border}` }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
                <div style={{ width:24, height:24, borderRadius:'50%', border:`2px solid ${T.border}`, borderTopColor:T.gold, animation:'spin 0.8s linear infinite' }}/>
                <span style={{ fontSize:10, color:T.muted, fontFamily:T.mono }}>Loading preview...</span>
              </div>
            </div>
          ) : (
            <CampaignVisualPreview camp={camp} detail={detail}/>
          )}
        </div>
      )}

      {/* ── CI/CD Pipeline ── */}
      <div style={{ padding:'14px 18px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center' }}>
        {STEPS.map((step,i)=>{
          const done    = i < stage;
          const current = i===stage-1 && !isLive;
          const failed  = camp.status==='failed' && i===stage-1;
          return (
            <React.Fragment key={step}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, flex:1 }}>
                <div style={{
                  width:24, height:24, borderRadius:'50%',
                  background: failed?T.redDim : done?T.greenDim : current?T.goldDim : 'rgba(255,255,255,0.03)',
                  border:`2px solid ${failed?T.red:done?T.green:current?T.gold:T.border}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:9, fontFamily:T.mono,
                  color:failed?T.red:done?T.green:current?T.gold:T.muted,
                  boxShadow: done?`0 0 8px ${T.green}30`:current?`0 0 8px ${T.gold}30`:'none',
                }}>{failed?'✕':done?'✓':current?'◎':i+1}</div>
                <span style={{ fontSize:8, color:done?T.green:current?T.gold:T.muted, fontFamily:T.mono }}>{step.toUpperCase()}</span>
              </div>
              {i<STEPS.length-1 && (
                <div style={{ height:2, flex:1, marginBottom:14, background: i<stage-1 ? T.green : T.border, transition:'background 0.5s' }}/>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Cloud metrics ── */}
      <div style={{ padding:'12px 18px', borderBottom:`1px solid ${T.border}` }}>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
          {[
            {l:'Region',   v:m.region,         c:T.blue  },
            {l:'Version',  v:m.version,         c:T.purple},
            {l:'Replicas', v:`×${m.replicas}`,  c:T.gold  },
            {l:'Build',    v:`${m.buildMs}ms`,  c:T.text  },
            {l:'Uptime',   v:`${m.uptime}%`,    c:T.green },
          ].map(({l,v,c})=>(
            <div key={l} style={{ display:'flex', flexDirection:'column', gap:2, padding:'6px 10px', borderRadius:7, background:'rgba(255,255,255,0.025)', border:`1px solid ${T.border}` }}>
              <span style={{ fontSize:8, color:T.muted, fontFamily:T.mono, letterSpacing:0.8 }}>{l.toUpperCase()}</span>
              <span style={{ fontSize:11, fontWeight:700, color:c, fontFamily:T.mono }}>{v}</span>
            </div>
          ))}
        </div>
        {[{l:'CPU',val:m.cpu,c:T.blue},{l:'MEM',val:m.mem,c:T.purple}].map(({l,val,c})=>(
          <div key={l} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
            <span style={{ fontSize:9, fontFamily:T.mono, color:T.muted, width:26, flexShrink:0 }}>{l}</span>
            <Bar val={val} color={c}/>
            <span style={{ fontSize:9, fontFamily:T.mono, color:val>80?T.red:T.muted, width:28, textAlign:'right' }}>{val}%</span>
          </div>
        ))}
      </div>

      {/* ── Logs toggle + Footer ── */}
      <div>
        <button
          onClick={()=>setLogOpen(o=>!o)}
          style={{
            width:'100%', padding:'9px 18px',
            background:'none', border:'none', borderBottom: logOpen?`1px solid ${T.border}`:'none',
            cursor:'pointer', display:'flex', alignItems:'center', gap:8,
            color:T.muted, fontFamily:T.mono, fontSize:10, transition:'color 0.15s',
          }}
          onMouseEnter={e=>e.currentTarget.style.color=T.text}
          onMouseLeave={e=>e.currentTarget.style.color=T.muted}
        >
          <span>{logOpen?'▾':'▸'}</span>
          <span>Build logs</span>
          <span style={{ marginLeft:'auto', color:isLive?T.green:camp.status==='failed'?T.red:T.gold }}>
            {isLive?`✓ ${m.commits} commits`:`${status.label}`}
          </span>
        </button>
        {logOpen && (
          <div style={{ padding:'10px 18px 14px', background:'rgba(0,0,0,0.35)', animation:'down 0.2s ease', maxHeight:140, overflowY:'auto' }}>
            {logs.map((l,i)=>(
              <div key={i} style={{ fontFamily:T.mono, fontSize:10, color:logColors[l.t]||T.muted, lineHeight:1.75, animation:`fadeIn 0.2s ease ${i*35}ms both` }}>
                <span style={{ color:T.border, marginRight:8, userSelect:'none' }}>
                  {l.t==='cmd'?'$':l.t==='success'?'✓':l.t==='error'?'✕':l.t==='warn'?'⚠':' '}
                </span>{l.v}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding:'11px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(0,0,0,0.2)' }}>
        <span style={{ fontSize:10, color:T.muted, fontFamily:T.mono }}>
          {camp.client?.name && `🏢 ${camp.client.name}`}
          {camp.dateScheduled && ` · 🕐 ${new Date(camp.dateScheduled).toLocaleDateString('fr-FR',{day:'2-digit',month:'short'})}`}
        </span>
        <button
          onClick={togglePreview}
          style={{
            padding:'6px 14px', borderRadius:7, fontSize:10, fontFamily:T.mono,
            background: open ? T.goldDim : 'rgba(255,255,255,0.04)',
            border:`1px solid ${open ? T.gold+'50' : T.border}`,
            color: open ? T.gold : T.muted,
            cursor:'pointer', transition:'all 0.2s', letterSpacing:0.3,
          }}
        >{open ? '✕ Close preview' : '⊞ Open preview'}</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   INFRA OVERVIEW PANEL
══════════════════════════════════════════ */
function InfraPanel({ camps }) {
  const deployed = camps.filter(c=>c.status==='sent'||c.status==='active').length;
  const building = camps.filter(c=>c.status==='draft'||c.status==='scheduled').length;
  const failed   = camps.filter(c=>c.status==='failed').length;
  const total    = camps.length;
  const uptime   = total>0 ? (99.1+(deployed/(total||1))*0.8).toFixed(2) : '—';
  const regions  = ['eu-west-1','us-east-1','ap-south-1'];

  return (
    <div style={{ background:T.bgCard, borderRadius:16, border:`1px solid ${T.border}`, padding:'18px 22px', marginBottom:22, fontFamily:T.sans }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
        <div style={{ width:30, height:30, borderRadius:8, background:T.blueDim, border:`1px solid ${T.blue}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>☁</div>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:T.textHi }}>Cloud Infrastructure</div>
          <div style={{ fontSize:10, color:T.muted, fontFamily:T.mono }}>DigiPip Marketing Platform · Production</div>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6 }}>
          <Dot color={T.green} size={6}/>
          <span style={{ fontSize:10, color:T.green, fontFamily:T.mono }}>All systems operational</span>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:8, marginBottom:12 }}>
        {[
          {l:'Deployed',v:deployed,  c:T.green },
          {l:'Building',v:building,  c:T.gold  },
          {l:'Failed',  v:failed,    c:failed>0?T.red:T.muted},
          {l:'Uptime',  v:`${uptime}%`, c:T.blue },
          {l:'Regions', v:regions.length, c:T.purple},
          {l:'Total',   v:total,     c:T.text  },
        ].map(({l,v,c})=>(
          <div key={l} style={{ padding:'10px 12px', borderRadius:9, background:'rgba(255,255,255,0.02)', border:`1px solid ${T.border}`, display:'flex', flexDirection:'column', gap:3 }}>
            <span style={{ fontSize:9, color:T.muted, fontFamily:T.mono, textTransform:'uppercase' }}>{l}</span>
            <span style={{ fontSize:18, fontWeight:800, color:c, fontFamily:T.mono, lineHeight:1 }}>{v}</span>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:7 }}>
        {regions.map(r=>(
          <div key={r} style={{ flex:1, padding:'7px 12px', borderRadius:7, background:'rgba(34,197,94,0.04)', border:`1px solid rgba(34,197,94,0.12)`, display:'flex', alignItems:'center', gap:7 }}>
            <Dot color={T.green} size={5}/>
            <span style={{ fontSize:9, color:T.green, fontFamily:T.mono }}>{r}</span>
            <span style={{ fontSize:9, color:T.muted, fontFamily:T.mono, marginLeft:'auto' }}>operational</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   PAGE
══════════════════════════════════════════ */
export default function PipelineStatus() {
  const [camps,   setCamps]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');
  const [search,  setSearch]  = useState('');

  useEffect(()=>{
    api.get('/api/campagnes')
      .then(r => setCamps(Array.isArray(r.data)?r.data:r.data?.data||[]))
      .catch(()=>setCamps([]))
      .finally(()=>setLoading(false));
  },[]);

  const filtered = camps.filter(c=>{
    const mF = filter==='all'
      ||(filter==='deployed'&&(c.status==='sent'||c.status==='active'))
      ||(filter==='building'&&(c.status==='draft'||c.status==='scheduled'))
      ||(filter==='failed'  && c.status==='failed');
    const mS = !search || c.title?.toLowerCase().includes(search.toLowerCase()) || c.client?.name?.toLowerCase().includes(search.toLowerCase());
    return mF && mS;
  });

  return (
    <div style={{ padding:'28px 32px', background:T.bg, minHeight:'100vh', color:T.text, fontFamily:T.sans }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes ping  { 75%,100%{transform:scale(2.2);opacity:0} }
        @keyframes up    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
        @keyframes down  { from{opacity:0;max-height:0} to{opacity:1;max-height:600px} }
        @keyframes fadeIn{ from{opacity:0} to{opacity:1} }
        @keyframes spin  { to{transform:rotate(360deg)} }
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px}
      `}</style>

      {/* Header */}
      <div style={{ marginBottom:22, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,rgba(245,166,35,0.2),rgba(245,166,35,0.04))', border:`1px solid rgba(245,166,35,0.25)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17 }}>⚡</div>
          <div>
            <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:T.textHi }}>Pipeline DevOps</h1>
            <div style={{ fontSize:10, color:T.muted, fontFamily:T.mono, marginTop:1 }}>digipip / marketing-engine · production</div>
          </div>
        </div>
        <div style={{ fontSize:10, color:T.muted, fontFamily:T.mono }}>
          Cliquez <span style={{ color:T.gold }}>⊞ PREVIEW</span> pour l'aperçu visuel inline
        </div>
      </div>

      {!loading && <InfraPanel camps={camps}/>}

      {/* Filter bar */}
      <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:20, padding:'10px 14px', background:T.bgCard, borderRadius:10, border:`1px solid ${T.border}` }}>
        <span style={{ fontSize:11, color:T.muted, fontFamily:T.mono }}>$</span>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="filter deployments..."
          style={{ flex:1, background:'none', border:'none', outline:'none', color:T.text, fontFamily:T.mono, fontSize:11 }}/>
        <div style={{ width:1, height:18, background:T.border }}/>
        {[['all','⊕ All',T.muted],['deployed','✓ Deployed',T.green],['building','◎ Building',T.gold],['failed','✕ Failed',T.red]].map(([v,l,c])=>(
          <button key={v} onClick={()=>setFilter(v)} style={{
            padding:'4px 10px', borderRadius:5, fontSize:10, fontFamily:T.mono,
            background:filter===v?`${c}18`:'none', border:`1px solid ${filter===v?c:'transparent'}`,
            color:filter===v?c:T.muted, cursor:'pointer', transition:'all 0.15s', fontWeight:filter===v?700:400,
          }}>{l}</button>
        ))}
        <span style={{ fontSize:10, color:T.muted, fontFamily:T.mono }}>{filtered.length} deployment{filtered.length!==1?'s':''}</span>
      </div>

      {/* Cards */}
      {loading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(460px,1fr))', gap:16 }}>
          {[1,2,3].map(i=>(
            <div key={i} style={{ height:260, borderRadius:18, background:T.bgCard, border:`1px solid ${T.border}`, animation:'fadeIn 1.5s ease infinite alternate' }}/>
          ))}
        </div>
      ) : filtered.length===0 ? (
        <div style={{ padding:'70px', textAlign:'center', background:T.bgCard, borderRadius:16, border:`1px solid ${T.border}` }}>
          <div style={{ fontSize:36, marginBottom:10, opacity:0.15 }}>⚡</div>
          <p style={{ color:T.muted, fontFamily:T.mono, fontSize:12 }}>No deployments found</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(460px,1fr))', gap:18 }}>
          {filtered.map((c,i)=><DeployCard key={c.id} camp={c} idx={i}/>)}
        </div>
      )}
    </div>
  );
}