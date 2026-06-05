import React, { useState, useEffect } from 'react';
import api from '../api';

/* ── Design Tokens — Light Theme ── */
const C = {
  bg:        '#f5f7fa',
  surface:   '#ffffff',
  surface2:  '#f1f4f9',
  surface3:  '#e8edf5',
  border:    '#e2e8f0',
  borderDk:  '#cbd5e1',
  text:      '#0f172a',
  textMid:   '#334155',
  muted:     '#94a3b8',
  gold:      '#d97706',
  goldLt:    '#fef3c7',
  green:     '#059669',
  greenLt:   '#d1fae5',
  red:       '#dc2626',
  redLt:     '#fee2e2',
  blue:      '#2563eb',
  blueLt:    '#dbeafe',
  purple:    '#7c3aed',
  purpleLt:  '#ede9fe',
  cyan:      '#0891b2',
  cyanLt:    '#cffafe',
  orange:    '#ea580c',
  orangeLt:  '#ffedd5',
  pink:      '#db2777',
  pinkLt:    '#fce7f3',
  navy:      '#0f172a',
  mono:      "'IBM Plex Mono', monospace",
  sans:      "'Sora', sans-serif",
};

/* ── Helpers ── */
function seed(id, n) { return ((id * 17 + n * 31) % 100); }
function genCloud(id) {
  return {
    cpu:      40 + seed(id,1)%50,
    mem:      30 + seed(id,2)%55,
    latency:  12 + seed(id,3)%88,
    uptime:   (99 + (seed(id,4)%2===0 ? 0.9 : 0.7)).toFixed(2),
    region:   ['eu-west-1','us-east-1','ap-south-1','eu-central-1'][seed(id,5)%4],
    replicas: 1 + seed(id,6)%3,
    buildMs:  900 + seed(id,7)*28,
    version:  `v${1+seed(id,8)%4}.${seed(id,9)%10}.${seed(id,10)%20}`,
    commits:  3 + seed(id,11)%12,
    network:  45 + seed(id,12)%40,
    disk:     20 + seed(id,13)%60,
    requests: 1200 + seed(id,14)*80,
    errors:   seed(id,15)%5,
  };
}

function useCountUp(target, duration=1500) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now-t0)/duration, 1);
      const ease = 1 - Math.pow(1-p, 3);
      setVal(Math.floor(target*ease));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return val;
}

/* ── Components ── */
function PulseDot({ color, size=8 }) {
  return (
    <span style={{ position:'relative', display:'inline-flex', width:size, height:size, flexShrink:0 }}>
      <span style={{ position:'absolute', inset:-2, borderRadius:'50%', background:color, opacity:0.25, animation:'ping 2s cubic-bezier(0,0,0.2,1) infinite' }} />
      <span style={{ width:size, height:size, borderRadius:'50%', background:color, display:'block', position:'relative', zIndex:1 }} />
    </span>
  );
}

function Badge({ label, color, bg }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600, color, background:bg, whiteSpace:'nowrap' }}>
      {label}
    </span>
  );
}

function CircularGauge({ value, max=100, color, size=48, stroke=5, label }) {
  const r = (size-stroke)/2;
  const circ = 2*Math.PI*r;
  const p = Math.min(value/max, 1);
  const col = value>80 ? C.red : value>60 ? C.gold : color;
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.surface3} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={circ*(1-p)} strokeLinecap="round"
          style={{ transition:'stroke-dashoffset 1.2s ease-out' }} />
      </svg>
      <span style={{ fontSize:10, fontWeight:700, color:col, fontFamily:C.mono }}>{value}%</span>
      {label && <span style={{ fontSize:8, color:C.muted, fontFamily:C.mono, textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</span>}
    </div>
  );
}

function Card({ children, style={}, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={()=>setHovered(true)}
      onMouseLeave={()=>setHovered(false)}
      style={{
        background: C.surface,
        borderRadius: 12,
        border: `1px solid ${hovered ? C.borderDk : C.border}`,
        overflow: 'hidden',
        transition: 'all 0.18s',
        boxShadow: hovered
          ? '0 8px 24px rgba(15,23,42,0.10)'
          : '0 1px 4px rgba(15,23,42,0.05)',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function MiniBar({ value, color, height=4 }) {
  const col = value > 80 ? C.red : value > 60 ? C.gold : color;
  return (
    <div style={{ height, borderRadius:4, background:C.surface3, overflow:'hidden', flex:1 }}>
      <div style={{ height:'100%', width:`${Math.min(value,100)}%`, background:col, borderRadius:4, transition:'width 1s ease' }} />
    </div>
  );
}

/* ── Static Data ── */
const REGIONS = [
  { id:'eu-west-1',    name:'Europe (Paris)',     flag:'🇫🇷', status:'active',  cpu:45, mem:62, lat:18,  uptime:'99.99' },
  { id:'us-east-1',    name:'US East (Virginia)', flag:'🇺🇸', status:'active',  cpu:38, mem:55, lat:42,  uptime:'99.97' },
  { id:'ap-south-1',   name:'Asia (Mumbai)',      flag:'🇮🇳', status:'active',  cpu:52, mem:48, lat:85,  uptime:'99.94' },
  { id:'eu-central-1', name:'Europe (Frankfurt)', flag:'🇩🇪', status:'standby', cpu:12, mem:20, lat:22,  uptime:'100.0' },
];

const SERVICES = [
  { id:'vercel',     name:'Frontend',    icon:'▲', color:C.blue,   bg:C.blueLt,   status:'up',   latency:18,  region:'us-east-1' },
  { id:'render',     name:'API Backend', icon:'⬡', color:C.green,  bg:C.greenLt,  status:'up',   latency:42,  region:'eu-west-1' },
  { id:'neon',       name:'PostgreSQL',  icon:'🐘',color:C.cyan,   bg:C.cyanLt,   status:'up',   latency:8,   region:'eu-central-1' },
  { id:'redis',      name:'Cache Redis', icon:'⚡', color:C.orange, bg:C.orangeLt, status:'up',   latency:3,   region:'eu-west-1' },
  { id:'firebase',   name:'Push FCM',    icon:'🔥',color:C.red,    bg:C.redLt,    status:'down', latency:0,   region:'—' },
  { id:'nodemailer', name:'Email SMTP',  icon:'📧',color:C.gold,   bg:C.goldLt,   status:'warn', latency:312, region:'us-east-1' },
];

const PIPELINE_STEPS = [
  { id:'source',  label:'Source',  icon:'⌥' },
  { id:'build',   label:'Build',   icon:'⚙' },
  { id:'test',    label:'Test',    icon:'✦' },
  { id:'preview', label:'Preview', icon:'◈' },
  { id:'deploy',  label:'Deploy',  icon:'↑' },
];

const ENVIRONMENTS = [
  { name:'Development', status:'active', color:C.blue,   bg:C.blueLt,  pods:4,  lastDeploy:'2h ago',  branch:'dev'     },
  { name:'Staging',     status:'active', color:C.gold,   bg:C.goldLt,  pods:6,  lastDeploy:'5h ago',  branch:'staging' },
  { name:'Production',  status:'active', color:C.green,  bg:C.greenLt, pods:10, lastDeploy:'1d ago',  branch:'main'    },
];

const SECURITY_SCORES = [
  { label:'Auth JWT',      score:'A+', status:'Actif',   detail:'HS256 · Exp: 7j',  color:C.green,  bg:C.greenLt,  icon:'🔐' },
  { label:'HTTPS / SSL',   score:'A+', status:'Actif',   detail:'TLS 1.3',           color:C.green,  bg:C.greenLt,  icon:'🛡️' },
  { label:'Rate Limiting', score:'A',  status:'Actif',   detail:'100 req/min',       color:C.blue,   bg:C.blueLt,   icon:'🚫' },
  { label:'Audit Logs',    score:'B',  status:'Partiel', detail:'Console only',      color:C.gold,   bg:C.goldLt,   icon:'🔍' },
];

const TABS = [
  { id:'overview',       icon:'☁️', label:"Vue d'ensemble" },
  { id:'infrastructure', icon:'🏗️', label:'Infrastructure'  },
  { id:'cicd',           icon:'🔄', label:'CI/CD'           },
  { id:'monitoring',     icon:'📊', label:'Monitoring'      },
  { id:'storage',        icon:'💾', label:'Stockage'        },
  { id:'costs',          icon:'💰', label:'Coûts'           },
  { id:'logs',           icon:'📝', label:'Logs'            },
  { id:'environments',   icon:'🌐', label:'Environnements'  },
  { id:'security',       icon:'🔐', label:'Sécurité'        },
];

/* ══════════════════════════════════════════
   SECTIONS
══════════════════════════════════════════ */

function OverviewSection({ camps }) {
  const deployed = camps.filter(c=>c.status==='sent'||c.status==='active').length;
  const uptimeAnim = useCountUp(9997, 1800);

  return (
    <div>
      {/* KPI row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
        {[
          { icon:'☁️', label:'Régions actives',  value:'3',                          color:C.blue,   bg:C.blueLt,   sub:'Multi-cloud'  },
          { icon:'⚡', label:'Uptime global',    value:`${(uptimeAnim/100).toFixed(2)}%`, color:C.green, bg:C.greenLt, sub:'SLA 99.9%'   },
          { icon:'📦', label:'Déployées',        value:deployed,                     color:C.gold,   bg:C.goldLt,   sub:`${camps.length} total` },
          { icon:'🔥', label:'Req / min',        value:'2 847',                      color:C.purple, bg:C.purpleLt, sub:'Pic : 8.2k'   },
        ].map((card,i)=>(
          <Card key={i} style={{ padding:'18px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div style={{ width:36, height:36, borderRadius:9, background:card.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{card.icon}</div>
              <PulseDot color={card.color} size={7} />
            </div>
            <div style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:'0.08em', fontFamily:C.mono, marginBottom:4 }}>{card.label}</div>
            <div style={{ fontSize:26, fontWeight:800, color:card.color, fontFamily:C.mono, lineHeight:1 }}>{card.value}</div>
            <div style={{ fontSize:10, color:C.muted, marginTop:5 }}>{card.sub}</div>
          </Card>
        ))}
      </div>

      {/* Services grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
        {SERVICES.map(svc=>(
          <Card key={svc.id}>
            <div style={{ padding:'13px 16px', display:'flex', alignItems:'center', gap:10, borderBottom:`1px solid ${C.border}` }}>
              <div style={{ width:30, height:30, borderRadius:8, background:svc.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>{svc.icon}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:700, color:C.text }}>{svc.name}</div>
                <div style={{ fontSize:9, color:C.muted, fontFamily:C.mono }}>{svc.region}</div>
              </div>
              <Badge
                label={svc.status==='up'?'OK':svc.status==='warn'?'WARN':'DOWN'}
                color={svc.status==='up'?C.green:svc.status==='warn'?C.gold:C.red}
                bg={svc.status==='up'?C.greenLt:svc.status==='warn'?C.goldLt:C.redLt}
              />
            </div>
            <div style={{ padding:'10px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:10, color:C.muted, fontFamily:C.mono }}>Latence</span>
              <span style={{ fontSize:13, fontWeight:700, color:svc.latency>100?C.red:C.green, fontFamily:C.mono }}>
                {svc.latency>0?`${svc.latency}ms`:'—'}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Regions */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {REGIONS.map(r=>(
          <Card key={r.id}>
            <div style={{ padding:'14px 16px', display:'flex', alignItems:'center', gap:10, borderBottom:`1px solid ${C.border}` }}>
              <span style={{ fontSize:22 }}>{r.flag}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:700, color:C.text }}>{r.name}</div>
                <div style={{ fontSize:9, color:C.muted, fontFamily:C.mono }}>{r.id}</div>
              </div>
              <PulseDot color={r.status==='active'?C.green:C.gold} size={6} />
            </div>
            <div style={{ padding:'12px 16px', display:'flex', gap:10, alignItems:'center' }}>
              <CircularGauge value={r.cpu} color={C.blue}   size={42} stroke={4} label="CPU" />
              <CircularGauge value={r.mem} color={C.purple} size={42} stroke={4} label="MEM" />
              <div style={{ flex:1, textAlign:'right' }}>
                <div style={{ fontSize:9, color:C.muted, fontFamily:C.mono }}>UPTIME</div>
                <div style={{ fontSize:12, fontWeight:700, color:C.green, fontFamily:C.mono }}>{r.uptime}%</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function InfrastructureSection() {
  const [selectedVM, setSelectedVM] = useState(null);
  return (
    <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
      {REGIONS.map(region=>(
        <Card key={region.id} style={{ flex:1, minWidth:240 }}>
          <div style={{ padding:'14px 18px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:26 }}>{region.flag}</span>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{region.name}</div>
                <div style={{ fontSize:9, color:C.muted, fontFamily:C.mono }}>{region.id}</div>
              </div>
            </div>
            <PulseDot color={region.status==='active'?C.green:C.gold} size={7} />
          </div>
          <div style={{ padding:'10px', display:'flex', flexDirection:'column', gap:8 }}>
            {[
              { id:'vm-1', type:'API Server', cpu:45, mem:62, color:C.blue   },
              { id:'vm-2', type:'Worker',     cpu:38, mem:55, color:C.blue   },
              { id:'vm-3', type:'Redis',      cpu:12, mem:20, color:C.orange },
            ].map(vm=>{
              const sel = selectedVM===vm.id;
              return (
                <div key={vm.id} onClick={()=>setSelectedVM(sel?null:vm.id)}
                  style={{ padding:'10px 12px', borderRadius:8, background:sel?`${vm.color}10`:C.surface2, border:`1.5px solid ${sel?vm.color:C.border}`, cursor:'pointer', transition:'all 0.18s', display:'flex', alignItems:'center', gap:10 }}>
                  <PulseDot color={vm.color} size={7} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:C.text }}>{vm.type}</div>
                    <div style={{ fontSize:9, color:C.muted, fontFamily:C.mono }}>{vm.id}</div>
                  </div>
                  <span style={{ fontSize:10, fontWeight:700, color:vm.color, fontFamily:C.mono }}>{vm.cpu}%</span>
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}

function CICDSection({ camps }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      {camps.slice(0,5).map((camp,idx)=>{
        const m = genCloud(camp.id||idx+1);
        const stage = camp.status==='sent'||camp.status==='active' ? 5 : camp.status==='scheduled' ? 3 : 2;
        const isLive = camp.status==='sent'||camp.status==='active';

        return (
          <Card key={camp.id} style={{ padding:'16px 20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
              <div style={{ width:36, height:36, borderRadius:9, background:C.blueLt, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>📦</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:700, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{camp.title}</div>
                <div style={{ fontSize:10, color:C.muted, fontFamily:C.mono }}>{camp.client?.name||'—'} · {m.version}</div>
              </div>
              <Badge
                label={isLive?'Deployed':camp.status==='scheduled'?'Queued':'Draft'}
                color={isLive?C.green:camp.status==='scheduled'?C.blue:C.gold}
                bg={isLive?C.greenLt:camp.status==='scheduled'?C.blueLt:C.goldLt}
              />
            </div>

            {/* Pipeline steps */}
            <div style={{ display:'flex', alignItems:'center', marginBottom:12 }}>
              {PIPELINE_STEPS.map((step,i)=>{
                const done    = i < stage;
                const current = i===stage-1 && !isLive;
                const failed  = camp.status==='failed' && i===stage-1;
                const sc = failed?C.red : done?C.green : current?C.gold : C.border;
                return (
                  <React.Fragment key={step.id}>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, flex:1 }}>
                      <div style={{
                        width:26, height:26, borderRadius:'50%',
                        background: failed?C.redLt : done?C.greenLt : current?C.goldLt : C.surface2,
                        border:`2px solid ${sc}`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:10, fontWeight:700, color:sc,
                      }}>
                        {failed?'✕':done?'✓':current?'●':step.icon}
                      </div>
                      <span style={{ fontSize:9, color:done?C.green:current?C.gold:C.muted, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em' }}>{step.label}</span>
                    </div>
                    {i < PIPELINE_STEPS.length-1 && (
                      <div style={{ height:2, flex:1, marginBottom:16, background:i<stage-1?C.green:C.border, transition:'background 0.4s' }} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Terminal log */}
            <div style={{ padding:'10px 14px', background:C.navy, borderRadius:8, fontFamily:C.mono, fontSize:10, color:C.green, lineHeight:1.8 }}>
              <div style={{ color:C.muted, marginBottom:2 }}>$ git push origin main</div>
              <div>✓ Build completed in {m.buildMs}ms</div>
              <div>✓ Deployed → {m.region} ×{m.replicas} replicas</div>
              <div>✓ Health check — {m.latency}ms latency</div>
            </div>
          </Card>
        );
      })}
      {camps.length === 0 && (
        <div style={{ textAlign:'center', padding:40, color:C.muted }}>
          <div style={{ fontSize:32, marginBottom:10, opacity:0.3 }}>📦</div>
          <p style={{ fontFamily:C.mono, fontSize:12 }}>Aucune campagne</p>
        </div>
      )}
    </div>
  );
}

function MonitoringSection() {
  const data = [35,52,41,68,79,55,43,91,87,72,66,84,95,88,76,63,71,83,78,90,85,92,88,96];
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
        {[
          { icon:'🟢', label:'API Backend',    status:'Opérationnel',  latency:'42ms',  uptime:'99.94%', color:C.green, bg:C.greenLt },
          { icon:'🟢', label:'Frontend',       status:'Opérationnel',  latency:'18ms',  uptime:'99.99%', color:C.green, bg:C.greenLt },
          { icon:'🟢', label:'PostgreSQL',     status:'Opérationnel',  latency:'8ms',   uptime:'99.97%', color:C.green, bg:C.greenLt },
          { icon:'🟡', label:'Email SMTP',     status:'Dégradé',       latency:'312ms', uptime:'98.12%', color:C.gold,  bg:C.goldLt  },
          { icon:'🟢', label:'Auth JWT',       status:'Opérationnel',  latency:'5ms',   uptime:'100%',   color:C.green, bg:C.greenLt },
          { icon:'🔴', label:'Push Firebase',  status:'Non configuré', latency:'—',     uptime:'—',      color:C.red,   bg:C.redLt   },
        ].map((svc,i)=>(
          <Card key={i}>
            <div style={{ padding:'12px 16px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:16 }}>{svc.icon}</span>
              <Badge label={svc.status} color={svc.color} bg={svc.bg} />
            </div>
            <div style={{ padding:'12px 16px' }}>
              <div style={{ fontSize:12, fontWeight:700, color:C.text, marginBottom:10 }}>{svc.label}</div>
              <div style={{ display:'flex', gap:16 }}>
                <div>
                  <div style={{ fontSize:9, color:C.muted, textTransform:'uppercase', fontFamily:C.mono, letterSpacing:'0.06em' }}>Latence</div>
                  <div style={{ fontSize:14, fontWeight:700, color:svc.color, fontFamily:C.mono }}>{svc.latency}</div>
                </div>
                <div>
                  <div style={{ fontSize:9, color:C.muted, textTransform:'uppercase', fontFamily:C.mono, letterSpacing:'0.06em' }}>Uptime</div>
                  <div style={{ fontSize:14, fontWeight:700, color:svc.color, fontFamily:C.mono }}>{svc.uptime}</div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card style={{ padding:'20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div style={{ fontSize:14, fontWeight:700, color:C.text }}>Trafic réseau — 24h</div>
          <div style={{ display:'flex', gap:12 }}>
            <span style={{ fontSize:10, color:C.blue, fontFamily:C.mono, display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ width:10, height:4, background:C.blue, borderRadius:2, display:'inline-block' }}></span> HTTP
            </span>
            <span style={{ fontSize:10, color:C.cyan, fontFamily:C.mono, display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ width:10, height:4, background:C.cyan, borderRadius:2, display:'inline-block' }}></span> WS
            </span>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'flex-end', gap:2, height:100 }}>
          {data.map((v,i)=>(
            <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', gap:2, height:'100%', justifyContent:'flex-end' }}>
              <div style={{ width:'100%', height:`${v}%`, borderRadius:'2px 2px 0 0', background:C.blue, opacity:0.75, minWidth:4 }} />
              <div style={{ width:'100%', height:`${v*0.5}%`, borderRadius:'2px 2px 0 0', background:C.cyan, opacity:0.5, minWidth:4 }} />
            </div>
          ))}
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
          {['00h','06h','12h','18h','24h'].map(t=>(
            <span key={t} style={{ fontSize:9, color:C.muted, fontFamily:C.mono }}>{t}</span>
          ))}
        </div>
      </Card>
    </div>
  );
}

function StorageSection() {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
      {[
        { icon:'🗃️', label:'PostgreSQL (Neon)',  used:68, total:'10 GB', color:C.blue,   bg:C.blueLt,   iops:'1.2k' },
        { icon:'📁', label:'Static Files (CDN)', used:23, total:'50 GB', color:C.green,  bg:C.greenLt,  iops:'8.5k' },
        { icon:'📊', label:'Logs (Grafana)',      used:41, total:'20 GB', color:C.purple, bg:C.purpleLt, iops:'450'  },
        { icon:'💬', label:'Redis Cache',         used:15, total:'2 GB',  color:C.orange, bg:C.orangeLt, iops:'12k'  },
      ].map(({ icon, label, used, total, color, bg, iops })=>(
        <Card key={label} style={{ padding:'16px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:8, background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>{icon}</div>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:C.text }}>{label}</div>
                <div style={{ fontSize:9, color:C.muted, fontFamily:C.mono }}>{iops} IOPS</div>
              </div>
            </div>
            <span style={{ fontSize:10, color:C.muted, fontFamily:C.mono }}>{total}</span>
          </div>
          <div style={{ height:5, borderRadius:3, background:C.surface3, overflow:'hidden', marginBottom:6 }}>
            <div style={{ height:'100%', width:`${used}%`, background:used>80?C.red:color, borderRadius:3, transition:'width 1s' }} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <span style={{ fontSize:10, color:C.muted, fontFamily:C.mono }}>{used}% utilisé</span>
            <span style={{ fontSize:10, color:used>80?C.red:C.green, fontFamily:C.mono, fontWeight:600 }}>
              {used>80?'⚠ Critique':'✓ Normal'}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}

function CostsSection() {
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:20 }}>
        {[
          { label:'Budget mensuel', value:'€1 240', used:'62%', color:C.blue,   bg:C.blueLt,   trend:'+8%',  trendColor:C.red   },
          { label:'Coût par envoi', value:'€0.002', used:'45%', color:C.green,  bg:C.greenLt,  trend:'-3%',  trendColor:C.green },
          { label:'Forecast',       value:'€1 480', used:'74%', color:C.gold,   bg:C.goldLt,   trend:'Alert',trendColor:C.red   },
        ].map((card,i)=>(
          <Card key={i} style={{ padding:'18px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <span style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:'0.08em', fontFamily:C.mono }}>{card.label}</span>
              <span style={{ fontSize:11, fontWeight:600, color:card.trendColor, fontFamily:C.mono }}>{card.trend}</span>
            </div>
            <div style={{ fontSize:28, fontWeight:800, color:card.color, fontFamily:C.mono, lineHeight:1, marginBottom:8 }}>{card.value}</div>
            <div style={{ fontSize:10, color:C.muted }}>Budget utilisé : {card.used}</div>
          </Card>
        ))}
      </div>

      <Card style={{ padding:'20px' }}>
        <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:16 }}>Répartition des coûts</div>
        {[
          { label:'Compute (Render + Vercel)', cost:'€520', pct:42, color:C.blue   },
          { label:'Database (Neon PostgreSQL)',cost:'€310', pct:25, color:C.cyan   },
          { label:'Storage (CDN + Logs)',      cost:'€240', pct:19, color:C.purple },
          { label:'Email (Nodemailer)',         cost:'€170', pct:14, color:C.gold   },
        ].map(item=>(
          <div key={item.label} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
            <span style={{ fontSize:12, color:C.textMid, minWidth:220 }}>{item.label}</span>
            <div style={{ flex:1, height:6, borderRadius:3, background:C.surface3, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${item.pct}%`, background:item.color, borderRadius:3, transition:'width 1s' }} />
            </div>
            <span style={{ fontSize:11, fontWeight:700, color:item.color, fontFamily:C.mono, minWidth:44, textAlign:'right' }}>{item.cost}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

function LogsSection() {
  const logs = [
    { time:'16:42:01', level:'info',    service:'api-server',  message:'POST /api/campagnes 201 Created' },
    { time:'16:41:58', level:'success', service:'worker',      message:'Campagne #42 envoyée à 12 500 contacts' },
    { time:'16:41:45', level:'warn',    service:'redis',       message:'Memory usage > 75%' },
    { time:'16:40:12', level:'error',   service:'email-smtp',  message:'Timeout connecting to Gmail SMTP' },
    { time:'16:39:33', level:'info',    service:'nginx',       message:'GET /dashboard 200 OK' },
    { time:'16:38:10', level:'success', service:'cicd',        message:'Deployment v2.4.1 → Render completed' },
  ];
  const logMeta = {
    info:    { color:C.blue,   bg:C.blueLt   },
    success: { color:C.green,  bg:C.greenLt  },
    warn:    { color:C.gold,   bg:C.goldLt   },
    error:   { color:C.red,    bg:C.redLt    },
  };

  return (
    <Card style={{ padding:'18px 20px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <div style={{ fontSize:14, fontWeight:700, color:C.text }}>Logs temps réel</div>
        <div style={{ display:'flex', gap:6 }}>
          {Object.entries(logMeta).map(([l,m])=>(
            <span key={l} style={{ fontSize:9, padding:'2px 8px', borderRadius:10, background:m.bg, color:m.color, textTransform:'uppercase', fontWeight:600 }}>{l}</span>
          ))}
        </div>
      </div>

      {/* Terminal box with dark bg */}
      <div style={{ background:C.navy, borderRadius:10, padding:'14px 16px', fontFamily:C.mono, fontSize:11, lineHeight:1.9, maxHeight:340, overflowY:'auto' }}>
        <div style={{ display:'flex', gap:8, paddingBottom:8, marginBottom:8, borderBottom:`1px solid #1e293b`, color:'#475569', fontSize:9, textTransform:'uppercase', letterSpacing:'0.08em' }}>
          <span style={{ width:68 }}>Time</span>
          <span style={{ width:60 }}>Level</span>
          <span style={{ width:100 }}>Service</span>
          <span>Message</span>
        </div>
        {logs.map((log,i)=>{
          const m = logMeta[log.level]||logMeta.info;
          return (
            <div key={i} style={{ display:'flex', gap:8, marginBottom:2 }}>
              <span style={{ width:68, color:'#475569' }}>{log.time}</span>
              <span style={{ width:60, color:m.color, fontWeight:600, textTransform:'uppercase', fontSize:9 }}>{log.level}</span>
              <span style={{ width:100, color:'#64748b' }}>{log.service}</span>
              <span style={{ color:'#94a3b8' }}>{log.message}</span>
            </div>
          );
        })}
        <div style={{ marginTop:10, paddingTop:8, borderTop:'1px solid #1e293b', display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ color:'#475569' }}>$ tail -f /var/log/digipip/app.log</span>
          <span style={{ display:'inline-block', width:7, height:13, background:C.green, borderRadius:1, animation:'blink 1s step-end infinite' }} />
        </div>
      </div>
    </Card>
  );
}

function EnvironmentsSection() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      {ENVIRONMENTS.map((env,i)=>(
        <Card key={i}>
          <div style={{ padding:'16px 20px', display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:48, height:48, borderRadius:12, background:env.bg, border:`1.5px solid ${env.color}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
              {env.name==='Development'?'🛠️':env.name==='Staging'?'🔍':'🚀'}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:5 }}>
                <span style={{ fontSize:14, fontWeight:700, color:C.text }}>{env.name}</span>
                <Badge label={env.status==='active'?'Running':'Stopped'} color={env.color} bg={env.bg} />
              </div>
              <div style={{ fontSize:11, color:C.muted, fontFamily:C.mono }}>
                Branch: {env.branch} · {env.pods} pods · Dernier déploiement : {env.lastDeploy}
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button style={{ padding:'7px 14px', borderRadius:7, background:C.surface2, border:`1px solid ${C.border}`, color:C.textMid, fontSize:11, cursor:'pointer', fontFamily:C.mono, fontWeight:500 }}>Logs</button>
              <button style={{ padding:'7px 14px', borderRadius:7, background:env.color, border:'none', color:'#fff', fontSize:11, cursor:'pointer', fontWeight:700, fontFamily:C.mono }}>Deploy</button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function SecuritySection() {
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12, marginBottom:20 }}>
        {SECURITY_SCORES.map((item,i)=>(
          <Card key={i} style={{ padding:'16px 20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <span style={{ fontSize:20 }}>{item.icon}</span>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:16, fontWeight:800, color:item.color, fontFamily:C.mono }}>{item.score}</span>
                <Badge label={item.status} color={item.color} bg={item.bg} />
              </div>
            </div>
            <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:4 }}>{item.label}</div>
            <div style={{ fontSize:10, color:C.muted, fontFamily:C.mono }}>{item.detail}</div>
          </Card>
        ))}
      </div>

      <Card style={{ padding:'20px' }}>
        <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:14 }}>Scan de vulnérabilités</div>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {[
            { name:'Dépendances npm',    status:'Clean',   issues:0, color:C.green,  bg:C.greenLt },
            { name:'Secrets (.env)',      status:'Clean',   issues:0, color:C.green,  bg:C.greenLt },
            { name:'Conteneurs Docker',  status:'Warning', issues:2, color:C.gold,   bg:C.goldLt  },
            { name:'Certificats SSL',     status:'Clean',   issues:0, color:C.green,  bg:C.greenLt },
          ].map(scan=>(
            <div key={scan.name} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 14px', background:C.surface2, borderRadius:8, border:`1px solid ${C.border}` }}>
              <div style={{ width:32, height:32, borderRadius:8, background:scan.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:scan.color, flexShrink:0 }}>
                {scan.issues===0?'✓':'⚠'}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:600, color:C.text }}>{scan.name}</div>
                <div style={{ fontSize:10, color:C.muted }}>{scan.issues} issue{scan.issues!==1?'s':''}</div>
              </div>
              <Badge label={scan.status} color={scan.color} bg={scan.bg} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function CloudOperations() {
  const [activeTab, setActiveTab] = useState('overview');
  const [camps,     setCamps]     = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(()=>{
    api.get('/api/campagnes')
      .then(r => setCamps(Array.isArray(r.data) ? r.data : r.data?.data || []))
      .catch(()  => setCamps([]))
      .finally(()=> setLoading(false));
  },[]);

  const sections = {
    overview:       <OverviewSection camps={camps} />,
    infrastructure: <InfrastructureSection />,
    cicd:           <CICDSection camps={camps} />,
    monitoring:     <MonitoringSection />,
    storage:        <StorageSection />,
    costs:          <CostsSection />,
    logs:           <LogsSection />,
    environments:   <EnvironmentsSection />,
    security:       <SecuritySection />,
  };

  return (
    <div style={{ padding:'28px 32px', background:C.bg, minHeight:'100vh', color:C.text, fontFamily:C.sans }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Sora:wght@400;500;600;700;800&display=swap');
        @keyframes ping    { 75%,100% { transform:scale(2.4); opacity:0; } }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes blink   { 50%{opacity:0} }
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background:${C.surface2}; }
        ::-webkit-scrollbar-thumb { background:${C.borderDk}; border-radius:3px; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24, animation:'fadeUp 0.3s ease' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:10, background:C.blueLt, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>☁️</div>
          <div>
            <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:C.navy }}>Cloud Operations Center</h1>
            <p style={{ margin:0, fontSize:11, color:C.muted, fontFamily:C.mono, marginTop:2 }}>
              DigiPip · Tous les modules cloud en un seul endroit
            </p>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 16px', borderRadius:20, background:C.surface, border:`1px solid ${C.border}` }}>
          <PulseDot color={C.green} size={6} />
          <span style={{ fontSize:12, color:C.green, fontWeight:600 }}>Cloud Opérationnel</span>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display:'flex', gap:4, marginBottom:24, overflowX:'auto', paddingBottom:4, animation:'fadeUp 0.35s ease 0.05s both' }}>
        {TABS.map(tab=>{
          const active = activeTab===tab.id;
          return (
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{
              padding:'9px 15px', borderRadius:9,
              border: active ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`,
              cursor:'pointer',
              background: active ? C.blueLt : C.surface,
              color: active ? C.blue : C.muted,
              fontFamily:C.sans, fontSize:12, fontWeight: active ? 700 : 500,
              display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap',
              transition:'all 0.15s',
            }}>
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      <div style={{ animation:'fadeUp 0.4s ease 0.1s both' }}>
        {loading && activeTab==='overview' ? (
          <div style={{ textAlign:'center', padding:60, color:C.muted }}>
            <div style={{ width:26, height:26, border:`2px solid ${C.border}`, borderTopColor:C.blue, borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 12px' }} />
            <p style={{ fontFamily:C.mono, fontSize:12 }}>Chargement...</p>
          </div>
        ) : (
          sections[activeTab]
        )}
      </div>
    </div>
  );
}