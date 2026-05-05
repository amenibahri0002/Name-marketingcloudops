import React, { useState } from 'react';
import api from '../api';

const DP = {
  gold:'#f5a623', goldGlow:'rgba(245,166,35,0.12)',
  dark:'#16120d', bg:'#f6f3ee', card:'#ffffff',
  border:'#ede8df', text:'#1a160e', muted:'#9c8f7a',
  blue:'#3b82f6', green:'#22c55e', red:'#ef4444',
  font:"'Montserrat','Open Sans',sans-serif",
};

export default function Profile() {
  const stored = JSON.parse(localStorage.getItem('user') || '{}');
  const [name,    setName]    = useState(stored.name    || '');
  const [email,   setEmail]   = useState(stored.email   || '');
  const [success, setSuccess] = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const [pwForm, setPwForm]   = useState({ current:'', next:'', confirm:'' });
  const [pwMsg,  setPwMsg]    = useState('');
  const [pwErr,  setPwErr]    = useState('');
  const [pwLoad, setPwLoad]   = useState(false);

  const initials = name ? name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) : '??';
  const AVATAR_COLORS = ['#f5a623','#3b82f6','#22c55e','#8b5cf6','#ec4899'];
  const avatarColor = AVATAR_COLORS[(name?.charCodeAt(0)||0) % AVATAR_COLORS.length];

  const handleSave = async (e) => {
    e.preventDefault(); setLoading(true); setSuccess(''); setError('');
    try {
      const res = await api.put('/api/users/me', { name, email });
      const updated = { ...stored, name, email };
      localStorage.setItem('user', JSON.stringify(updated));
      setSuccess('Profil mis à jour avec succès !');
    } catch(err) {
      setError('Erreur lors de la mise à jour');
    }
    setLoading(false);
  };

  const handlePassword = async (e) => {
    e.preventDefault(); setPwMsg(''); setPwErr('');
    if (pwForm.next !== pwForm.confirm) { setPwErr('Les mots de passe ne correspondent pas'); return; }
    if (pwForm.next.length < 6) { setPwErr('Minimum 6 caractères'); return; }
    setPwLoad(true);
    try {
      await api.put('/api/users/me/password', { currentPassword: pwForm.current, newPassword: pwForm.next });
      setPwMsg('Mot de passe modifié !');
      setPwForm({ current:'', next:'', confirm:'' });
    } catch(err) {
      setPwErr(err.response?.data?.message || 'Mot de passe actuel incorrect');
    }
    setPwLoad(false);
  };

  const roleLabel = stored.role === 'ADMIN' ? 'Administrateur' : stored.role === 'RESPONSABLE_MARKETING' ? 'Resp. Marketing' : 'Client';

  return (
    <div style={{ fontFamily:DP.font, color:DP.text, maxWidth:680 }}>

      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:20, fontWeight:900, margin:'0 0 4px' }}>Mon Profil</h1>
        <p style={{ color:DP.muted, fontSize:12, margin:0 }}>Gérez vos informations personnelles</p>
      </div>

      {/* Avatar card */}
      <div style={{ background:DP.card, border:`1px solid ${DP.border}`, borderRadius:16, padding:24, marginBottom:16, display:'flex', alignItems:'center', gap:20 }}>
        <div style={{
          width:72, height:72, borderRadius:20,
          background:`${avatarColor}20`, border:`2px solid ${avatarColor}40`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:24, fontWeight:900, color:avatarColor, flexShrink:0
        }}>
          {initials}
        </div>
        <div>
          <div style={{ fontSize:18, fontWeight:900, color:DP.text }}>{name}</div>
          <div style={{ fontSize:12, color:DP.muted, marginTop:2 }}>{email}</div>
          <div style={{ display:'inline-block', marginTop:6, background:DP.goldGlow, color:'#d97706', fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:20 }}>{roleLabel}</div>
        </div>
      </div>

      {/* Infos form */}
      <div style={{ background:DP.card, border:`1px solid ${DP.border}`, borderRadius:16, padding:24, marginBottom:16 }}>
        <h3 style={{ fontSize:14, fontWeight:800, margin:'0 0 18px', color:DP.text }}>Informations personnelles</h3>

        {success && <div style={{ background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.25)', borderRadius:8, padding:'10px 14px', marginBottom:16, color:DP.green, fontSize:13, fontWeight:600 }}>✅ {success}</div>}
        {error   && <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, padding:'10px 14px', marginBottom:16, color:DP.red, fontSize:13, fontWeight:600 }}>❌ {error}</div>}

        <form onSubmit={handleSave} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <div>
            <label style={{ fontSize:10, fontWeight:700, color:DP.muted, textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:5 }}>Nom complet</label>
            <input value={name} onChange={e=>setName(e.target.value)} required
              style={{ width:'100%', padding:'10px 12px', border:`1px solid ${DP.border}`, borderRadius:8, fontSize:13, boxSizing:'border-box', fontFamily:DP.font, background:'white', color:DP.text }}
              onFocus={e=>e.target.style.borderColor=DP.gold}
              onBlur={e=>e.target.style.borderColor=DP.border}
            />
          </div>
          <div>
            <label style={{ fontSize:10, fontWeight:700, color:DP.muted, textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:5 }}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
              style={{ width:'100%', padding:'10px 12px', border:`1px solid ${DP.border}`, borderRadius:8, fontSize:13, boxSizing:'border-box', fontFamily:DP.font, background:'white', color:DP.text }}
              onFocus={e=>e.target.style.borderColor=DP.gold}
              onBlur={e=>e.target.style.borderColor=DP.border}
            />
          </div>
          <div>
            <label style={{ fontSize:10, fontWeight:700, color:DP.muted, textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:5 }}>Rôle</label>
            <input value={roleLabel} disabled
              style={{ width:'100%', padding:'10px 12px', border:`1px solid ${DP.border}`, borderRadius:8, fontSize:13, boxSizing:'border-box', fontFamily:DP.font, background:'#f9f7f3', color:DP.muted }}
            />
          </div>
          <div>
            <label style={{ fontSize:10, fontWeight:700, color:DP.muted, textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:5 }}>ID Utilisateur</label>
            <input value={`#${stored.id || '—'}`} disabled
              style={{ width:'100%', padding:'10px 12px', border:`1px solid ${DP.border}`, borderRadius:8, fontSize:13, boxSizing:'border-box', fontFamily:DP.font, background:'#f9f7f3', color:DP.muted }}
            />
          </div>
          <div style={{ gridColumn:'1/-1' }}>
            <button type="submit" disabled={loading} style={{
              background:DP.gold, color:DP.dark, border:'none',
              padding:'10px 24px', borderRadius:8, fontSize:12, fontWeight:800,
              cursor:'pointer', fontFamily:DP.font
            }}>{loading ? 'Sauvegarde...' : '💾 Sauvegarder'}</button>
          </div>
        </form>
      </div>

      {/* Password form */}
      <div style={{ background:DP.card, border:`1px solid ${DP.border}`, borderRadius:16, padding:24 }}>
        <h3 style={{ fontSize:14, fontWeight:800, margin:'0 0 18px', color:DP.text }}>🔒 Changer le mot de passe</h3>

        {pwMsg && <div style={{ background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.25)', borderRadius:8, padding:'10px 14px', marginBottom:16, color:DP.green, fontSize:13, fontWeight:600 }}>✅ {pwMsg}</div>}
        {pwErr && <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, padding:'10px 14px', marginBottom:16, color:DP.red, fontSize:13, fontWeight:600 }}>❌ {pwErr}</div>}

        <form onSubmit={handlePassword} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          {[
            { label:'Mot de passe actuel', key:'current' },
            { label:'Nouveau mot de passe', key:'next' },
            { label:'Confirmer le mot de passe', key:'confirm' },
          ].map(f => (
            <div key={f.key} style={{ gridColumn: f.key==='current' ? '1/-1' : 'auto' }}>
              <label style={{ fontSize:10, fontWeight:700, color:DP.muted, textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:5 }}>{f.label}</label>
              <input type="password" value={pwForm[f.key]} onChange={e=>setPwForm({...pwForm, [f.key]:e.target.value})} required
                placeholder="••••••••"
                style={{ width:'100%', padding:'10px 12px', border:`1px solid ${DP.border}`, borderRadius:8, fontSize:13, boxSizing:'border-box', fontFamily:DP.font, background:'white' }}
                onFocus={e=>e.target.style.borderColor=DP.gold}
                onBlur={e=>e.target.style.borderColor=DP.border}
              />
            </div>
          ))}
          <div style={{ gridColumn:'1/-1' }}>
            <button type="submit" disabled={pwLoad} style={{
              background:'rgba(59,130,246,0.1)', color:DP.blue,
              border:`1px solid rgba(59,130,246,0.3)`,
              padding:'10px 24px', borderRadius:8, fontSize:12, fontWeight:800,
              cursor:'pointer', fontFamily:DP.font
            }}>{pwLoad ? 'Modification...' : '🔑 Modifier le mot de passe'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}