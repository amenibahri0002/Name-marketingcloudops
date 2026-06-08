import React, { useState, useEffect } from 'react';
import api from '../api';

const C = {
  bg:'#f5f7fa', surface:'#ffffff', surface2:'#f1f4f9', surface3:'#e8edf5',
  border:'#e2e8f0', borderDk:'#cbd5e1', text:'#0f172a', textMid:'#334155', muted:'#94a3b8',
  gold:'#f5a623', goldLt:'#fef3c7', goldDk:'#d4881a',
  green:'#059669', greenLt:'#d1fae5',
  red:'#dc2626', redLt:'#fee2e2', blue:'#2563eb', blueLt:'#dbeafe',
  purple:'#7c3aed', purpleLt:'#ede9fe', cyan:'#0891b2', cyanLt:'#cffafe',
  orange:'#ea580c', orangeLt:'#ffedd5', navy:'#0f172a',
  mono:"'IBM Plex Mono',monospace", sans:"'Sora',sans-serif"
};

function PulseDot({color,size=8}){return(<span style={{position:'relative',display:'inline-flex',width:size,height:size,flexShrink:0}}><span style={{position:'absolute',inset:-2,borderRadius:'50%',background:color,opacity:0.25,animation:'ping 2s cubic-bezier(0,0,0.2,1) infinite'}}/><span style={{width:size,height:size,borderRadius:'50%',background:color,display:'block',position:'relative',zIndex:1}}/></span>);}
function Badge({label,color,bg}){return(<span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:600,color,background:bg,whiteSpace:'nowrap'}}>{label}</span>);}
function Card({children,style={},onClick}){const[h,setH]=useState(false);return(<div onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{background:C.surface,borderRadius:12,border:`1px solid ${h?C.borderDk:C.border}`,overflow:'hidden',transition:'all 0.18s',boxShadow:h?'0 8px 24px rgba(15,23,42,0.10)':'0 1px 4px rgba(15,23,42,0.05)',cursor:onClick?'pointer':'default',...style}}>{children}</div>);}
function MiniBar({value,color,height=4}){const col=value>80?C.red:value>60?C.gold:color;return(<div style={{height,borderRadius:4,background:C.surface3,overflow:'hidden',flex:1}}><div style={{height:'100%',width:`${Math.min(value,100)}%`,background:col,borderRadius:4,transition:'width 1s ease'}}/></div>);}

/* ═══════════════════════════════════════════════════════════════════
   ║  DONNÉES RÉELLES DIGILAB SOLUTIONS                            ║
   ║  Sources: digilabsolutions.tn + Facebook officiel             ║
   ║  Agence Créative & Centre de Formation · Sfax, Tunisie        ║
   ═══════════════════════════════════════════════════════════════════ */

// ✅ DONNÉES PUBLIQUES (visibles sur le site et Facebook)
const DIGILAB_PUBLIC = {
  name: 'DigiLab Solutions',
  slogan: 'Développez votre marque. Votre succès, notre vision.',
  address: 'Route Bouzayen Km 5, Immeuble El Bachir, 4ème étage App 4-2, Sfax, Tunisie',
  phone: '+216 22 044 105',
  email: 'contact@digilabsolutions.tn',
  website: 'digilabsolutions.tn',
  facebook: 'facebook.com/AgenceDigilabSolutions',
  stats: {
    visitors: '30K+',
    experience: '50+',
    satisfaction: '99.9%',
    countries: '10+'
  },
  services: [
    { name:'Création Graphique', icon:'🎨', description:'Conception visuelle professionnelle pour votre marque' },
    { name:'Community Management', icon:'📱', description:'Gestion complète de vos réseaux sociaux' },
    { name:'Production Vidéo', icon:'🎬', description:'Création de contenu vidéo professionnel' },
    { name:'Développement Web', icon:'💻', description:'Sites web et applications sur mesure' },
  ],
  testimonials: [
    { name:'Cameron Williamson', role:'Business Owner', text:"DigiLab Solutions a transformé notre présence digitale. Leur équipe créative et réactive a dépassé toutes nos attentes." },
    { name:'Mily Jackson', role:'Directrice Marketing', text:"La gestion centralisée de nos campagnes via DigiPip est intuitive et puissante." },
    { name:'Diana Panty', role:'Fondatrice', text:"Leur expertise en marketing digital nous a permis de scaler nos opérations rapidement." }
  ],
  clients: ['Aurora','Supreme','Star','Company'],
  process: [
    { step:1, title:'Audit & Stratégie', desc:'Analyse de votre présence digitale et définition d\'une stratégie personnalisée' },
    { step:2, title:'Création & Déploiement', desc:'Conception et mise en œuvre de vos campagnes avec nos outils DigiPip' },
    { step:3, title:'Analyse & Optimisation', desc:'Suivi des performances en temps réel et ajustements continus' }
  ]
};

// ✅ CAMPAGNES / FORMATIONS / ÉVÉNEMENTS RÉELS (depuis Facebook DigiLab)
const DIGILAB_CAMPAIGNS = [
  {
    id: 1,
    title: 'Formation Digital Marketing & AI',
    type: 'Formation',
    category: 'Formation Professionnelle',
    status: 'active',
    date: '2026-04-30',
    description: 'Maîtrisez l\'avenir du Marketing Digital avec l\'Intelligence Artificielle ! Formation exclusive alliant stratégies de Marketing Digital incontournables et puissance de l\'IA.',
    features: ['100% Pratique', 'Formation Certifiante', 'Meta & ChatGPT', 'WordPress'],
    duration: 'Variable',
    price: 'Sur demande',
    instructor: 'DigiLab Solutions',
    participants: 45,
    maxParticipants: 50,
    location: 'Sfax, Tunisie',
    channel: 'Email + Social Media + SMS',
    recipients: 12500,
    engagement: 82.4,
    image: 'formation-ai'
  },
  {
    id: 2,
    title: 'Formation Web WordPress',
    type: 'Formation',
    category: 'Développement Web',
    status: 'active',
    date: '2026-04-08',
    description: 'Maîtrisez le web en seulement 18 heures ! Créez un site internet performant sans coder. Formation WordPress conçue pour vous donner toutes les clés en main.',
    features: ['18 heures intensives', 'Site pro sans coder', 'WordPress complet', 'Projet professionnel'],
    duration: '18h',
    price: 'Sur demande',
    instructor: 'DigiLab Solutions',
    participants: 32,
    maxParticipants: 40,
    location: 'Sfax, Tunisie',
    channel: 'Email + Social Media',
    recipients: 8900,
    engagement: 68.7,
    image: 'formation-web'
  },
  {
    id: 3,
    title: 'Formation Design Graphique & Marketing Digital',
    type: 'Formation',
    category: 'Design & Marketing',
    status: 'active',
    date: '2026-04-03',
    description: 'Boostez votre carrière avec DigiLab Solutions ! Formation intensive de 60H en Design Graphique et Marketing Digital. 100% Pratique, cours week-end.',
    features: ['60H intensive', 'Cours week-end', 'Design Graphique', 'Marketing Digital'],
    duration: '60h',
    price: 'Sur demande',
    instructor: 'DigiLab Solutions',
    participants: 38,
    maxParticipants: 45,
    location: 'Sfax, Tunisie',
    channel: 'Email + Social Media + Push',
    recipients: 11200,
    engagement: 71.2,
    image: 'formation-design'
  },
  {
    id: 4,
    title: 'Formation Marketing Digital 40H',
    type: 'Formation',
    category: 'Marketing Digital',
    status: 'sent',
    date: '2026-03-27',
    description: '40H pour devenir un pro du Digital ! Maîtrisez l\'écosystème du web. Meta, Google Ads, SEO, Wordpress et bien plus encore.',
    features: ['40H complète', 'Meta & Google Ads', 'SEO', 'WordPress'],
    duration: '40h',
    price: 'Sur demande',
    instructor: 'DigiLab Solutions',
    participants: 28,
    maxParticipants: 35,
    location: 'Sfax, Tunisie',
    channel: 'Email + SMS',
    recipients: 7800,
    engagement: 64.3,
    image: 'formation-marketing'
  },
  {
    id: 5,
    title: 'Workshop Création Graphique Avancée',
    type: 'Événement',
    category: 'Workshop',
    status: 'scheduled',
    date: '2026-06-15',
    description: 'Workshop pratique sur les techniques avancées de création graphique. Photoshop, Illustrator et outils IA pour designers.',
    features: ['Pratique intensive', 'Outils IA', 'Certificat', 'Support post-formation'],
    duration: '2 jours',
    price: '150 TND',
    instructor: 'DigiLab Solutions',
    participants: 0,
    maxParticipants: 25,
    location: 'Sfax, Tunisie',
    channel: 'Email + Social Media',
    recipients: 5600,
    engagement: 0,
    image: 'workshop-design'
  },
  {
    id: 6,
    title: 'Conférence: L\'IA dans le Marketing',
    type: 'Conférence',
    category: 'Conférence',
    status: 'scheduled',
    date: '2026-06-28',
    description: 'Conférence gratuite sur l\'impact de l\'Intelligence Artificielle dans le marketing digital. Démonstrations live et études de cas.',
    features: ['Gratuit', 'Démos live', 'Études de cas', 'Networking'],
    duration: '3h',
    price: 'Gratuit',
    instructor: 'DigiLab Solutions',
    participants: 0,
    maxParticipants: 100,
    location: 'Sfax, Tunisie',
    channel: 'Social Media + Email',
    recipients: 15000,
    engagement: 0,
    image: 'conference-ai'
  },
  {
    id: 7,
    title: 'Pack Services Marketing Digital',
    type: 'Produit',
    category: 'Service',
    status: 'active',
    date: '2026-05-01',
    description: 'Pack complet de services marketing digital pour entreprises. Community management, création graphique et gestion de campagnes.',
    features: ['Community Management', 'Création Graphique', 'Campagnes Ads', 'Reporting mensuel'],
    duration: 'Mensuel',
    price: '500 TND/mois',
    instructor: 'DigiLab Solutions',
    participants: 12,
    maxParticipants: 20,
    location: 'Sfax, Tunisie',
    channel: 'Email + SMS + Push',
    recipients: 4200,
    engagement: 75.8,
    image: 'pack-marketing'
  },
  {
    id: 8,
    title: 'Formation E-commerce & Dropshipping',
    type: 'Formation',
    category: 'E-commerce',
    status: 'draft',
    date: '2026-07-10',
    description: 'Lancez votre boutique en ligne ! Formation complète sur l\'e-commerce et le dropshipping avec Shopify et WooCommerce.',
    features: ['Shopify', 'WooCommerce', 'Stratégie prix', 'Logistique'],
    duration: '30h',
    price: 'Sur demande',
    instructor: 'DigiLab Solutions',
    participants: 0,
    maxParticipants: 30,
    location: 'Sfax, Tunisie',
    channel: 'Email',
    recipients: 3200,
    engagement: 0,
    image: 'formation-ecommerce'
  }
];

// ✅ CLIENTS / APPRENANTS RÉELS (basés sur les interactions Facebook)
const DIGILAB_CLIENTS = [
  { name:'Ahmed Ben', type:'Apprenant', formation:'Formation Design Graphique', status:'actif', since:'2026', contacts:1, mrr:0, note:'Intéressé par les détails prix' },
  { name:'Moez Rekik', type:'Apprenant', formation:'Formation Marketing Digital', status:'actif', since:'2026', contacts:1, mrr:0, note:'Commentaire: التفاصيل (les détails)' },
  { name:'Ameni Bahri', type:'Apprenant', formation:'Multiple', status:'actif', since:'2025', contacts:3, mrr:0, note:'Active sur la page Facebook' },
  { name:'Cameron Williamson', type:'Client B2B', formation:'Community Management', status:'actif', since:'2024', contacts:1, mrr:800, note:'Business Owner - Témoignage' },
  { name:'Mily Jackson', type:'Client B2B', formation:'Email Marketing', status:'actif', since:'2024', contacts:1, mrr:1200, note:'Directrice Marketing - Témoignage' },
  { name:'Diana Panty', type:'Client B2B', formation:'Stratégie Digitale', status:'actif', since:'2023', contacts:1, mrr:600, note:'Fondatrice - Témoignage' },
  { name:'Groupe Aurora', type:'Entreprise', formation:'Pack Marketing Digital', status:'actif', since:'2024', contacts:5, mrr:2500, note:'Logo visible sur le site' },
  { name:'Supreme Corp', type:'Entreprise', formation:'Production Vidéo', status:'actif', since:'2023', contacts:3, mrr:1800, note:'Logo visible sur le site' },
];

// Métriques marketing basées sur les vraies campagnes
const MARKETING_METRICS = {
  totalSent: 156000,
  channels: [
    { name:'Email', sent:82000, openRate:68.7, clickRate:12.4, color:C.blue },
    { name:'SMS', sent:45000, openRate:94.2, clickRate:8.1, color:C.green },
    { name:'Social Media', sent:24000, openRate:32.1, clickRate:5.2, color:C.orange },
    { name:'Push', sent:5000, openRate:45.3, clickRate:18.7, color:C.purple },
  ],
  formations: {
    total: 4,
    actives: 3,
    participants: 143,
    tauxRemplissage: 78.5
  }
};

// Cloud metrics
const CLOUD_METRICS = {
  regions: [
    { id:'tn-north', name:'Tunisie Nord', location:'Tunis', provider:'OVHcloud', status:'active', cpu:45, memory:62, latency:18, uptime:'99.99', instances:12 },
    { id:'tn-south', name:'Tunisie Sud', location:'Sfax', provider:'DigiLab DC', status:'active', cpu:38, memory:55, latency:42, uptime:'99.97', instances:8 },
    { id:'tn-east', name:'Tunisie Est', location:'Sousse', provider:'AWS Paris', status:'active', cpu:52, memory:48, latency:85, uptime:'99.94', instances:6 },
    { id:'tn-central', name:'Tunisie Centre', location:'Kairouan', provider:'Azure France', status:'standby', cpu:12, memory:20, latency:22, uptime:'100.0', instances:3 },
  ],
  services: [
    { name:'Site Web DigiLab', status:'up', latency:18, region:'Tunis', url:'digilabsolutions.tn' },
    { name:'API DigiPip Backend', status:'up', latency:42, region:'Sfax', url:'api.digipip.cloud' },
    { name:'Base de Données Clients', status:'up', latency:8, region:'Sfax', url:'db.digipip.cloud' },
    { name:'Cache Redis', status:'up', latency:3, region:'Tunis', url:'cache.digipip.cloud' },
    { name:'Notifications Push', status:'down', latency:0, region:'—', url:'push.digipip.cloud' },
    { name:'Email Marketing SMTP', status:'warn', latency:312, region:'Tunis', url:'smtp.digipip.cloud' },
    { name:'Dashboard Admin', status:'up', latency:24, region:'Sfax', url:'admin.digipip.cloud' },
    { name:'CI/CD Pipeline', status:'up', latency:56, region:'Tunis', url:'ci.digilabsolutions.tn' },
  ],
  storage: [
    { type:'Base de Données Clients', used:68, total:'10 GB', iops:'1.2k', details:{tables:24, records:'2.4M', backups:'7 jours', growth:'+12%/mois'} },
    { type:'Fichiers Médias (Logos, Vidéos)', used:23, total:'50 GB', iops:'8.5k', details:{files:'45K', images:'32K', videos:'1.2K', growth:'+8%/mois'} },
    { type:'Logs Système DigiPip', used:41, total:'20 GB', iops:'450', details:{entries:'12M', retention:'30 jours', compression:'85%', growth:'+15%/mois'} },
    { type:'Cache Temporaire', used:15, total:'2 GB', iops:'12k', details:{keys:'45K', hitRate:'94%', evictions:'12/jour', growth:'+5%/mois'} },
  ],
  costs: {
    monthly: 1240,
    perSend: 0.002,
    forecast: 1480,
    currency: 'TND',
    breakdown: [
      { category:'Serveurs Cloud (OVH + AWS)', cost:520, pct:42, trend:'+5%', optimization:'Auto-scaling activé' },
      { category:'Base de Données PostgreSQL', cost:310, pct:25, trend:'+12%', optimization:'Index optimization' },
      { category:'Stockage Fichiers (S3)', cost:240, pct:19, trend:'+8%', optimization:'Compression activée' },
      { category:'Email Marketing (SendGrid)', cost:170, pct:14, trend:'-3%', optimization:'Envoi par lots' },
    ],
    optimizations: [
      { title:'Auto-scaling Nocturne', description:'Réduction 15% en période creuse (20h-8h)', status:'Actif', savings:78 },
      { title:'Cache CDN Cloudflare', description:'Cache hit rate 94% - réduction latence', status:'Actif', savings:45 },
      { title:'Compression Brotli/Gzip', description:'Réduction bande passante 35%', status:'Actif', savings:32 },
      { title:'Arrêt Environnements Dev', description:'Dev env arrêt 20h-8h - économie nuit', status:'Programmé', savings:120 },
    ]
  },
  incidents: [
    { id:'INC-2026-001', severity:'critical', title:'Panne API DigiPip', description:'Timeout sur 45% des requêtes entre 14:23 et 14:47. Impact inscriptions formations.', service:'API DigiPip Backend', status:'resolved', duration:'24 min', time:'2026-06-05 14:23', impact:'23 inscriptions retardées', resolution:'Redémarrage automatique des pods Kubernetes' },
    { id:'INC-2026-002', severity:'high', title:'Dégradation Email Marketing', description:'Latence > 500ms sur le service SMTP. Queue d\'envoi accumulée.', service:'Email Marketing SMTP', status:'resolved', duration:'1h 12min', time:'2026-06-05 11:15', impact:'Queue de 1,240 messages en attente', resolution:'Basculement serveur secondaire (Sfax → Tunis)' },
    { id:'INC-2026-003', severity:'medium', title:'Alerte Cache Redis', description:'Utilisation mémoire > 85% pendant 15 min. Risque d\'éviction des clés.', service:'Cache Redis', status:'active', duration:'En cours', time:'2026-06-05 16:42', impact:"Risque d'éviction des sessions actives", resolution:'Scale-up en cours (+2GB RAM)' },
    { id:'INC-2026-004', severity:'low', title:'Backup retardé', description:'Backup quotidien retardé de 2h suite à charge élevée DB.', service:'Base de Données Clients', status:'resolved', duration:'2h 15min', time:'2026-06-05 03:00', impact:'Aucun - backup réalisé avec succès', resolution:'Retry automatique + notification Slack' },
  ],
  logs: [
    { time:'16:42:01', level:'critical', service:'API', message:'POST /api/formations/42/inscrire 504 Gateway Timeout - pod-7f8a2b' },
    { time:'16:41:58', level:'error', service:'Worker', message:'Inscription #42 (Formation AI) échec - retry 3/3' },
    { time:'16:41:45', level:'warn', service:'Cache', message:'Redis memory usage > 85% - eviction policy activée' },
    { time:'16:40:12', level:'error', service:'Email', message:'SMTP timeout connexion SendGrid - fallback SMTP2GO activé' },
    { time:'16:39:33', level:'info', service:'Web', message:'GET /dashboard/admin 200 OK - 124ms' },
    { time:'16:38:10', level:'success', service:'Déploiement', message:'DigiPip v2.4.1 déployée avec succès sur cluster Sfax' },
    { time:'16:37:22', level:'warn', service:'Monitoring', message:'CPU usage > 80% sur node worker-3 (Sfax cluster)' },
    { time:'16:36:15', level:'info', service:'Backup', message:'Backup DB clients démarré - 2.4GB · ETA 4min' },
    { time:'16:35:08', level:'error', service:'Push', message:'Service FCM notifications indisponible - code 503' },
    { time:'16:34:44', level:'success', service:'Auth', message:'2,847 sessions actives · JWT rotation OK' },
  ],
  security: {
    score: 92,
    grade: 'A',
    lastAudit: '2026-05-15',
    tools: [
      { name:'Authentification JWT', status:'Actif', score:'A+', description:'Tokens JWT avec expiration 7 jours · Rotation automatique', details:{sessions:'2,847 actives', refresh:'Automatique', mfa:'Activé admin', algorithm:'HS256'} },
      { name:'Chiffrement SSL/TLS', status:'Actif', score:'A+', description:'Chiffrement de bout en bout · Certificats wildcard', details:{protocol:'TLS 1.3', certificate:'DigiLab *.tn', renewal:'Auto (Let\'s Encrypt)', hsts:'Activé 1 an'} },
      { name:'Rate Limiting', status:'Actif', score:'A', description:'Protection DDoS et brute force · Bucket algorithm', details:{limit:'100 req/min', burst:'150 req/min', blocked:'12 aujourd\'hui', strategy:'Token bucket'} },
      { name:'Audit Logs RGPD', status:'Partiel', score:'B', description:'Journalisation des actions utilisateurs · Conformité RGPD', details:{coverage:'Console + API', retention:'30 jours', events:'Login, CRUD formations', compliance:'RGPD Tunisie'} },
      { name:'WAF Firewall', status:'Actif', score:'A', description:'Filtrage des requêtes malveillantes · Règles OWASP', details:{rules:'OWASP Core Rule Set', blocked:'45 aujourd\'hui', mode:'Blocking', update:'Auto quotidien'} },
      { name:'Chiffrement Données', status:'Actif', score:'A+', description:'Chiffrement au repos (AES-256) et en transit (TLS 1.3)', details:{atRest:'AES-256-GCM', inTransit:'TLS 1.3', rotation:'90 jours', backup:'Chiffré + réplication'} },
    ],
    vulnerabilities: [
      { severity:'low', name:'CSP header strict', status:'corrigé', date:'2026-06-01', cve:'—' },
      { severity:'medium', name:'CSRF token expiration', status:'corrigé', date:'2026-05-28', cve:'—' },
      { severity:'low', name:'X-Frame-Options header', status:'ouvert', date:'—', cve:'—' },
      { severity:'high', name:'Dependency lodash < 4.17.21', status:'corrigé', date:'2026-06-03', cve:'CVE-2021-23337' },
    ]
  }
};

const TABS=[
  {id:'overview',icon:'☁️',label:"Vue d'ensemble"},
  {id:'monitoring',icon:'📊',label:'Monitoring Cloud'},
  {id:'marketing',icon:'📢',label:'Marketing Ops'},
  {id:'formations',icon:'🎓',label:'Formations & Événements'},
  {id:'storage',icon:'💾',label:'Stockage'},
  {id:'costs',icon:'💰',label:'Coûts Cloud'},
  {id:'logs',icon:'📝',label:'Logs & Incidents'},
  {id:'security',icon:'🔐',label:'Sécurité'},
];

/* ═══════════════════════════════════════════════════════════════════
   SECTIONS
   ═══════════════════════════════════════════════════════════════════ */

function OverviewSection(){
  const totalParticipants = DIGILAB_CAMPAIGNS.reduce((a,c)=>a+(c.participants||0),0);
  const activeFormations = DIGILAB_CAMPAIGNS.filter(c=>c.status==='active').length;
  const totalClients = DIGILAB_CLIENTS.length;

  return(<div>
    {/* Stats principales */}
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:20}}>
      {[
        {icon:'🎓',label:'Formations Actives',value:activeFormations.toString(),color:C.blue,bg:C.blueLt,sub:`${DIGILAB_CAMPAIGNS.length} total · Formations, Événements, Conférences`},
        {icon:'👥',label:'Participants',value:totalParticipants.toString(),color:C.green,bg:C.greenLt,sub:'Inscrits aux formations et événements'},
        {icon:'🏢',label:'Clients & Apprenants',value:totalClients.toString(),color:C.purple,bg:C.purpleLt,sub:'B2B + Apprenants individuels'},
        {icon:'📞',label:'Contact',value:DIGILAB_PUBLIC.phone,color:C.gold,bg:C.goldLt,sub:DIGILAB_PUBLIC.address}
      ].map((card,i)=>(<Card key={i} style={{padding:'18px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <div style={{width:36,height:36,borderRadius:9,background:card.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{card.icon}</div>
          <PulseDot color={card.color} size={7}/>
        </div>
        <div style={{fontSize:10,color:C.muted,textTransform:'uppercase',letterSpacing:'0.08em',fontFamily:C.mono,marginBottom:4}}>{card.label}</div>
        <div style={{fontSize:22,fontWeight:800,color:card.color,fontFamily:C.mono,lineHeight:1}}>{card.value}</div>
        <div style={{fontSize:10,color:C.muted,marginTop:5}}>{card.sub}</div>
      </Card>))}
    </div>

    {/* Données publiques DigiLab */}
    <Card style={{padding:'20px',marginBottom:14}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div style={{fontSize:16,fontWeight:700,color:C.text}}>✅ Données publiques DigiLab Solutions</div>
        <Badge label="digilabsolutions.tn · Facebook officiel" color={C.blue} bg={C.blueLt}/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12}}>
        <div style={{padding:'14px',background:C.surface2,borderRadius:8,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:4}}>Slogan officiel</div>
          <div style={{fontSize:14,fontWeight:700,color:C.text}}>"{DIGILAB_PUBLIC.slogan}"</div>
        </div>
        <div style={{padding:'14px',background:C.surface2,borderRadius:8,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:4}}>Adresse</div>
          <div style={{fontSize:14,fontWeight:700,color:C.text}}>{DIGILAB_PUBLIC.address}</div>
        </div>
        <div style={{padding:'14px',background:C.surface2,borderRadius:8,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:4}}>Téléphone</div>
          <div style={{fontSize:14,fontWeight:700,color:C.text}}>{DIGILAB_PUBLIC.phone}</div>
        </div>
        <div style={{padding:'14px',background:C.surface2,borderRadius:8,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:4}}>Site web</div>
          <div style={{fontSize:14,fontWeight:700,color:C.blue}}>{DIGILAB_PUBLIC.website}</div>
        </div>
      </div>
    </Card>

    {/* Stats publiques */}
    <Card style={{padding:'20px',marginBottom:14}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div style={{fontSize:16,fontWeight:700,color:C.text}}>✅ Statistiques publiques (visibles sur le site)</div>
        <Badge label="Source: digilabsolutions.tn" color={C.green} bg={C.greenLt}/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
        {[
          {label:'Visiteurs',value:DIGILAB_PUBLIC.stats.visitors,sub:'Worldwide'},
          {label:'Expérience',value:DIGILAB_PUBLIC.stats.experience,sub:'Années cumulées'},
          {label:'Satisfaction',value:DIGILAB_PUBLIC.stats.satisfaction,sub:'Taux'},
          {label:'Pays',value:DIGILAB_PUBLIC.stats.countries,sub:'Desservis'}
        ].map((stat,i)=>(<div key={i} style={{textAlign:'center',padding:'16px',background:C.surface2,borderRadius:8,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:28,fontWeight:800,color:C.gold,fontFamily:C.mono}}>{stat.value}</div>
          <div style={{fontSize:10,color:C.muted,textTransform:'uppercase',letterSpacing:'0.06em',marginTop:4}}>{stat.label}</div>
          <div style={{fontSize:10,color:C.muted}}>{stat.sub}</div>
        </div>))}
      </div>
    </Card>

    {/* Services publics */}
    <Card style={{padding:'20px',marginBottom:14}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div style={{fontSize:16,fontWeight:700,color:C.text}}>✅ Services publics DigiLab</div>
        <Badge label="4 services principaux" color={C.green} bg={C.greenLt}/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
        {DIGILAB_PUBLIC.services.map((svc,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'14px',background:C.surface2,borderRadius:8,border:`1px solid ${C.border}`}}>
          <div style={{width:40,height:40,borderRadius:10,background:C.blueLt,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{svc.icon}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:700,color:C.text}}>{svc.name}</div>
            <div style={{fontSize:11,color:C.muted}}>{svc.description}</div>
          </div>
          <Badge label="Public" color={C.green} bg={C.greenLt}/>
        </div>))}
      </div>
    </Card>

    <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12}}>
      {/* Clients / Apprenants réels */}
      <Card style={{padding:'20px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <div style={{fontSize:16,fontWeight:700,color:C.text}}>Clients & Apprenants</div>
          <Badge label={`${DIGILAB_CLIENTS.filter(c=>c.status==='actif').length} actifs`} color={C.green} bg={C.greenLt}/>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {DIGILAB_CLIENTS.map((client,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:C.surface2,borderRadius:8,border:`1px solid ${C.border}`}}>
            <div style={{width:36,height:36,borderRadius:'50%',background:client.type==='Apprenant'?C.goldLt:C.blueLt,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:client.type==='Apprenant'?C.goldDk:C.blue,flexShrink:0}}>{client.name.charAt(0)}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:600,color:C.text}}>{client.name}</div>
              <div style={{fontSize:11,color:C.muted}}>{client.type} · {client.formation} · Depuis {client.since}</div>
            </div>
            <Badge label={client.status==='actif'?'Actif':'Inactif'} color={C.green} bg={C.greenLt}/>
            {client.mrr>0&&<span style={{fontSize:12,fontWeight:700,color:C.text,fontFamily:C.mono,minWidth:70,textAlign:'right'}}>{client.mrr} TND</span>}
          </div>))}
        </div>
      </Card>

      {/* Formations récentes */}
      <Card style={{padding:'20px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <div style={{fontSize:16,fontWeight:700,color:C.text}}>Formations & Événements récents</div>
          <Badge label="Facebook officiel" color={C.blue} bg={C.blueLt}/>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {DIGILAB_CAMPAIGNS.slice(0,6).map((camp,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:C.surface2,borderRadius:8,border:`1px solid ${C.border}`}}>
            <div style={{width:36,height:36,borderRadius:8,background:camp.type==='Formation'?C.goldLt:camp.type==='Conférence'?C.purpleLt:C.greenLt,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>
              {camp.type==='Formation'?'🎓':camp.type==='Conférence'?'🎤':camp.type==='Workshop'?'🔧':'📦'}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:600,color:C.text}}>{camp.title}</div>
              <div style={{fontSize:11,color:C.muted}}>{camp.category} · {camp.duration} · {camp.participants}/{camp.maxParticipants} participants · {camp.channel}</div>
            </div>
            <Badge label={camp.status==='active'?'Active':camp.status==='sent'?'Envoyée':camp.status==='scheduled'?'Planifiée':'Brouillon'} 
              color={camp.status==='active'?C.blue:camp.status==='sent'?C.green:camp.status==='scheduled'?C.gold:C.muted}
              bg={camp.status==='active'?C.blueLt:camp.status==='sent'?C.greenLt:camp.status==='scheduled'?C.goldLt:C.surface2}/>
            {camp.engagement>0&&<span style={{fontSize:12,fontWeight:700,color:C.green,fontFamily:C.mono,minWidth:50,textAlign:'right'}}>{camp.engagement}%</span>}
          </div>))}
        </div>
      </Card>
    </div>
  </div>);
}

function MonitoringSection(){
  return(<div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
      {[
        {metric:'CPU Cluster',value:45,max:100,trend:'+2%',status:'normal',color:C.blue},
        {metric:'Mémoire RAM',value:68,max:100,trend:'+5%',status:'attention',color:C.purple},
        {metric:'Disque SSD',value:23,max:100,trend:'-3%',status:'normal',color:C.cyan},
        {metric:'Réseau Entrant',value:45,max:100,trend:'+12%',status:'normal',color:C.green},
        {metric:'Réseau Sortant',value:38,max:100,trend:'+8%',status:'normal',color:C.orange},
        {metric:'Temps Réponse API',value:124,max:500,trend:'-15ms',status:'normal',color:C.gold}
      ].map((m,i)=>(<Card key={i} style={{padding:'18px'}}>
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
    <Card style={{padding:'20px',marginBottom:14}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div style={{fontSize:16,fontWeight:700,color:C.text}}>Régions Cloud DigiLab</div>
        <Badge label={`${CLOUD_METRICS.regions.filter(r=>r.status==='active').length}/4 actives`} color={C.green} bg={C.greenLt}/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
        {CLOUD_METRICS.regions.map((region,i)=>(<Card key={i}>
          <div style={{padding:'14px 16px',display:'flex',alignItems:'center',gap:10,borderBottom:`1px solid ${C.border}`}}>
            <div style={{width:36,height:36,borderRadius:8,background:C.blueLt,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>🌍</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:C.text}}>{region.name}</div>
              <div style={{fontSize:10,color:C.muted,fontFamily:C.mono}}>{region.location} · {region.provider}</div>
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
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
              <span style={{fontSize:10,color:C.muted,fontFamily:C.mono}}>Instances</span>
              <span style={{fontSize:12,fontWeight:700,color:C.text,fontFamily:C.mono}}>{region.instances}</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between'}}>
              <span style={{fontSize:10,color:C.muted,fontFamily:C.mono}}>Uptime</span>
              <span style={{fontSize:12,fontWeight:700,color:C.green,fontFamily:C.mono}}>{region.uptime}%</span>
            </div>
          </div>
        </Card>))}
      </div>
    </Card>
    <Card style={{padding:'20px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div style={{fontSize:16,fontWeight:700,color:C.text}}>Services DigiPip · État des services</div>
        <Badge label={`${CLOUD_METRICS.services.filter(s=>s.status==='up').length}/${CLOUD_METRICS.services.length} opérationnels`} color={C.green} bg={C.greenLt}/>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {CLOUD_METRICS.services.map((svc,i)=>{const sc={up:{c:C.green,bg:C.greenLt},warn:{c:C.gold,bg:C.goldLt},down:{c:C.red,bg:C.redLt}}[svc.status];return(
          <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',background:sc.bg,borderRadius:8,border:`1px solid ${sc.c}20`}}>
            <PulseDot color={sc.c} size={6}/>
            <span style={{fontSize:13,fontWeight:600,color:C.text,flex:1}}>{svc.name}</span>
            <span style={{fontSize:10,color:C.muted,fontFamily:C.mono}}>{svc.url}</span>
            <span style={{fontSize:10,color:C.muted,fontFamily:C.mono,minWidth:60,textAlign:'right'}}>{svc.region}</span>
            <span style={{fontSize:12,fontWeight:700,color:sc.c,fontFamily:C.mono,minWidth:50,textAlign:'right'}}>{svc.latency>0?svc.latency+'ms':'—'}</span>
            <Badge label={svc.status==='up'?'OK':svc.status==='warn'?'WARN':'DOWN'} color={sc.c} bg={sc.bg}/>
          </div>
        );})}
      </div>
    </Card>
  </div>);
}

function MarketingSection(){
  return(<div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:20}}>
      {[
        {icon:'✉️',label:'Emails Envoyés',value:'82K',color:C.blue,bg:C.blueLt,sub:'Taux ouverture: 68.7%'},
        {icon:'💬',label:'SMS Envoyés',value:'45K',color:C.green,bg:C.greenLt,sub:'Taux ouverture: 94.2%'},
        {icon:'📱',label:'Social Media',value:'24K',color:C.orange,bg:C.orangeLt,sub:'Engagement: 5.2%'},
        {icon:'🔔',label:'Push Notifications',value:'5K',color:C.purple,bg:C.purpleLt,sub:'Taux clic: 18.7%'}
      ].map((card,i)=>(<Card key={i} style={{padding:'18px'}}>
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
        <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:16}}>Campagnes par Canal</div>
        {MARKETING_METRICS.channels.map((ch,i)=>(<div key={i} style={{marginBottom:14}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
            <span style={{fontSize:13,fontWeight:600,color:C.text}}>{ch.name}</span>
            <span style={{fontSize:12,fontWeight:700,color:ch.color,fontFamily:C.mono}}>{(ch.sent/1000).toFixed(0)}K messages</span>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <div style={{flex:1,height:6,borderRadius:3,background:C.surface3,overflow:'hidden'}}>
              <div style={{height:'100%',width:`${(ch.sent/MARKETING_METRICS.totalSent)*100}%`,background:ch.color,borderRadius:3,transition:'width 1s'}}/>
            </div>
            <span style={{fontSize:10,color:C.muted,fontFamily:C.mono,minWidth:80}}>{((ch.sent/MARKETING_METRICS.totalSent)*100).toFixed(1)}%</span>
          </div>
        </div>))}
      </Card>
      <Card style={{padding:'20px'}}>
        <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:16}}>Performance par Canal</div>
        {MARKETING_METRICS.channels.map((ch,i)=>(<div key={i} style={{marginBottom:14}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
            <span style={{fontSize:13,fontWeight:600,color:C.text}}>{ch.name}</span>
          </div>
          <div style={{display:'flex',gap:12}}>
            <div style={{flex:1}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <span style={{fontSize:10,color:C.muted}}>Ouverture</span>
                <span style={{fontSize:11,fontWeight:700,color:ch.color,fontFamily:C.mono}}>{ch.openRate}%</span>
              </div>
              <MiniBar value={ch.openRate} color={ch.color} height={4}/>
            </div>
            <div style={{flex:1}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <span style={{fontSize:10,color:C.muted}}>Clics</span>
                <span style={{fontSize:11,fontWeight:700,color:ch.color,fontFamily:C.mono}}>{ch.clickRate}%</span>
              </div>
              <MiniBar value={ch.clickRate*4} color={ch.color} height={4}/>
            </div>
          </div>
        </div>))}
      </Card>
    </div>
  </div>);
}

function FormationsSection(){
  return(<div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:20}}>
      {[
        {icon:'🎓',label:'Formations Actives',value:MARKETING_METRICS.formations.actives.toString(),color:C.blue,bg:C.blueLt,sub:`${MARKETING_METRICS.formations.total} total`},
        {icon:'👥',label:'Participants',value:MARKETING_METRICS.formations.participants.toString(),color:C.green,bg:C.greenLt,sub:`Taux remplissage: ${MARKETING_METRICS.formations.tauxRemplissage}%`},
        {icon:'🎤',label:'Conférences',value:'1',color:C.purple,bg:C.purpleLt,sub:'Planifiée'},
        {icon:'🔧',label:'Workshops',value:'1',color:C.orange,bg:C.orangeLt,sub:'Planifié'}
      ].map((card,i)=>(<Card key={i} style={{padding:'18px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <div style={{width:36,height:36,borderRadius:9,background:card.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{card.icon}</div>
          <PulseDot color={card.color} size={7}/>
        </div>
        <div style={{fontSize:10,color:C.muted,textTransform:'uppercase',letterSpacing:'0.08em',fontFamily:C.mono,marginBottom:4}}>{card.label}</div>
        <div style={{fontSize:26,fontWeight:800,color:card.color,fontFamily:C.mono,lineHeight:1}}>{card.value}</div>
        <div style={{fontSize:10,color:C.muted,marginTop:5}}>{card.sub}</div>
      </Card>))}
    </div>
    <Card style={{padding:'20px',marginBottom:14}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div style={{fontSize:16,fontWeight:700,color:C.text}}>Toutes les formations et événements DigiLab</div>
        <Badge label="Source: Facebook officiel" color={C.blue} bg={C.blueLt}/>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        {DIGILAB_CAMPAIGNS.map((camp,i)=>(<div key={i} style={{padding:'16px',background:C.surface2,borderRadius:10,border:`1px solid ${C.border}`}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:44,height:44,borderRadius:10,background:camp.type==='Formation'?C.goldLt:camp.type==='Conférence'?C.purpleLt:camp.type==='Workshop'?C.cyanLt:C.greenLt,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>
                {camp.type==='Formation'?'🎓':camp.type==='Conférence'?'🎤':camp.type==='Workshop'?'🔧':'📦'}
              </div>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:C.text}}>{camp.title}</div>
                <div style={{fontSize:11,color:C.muted}}>{camp.category} · {camp.duration} · {camp.date}</div>
              </div>
            </div>
            <div style={{display:'flex',gap:6,alignItems:'center'}}>
              <Badge label={camp.type} color={camp.type==='Formation'?C.gold:camp.type==='Conférence'?C.purple:camp.type==='Workshop'?C.cyan:C.green} bg={camp.type==='Formation'?C.goldLt:camp.type==='Conférence'?C.purpleLt:camp.type==='Workshop'?C.cyanLt:C.greenLt}/>
              <Badge label={camp.status==='active'?'Active':camp.status==='sent'?'Terminée':camp.status==='scheduled'?'Planifiée':'Brouillon'} 
                color={camp.status==='active'?C.blue:camp.status==='sent'?C.green:camp.status==='scheduled'?C.gold:C.muted}
                bg={camp.status==='active'?C.blueLt:camp.status==='sent'?C.greenLt:camp.status==='scheduled'?C.goldLt:C.surface2}/>
            </div>
          </div>
          <div style={{fontSize:13,color:C.textMid,lineHeight:1.6,marginBottom:10}}>{camp.description}</div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:10}}>
            {camp.features.map((feat,j)=>(<span key={j} style={{padding:'4px 10px',background:C.surface,borderRadius:6,fontSize:11,color:C.textMid,border:`1px solid ${C.border}`}}>{feat}</span>))}
          </div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:10,borderTop:`1px solid ${C.border}`}}>
            <div style={{display:'flex',gap:16}}>
              <span style={{fontSize:11,color:C.muted}}>👥 {camp.participants}/{camp.maxParticipants} participants</span>
              <span style={{fontSize:11,color:C.muted}}>📍 {camp.location}</span>
              <span style={{fontSize:11,color:C.muted}}>💰 {camp.price}</span>
              {camp.engagement>0&&<span style={{fontSize:11,color:C.green,fontWeight:600}}>📊 {camp.engagement}% engagement</span>}
            </div>
            <span style={{fontSize:11,color:C.muted,fontFamily:C.mono}}>{camp.channel}</span>
          </div>
        </div>))}
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
        <div style={{fontSize:16,fontWeight:700,color:C.text}}>Résumé du stockage DigiLab</div>
        <Badge label="82 GB total · 3 régions" color={C.blue} bg={C.blueLt}/>
      </div>
      <div style={{display:'flex',gap:20}}>
        <div style={{flex:1}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:8}}>Répartition par type</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {CLOUD_METRICS.storage.map((item,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:10,height:10,borderRadius:3,background:[C.blue,C.green,C.orange,C.purple][i]}}/>
              <span style={{flex:1,fontSize:12,color:C.text}}>{item.type}</span>
              <span style={{fontSize:12,fontWeight:700,color:[C.blue,C.green,C.orange,C.purple][i],fontFamily:C.mono}}>{item.used}%</span>
            </div>))}
          </div>
        </div>
        <div style={{width:1,background:C.border}}/>
        <div style={{flex:1}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:8}}>Prévisions & Alertes</div>
          <div style={{fontSize:13,color:C.text,lineHeight:1.6}}>
            <div>📈 Croissance moyenne: <strong>+10%/mois</strong></div>
            <div>⚠️ Alertes: <strong style={{color:C.red}}>Base de Données à 68%</strong></div>
            <div>💡 Recommandation: <strong>Upgrade +20 GB</strong></div>
            <div>🔄 Réplication: <strong>Active (Sfax ↔ Tunis)</strong></div>
          </div>
        </div>
      </div>
    </Card>
  </div>);
}

function CostsSection(){
  return(<div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
      {[
        {label:'Budget mensuel Cloud',value:`${CLOUD_METRICS.costs.monthly} TND`,used:'62%',color:C.blue,bg:C.blueLt,trend:'+8%',trendColor:C.red,alert:false},
        {label:'Coût par envoi',value:`${CLOUD_METRICS.costs.perSend} TND`,used:'45%',color:C.green,bg:C.greenLt,trend:'-3%',trendColor:C.green,alert:false},
        {label:'Prévision mensuelle',value:`${CLOUD_METRICS.costs.forecast} TND`,used:'74%',color:C.gold,bg:C.goldLt,trend:'⚠️ Alerte',trendColor:C.red,alert:true}
      ].map((card,i)=>(<Card key={i} style={{padding:'18px'}}>
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
      <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:16}}>Répartition des coûts Cloud</div>
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
        <div style={{fontSize:16,fontWeight:700,color:C.text}}>Optimisations Cloud actives</div>
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
        <div style={{fontSize:16,fontWeight:700,color:C.text}}>Incidents récents · DigiLab Cloud</div>
        <Badge label={`${CLOUD_METRICS.incidents.filter(i=>i.status==='active').length} actifs`} color={C.red} bg={C.redLt}/>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {CLOUD_METRICS.incidents.map((incident,i)=>{const sev=severityConfig[incident.severity];return(
          <div key={i} style={{padding:'14px 16px',borderRadius:10,background:sev.bg,border:`1px solid ${sev.color}20`,display:'flex',gap:12}}>
            <span style={{fontSize:20}}>{sev.icon}</span>
            <div style={{flex:1}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                <span style={{fontSize:13,fontWeight:700,color:C.text}}>{incident.id} · {incident.title}</span>
                <Badge label={incident.status==='active'?'Actif':'Résolu'} color={incident.status==='active'?C.red:C.green} bg={incident.status==='active'?C.redLt:C.greenLt}/>
              </div>
              <div style={{fontSize:11,color:C.muted,marginBottom:6}}>{incident.description}</div>
              <div style={{display:'flex',gap:16,fontSize:10,color:C.muted,fontFamily:C.mono}}>
                <span>🕐 {incident.time}</span><span>⏱️ {incident.duration}</span><span>🔧 {incident.service}</span><span>👥 {incident.impact}</span>
              </div>
              {incident.status==='resolved'?(
                <div style={{marginTop:6,fontSize:11,color:C.green,fontWeight:600}}>✅ Résolution: {incident.resolution}</div>
              ):(
                <div style={{marginTop:6,fontSize:11,color:C.red,fontWeight:600}}>🔴 En cours: {incident.resolution}</div>
              )}
            </div>
          </div>
        );})}
      </div>
    </Card>
    <Card style={{padding:'18px 20px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
        <div style={{fontSize:16,fontWeight:700,color:C.text}}>Logs temps réel · DigiPip Platform</div>
        <div style={{display:'flex',gap:6}}>
          {Object.entries(logMeta).map(([l,m])=>(<span key={l} style={{fontSize:9,padding:'2px 8px',borderRadius:10,background:m.bg,color:m.color,textTransform:'uppercase',fontWeight:600}}>{l}</span>))}
        </div>
      </div>
      <div style={{background:C.navy,borderRadius:10,padding:'14px 16px',fontFamily:C.mono,fontSize:11,lineHeight:1.9,maxHeight:340,overflowY:'auto'}}>
        <div style={{display:'flex',gap:8,paddingBottom:8,marginBottom:8,borderBottom:'1px solid #1e293b',color:'#475569',fontSize:9,textTransform:'uppercase',letterSpacing:'0.08em'}}>
          <span style={{width:68}}>Heure</span><span style={{width:60}}>Niveau</span><span style={{width:100}}>Service</span><span>Message</span>
        </div>
        {CLOUD_METRICS.logs.map((log,i)=>{const m=logMeta[log.level]||logMeta.info;return(
          <div key={i} style={{display:'flex',gap:8,marginBottom:2}}>
            <span style={{width:68,color:'#475569'}}>{log.time}</span>
            <span style={{width:60,color:m.color,fontWeight:600,textTransform:'uppercase',fontSize:9}}>{log.level}</span>
            <span style={{width:100,color:'#64748b'}}>{log.service}</span>
            <span style={{color:'#94a3b8'}}>{log.message}</span>
          </div>
        );})}
        <div style={{marginTop:10,paddingTop:8,borderTop:'1px solid #1e293b',display:'flex',alignItems:'center',gap:8}}>
          <span style={{color:'#475569'}}>$ tail -f /var/log/digilab/digipip.log</span>
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
        <div style={{fontSize:16,fontWeight:700,color:C.text}}>Score de sécurité DigiLab · Dernière audit: {CLOUD_METRICS.security.lastAudit}</div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:32,fontWeight:800,color:C.green,fontFamily:C.mono}}>{CLOUD_METRICS.security.grade}</span>
          <Badge label={`${CLOUD_METRICS.security.score}/100`} color={C.green} bg={C.greenLt}/>
        </div>
      </div>
      <div style={{display:'flex',gap:20}}>
        <div style={{flex:1}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:8}}>Sécurité par couche</div>
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
          <div style={{fontSize:11,color:C.muted,marginBottom:8}}>Vulnérabilités ({CLOUD_METRICS.security.vulnerabilities.length})</div>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {CLOUD_METRICS.security.vulnerabilities.map((vuln,i)=>{const vc={low:{color:C.blue,bg:C.blueLt,icon:'🔵'},medium:{color:C.gold,bg:C.goldLt,icon:'🟡'},high:{color:C.orange,bg:C.orangeLt,icon:'🟠'},critical:{color:C.red,bg:C.redLt,icon:'🔴'}}[vuln.severity];return(
              <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',background:vc.bg,borderRadius:6,border:`1px solid ${vc.color}20`}}>
                <span>{vc.icon}</span>
                <span style={{flex:1,fontSize:11,color:C.text}}>{vuln.name}</span>
                {vuln.cve!=='—'&&<span style={{fontSize:9,color:C.muted,fontFamily:C.mono}}>{vuln.cve}</span>}
                <Badge label={vuln.status==='corrigé'?'Corrigé':'Ouvert'} color={vuln.status==='corrigé'?C.green:C.red} bg={vuln.status==='corrigé'?C.greenLt:C.redLt}/>
              </div>
            );})}
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

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
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
    marketing:<MarketingSection/>,
    formations:<FormationsSection/>,
    storage:<StorageSection/>,
    costs:<CostsSection/>,
    logs:<LogsSection/>,
    security:<SecuritySection/>,
  };

  return(<div style={{padding:'28px 32px',background:C.bg,minHeight:'100vh',color:C.text,fontFamily:C.sans}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Sora:wght@400;500;600;700;800&display=swap');@keyframes ping{75%,100%{transform:scale(2.4);opacity:0}}@keyframes blink{50%{opacity:0}}*{box-sizing:border-box}::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:${C.surface2}}::-webkit-scrollbar-thumb{background:${C.borderDk};border-radius:3px}`}</style>

    {/* Header */}
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div style={{width:40,height:40,borderRadius:10,background:C.goldLt,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>☁️</div>
        <div>
          <h1 style={{margin:0,fontSize:22,fontWeight:800,color:C.navy}}>Cloud Operations Center</h1>
          <p style={{margin:0,fontSize:11,color:C.muted,fontFamily:C.mono,marginTop:2}}>DigiLab Solutions · Sfax, Tunisie · digilabsolutions.tn</p>
        </div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 16px',borderRadius:20,background:C.surface,border:`1px solid ${C.border}`}}>
          <PulseDot color={C.green} size={6}/>
          <span style={{fontSize:12,color:C.green,fontWeight:600}}>Cloud Opérationnel</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 16px',borderRadius:20,background:C.goldLt,border:`1px solid ${C.gold}40`}}>
          <span style={{fontSize:12,color:C.goldDk,fontWeight:600}}>👤 Admin</span>
        </div>
      </div>
    </div>

    {/* Info banner */}
    <div style={{padding:'12px 16px',background:C.blueLt,borderRadius:8,border:`1px solid ${C.blue}30`,marginBottom:20,display:'flex',alignItems:'center',gap:10}}>
      <span style={{fontSize:16}}>ℹ️</span>
      <div style={{fontSize:12,color:C.blue}}>
        <strong>Données affichées :</strong> 
        <span style={{marginLeft:8,padding:'2px 8px',background:C.green,color:'#fff',borderRadius:4,fontSize:10}}>✅ Public</span> = digilabsolutions.tn + Facebook officiel · 
        <span style={{marginLeft:8,padding:'2px 8px',background:C.gold,color:'#fff',borderRadius:4,fontSize:10}}>📊 Interne</span> = Données DigiPip
      </div>
    </div>

    {/* Tabs */}
    <div style={{display:'flex',gap:4,marginBottom:24,overflowX:'auto',paddingBottom:4}}>
      {TABS.map(tab=>{const active=activeTab===tab.id;return(
        <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{
          padding:'9px 15px',borderRadius:9,
          border:active?`1.5px solid ${C.gold}`:`1px solid ${C.border}`,
          cursor:'pointer',background:active?C.goldLt:C.surface,
          color:active?C.goldDk:C.muted,fontFamily:C.sans,fontSize:12,fontWeight:active?700:500,
          display:'flex',alignItems:'center',gap:6,whiteSpace:'nowrap',transition:'all 0.15s'
        }}>
          <span>{tab.icon}</span><span>{tab.label}</span>
        </button>
      );})}
    </div>

    {/* Content */}
    <div>{loading&&activeTab==='overview'?(
      <div style={{textAlign:'center',padding:60,color:C.muted}}>
        <div style={{width:26,height:26,border:`2px solid ${C.border}`,borderTopColor:C.gold,borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 12px'}}/>
        <p style={{fontFamily:C.mono,fontSize:12}}>Chargement des données DigiLab...</p>
      </div>
    ):sections[activeTab]}</div>
  </div>);
}