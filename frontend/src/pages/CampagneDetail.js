import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import api from '../api';

const T = {
  gold:'#f5a623', goldDk:'#d4881a', bg:'#080c14',
  card:'#141c2e', border:'rgba(255,255,255,0.07)', blue:'#4f8ef7',
  purple:'#7c3aed', green:'#10b981', red:'#ef4444',
  white:'#ffffff', gray:'rgba(255,255,255,0.45)',
  font:"'Inter','DM Sans',sans-serif",
};

const TYPE_CFG = {
  email:{ label:'Email',   icon:'✉',  color:T.blue,   desc:'Recevez nos communications par email'   },
  sms:  { label:'SMS',     icon:'💬', color:T.green,  desc:'Recevez nos messages sur votre mobile'  },
  push: { label:'Push',    icon:'🔔', color:T.gold,   desc:'Notifications instantanées sur votre appareil' },
};

const CAMP_IMGS = {
  email:'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&q=80',
  sms:  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&q=80',
  push: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=900&q=80',
};

/* Mini aurora */
function AuroraBg() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if(!canvas) return;
    const ctx = canvas.getContext('2d'); let t=0, raf;
    const orbs=[
      {bx:0.1,by:0.2,rx:0.2,ry:0.15,freq:0.22,ph:0,r:600,col:[79,142,247],a:0.28},
      {bx:0.9,by:0.1,rx:0.16,ry:0.12,freq:0.17,ph:1.1,r:550,col:[124,58,237],a:0.26},
      {bx:0.5,by:0.7,rx:0.22,ry:0.18,freq:0.13,ph:2.2,r:700,col:[245,166,35],a:0.15},
      {bx:0.3,by:0.5,rx:0.18,ry:0.14,freq:0.25,ph:4.8,r:580,col:[160,60,255],a:0.20},
    ];
    const resize=()=>{canvas.width=window.innerWidth;canvas.height=window.innerHeight;};
    resize(); window.addEventListener('resize',resize);
    const draw=()=>{
      const{width:W,height:H}=canvas;
      ctx.fillStyle='#080c14'; ctx.fillRect(0,0,W,H);
      ctx.strokeStyle='rgba(255,255,255,0.02)'; ctx.lineWidth=0.5;
      for(let x=0;x<W;x+=50){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
      for(let y=0;y<H;y+=50){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
      orbs.forEach(o=>{
        const cx=(o.bx+Math.sin(t*o.freq+o.ph)*o.rx)*W;
        const cy=(o.by+Math.cos(t*o.freq*0.7+o.ph+1)*o.ry)*H;
        const r=o.r*(1+Math.sin(t*o.freq*1.3+o.ph)*0.1);
        const g=ctx.createRadialGradient(cx,cy,0,cx,cy,r);
        g.addColorStop(0,`rgba(${o.col},${o.a})`);
        g.addColorStop(0.3,`rgba(${o.col},${(o.a*0.4).toFixed(2)})`);
        g.addColorStop(1,`rgba(${o.col},0)`);
        ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
      });
      t+=0.008; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);};
  },[]);
  return <canvas ref={ref} style={{position:'fixed',inset:0,width:'100%',height:'100%',zIndex:0,pointerEvents:'none'}}/>;
}

/* Champ de formulaire stylé */
function Field({ label, name, type='text', value, onChange, placeholder, error, icon, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom:20 }}>
      <label style={{ display:'block', fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.5)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>
        {label} {required && <span style={{color:T.gold}}>*</span>}
      </label>
      <div style={{ position:'relative' }}>
        {icon && <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:16, opacity:0.5 }}>{icon}</span>}
        <input
          type={type} name={name} value={value}
          onChange={onChange}
          onFocus={()=>setFocused(true)}
          onBlur={()=>setFocused(false)}
          placeholder={placeholder}
          style={{
            width:'100%', padding: icon ? '12px 14px 12px 42px' : '12px 14px',
            background:'rgba(255,255,255,0.05)',
            border:`1px solid ${error ? T.red : focused ? T.gold+'80' : T.border}`,
            borderRadius:10, fontSize:14, color:T.white,
            fontFamily:T.font, transition:'border .2s, box-shadow .2s',
            boxShadow: focused ? `0 0 0 3px ${error ? T.red+'20' : T.gold+'15'}` : 'none',
            outline:'none',
          }}
        />
      </div>
      {error && <p style={{ fontSize:12, color:T.red, marginTop:5 }}>⚠ {error}</p>}
    </div>
  );
}

export default function CampagneDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campagne, setCampagne] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [isInscrit, setIsInscrit] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    nom:       localStorage.getItem('userName')  || '',
    email:     localStorage.getItem('userEmail') || '',
    telephone: '',
  });

  // ── Vérification auth IMMÉDIATE ──
  const token = localStorage.getItem('token');
if (!token) {
  sessionStorage.setItem('redirect_after_login', `/campagnes/${id}`);
  return <Navigate to="/login" replace />;
}

  useEffect(() => {
    Promise.all([
      api.get(`/api/campagnes/${id}`),
      api.get('/api/campagnes/mes-inscriptions').catch(()=>({data:[]})),
    ])
      .then(([c, i]) => {
        setCampagne(c.data);
        const ids = Array.isArray(i.data) ? i.data.map(x=>x.campagneId||x.id) : [];
        setIsInscrit(ids.includes(Number(id)));
      })
      .catch(() => navigate('/campagnes'))
      .finally(() => setLoading(false));
  }, [id]);

  const validate = () => {
    const e = {};
    if (!form.nom.trim()) e.nom = 'Le nom est requis';
    if (!form.email.trim()) e.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email invalide';
    if (!form.telephone.trim()) e.telephone = 'Le téléphone est requis';
    else if (!/^[+\d\s\-()]{7,15}$/.test(form.telephone)) e.telephone = 'Numéro invalide';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setSubmitting(true);
    try {
await api.post(`/api/campagnes/${id}/inscrire`, {
  name: form.nom,
  email: form.email,
  telephone: form.telephone,
});      setDone(true);
      setIsInscrit(true);
    } catch (err) {
      setErrors({ global: err.response?.data?.message || 'Erreur lors de l\'inscription. Réessayez.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight:'100vh', background:T.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:T.font }}>
      <AuroraBg />
      <div style={{ position:'relative', zIndex:1, textAlign:'center' }}>
        <div style={{ width:40,height:40,border:`3px solid rgba(245,166,35,0.15)`,borderTop:`3px solid ${T.gold}`,borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto 16px' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ color:T.gray }}>Chargement de la campagne...</p>
      </div>
    </div>
  );

  if (!campagne) return null;

  const tc = TYPE_CFG[campagne.type?.toLowerCase()] || TYPE_CFG.email;

  return (
    <div style={{ fontFamily:T.font, minHeight:'100vh', color:T.white, overflowX:'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:rgba(245,166,35,0.4);border-radius:2px}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        @keyframes scaleIn{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:scale(1)}}
        @keyframes checkDraw{from{stroke-dashoffset:50}to{stroke-dashoffset:0}}
        .submit-btn { transition:all 0.2s; }
        .submit-btn:hover:not(:disabled) { background: ${T.goldDk} !important; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(245,166,35,0.35) !important; }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .back-btn { transition:all 0.2s; }
        .back-btn:hover { background: rgba(255,255,255,0.08) !important; }
      `}</style>

      <AuroraBg />

      <div style={{ position:'relative', zIndex:1 }}>
        {/* NAV */}
        <nav style={{ height:64, padding:'0 5%', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(8,12,20,0.7)', backdropFilter:'blur(20px)', borderBottom:`1px solid ${T.border}`, position:'sticky', top:0, zIndex:100 }}>
          <button className="back-btn" onClick={() => navigate('/campagnes')} style={{ display:'flex',alignItems:'center',gap:8,background:'rgba(255,255,255,0.05)',border:`1px solid ${T.border}`,borderRadius:8,padding:'8px 14px',color:T.white,cursor:'pointer',fontFamily:T.font,fontSize:13 }}>
            ← Mes campagnes
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:32,height:32,borderRadius:'50%',background:`linear-gradient(135deg,${T.gold},${T.purple})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:'#fff' }}>
              {(localStorage.getItem('userName')||'C')[0].toUpperCase()}
            </div>
            <span style={{ fontSize:13,color:T.gray }}>{localStorage.getItem('userName') || 'Client'}</span>
          </div>
        </nav>

        {/* HERO IMAGE */}
        <div style={{ height:280, position:'relative', overflow:'hidden' }}>
          <img src={CAMP_IMGS[campagne.type?.toLowerCase()]||CAMP_IMGS.email} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(8,12,20,0.3) 0%, rgba(8,12,20,0.85) 100%)' }} />
          <div style={{ position:'absolute', bottom:32, left:'5%', right:'5%' }}>
            <div style={{ display:'inline-flex',alignItems:'center',gap:6,background:`rgba(0,0,0,0.5)`,backdropFilter:'blur(8px)',border:`1px solid ${tc.color}40`,borderRadius:20,padding:'5px 12px',marginBottom:12 }}>
              <span>{tc.icon}</span>
              <span style={{ fontSize:12,fontWeight:700,color:tc.color }}>{tc.label}</span>
            </div>
            <h1 style={{ fontSize:'clamp(22px,3.5vw,40px)', fontWeight:900, letterSpacing:'-0.02em', textShadow:'0 2px 20px rgba(0,0,0,0.5)' }}>{campagne.title}</h1>
            {campagne.client?.name && <p style={{ fontSize:13, color:'rgba(255,255,255,0.5)', marginTop:6 }}>🏢 {campagne.client.name}</p>}
          </div>
        </div>

        {/* CONTENU PRINCIPAL */}
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'40px 5% 80px', display:'grid', gridTemplateColumns:'1fr 420px', gap:40, alignItems:'start' }}>

          {/* COLONNE GAUCHE — détails */}
          <div style={{ animation:'fadeUp 0.6s ease' }}>

            {/* Infos rapides */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:32 }}>
              {[
                ['📣', 'Canal', tc.label, tc.color],
                ['🏢', 'Agence', campagne.client?.name || '—', T.white],
                ['📊', 'Statut', campagne.status || 'Active', T.green],
              ].map(([icon,label,val,c]) => (
                <div key={label} style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:'16px 18px' }}>
                  <div style={{ fontSize:20,marginBottom:8 }}>{icon}</div>
                  <div style={{ fontSize:10,color:T.gray,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:4 }}>{label}</div>
                  <div style={{ fontSize:14,fontWeight:700,color:c }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:'28px 28px',marginBottom:24 }}>
              <h2 style={{ fontSize:16,fontWeight:700,marginBottom:16,color:T.white }}>📋 À propos de cette campagne</h2>
              <p style={{ fontSize:14,color:'rgba(255,255,255,0.6)',lineHeight:1.8 }}>
                {campagne.description || 'Campagne marketing multi-canal avec suivi des performances en temps réel. Rejoignez-nous pour bénéficier de nos offres et actualités exclusives.'}
              </p>
            </div>

            {/* Avantages */}
            <div style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:'28px 28px' }}>
              <h2 style={{ fontSize:16,fontWeight:700,marginBottom:16 }}>✨ Pourquoi rejoindre cette campagne ?</h2>
              <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
                {[
                  tc.desc,
                  'Offres et promotions exclusives aux abonnés',
                  'Désinscription possible à tout moment',
                  'Vos données sont protégées et sécurisées',
                ].map((item,i) => (
                  <div key={i} style={{ display:'flex',alignItems:'flex-start',gap:10 }}>
                    <div style={{ width:20,height:20,borderRadius:6,background:`${tc.color}20`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1 }}>
                      <div style={{ width:7,height:7,borderRadius:'50%',background:tc.color }} />
                    </div>
                    <span style={{ fontSize:13,color:'rgba(255,255,255,0.65)',lineHeight:1.6 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COLONNE DROITE — formulaire ou confirmation */}
          <div style={{ position:'sticky', top:80, animation:'fadeUp 0.6s ease 0.15s both' }}>
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20, padding:'28px 28px', boxShadow:'0 32px 64px rgba(0,0,0,0.4)' }}>

              {done ? (
                /* ── SUCCÈS ── */
                <div style={{ textAlign:'center', padding:'20px 0' }}>
                  <div style={{ width:72,height:72,borderRadius:'50%',background:'rgba(16,185,129,0.12)',border:'2px solid rgba(16,185,129,0.3)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',animation:'scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
                    <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                      <path d="M7 17 L14 24 L27 10" stroke={T.green} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="50" strokeDashoffset="0" style={{animation:'checkDraw 0.5s ease 0.3s both'}} />
                    </svg>
                  </div>
                  <h3 style={{ fontSize:20,fontWeight:800,color:T.green,marginBottom:8 }}>Inscription confirmée !</h3>
                  <p style={{ fontSize:13,color:T.gray,lineHeight:1.6,marginBottom:24 }}>
                    Vous êtes inscrit à <strong style={{color:T.white}}>{campagne.title}</strong>.<br/>
                    Vous recevrez bientôt nos communications.
                  </p>
                  <div style={{ background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:12,padding:'14px 16px',marginBottom:20,textAlign:'left' }}>
                    <div style={{ fontSize:11,color:T.gray,marginBottom:6,textTransform:'uppercase',letterSpacing:'0.08em' }}>Récapitulatif</div>
                    <div style={{ fontSize:13,color:T.white }}><strong>Nom :</strong> {form.nom}</div>
                    <div style={{ fontSize:13,color:T.white,marginTop:4 }}><strong>Email :</strong> {form.email}</div>
                    <div style={{ fontSize:13,color:T.white,marginTop:4 }}><strong>Tél :</strong> {form.telephone}</div>
                  </div>
                  <button onClick={() => navigate('/campagnes')} style={{ width:'100%',padding:'12px',borderRadius:10,background:T.gold,color:'#111',fontWeight:700,fontSize:14,border:'none',cursor:'pointer',fontFamily:T.font }}>
                    Voir toutes les campagnes →
                  </button>
                </div>

              ) : isInscrit ? (
                /* ── DÉJÀ INSCRIT ── */
                <div style={{ textAlign:'center', padding:'20px 0' }}>
                  <div style={{ fontSize:44,marginBottom:16 }}>✅</div>
                  <h3 style={{ fontSize:18,fontWeight:800,color:T.green,marginBottom:8 }}>Vous êtes déjà inscrit</h3>
                  <p style={{ fontSize:13,color:T.gray,lineHeight:1.6,marginBottom:20 }}>Vous participez déjà à cette campagne.</p>
                  <button onClick={() => navigate('/campagnes')} style={{ width:'100%',padding:'12px',borderRadius:10,background:T.gold,color:'#111',fontWeight:700,fontSize:14,border:'none',cursor:'pointer',fontFamily:T.font }}>
                    Voir d'autres campagnes →
                  </button>
                </div>

              ) : (
                /* ── FORMULAIRE ── */
                <>
                  <div style={{ marginBottom:24 }}>
                    <h2 style={{ fontSize:18,fontWeight:800,marginBottom:6 }}>S'inscrire à la campagne</h2>
                    <p style={{ fontSize:13,color:T.gray,lineHeight:1.5 }}>Remplissez le formulaire pour rejoindre <strong style={{color:T.white}}>{campagne.title}</strong>.</p>
                  </div>

                  {errors.global && (
                    <div style={{ background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:10,padding:'12px 14px',marginBottom:20,fontSize:13,color:T.red }}>
                      ⚠ {errors.global}
                    </div>
                  )}

                  <Field label="Nom complet" name="name" value={form.name}
                    onChange={e=>setForm({...form,name:e.target.value})}
                    placeholder="Jean Dupont" error={errors.name} icon="👤" required />

                  <Field label="Adresse email" name="email" type="email" value={form.email}
                    onChange={e=>setForm({...form,email:e.target.value})}
                    placeholder="jean@exemple.com" error={errors.email} icon="✉️" required />

                  <Field label="Téléphone" name="telephone" type="tel" value={form.telephone}
                    onChange={e=>setForm({...form,telephone:e.target.value})}
                    placeholder="+216 XX XXX XXX" error={errors.telephone} icon="📱" required />

                  {/* Canal info */}
                  <div style={{ background:`${tc.color}0d`,border:`1px solid ${tc.color}30`,borderRadius:10,padding:'12px 14px',marginBottom:20,display:'flex',alignItems:'center',gap:10 }}>
                    <span style={{ fontSize:18 }}>{tc.icon}</span>
                    <div>
                      <div style={{ fontSize:12,fontWeight:700,color:tc.color }}>Canal {tc.label}</div>
                      <div style={{ fontSize:12,color:T.gray }}>{tc.desc}</div>
                    </div>
                  </div>

                  <button
                    className="submit-btn"
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{ width:'100%',padding:'14px',borderRadius:12,background:T.gold,color:'#111',fontWeight:700,fontSize:15,border:'none',cursor:'pointer',fontFamily:T.font,display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}
                  >
                    {submitting ? (
                      <>
                        <div style={{ width:16,height:16,border:'2px solid rgba(0,0,0,0.2)',borderTop:'2px solid #111',borderRadius:'50%',animation:'spin 0.8s linear infinite' }} />
                        Inscription en cours...
                      </>
                    ) : '✓ Confirmer l\'inscription'}
                  </button>

                  <p style={{ fontSize:11,color:'rgba(255,255,255,0.25)',textAlign:'center',marginTop:12,lineHeight:1.5 }}>
                    En vous inscrivant, vous acceptez de recevoir des communications via {tc.label}. Désinscription possible à tout moment.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}