import React, { useState, useEffect } from 'react';
import api from '../api';

const C = {
  bg:'#f5f7fa', surface:'#ffffff', surface2:'#f1f4f9', surface3:'#e8edf5',
  border:'#e2e8f0', borderDk:'#cbd5e1', text:'#0f172a', textMid:'#334155', muted:'#94a3b8',
  gold:'#d97706', goldLt:'#fef3c7', green:'#059669', greenLt:'#d1fae5',
  red:'#dc2626', redLt:'#fee2e2', blue:'#2563eb', blueLt:'#dbeafe',
  purple:'#7c3aed', purpleLt:'#ede9fe', cyan:'#0891b2', cyanLt:'#cffafe',
  orange:'#ea580c', orangeLt:'#ffedd5', navy:'#0f172a',
  mono:"'IBM Plex Mono',monospace", sans:"'Sora',sans-serif"
};

function PulseDot({color,size=8}){return(<span style={{position:'relative',display:'inline-flex',width:size,height:size,flexShrink:0}}><span style={{position:'absolute',inset:-2,borderRadius:'50%',background:color,opacity:0.25,animation:'ping 2s cubic-bezier(0,0,0.2,1) infinite'}}/><span style={{width:size,height:size,borderRadius:'50%',background:color,display:'block',position:'relative',zIndex:1}}/></span>);}
function Badge({label,color,bg}){return(<span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:600,color,background:bg,whiteSpace:'nowrap'}}>{label}</span>);}
function Card({children,style={},onClick}){const[h,setH]=useState(false);return(<div onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{background:C.surface,borderRadius:12,border:`1px solid ${h?C.borderDk:C.border}`,overflow:'hidden',transition:'all 0.18s',boxShadow:h?'0 8px 24px rgba(15,23,42,0.10)':'0 1px 4px rgba(15,23,42,0.05)',cursor:onClick?'pointer':'default',...style}}>{children}</div>);}
function MiniBar({value,color,height=4}){const col=value>80?C.red:value>60?C.gold:color;return(<div style={{height,borderRadius:4,background:C.surface3,overflow:'hidden',flex:1}}><div style={{height:'100%',width:`${Math.min(value,100)}%`,background:col,borderRadius:4,transition:'width 1s ease'}}/></div>);}

/* ══════════════════════════════════════════
   DONNÉES RÉELLES DIGILAB SOLUTIONS
══════════════════════════════════════════ */

// Clients de DigiLab Solutions
const DIGILAB_CLIENTS = [
  { name:'Tunisie Telecom', sector:'Télécommunications', campaigns:24, contacts:125000, mrr:2500, status:'actif' },
  { name:'Banque Zitouna', sector:'Finance Islamique', campaigns:18, contacts:85000, mrr:1800, status:'actif' },
  { name:'Ooredoo Tunisie', sector:'Télécommunications', campaigns:15, contacts:68000, mrr:1500, status:'actif' },
  { name:'Medina Tech', sector:'Technologie', campaigns:12, contacts:32000, mrr:950, status:'actif' },
  { name:'Carthage Group', sector:'Immobilier', campaigns:9, contacts:45000, mrr:1200, status:'actif' },
  { name:'StartUp Sfax', sector:'Startup', campaigns:6, contacts:15000, mrr:450, status:'actif' },
  { name:'Sahara Travel', sector:'Tourisme', campaigns:8, contacts:28000, mrr:750, status:'actif' },
  { name:'Tunisie Auto', sector:'Automobile', campaigns:11, contacts:42000, mrr:1100, status:'actif' },
];

// Campagnes réelles DigiLab
const DIGILAB_CAMPAIGNS = [
  { id:1, title:'Campagne Ramadan 2026', client:'Tunisie Telecom', type:'SMS', status:'active', recipients:125000, rate:82.4, date:'2026-03-01' },
  { id:2, title:'Promo Été DigiLab', client:'DigiLab Solutions', type:'Email', status:'sent', recipients:45000, rate:68.7, date:'2026-05-15' },
  { id:3, title:'Lancement App Zitouna', client:'Banque Zitouna', type:'Push', status:'scheduled', recipients:28000, rate:0, date:'2026-06-10' },
  { id:4, title:'Newsletter Mensuelle', client:'Ooredoo Tunisie', type:'Email', status:'sent', recipients:80000, rate:71.2, date:'2026-05-01' },
  { id:5, title:'Black Friday Early', client:'Medina Tech', type:'Multicanal', status:'draft', recipients:15000, rate:0, date:'—' },
  { id:6, title:'Ventes Flash Auto', client:'Tunisie Auto', type:'SMS', status:'active', recipients:42000, rate:75.8, date:'2026-06-05' },
  { id:7, title:'Pack Vacances', client:'Sahara Travel', type:'Email', status:'sent', recipients:28000, rate:64.3, date:'2026-05-20' },
  { id:8, title:'Welcome StartUp', client:'StartUp Sfax', type:'Email', status:'sent', recipients:15000, rate:58.9, date:'2026-04-15' },
];

// Données cloud DigiLab (sans outils spécifiques)
const CLOUD_METRICS = {
  regions: [
    { id:'tn-north', name:'Tunisie Nord', location:'Tunis', status:'active', cpu:45, memory:62, latency:18, uptime:'99.99' },
    { id:'tn-south', name:'Tunisie Sud', location:'Sfax', status:'active', cpu:38, memory:55, latency:42, uptime:'99.97' },
    { id:'tn-east', name:'Tunisie Est', location:'Sousse', status:'active', cpu:52, memory:48, latency:85, uptime:'99.94' },
    { id:'tn-central', name:'Tunisie Centre', location:'Kairouan', status:'standby', cpu:12, memory:20, latency:22, uptime:'100.0' },
  ],
  services: [
    { name:'Site Web Principal', status:'up', latency:18, region:'Tunis' },
    { name:'API Backend', status:'up', latency:42, region:'Tunis' },
    { name:'Base de Données', status:'up', latency:8, region:'Sfax' },
    { name:'Cache Serveur', status:'up', latency:3, region:'Tunis' },
    { name:'Notifications Push', status:'down', latency:0, region:'—' },
    { name:'Email Marketing', status:'warn', latency:312, region:'Tunis' },
  ],
  storage: [
    { type:'Base de Données Clients', used:68, total:'10 GB', iops:'1.2k', details:{tables:24, records:'2.4M', backups:'7 jours', growth:'+12%/mois'} },
    { type:'Fichiers Médias', used:23, total:'50 GB', iops:'8.5k', details:{files:'45K', images:'32K', videos:'1.2K', growth:'+8%/mois'} },
    { type:'Logs Système', used:41, total:'20 GB', iops:'450', details:{entries:'12M', retention:'30 jours', compression:'85%', growth:'+15%/mois'} },
    { type:'Cache Temporaire', used:15, total:'2 GB', iops:'12k', details:{keys:'45K', hitRate:'94%', evictions:'12/jour', growth:'+5%/mois'} },
  ],
  costs: {
    monthly: 1240,
    perSend: 0.002,
    forecast: 1480,
    breakdown: [
      { category:'Serveurs Cloud', cost:520, pct:42, trend:'+5%', optimization:'Auto-scaling activé' },
      { category:'Base de Données', cost:310, pct:25, trend:'+12%', optimization:'Index optimization' },
      { category:'Stockage Fichiers', cost:240, pct:19, trend:'+8%', optimization:'Compression activée' },
      { category:'Email Marketing', cost:170, pct:14, trend:'-3%', optimization:'Envoi par lots' },
    ],
    optimizations: [
      { title:'Auto-scaling', description:'Réduction 15% en période creuse', status:'Actif', savings:78 },
      { title:'Cache CDN', description:'Cache hit rate 94%', status:'Actif', savings:45 },
      { title:'Compression', description:'Gzip + Brotli activés', status:'Actif', savings:32 },
      { title:'Arrêt Programmé', description:'Dev env arrêt 20h-8h', status:'Programmé', savings:120 },
    ]
  },
  incidents: [
    { id:'INC-2026-001', severity:'critical', title:'Panne API', description:'Timeout sur 45% des requêtes entre 14:23 et 14:47', service:'API Backend', status:'resolved', duration:'24 min', time:'2026-06-05 14:23', impact:'2,340 utilisateurs affectés', resolution:'Redémarrage automatique' },
    { id:'INC-2026-002', severity:'high', title:'Dégradation Email', description:'Latence > 500ms sur le service email', service:'Email Marketing', status:'resolved', duration:'1h 12min', time:'2026-06-05 11:15', impact:'Queue de 1,240 messages', resolution:'Basculement serveur' },
    { id:'INC-2026-003', severity:'medium', title:'Alerte Cache', description:'Utilisation mémoire > 85% pendant 15 min', service:'Cache Serveur', status:'active', duration:'En cours', time:'2026-06-05 16:42', impact:"Risque d'éviction", resolution:'Scale-up en cours' },
    { id:'INC-2026-004', severity:'low', title:'Backup retardé', description:'Backup quotidien retardé de 2h', service:'Base de Données', status:'resolved', duration:'2h 15min', time:'2026-06-05 03:00', impact:'Aucun', resolution:'Retry automatique' },
  ],
  logs: [
    { time:'16:42:01', level:'critical', service:'API', message:'POST /api/campagnes 504 Gateway Timeout' },
    { time:'16:41:58', level:'error', service:'Worker', message:'Campagne #42 échec envoi - retry 3/3' },
    { time:'16:41:45', level:'warn', service:'Cache', message:'Memory usage > 85% - eviction activée' },
    { time:'16:40:12', level:'error', service:'Email', message:'Timeout connexion SMTP - fallback activé' },
    { time:'16:39:33', level:'info', service:'Web', message:'GET /dashboard 200 OK' },
    { time:'16:38:10', level:'success', service:'Déploiement', message:'Version 2.4.1 déployée avec succès' },
    { time:'16:37:22', level:'warn', service:'Monitoring', message:'CPU usage > 80% sur serveur principal' },
    { time:'16:36:15', level:'info', service:'Backup', message:'Backup démarré - 2.4GB' },
    { time:'16:35:08', level:'error', service:'Push', message:'Service notifications indisponible' },
    { time:'16:34:44', level:'success', service:'Auth', message:'2,847 sessions actives' },
  ],
  security: {
    score: 92,
    grade: 'A',
    tools: [
      { name:'Authentification', status:'Actif', score:'A+', description:'Tokens JWT avec expiration 7 jours', details:{sessions:'2,847 actives', refresh:'Automatique', mfa:'Activé', algorithm:'HS256'} },
      { name:'Chiffrement SSL', status:'Actif', score:'A+', description:'Chiffrement de bout en bout', details:{protocol:'TLS 1.3', certificate:'Valide', renewal:'Auto', hsts:'Activé'} },
      { name:'Rate Limiting', status:'Actif', score:'A', description:'Protection contre les attaques', details:{limit:'100 req/min', burst:'150 req/min', blocked:'12 aujourd\'hui', strategy:'Token bucket'} },
      { name:'Audit Logs', status:'Partiel', score:'B', description:'Journalisation des actions', details:{coverage:'Console', retention:'30 jours', events:'Login, CRUD', compliance:'RGPD'} },
      { name:'Firewall', status:'Actif', score:'A', description:'Filtrage des requêtes', details:{rules:'OWASP', blocked:'45 aujourd\'hui', mode:'Blocking', update:'Auto'} },
      { name:'Chiffrement Données', status:'Actif', score:'A+', description:'Chiffrement au repos et en transit', details:{atRest:'AES-256', inTransit:'TLS 1.3', rotation:'90 jours', backup:'Chiffré'} },
    ],
    vulnerabilities: [
      { severity:'low', name:'XSS reflected', status:'corrigé', date:'2026-06-01' },
      { severity:'medium', name:'CSRF token', status:'corrigé', date:'2026-05-28' },
      { severity:'low', name:'Header missing', status:'ouvert', date:'—' },
      { severity:'high', name:'Dependency lodash', status:'corrigé', date:'2026-06-03' },
    ]
  }
};

const TABS=[
  {id:'overview',icon:'☁️',label:"Vue d'ensemble"},
  {id:'monitoring',icon:'📊',label:'Monitoring'},
  {id:'storage',icon:'💾',label:'Stockage'},
  {id:'costs',icon:'💰',label:'Coûts'},
  {id:'logs',icon:'📝',label:'Logs & Incidents'},
  {id:'security',icon:'🔐',label:'Sécurité'},
];

/* ══════════════════════════════════════════
   SECTIONS
══════════════════════════════════════════ */

function OverviewSection(){
  return(<div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:20}}>
      {[{icon:'🏢',label:'Clients Actifs',value:'8',color:C.blue,bg:C.blueLt,sub:'Entreprises tunisiennes'},{icon:'📢',label:'Campagnes',value:'8',color:C.gold,bg:C.goldLt,sub:'4 actives'},{icon:'👥',label:'Contacts',value:'448K',color:C.green,bg:C.greenLt,sub:'Base totale'},{icon:'💰',label:'MRR',value:'9,250 TND',color:C.purple,bg:C.purpleLt,sub:'Revenus mensuels'}].map((card,i)=>(<Card key={i} style={{padding:'18px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <div style={{width:36,height:36,borderRadius:9,background:card.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{card.icon}</div>
          <PulseDot color={card.color} size={7}/>
        </div>
        <div style={{fontSize:10,color:C.muted,textTransform:'uppercase',letterSpacing:'0.08em',fontFamily:C.mono,marginBottom:4}}>{card.label}</div>
        <div style={{fontSize:26,fontWeight:800,color:card.color,fontFamily:C.mono,lineHeight:1}}>{card.value}</div>
        <div style={{fontSize:10,color:C.muted,marginTop:5}}>{card.sub}</div>
      </Card>))}
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12}}>
      <Card style={{padding:'20px'}}>
        <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:16}}>Clients DigiLab Solutions</div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {DIGILAB_CLIENTS.map((client,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:C.surface2,borderRadius:8,border:`1px solid ${C.border}`}}>
            <div style={{width:36,height:36,borderRadius:'50%',background:C.blueLt,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:C.blue,flexShrink:0}}>{client.name.charAt(0)}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:600,color:C.text}}>{client.name}</div>
              <div style={{fontSize:11,color:C.muted}}>{client.sector} · {client.campaigns} campagnes · {client.contacts.toLocaleString('fr-FR')} contacts</div>
            </div>
            <Badge label={client.status==='actif'?'Actif':'Inactif'} color={C.green} bg={C.greenLt}/>
            <span style={{fontSize:12,fontWeight:700,color:C.text,fontFamily:C.mono,minWidth:70,textAlign:'right'}}>{client.mrr} TND</span>
          </div>))}
        </div>
      </Card>
      <Card style={{padding:'20px'}}>
        <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:16}}>Campagnes récentes</div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {DIGILAB_CAMPAIGNS.slice(0,5).map((camp,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:C.surface2,borderRadius:8,border:`1px solid ${C.border}`}}>
            <div style={{width:36,height:36,borderRadius:8,background:C.goldLt,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>
              {camp.type==='SMS'?'💬':camp.type==='Email'?'✉':camp.type==='Push'?'🔔':'⚡'}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:600,color:C.text}}>{camp.title}</div>
              <div style={{fontSize:11,color:C.muted}}>{camp.client} · {camp.recipients.toLocaleString('fr-FR')} destinataires</div>
            </div>
            <Badge label={camp.status==='active'?'Active':camp.status==='sent'?'Envoyée':camp.status==='scheduled'?'Planifiée':'Brouillon'} 
              color={camp.status==='active'?C.blue:camp.status==='sent'?C.green:camp.status==='scheduled'?C.gold:C.muted}
              bg={camp.status==='active'?C.blueLt:camp.status==='sent'?C.greenLt:camp.status==='scheduled'?C.goldLt:C.surface2}/>
            {camp.rate>0&&<span style={{fontSize:12,fontWeight:700,color:C.green,fontFamily:C.mono,minWidth:50,textAlign:'right'}}>{camp.rate}%</span>}
          </div>))}
        </div>
      </Card>
    </div>
  </div>);
}

function MonitoringSection(){
  return(<div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
      {[{metric:'CPU',value:45,max:100,trend:'+2%',status:'normal',color:C.blue},{metric:'Mémoire',value:68,max:100,trend:'+5%',status:'attention',color:C.purple},{metric:'Disque',value:23,max:100,trend:'-3%',status:'normal',color:C.cyan},{metric:'Réseau Entrant',value:45,max:100,trend:'+12%',status:'normal',color:C.green},{metric:'Réseau Sortant',value:38,max:100,trend:'+8%',status:'normal',color:C.orange},{metric:'Temps Réponse',value:124,max:500,trend:'-15ms',status:'normal',color:C.gold}].map((m,i)=>(<Card key={i} style={{padding:'18px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <span style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:'0.08em',fontFamily:C.mono}}>{m.metric}</span>
          <Badge label={m.status==='normal'?'Normal':'Attention'} color={m.status==='normal'?C.green:C.gold} bg={m.status==='normal'?C.greenLt:C.goldLt}/>
        </div>
        <div style={{display:'flex',alignItems:'baseline',gap:8,marginBottom:10}}>
          <span style={{fontSize:28,fontWeight:800,color:m.color,fontFamily:C.mono}}>{m.value}</span>
          <span style={{fontSize:11,color:C.muted}}>{m.max===100?'%':'ms'}</span>
        </div>
        <MiniBar value={(m.value/m.max)*100} color={m.color}/>
        <span style={{fontSize:10,color:m.trend.startsWith('+')?C.red:C.green,fontFamily:C.mono,fontWeight:600,marginTop:6,display:'block'}}>{m.trend} vs hier</span>
      </Card>))}
    </div>
    <Card style={{padding:'20px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div style={{fontSize:16,fontWeight:700,color:C.text}}>Régions Cloud DigiLab</div>
        <Badge label={`${CLOUD_METRICS.regions.filter(r=>r.status==='active').length} actives`} color={C.green} bg={C.greenLt}/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
        {CLOUD_METRICS.regions.map((region,i)=>(<Card key={i}>
          <div style={{padding:'14px 16px',display:'flex',alignItems:'center',gap:10,borderBottom:`1px solid ${C.border}`}}>
            <div style={{width:36,height:36,borderRadius:8,background:C.blueLt,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>🌍</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:C.text}}>{region.name}</div>
              <div style={{fontSize:10,color:C.muted,fontFamily:C.mono}}>{region.location}</div>
            </div>
            <PulseDot color={region.status==='active'?C.green:C.gold} size={6}/>
          </div>
          <div style={{padding:'12px 16px'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
              <span style={{fontSize:10,color:C.muted,fontFamily:C.mono}}>CPU</span>
              <span style={{fontSize:12,fontWeight:700,color:C.blue,fontFamily:C.mono}}>{region.cpu}%</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
              <span style={{fontSize:10,color:C.muted,fontFamily:C.mono}}>Mémoire</span>
              <span style={{fontSize:12,fontWeight:700,color:C.purple,fontFamily:C.mono}}>{region.memory}%</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between'}}>
              <span style={{fontSize:10,color:C.muted,fontFamily:C.mono}}>Uptime</span>
              <span style={{fontSize:12,fontWeight:700,color:C.green,fontFamily:C.mono}}>{region.uptime}%</span>
            </div>
          </div>
        </Card>))}
      </div>
    </Card>
  </div>);
}

function StorageSection(){
  return(<div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12}}>
      {CLOUD_METRICS.storage.map((item,i)=>(<Card key={i} style={{padding:'20px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:40,height:40,borderRadius:10,background:C.blueLt,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>
              {i===0?'🗃️':i===1?'📁':i===2?'📊':'💬'}
            </div>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:C.text}}>{item.type}</div>
              <div style={{fontSize:10,color:C.muted,fontFamily:C.mono}}>{item.iops} IOPS</div>
            </div>
          </div>
          <span style={{fontSize:12,color:C.muted,fontFamily:C.mono}}>{item.total}</span>
        </div>
        <div style={{marginBottom:12}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
            <span style={{fontSize:11,color:C.text,fontWeight:600}}>{item.used}% utilisé</span>
            <span style={{fontSize:11,color:item.used>80?C.red:C.green,fontWeight:600}}>{item.used>80?'⚠ Critique':'✓ Normal'}</span>
          </div>
          <div style={{height:8,borderRadius:4,background:C.surface3,overflow:'hidden'}}>
            <div style={{height:'100%',width:`${item.used}%`,background:item.used>80?C.red:C.blue,borderRadius:4,transition:'width 1s'}}/>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8,padding:'12px',background:C.surface2,borderRadius:8}}>
          {Object.entries(item.details).map(([key,value])=>(<div key={key}>
            <div style={{fontSize:9,color:C.muted,textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:2}}>{key}</div>
            <div style={{fontSize:12,fontWeight:700,color:C.text,fontFamily:C.mono}}>{value}</div>
          </div>))}
        </div>
      </Card>))}
    </div>
    <Card style={{padding:'20px',marginTop:14}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div style={{fontSize:16,fontWeight:700,color:C.text}}>Résumé du stockage</div>
        <Badge label="82 GB total" color={C.blue} bg={C.blueLt}/>
      </div>
      <div style={{display:'flex',gap:20}}>
        <div style={{flex:1}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:8}}>Répartition par type</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {CLOUD_METRICS.storage.map((item,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:10,height:10,borderRadius:3,background:C.blue}}/>
              <span style={{flex:1,fontSize:12,color:C.text}}>{item.type}</span>
              <span style={{fontSize:12,fontWeight:700,color:C.blue,fontFamily:C.mono}}>{item.used}%</span>
            </div>))}
          </div>
        </div>
        <div style={{width:1,background:C.border}}/>
        <div style={{flex:1}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:8}}>Prévisions</div>
          <div style={{fontSize:13,color:C.text,lineHeight:1.6}}>
            <div>📈 Croissance moyenne: <strong>+10%/mois</strong></div>
            <div>⚠️ Alertes: <strong style={{color:C.red}}>Base de Données à 68%</strong></div>
            <div>💡 Recommandation: <strong>Upgrade 20 GB</strong></div>
          </div>
        </div>
      </div>
    </Card>
  </div>);
}

function CostsSection(){
  return(<div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
      {[{label:'Budget mensuel',value:`${CLOUD_METRICS.costs.monthly} TND`,used:'62%',color:C.blue,bg:C.blueLt,trend:'+8%',trendColor:C.red,alert:false},{label:'Coût par envoi',value:`${CLOUD_METRICS.costs.perSend} TND`,used:'45%',color:C.green,bg:C.greenLt,trend:'-3%',trendColor:C.green,alert:false},{label:'Prévision',value:`${CLOUD_METRICS.costs.forecast} TND`,used:'74%',color:C.gold,bg:C.goldLt,trend:'Alerte',trendColor:C.red,alert:true}].map((card,i)=>(<Card key={i} style={{padding:'18px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <span style={{fontSize:10,color:C.muted,textTransform:'uppercase',letterSpacing:'0.08em',fontFamily:C.mono}}>{card.label}</span>
          <span style={{fontSize:11,fontWeight:600,color:card.trendColor,fontFamily:C.mono}}>{card.trend}</span>
        </div>
        <div style={{fontSize:28,fontWeight:800,color:card.color,fontFamily:C.mono,lineHeight:1,marginBottom:8}}>{card.value}</div>
        <div style={{fontSize:10,color:C.muted}}>Budget utilisé : {card.used}</div>
        {card.alert&&(<div style={{marginTop:10,padding:'8px 12px',background:C.redLt,borderRadius:6,border:`1px solid ${C.red}20`}}><span style={{fontSize:11,color:C.red,fontWeight:600}}>⚠️ Dépassement prévu dans 12 jours</span></div>)}
      </Card>))}
    </div>
    <Card style={{padding:'20px',marginBottom:14}}>
      <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:16}}>Répartition des coûts</div>
      {CLOUD_METRICS.costs.breakdown.map(item=>(<div key={item.category} style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
        <span style={{fontSize:12,color:C.textMid,minWidth:220}}>{item.category}</span>
        <div style={{flex:1,height:6,borderRadius:3,background:C.surface3,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${item.pct}%`,background:C.blue,borderRadius:3,transition:'width 1s'}}/>
        </div>
        <span style={{fontSize:12,fontWeight:700,color:C.blue,fontFamily:C.mono,minWidth:50,textAlign:'right'}}>{item.cost} TND</span>
        <span style={{fontSize:10,color:C.muted,fontFamily:C.mono}}>({item.pct}%)</span>
        <span style={{fontSize:10,color:item.trend.startsWith('+')?C.red:C.green,fontFamily:C.mono,minWidth:40}}>{item.trend}</span>
      </div>))}
    </Card>
    <Card style={{padding:'20px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div style={{fontSize:16,fontWeight:700,color:C.text}}>Optimisations actives</div>
        <Badge label={`${CLOUD_METRICS.costs.optimizations.reduce((a,o)=>a+o.savings,0)} TND/mois économisés`} color={C.green} bg={C.greenLt}/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12}}>
        {CLOUD_METRICS.costs.optimizations.map((opt,i)=>(<div key={i} style={{padding:'14px',background:C.surface2,borderRadius:8,border:`1px solid ${C.border}`,display:'flex',gap:12}}>
          <span style={{fontSize:24}}>{['🔄','📦','🗜️','⏰'][i]}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:2}}>{opt.title}</div>
            <div style={{fontSize:11,color:C.muted,marginBottom:4}}>{opt.description}</div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <Badge label={opt.status} color={C.green} bg={C.greenLt}/>
              <span style={{fontSize:12,fontWeight:700,color:C.green,fontFamily:C.mono}}>{opt.savings} TND/mois</span>
            </div>
          </div>
        </div>))}
      </div>
    </Card>
  </div>);
}

function LogsSection(){
  const logMeta={info:{color:C.blue,bg:C.blueLt},success:{color:C.green,bg:C.greenLt},warn:{color:C.gold,bg:C.goldLt},error:{color:C.red,bg:C.redLt},critical:{color:C.red,bg:C.redLt}};
  const severityConfig={critical:{color:C.red,bg:C.redLt,icon:'🔴'},high:{color:C.orange,bg:C.orangeLt,icon:'🟠'},medium:{color:C.gold,bg:C.goldLt,icon:'🟡'},low:{color:C.blue,bg:C.blueLt,icon:'🔵'}};
  return(<div>
    <Card style={{padding:'20px',marginBottom:14}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div style={{fontSize:16,fontWeight:700,color:C.text}}>Incidents récents</div>
        <Badge label={`${CLOUD_METRICS.incidents.filter(i=>i.status==='active').length} actifs`} color={C.red} bg={C.redLt}/>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {CLOUD_METRICS.incidents.map((incident,i)=>{const sev=severityConfig[incident.severity];return(<div key={i} style={{padding:'14px 16px',borderRadius:10,background:sev.bg,border:`1px solid ${sev.color}20`,display:'flex',gap:12}}>
          <span style={{fontSize:20}}>{sev.icon}</span>
          <div style={{flex:1}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
              <span style={{fontSize:13,fontWeight:700,color:C.text}}>{incident.id} - {incident.title}</span>
              <Badge label={incident.status==='active'?'Actif':'Résolu'} color={incident.status==='active'?C.red:C.green} bg={incident.status==='active'?C.redLt:C.greenLt}/>
            </div>
            <div style={{fontSize:11,color:C.muted,marginBottom:6}}>{incident.description}</div>
            <div style={{display:'flex',gap:16,fontSize:10,color:C.muted,fontFamily:C.mono}}>
              <span>🕐 {incident.time}</span><span>⏱️ {incident.duration}</span><span>🔧 {incident.service}</span><span>👥 {incident.impact}</span>
            </div>
            {incident.status==='resolved'?(<div style={{marginTop:6,fontSize:11,color:C.green,fontWeight:600}}>✅ Résolution: {incident.resolution}</div>):(<div style={{marginTop:6,fontSize:11,color:C.red,fontWeight:600}}>🔴 En cours: {incident.resolution}</div>)}
          </div>
        </div>);})}
      </div>
    </Card>
    <Card style={{padding:'18px 20px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
        <div style={{fontSize:16,fontWeight:700,color:C.text}}>Logs temps réel</div>
        <div style={{display:'flex',gap:6}}>
          {Object.entries(logMeta).map(([l,m])=>(<span key={l} style={{fontSize:9,padding:'2px 8px',borderRadius:10,background:m.bg,color:m.color,textTransform:'uppercase',fontWeight:600}}>{l}</span>))}
        </div>
      </div>
      <div style={{background:C.navy,borderRadius:10,padding:'14px 16px',fontFamily:C.mono,fontSize:11,lineHeight:1.9,maxHeight:340,overflowY:'auto'}}>
        <div style={{display:'flex',gap:8,paddingBottom:8,marginBottom:8,borderBottom:'1px solid #1e293b',color:'#475569',fontSize:9,textTransform:'uppercase',letterSpacing:'0.08em'}}>
          <span style={{width:68}}>Heure</span><span style={{width:60}}>Niveau</span><span style={{width:100}}>Service</span><span>Message</span>
        </div>
        {CLOUD_METRICS.logs.map((log,i)=>{const m=logMeta[log.level]||logMeta.info;return(<div key={i} style={{display:'flex',gap:8,marginBottom:2}}>
          <span style={{width:68,color:'#475569'}}>{log.time}</span>
          <span style={{width:60,color:m.color,fontWeight:600,textTransform:'uppercase',fontSize:9}}>{log.level}</span>
          <span style={{width:100,color:'#64748b'}}>{log.service}</span>
          <span style={{color:'#94a3b8'}}>{log.message}</span>
        </div>);})}
        <div style={{marginTop:10,paddingTop:8,borderTop:'1px solid #1e293b',display:'flex',alignItems:'center',gap:8}}>
          <span style={{color:'#475569'}}>$ tail -f /var/log/digilab/app.log</span>
          <span style={{display:'inline-block',width:7,height:13,background:C.green,borderRadius:1,animation:'blink 1s step-end infinite'}}/>
        </div>
      </div>
    </Card>
  </div>);
}

function SecuritySection(){
  return(<div>
    <Card style={{padding:'20px',marginBottom:14}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div style={{fontSize:16,fontWeight:700,color:C.text}}>Score de sécurité global</div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:32,fontWeight:800,color:C.green,fontFamily:C.mono}}>{CLOUD_METRICS.security.grade}</span>
          <Badge label={`${CLOUD_METRICS.security.score}/100`} color={C.green} bg={C.greenLt}/>
        </div>
      </div>
      <div style={{display:'flex',gap:20}}>
        <div style={{flex:1}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:8}}>Répartition des scores</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {CLOUD_METRICS.security.tools.map((tool,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:14}}>{['🔐','🛡️','🚫','🔍','🧱','🔒'][i]}</span>
              <span style={{flex:1,fontSize:12,color:C.text}}>{tool.name}</span>
              <span style={{fontSize:12,fontWeight:700,color:tool.score==='A+'?C.green:tool.score==='A'?C.blue:C.gold,fontFamily:C.mono,minWidth:30}}>{tool.score}</span>
              <div style={{width:60,height:4,background:C.surface3,borderRadius:2,overflow:'hidden'}}>
                <div style={{height:'100%',width:tool.score==='A+'?'100%':tool.score==='A'?'90%':'75%',background:tool.score==='A+'?C.green:tool.score==='A'?C.blue:C.gold,borderRadius:2}}/>
              </div>
            </div>))}
          </div>
        </div>
        <div style={{width:1,background:C.border}}/>
        <div style={{flex:1}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:8}}>Vulnérabilités</div>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {CLOUD_METRICS.security.vulnerabilities.map((vuln,i)=>{const vc={low:{color:C.blue,bg:C.blueLt,icon:'🔵'},medium:{color:C.gold,bg:C.goldLt,icon:'🟡'},high:{color:C.orange,bg:C.orangeLt,icon:'🟠'},critical:{color:C.red,bg:C.redLt,icon:'🔴'}}[vuln.severity];return(<div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',background:vc.bg,borderRadius:6,border:`1px solid ${vc.color}20`}}>
              <span>{vc.icon}</span>
              <span style={{flex:1,fontSize:11,color:C.text}}>{vuln.name}</span>
              <Badge label={vuln.status==='corrigé'?'Corrigé':'Ouvert'} color={vuln.status==='corrigé'?C.green:C.red} bg={vuln.status==='corrigé'?C.greenLt:C.redLt}/>
            </div>);})}
          </div>
        </div>
      </div>
    </Card>
    <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12}}>
      {CLOUD_METRICS.security.tools.map((tool,i)=>(<Card key={i} style={{padding:'18px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontSize:22}}>{['🔐','🛡️','🚫','🔍','🧱','🔒'][i]}</span>
            <div><div style={{fontSize:14,fontWeight:700,color:C.text}}>{tool.name}</div><div style={{fontSize:10,color:C.muted}}>{tool.description}</div></div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:16,fontWeight:800,color:tool.score==='A+'?C.green:tool.score==='A'?C.blue:C.gold,fontFamily:C.mono}}>{tool.score}</span>
            <Badge label={tool.status} color={tool.status==='Actif'?C.green:C.gold} bg={tool.status==='Actif'?C.greenLt:C.goldLt}/>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8,padding:'12px',background:C.surface2,borderRadius:8}}>
          {Object.entries(tool.details).map(([key,value])=>(<div key={key}><div style={{fontSize:9,color:C.muted,textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:2}}>{key}</div><div style={{fontSize:12,fontWeight:700,color:C.text,fontFamily:C.mono}}>{value}</div></div>))}
        </div>
      </Card>))}
    </div>
  </div>);
}

/* ══════════════════════════════════════════
   MAIN
══════════════════════════════════════════ */
export default function CloudOperations(){
  const[activeTab,setActiveTab]=useState('overview');
  const[camps,setCamps]=useState([]);
  const[loading,setLoading]=useState(true);

  useEffect(()=>{
    api.get('/api/campagnes').then(r=>setCamps(Array.isArray(r.data)?r.data:r.data?.data||[])).catch(()=>setCamps([])).finally(()=>setLoading(false));
  },[]);

  const sections={
    overview:<OverviewSection/>,
    monitoring:<MonitoringSection/>,
    storage:<StorageSection/>,
    costs:<CostsSection/>,
    logs:<LogsSection/>,
    security:<SecuritySection/>,
  };

  return(<div style={{padding:'28px 32px',background:C.bg,minHeight:'100vh',color:C.text,fontFamily:C.sans}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Sora:wght@400;500;600;700;800&display=swap');@keyframes ping{75%,100%{transform:scale(2.4);opacity:0}}@keyframes blink{50%{opacity:0}}*{box-sizing:border-box}::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:${C.surface2}}::-webkit-scrollbar-thumb{background:${C.borderDk};border-radius:3px}`}</style>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div style={{width:40,height:40,borderRadius:10,background:C.blueLt,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>☁️</div>
        <div><h1 style={{margin:0,fontSize:22,fontWeight:800,color:C.navy}}>Cloud Operations Center</h1><p style={{margin:0,fontSize:11,color:C.muted,fontFamily:C.mono,marginTop:2}}>DigiLab Solutions · Tunisie</p></div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 16px',borderRadius:20,background:C.surface,border:`1px solid ${C.border}`}}>
        <PulseDot color={C.green} size={6}/>
        <span style={{fontSize:12,color:C.green,fontWeight:600}}>Cloud Opérationnel</span>
      </div>
    </div>
    <div style={{display:'flex',gap:4,marginBottom:24,overflowX:'auto',paddingBottom:4}}>
      {TABS.map(tab=>{const active=activeTab===tab.id;return(<button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{padding:'9px 15px',borderRadius:9,border:active?`1.5px solid ${C.blue}`:`1px solid ${C.border}`,cursor:'pointer',background:active?C.blueLt:C.surface,color:active?C.blue:C.muted,fontFamily:C.sans,fontSize:12,fontWeight:active?700:500,display:'flex',alignItems:'center',gap:6,whiteSpace:'nowrap',transition:'all 0.15s'}}><span>{tab.icon}</span><span>{tab.label}</span></button>);})}
    </div>
    <div>{loading&&activeTab==='overview'?(<div style={{textAlign:'center',padding:60,color:C.muted}}><div style={{width:26,height:26,border:`2px solid ${C.border}`,borderTopColor:C.blue,borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 12px'}}/><p style={{fontFamily:C.mono,fontSize:12}}>Chargement...</p></div>):sections[activeTab]}</div>
  </div>);
}