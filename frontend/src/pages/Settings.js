import React, { useState } from 'react';

const DP = {
  gold:'#f5a623', goldGlow:'rgba(245,166,35,0.12)',
  dark:'#16120d', card:'#ffffff', border:'#ede8df',
  text:'#1a160e', muted:'#9c8f7a', green:'#22c55e',
  blue:'#3b82f6', red:'#ef4444',
  font:"'Montserrat','Open Sans',sans-serif",
};

function Toggle({ value, onChange }) {
  return (
    <div onClick={() => onChange(!value)} style={{
      width:40, height:22, borderRadius:11, cursor:'pointer',
      background: value ? DP.gold : '#e2ddd6',
      position:'relative', transition:'background 0.2s', flexShrink:0
    }}>
      <div style={{
        position:'absolute', top:3, left: value ? 21 : 3,
        width:16, height:16, borderRadius:'50%',
        background:'white', transition:'left 0.2s',
        boxShadow:'0 1px 4px rgba(0,0,0,0.15)'
      }} />
    </div>
  );
}

export default function Settings() {
  const [notifs, setNotifs] = useState({
    email:    true,
    sms:      false,
    push:     true,
    rapports: true,
    alertes:  true,
  });

  const [theme, setTheme]   = useState('light');
  const [lang,  setLang]    = useState('fr');
  const [saved, setSaved]   = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ fontFamily:DP.font, color:DP.text, maxWidth:680 }}>

      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:20, fontWeight:900, margin:'0 0 4px' }}>Paramètres</h1>
        <p style={{ color:DP.muted, fontSize:12, margin:0 }}>Personnalisez votre expérience DigiPip</p>
      </div>

      {saved && (
        <div style={{ background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.25)', borderRadius:10, padding:'12px 16px', marginBottom:16, color:DP.green, fontSize:13, fontWeight:700 }}>
          ✅ Paramètres sauvegardés !
        </div>
      )}

      {/* Notifications */}
      <div style={{ background:DP.card, border:`1px solid ${DP.border}`, borderRadius:16, padding:24, marginBottom:16 }}>
        <h3 style={{ fontSize:14, fontWeight:800, margin:'0 0 4px', color:DP.text }}>🔔 Notifications</h3>
        <p style={{ fontSize:11, color:DP.muted, margin:'0 0 18px' }}>Choisissez comment recevoir vos alertes</p>
        <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
          {[
            { key:'email',    label:'Notifications Email',       desc:'Recevoir les alertes par email' },
            { key:'sms',      label:'Notifications SMS',         desc:'Recevoir les alertes par SMS' },
            { key:'push',     label:'Notifications Push',        desc:'Alertes en temps réel dans le navigateur' },
            { key:'rapports', label:'Rapports hebdomadaires',    desc:'Résumé des performances chaque semaine' },
            { key:'alertes',  label:'Alertes campagnes',         desc:'Notification à chaque envoi de campagne' },
          ].map((n, i, arr) => (
            <div key={n.key} style={{
              display:'flex', justifyContent:'space-between', alignItems:'center',
              padding:'14px 0',
              borderBottom: i < arr.length-1 ? `1px solid ${DP.border}` : 'none'
            }}>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:DP.text }}>{n.label}</div>
                <div style={{ fontSize:11, color:DP.muted, marginTop:2 }}>{n.desc}</div>
              </div>
              <Toggle value={notifs[n.key]} onChange={v => setNotifs({...notifs, [n.key]:v})} />
            </div>
          ))}
        </div>
      </div>

      {/* Apparence */}
      <div style={{ background:DP.card, border:`1px solid ${DP.border}`, borderRadius:16, padding:24, marginBottom:16 }}>
        <h3 style={{ fontSize:14, fontWeight:800, margin:'0 0 4px', color:DP.text }}>🎨 Apparence</h3>
        <p style={{ fontSize:11, color:DP.muted, margin:'0 0 18px' }}>Thème et langue de l'interface</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <div>
            <label style={{ fontSize:10, fontWeight:700, color:DP.muted, textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:8 }}>Thème</label>
            <div style={{ display:'flex', gap:8 }}>
              {[
                { value:'light', icon:'☀️', label:'Clair' },
                { value:'dark',  icon:'🌙', label:'Sombre' },
              ].map(t => (
                <div key={t.value} onClick={() => setTheme(t.value)} style={{
                  flex:1, padding:'10px', borderRadius:10, cursor:'pointer', textAlign:'center',
                  border:`2px solid ${theme===t.value ? DP.gold : DP.border}`,
                  background: theme===t.value ? DP.goldGlow : 'white',
                  transition:'all 0.2s'
                }}>
                  <div style={{ fontSize:18, marginBottom:4 }}>{t.icon}</div>
                  <div style={{ fontSize:11, fontWeight:700, color: theme===t.value ? '#d97706' : DP.muted }}>{t.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize:10, fontWeight:700, color:DP.muted, textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:8 }}>Langue</label>
            <select value={lang} onChange={e=>setLang(e.target.value)}
              style={{ width:'100%', padding:'10px 12px', border:`1px solid ${DP.border}`, borderRadius:8, fontSize:13, fontFamily:DP.font, background:'white', color:DP.text }}>
              <option value="fr">🇫🇷 Français</option>
              <option value="en">🇬🇧 English</option>
              <option value="ar">🇹🇳 العربية</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sécurité */}
      <div style={{ background:DP.card, border:`1px solid ${DP.border}`, borderRadius:16, padding:24, marginBottom:16 }}>
        <h3 style={{ fontSize:14, fontWeight:800, margin:'0 0 4px', color:DP.text }}>🔒 Sécurité</h3>
        <p style={{ fontSize:11, color:DP.muted, margin:'0 0 18px' }}>Gérez la sécurité de votre compte</p>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {[
            { icon:'🔑', label:'Double authentification (2FA)', desc:'Sécurisez votre compte avec un second facteur', badge:'Bientôt', badgeColor:DP.muted },
            { icon:'📱', label:'Sessions actives', desc:'Gérez les appareils connectés', badge:'1 session', badgeColor:DP.green },
            { icon:'📋', label:'Journal d\'activité', desc:'Voir l\'historique des connexions', badge:'Voir', badgeColor:DP.blue },
          ].map(s => (
            <div key={s.label} style={{
              display:'flex', justifyContent:'space-between', alignItems:'center',
              padding:'12px 14px', background:'#f9f7f3', borderRadius:10, border:`1px solid ${DP.border}`
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:DP.card, border:`1px solid ${DP.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:DP.text }}>{s.label}</div>
                  <div style={{ fontSize:10, color:DP.muted, marginTop:1 }}>{s.desc}</div>
                </div>
              </div>
              <span style={{ background:`${s.badgeColor}18`, color:s.badgeColor, padding:'3px 10px', borderRadius:20, fontSize:10, fontWeight:700 }}>{s.badge}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <div style={{ display:'flex', gap:10 }}>
        <button onClick={handleSave} style={{
          background:DP.gold, color:DP.dark, border:'none',
          padding:'11px 28px', borderRadius:10, fontSize:12, fontWeight:800,
          cursor:'pointer', fontFamily:DP.font
        }}>💾 Sauvegarder les paramètres</button>
        <button onClick={() => window.location.reload()} style={{
          background:'transparent', color:DP.muted, border:`1px solid ${DP.border}`,
          padding:'11px 20px', borderRadius:10, fontSize:12, cursor:'pointer', fontFamily:DP.font
        }}>Annuler</button>
      </div>
    </div>
  );
}
