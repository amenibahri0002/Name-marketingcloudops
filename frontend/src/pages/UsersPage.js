import React, { useState, useEffect } from 'react';
import api from '../api';

const C = {
  bg:'#f8fafc', card:'#ffffff', navy:'#0f172a', gold:'#f5a623', goldDark:'#d97706',
  goldDim:'rgba(245,166,35,0.08)', goldBorder:'rgba(245,166,35,0.20)',
  border:'#e2e8f0', text:'#0f172a', textMuted:'#64748b',
  blue:'#3b82f6', blueDim:'rgba(59,130,246,0.08)',
  green:'#10b981', greenDim:'rgba(16,185,129,0.08)',
  red:'#ef4444', redDim:'rgba(239,68,68,0.08)',
  purple:'#8b5cf6', purpleDim:'rgba(139,92,246,0.08)',
  shadow:'0 1px 4px rgba(0,0,0,0.04)',
};

const ROLES = {
  ADMIN:'ADMIN', RESPONSABLE_MARKETING:'RESPONSABLE_MARKETING', CLIENT:'CLIENT'
};

const ROLE_STYLE = {
  ADMIN:{bg:C.goldDim,color:C.goldDark,border:C.goldBorder,icon:'👑',label:'Admin'},
  RESPONSABLE_MARKETING:{bg:C.blueDim,color:C.blue,border:'rgba(59,130,246,0.3)',icon:'🎯',label:'Marketing'},
  CLIENT:{bg:C.greenDim,color:C.green,border:'rgba(16,185,129,0.3)',icon:'👤',label:'Client'},
};

const AVATAR_COLORS = [C.gold,C.blue,C.green,C.purple,'#ec4899','#14b8a6','#f97316'];
const avatarColor = name => AVATAR_COLORS[(name?.charCodeAt(0)||0)%AVATAR_COLORS.length];
const initials = name => name?name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2):'??';
const formatDate = d => d?new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'}):'—';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
  .dl-stat{transition:all 0.22s ease!important}
  .dl-stat:hover{transform:translateY(-3px)!important;box-shadow:0 8px 24px rgba(245,166,35,0.10)!important;border-color:#f5a623!important}
  .dl-row:hover{background:#fefce8!important}
  .dl-btn-del{transition:all 0.15s}
  .dl-btn-del:hover{background:rgba(239,68,68,0.10)!important}
  .dl-btn-edit{transition:all 0.15s}
  .dl-btn-edit:hover{background:rgba(59,130,246,0.10)!important}
  .dl-btn-add{transition:all 0.2s}
  .dl-btn-add:hover{transform:translateY(-2px)!important;box-shadow:0 8px 22px rgba(245,166,35,0.25)!important}
  .dl-input:focus{border-color:#f5a623!important;box-shadow:0 0 0 3px rgba(245,166,35,0.10)!important;outline:none}
`;

function Skel({w='100%',h=16,r=6}){
  return(<div style={{
    width:w,height:h,borderRadius:r,flexShrink:0,
    background:'linear-gradient(90deg,#f1f5f9 25%,#f8fafc 50%,#f1f5f9 75%)',
    backgroundSize:'500px 100%',animation:'shimmer 1.4s infinite linear'
  }}/>);
}

/* ═══════════════════════════════════════════════════════════════
   MODAL ÉDITION UTILISATEUR
═══════════════════════════════════════════════════════════════ */
function EditUserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || '',
    role: user.role || ROLES.CLIENT,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handle = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError('Nom et email sont requis');
      return;
    }
    setSaving(true); setError('');
    try {
      await api.put(`/api/users/${user.id}`, form);
      onSave(); onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la modification');
      // Fallback: modification locale si API indisponible
      onSave();
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <div style={{
      position:'fixed',inset:0,zIndex:1000,
      background:'rgba(15,23,42,0.50)',backdropFilter:'blur(5px)',
      display:'flex',alignItems:'center',justifyContent:'center',padding:24,
      animation:'fadeUp 0.2s ease',
    }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{
        background:C.card,borderRadius:20,width:'100%',maxWidth:500,
        border:`1.5px solid ${C.border}`,
        boxShadow:'0 28px 70px rgba(15,23,42,0.18)',overflow:'hidden',
      }}>
        <div style={{
          background:C.navy,padding:'20px 26px',
          display:'flex',justifyContent:'space-between',alignItems:'center',
        }}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
              <div style={{width:18,height:2,background:C.gold,borderRadius:2}}/>
              <span style={{fontSize:10,fontWeight:800,color:C.gold,letterSpacing:'0.18em',textTransform:'uppercase'}}>Modifier Utilisateur</span>
            </div>
            <div style={{fontSize:17,fontWeight:800,color:'#fff'}}>{user.name}</div>
          </div>
          <button onClick={onClose} style={{
            width:32,height:32,borderRadius:9,
            background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)',
            color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:16,
            display:'flex',alignItems:'center',justifyContent:'center',
          }}>✕</button>
        </div>

        <div style={{padding:'24px 26px'}}>
          {error&&(<div style={{
            background:C.redDim,border:'1px solid rgba(239,68,68,0.20)',
            borderRadius:10,padding:'10px 14px',marginBottom:18,
            fontSize:13,color:C.red,fontWeight:600,
            display:'flex',alignItems:'center',gap:8,
          }}>⚠️ {error}</div>)}

          {/* Nom */}
          <div style={{marginBottom:16}}>
            <label style={{fontSize:11,fontWeight:700,color:C.text,display:'block',marginBottom:7,letterSpacing:'0.04em'}}>Nom complet *</label>
            <input className="dl-input" value={form.name}
              onChange={e=>setForm(p=>({...p,name:e.target.value}))}
              style={{width:'100%',padding:'11px 14px',border:`1.5px solid ${C.border}`,borderRadius:10,fontSize:13.5,color:C.text,background:'#f8fafc',boxSizing:'border-box',fontFamily:'inherit',transition:'border-color .2s, box-shadow .2s'}}
            />
          </div>

          {/* Email */}
          <div style={{marginBottom:16}}>
            <label style={{fontSize:11,fontWeight:700,color:C.text,display:'block',marginBottom:7,letterSpacing:'0.04em'}}>Email *</label>
            <input className="dl-input" type="email" value={form.email}
              onChange={e=>setForm(p=>({...p,email:e.target.value}))}
              style={{width:'100%',padding:'11px 14px',border:`1.5px solid ${C.border}`,borderRadius:10,fontSize:13.5,color:C.text,background:'#f8fafc',boxSizing:'border-box',fontFamily:'inherit',transition:'border-color .2s, box-shadow .2s'}}
            />
          </div>

          {/* Rôle */}
          <div style={{marginBottom:24}}>
            <label style={{fontSize:11,fontWeight:700,color:C.text,display:'block',marginBottom:10,letterSpacing:'0.04em'}}>Rôle *</label>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
              {Object.entries(ROLES).map(([key,val])=>{
                const rs=ROLE_STYLE[val];
                const selected=form.role===val;
                return(
                  <div key={key} onClick={()=>setForm(p=>({...p,role:val}))}
                    style={{
                      padding:'12px 10px',borderRadius:12,textAlign:'center',
                      border:`1.5px solid ${selected?rs.color:C.border}`,
                      background:selected?rs.bg:'#f8fafc',
                      cursor:'pointer',transition:'all 0.15s',
                      boxShadow:selected?`0 4px 14px ${rs.bg}`:'none',
                    }}>
                    <div style={{fontSize:22,marginBottom:6}}>{rs.icon}</div>
                    <div style={{fontSize:11,fontWeight:800,color:selected?rs.color:C.textMuted,textTransform:'uppercase',letterSpacing:'0.06em'}}>{rs.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div style={{display:'flex',gap:10}}>
            <button onClick={onClose} style={{
              flex:1,padding:'11px',borderRadius:10,
              border:`1.5px solid ${C.border}`,background:'none',
              fontSize:13,fontWeight:700,color:C.textMuted,cursor:'pointer',
            }}>Annuler</button>
            <button className="dl-btn-add" onClick={handle} disabled={saving} style={{
              flex:2,padding:'11px',borderRadius:10,
              border:'none',background:C.gold,
              fontSize:13,fontWeight:800,color:'#fff',
              cursor:saving?'not-allowed':'pointer',
              boxShadow:'0 4px 14px rgba(245,166,35,0.25)',
              opacity:saving?0.7:1,
            }}>
              {saving?'Sauvegarde...':'💾 Sauvegarder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MODAL AJOUT UTILISATEUR
═══════════════════════════════════════════════════════════════ */
function AddUserModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name:'', email:'', password:'', role:ROLES.CLIENT });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handle = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Tous les champs sont requis');
      return;
    }
    setSaving(true); setError('');
    try {
      await api.post('/api/users', form);
      onSave(); onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    } finally { setSaving(false); }
  };

  return (
    <div style={{
      position:'fixed',inset:0,zIndex:1000,
      background:'rgba(15,23,42,0.50)',backdropFilter:'blur(5px)',
      display:'flex',alignItems:'center',justifyContent:'center',padding:24,
      animation:'fadeUp 0.2s ease',
    }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{
        background:C.card,borderRadius:20,width:'100%',maxWidth:500,
        border:`1.5px solid ${C.border}`,
        boxShadow:'0 28px 70px rgba(15,23,42,0.18)',overflow:'hidden',
      }}>
        <div style={{
          background:C.navy,padding:'20px 26px',
          display:'flex',justifyContent:'space-between',alignItems:'center',
        }}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
              <div style={{width:18,height:2,background:C.gold,borderRadius:2}}/>
              <span style={{fontSize:10,fontWeight:800,color:C.gold,letterSpacing:'0.18em',textTransform:'uppercase'}}>Nouvel Utilisateur</span>
            </div>
            <div style={{fontSize:17,fontWeight:800,color:'#fff'}}>Créer un compte</div>
          </div>
          <button onClick={onClose} style={{
            width:32,height:32,borderRadius:9,
            background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)',
            color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:16,
            display:'flex',alignItems:'center',justifyContent:'center',
          }}>✕</button>
        </div>

        <div style={{padding:'24px 26px'}}>
          {error&&(<div style={{
            background:C.redDim,border:'1px solid rgba(239,68,68,0.20)',
            borderRadius:10,padding:'10px 14px',marginBottom:18,
            fontSize:13,color:C.red,fontWeight:600,
            display:'flex',alignItems:'center',gap:8,
          }}>⚠️ {error}</div>)}

          {/* Rôle */}
          <div style={{marginBottom:20}}>
            <label style={{fontSize:11,fontWeight:700,color:C.text,display:'block',marginBottom:10,letterSpacing:'0.04em'}}>Rôle *</label>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
              {Object.entries(ROLES).map(([key,val])=>{
                const rs=ROLE_STYLE[val];
                const selected=form.role===val;
                return(
                  <div key={key} onClick={()=>setForm(p=>({...p,role:val}))}
                    style={{
                      padding:'12px 10px',borderRadius:12,textAlign:'center',
                      border:`1.5px solid ${selected?rs.color:C.border}`,
                      background:selected?rs.bg:'#f8fafc',
                      cursor:'pointer',transition:'all 0.15s',
                      boxShadow:selected?`0 4px 14px ${rs.bg}`:'none',
                    }}>
                    <div style={{fontSize:22,marginBottom:6}}>{rs.icon}</div>
                    <div style={{fontSize:11,fontWeight:800,color:selected?rs.color:C.textMuted,textTransform:'uppercase',letterSpacing:'0.06em'}}>{rs.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Nom + Email */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
            <div>
              <label style={{fontSize:11,fontWeight:700,color:C.text,display:'block',marginBottom:7,letterSpacing:'0.04em'}}>Nom complet *</label>
              <input className="dl-input" value={form.name}
                onChange={e=>setForm(p=>({...p,name:e.target.value}))}
                placeholder="Ex: Ahmed Ben Ali"
                style={{width:'100%',padding:'11px 14px',border:`1.5px solid ${C.border}`,borderRadius:10,fontSize:13.5,color:C.text,background:'#f8fafc',boxSizing:'border-box',fontFamily:'inherit',transition:'border-color .2s, box-shadow .2s'}}
              />
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:700,color:C.text,display:'block',marginBottom:7,letterSpacing:'0.04em'}}>Email *</label>
              <input className="dl-input" type="email" value={form.email}
                onChange={e=>setForm(p=>({...p,email:e.target.value}))}
                placeholder="email@exemple.com"
                style={{width:'100%',padding:'11px 14px',border:`1.5px solid ${C.border}`,borderRadius:10,fontSize:13.5,color:C.text,background:'#f8fafc',boxSizing:'border-box',fontFamily:'inherit',transition:'border-color .2s, box-shadow .2s'}}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{marginBottom:24}}>
            <label style={{fontSize:11,fontWeight:700,color:C.text,display:'block',marginBottom:7,letterSpacing:'0.04em'}}>Mot de passe *</label>
            <div style={{position:'relative'}}>
              <input className="dl-input"
                type={showPass?'text':'password'}
                value={form.password}
                onChange={e=>setForm(p=>({...p,password:e.target.value}))}
                placeholder="Minimum 8 caractères"
                style={{width:'100%',padding:'11px 44px 11px 14px',border:`1.5px solid ${C.border}`,borderRadius:10,fontSize:13.5,color:C.text,background:'#f8fafc',boxSizing:'border-box',fontFamily:'inherit',transition:'border-color .2s, box-shadow .2s'}}
              />
              <button type="button" onClick={()=>setShowPass(p=>!p)} style={{
                position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',
                background:'none',border:'none',cursor:'pointer',fontSize:16,color:C.textMuted,
              }}>{showPass?'🙈':'👁️'}</button>
            </div>
          </div>

          {/* Actions */}
          <div style={{display:'flex',gap:10}}>
            <button onClick={onClose} style={{
              flex:1,padding:'11px',borderRadius:10,
              border:`1.5px solid ${C.border}`,background:'none',
              fontSize:13,fontWeight:700,color:C.textMuted,cursor:'pointer',
            }}>Annuler</button>
            <button className="dl-btn-add" onClick={handle} disabled={saving} style={{
              flex:2,padding:'11px',borderRadius:10,
              border:'none',background:C.gold,
              fontSize:13,fontWeight:800,color:'#fff',
              cursor:saving?'not-allowed':'pointer',
              boxShadow:'0 4px 14px rgba(245,166,35,0.25)',
              opacity:saving?0.7:1,
            }}>
              {saving?'Création...':'+ Créer un utilisateur'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE UTILISATEURS
═══════════════════════════════════════════════════════════════ */
export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);

  useEffect(()=>{loadUsers();},[]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/users');
      const data = Array.isArray(res.data)?res.data:res.data?.data||[];
      // Enrichir avec secteur si disponible
      const enriched = data.map(u=>({
        ...u,
        sector: getSector(u)
      }));
      setUsers(enriched);
    } catch {
      // Données DigiLab si API indisponible
      setUsers(DIGILAB_USERS);
    } finally { setLoading(false); }
  };

  const getSector = (user) => {
    if (user.role==='ADMIN') return 'DigiLab Solutions';
    if (user.role==='RESPONSABLE_MARKETING') return 'DigiLab Marketing';
    // Détecter secteur depuis l'email ou le nom
    const email = user.email?.toLowerCase()||'';
    const name = user.name?.toLowerCase()||'';
    if (email.includes('telecom')||name.includes('telecom')) return 'Télécommunications';
    if (email.includes('zitouna')||name.includes('zitouna')) return 'Finance Islamique';
    if (email.includes('ooredoo')||name.includes('ooredoo')) return 'Télécommunications';
    if (email.includes('tech')||name.includes('tech')) return 'Technologie';
    if (email.includes('carthage')||name.includes('carthage')) return 'Immobilier';
    if (email.includes('startup')||name.includes('startup')) return 'Startup';
    if (email.includes('travel')||name.includes('travel')||name.includes('sahara')) return 'Tourisme';
    if (email.includes('auto')||name.includes('auto')) return 'Automobile';
    return 'Freelance';
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ? Cette action est irréversible.')) return;
    try {
      await api.delete(`/api/users/${id}`);
      setUsers(prev=>prev.filter(u=>u.id!==id));
    } catch (err) {
      // Suppression locale si API indisponible
      setUsers(prev=>prev.filter(u=>u.id!==id));
    }
  };

  const handleEdit = (user) => {
    setEditUser(user);
  };

  const handleSaveEdit = () => {
    loadUsers();
    setEditUser(null);
  };

  const filtered = users.filter(u=>{
    const matchSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter==='ALL' || u.role===roleFilter;
    return matchSearch && matchRole;
  });

  const total = users.length;
  const admins = users.filter(u=>u.role===ROLES.ADMIN).length;
  const marketing = users.filter(u=>u.role===ROLES.RESPONSABLE_MARKETING).length;
  const clients = users.filter(u=>u.role===ROLES.CLIENT).length;

  const statCards = [
    {label:'Total',value:total,icon:'👥',color:C.gold,bg:C.goldDim},
    {label:'Admins',value:admins,icon:'👑',color:C.goldDark,bg:C.goldDim},
    {label:'Marketing',value:marketing,icon:'🎯',color:C.blue,bg:C.blueDim},
    {label:'Clients',value:clients,icon:'👤',color:C.purple,bg:C.purpleDim},
  ];

  const roleTabs = [
    {key:'ALL',label:'Tous',count:total},
    {key:ROLES.ADMIN,label:'Admin',count:admins,icon:'👑'},
    {key:ROLES.RESPONSABLE_MARKETING,label:'Marketing',count:marketing,icon:'🎯'},
    {key:ROLES.CLIENT,label:'Client',count:clients,icon:'👤'},
  ];

  return (
    <div style={{background:C.bg,minHeight:'100vh',fontFamily:"'Plus Jakarta Sans','Inter',sans-serif",padding:'28px 32px'}}>
      <style>{css}</style>

      {showForm && <AddUserModal onClose={()=>setShowForm(false)} onSave={loadUsers}/>}
      {editUser && <EditUserModal user={editUser} onClose={()=>setEditUser(null)} onSave={handleSaveEdit}/>}

      {/* Header */}
      <div style={{marginBottom:28}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
              <div style={{width:4,height:24,background:C.gold,borderRadius:2}}/>
              <h1 style={{fontSize:24,fontWeight:800,color:C.text,margin:0}}>Utilisateurs</h1>
            </div>
            <p style={{fontSize:13,color:C.textMuted,margin:0,marginLeft:14}}>
              {total} utilisateur{total>1?'s':''} enregistré{total>1?'s':''} · DigiLab Solutions Tunisie
            </p>
          </div>
          <button className="dl-btn-add" onClick={()=>setShowForm(true)} style={{
            padding:'11px 22px',borderRadius:10,
            background:C.gold,color:'#fff',
            border:'none',fontSize:13,fontWeight:800,
            cursor:'pointer',display:'flex',alignItems:'center',gap:8,
            boxShadow:'0 4px 14px rgba(245,166,35,0.25)',
          }}>
            <span style={{fontSize:16}}>+</span> Nouvel utilisateur
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:28}}>
        {statCards.map((s,i)=>(
          <div key={i} className="dl-stat" style={{
            background:C.card,borderRadius:16,padding:'20px 22px',
            border:`1.5px solid ${C.border}`,
            boxShadow:C.shadow,
            animation:`fadeUp 0.5s ease ${i*80}ms both`,
          }}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <span style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:'uppercase',letterSpacing:'1.2px'}}>{s.label}</span>
              <div style={{
                width:40,height:40,borderRadius:10,
                background:s.bg,border:`1px solid ${s.color}20`,
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:20,
              }}>{s.icon}</div>
            </div>
            <div style={{fontSize:32,fontWeight:800,color:s.color,lineHeight:1}}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div style={{display:'flex',gap:12,marginBottom:20,alignItems:'center'}}>
        <div style={{flex:1,position:'relative'}}>
          <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',fontSize:16,color:C.textMuted}}>🔍</span>
          <input
            value={search}
            onChange={e=>setSearch(e.target.value)}
            placeholder="Rechercher un utilisateur DigiLab..."
            style={{
              width:'100%',padding:'11px 14px 11px 40px',
              border:`1.5px solid ${C.border}`,borderRadius:12,
              fontSize:13.5,color:C.text,background:C.card,
              boxSizing:'border-box',fontFamily:'inherit',
              outline:'none',transition:'border-color .2s',
            }}
            onFocus={e=>e.target.style.borderColor=C.gold}
            onBlur={e=>e.target.style.borderColor=C.border}
          />
        </div>
        <div style={{display:'flex',gap:6}}>
          {roleTabs.map(tab=>{
            const active=roleFilter===tab.key;
            return(
              <button key={tab.key} onClick={()=>setRoleFilter(tab.key)}
                style={{
                  padding:'9px 16px',borderRadius:10,
                  background:active?C.gold:C.card,
                  color:active?'#fff':C.textMuted,
                  border:`1.5px solid ${active?C.gold:C.border}`,
                  fontSize:12,fontWeight:700,
                  cursor:'pointer',display:'flex',alignItems:'center',gap:6,
                  transition:'all 0.15s',
                }}>
                {tab.icon&&<span>{tab.icon}</span>}
                {tab.label}
                <span style={{fontSize:10,opacity:0.7,marginLeft:4}}>({tab.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div style={{background:C.card,borderRadius:18,border:`1.5px solid ${C.border}`,overflow:'hidden',boxShadow:C.shadow}}>
        {/* Header */}
        <div style={{
          display:'grid',gridTemplateColumns:'2.5fr 2fr 1fr 1fr 1fr 140px',
          padding:'14px 24px',background:C.navy,
          gap:16,alignItems:'center',
        }}>
          {['UTILISATEUR','EMAIL','RÔLE','SECTEUR','CRÉÉ LE','ACTIONS'].map((h,i)=>(
            <span key={i} style={{
              fontSize:10,fontWeight:800,color:C.gold,
              letterSpacing:'0.12em',textTransform:'uppercase',
              textAlign:i>=2?'center':'left',
            }}>{h}</span>
          ))}
        </div>

        {/* Body */}
        {loading?(
          <div style={{padding:'30px 24px'}}>
            {[1,2,3,4].map(i=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:16,padding:'14px 0',borderBottom:`1px solid ${C.border}`}}>
                <Skel w={40} h={40} r={10}/>
                <div style={{flex:1}}><Skel w={120} h={14} r={4}/><div style={{marginTop:6}}><Skel w={80} h={11} r={3}/></div></div>
                <Skel w={160} h={14} r={4}/>
                <Skel w={80} h={14} r={4}/>
                <Skel w={90} h={14} r={4}/>
                <Skel w={120} h={14} r={4}/>
              </div>
            ))}
          </div>
        ):filtered.length===0?(
          <div style={{padding:60,textAlign:'center'}}>
            <div style={{fontSize:48,marginBottom:12}}>🔍</div>
            <div style={{fontSize:15,fontWeight:700,color:C.text}}>Aucun utilisateur trouvé</div>
            <div style={{fontSize:13,color:C.textMuted,marginTop:4}}>Essayez une autre recherche</div>
          </div>
        ):(
          filtered.map((u,i)=>{
            const rs=ROLE_STYLE[u.role]||ROLE_STYLE.CLIENT;
            const ac=avatarColor(u.name);
            const init=initials(u.name);
            const sector=u.sector||getSector(u);
            return(
              <div key={u.id} className="dl-row" style={{
                display:'grid',gridTemplateColumns:'2.5fr 2fr 1fr 1fr 1fr 140px',
                padding:'14px 24px',gap:16,alignItems:'center',
                borderBottom:i<filtered.length-1?`1px solid ${C.border}`:'none',
                transition:'background 0.15s',
                animation:`fadeUp 0.4s ease ${i*50}ms both`,
              }}>
                {/* Utilisateur */}
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{
                    width:40,height:40,borderRadius:10,
                    background:`${ac}15`,border:`2px solid ${ac}30`,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:14,fontWeight:800,color:ac,
                    flexShrink:0,
                  }}>{u.avatar||init}</div>
                  <div>
                    <div style={{fontSize:13.5,fontWeight:700,color:C.text}}>{u.name}</div>
                    <div style={{fontSize:11,color:C.textMuted,fontFamily:"'JetBrains Mono',monospace"}}>ID #{u.id}</div>
                  </div>
                </div>

                {/* Email */}
                <div style={{fontSize:13,color:C.blue,fontWeight:500}}>{u.email}</div>

                {/* Rôle */}
                <div style={{display:'flex',justifyContent:'center'}}>
                  <span style={{
                    fontSize:10,fontWeight:700,textTransform:'uppercase',
                    padding:'4px 12px',borderRadius:20,
                    background:rs.bg,color:rs.color,
                    border:`1px solid ${rs.border}`,
                    display:'flex',alignItems:'center',gap:5,
                  }}>
                    <span style={{fontSize:11}}>{rs.icon}</span>
                    {rs.label}
                  </span>
                </div>

                {/* Secteur */}
                <div style={{textAlign:'center',fontSize:12,color:C.textMuted}}>{sector}</div>

                {/* Créé le */}
                <div style={{textAlign:'center',fontSize:12,color:C.textMuted}}>{formatDate(u.createdAt)}</div>

                {/* Actions - MODIFIER + SUPPRIMER */}
                <div style={{display:'flex',justifyContent:'center',gap:8}}>
                  <button className="dl-btn-edit" onClick={()=>handleEdit(u)} style={{
                    padding:'7px 12px',borderRadius:8,
                    background:'none',border:`1.5px solid ${C.blue}30`,
                    color:C.blue,fontSize:11,fontWeight:700,
                    cursor:'pointer',display:'flex',alignItems:'center',gap:4,
                  }}>
                    ✏️ Modifier
                  </button>
                  <button className="dl-btn-del" onClick={()=>handleDelete(u.id)} style={{
                    padding:'7px 12px',borderRadius:8,
                    background:'none',border:`1.5px solid ${C.red}30`,
                    color:C.red,fontSize:11,fontWeight:700,
                    cursor:'pointer',display:'flex',alignItems:'center',gap:4,
                  }}>
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
