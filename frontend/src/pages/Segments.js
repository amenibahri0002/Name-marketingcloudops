import React, { useState, useEffect } from 'react';

/* ═══════════════════════════════════════════════════════════════
   DESIGN SYSTEM DIGILAB
   ═══════════════════════════════════════════════════════════════ */
const T = {
  bg:        '#f0f2f8',
  card:      '#ffffff',
  navy:      '#16120d',
  gold:      '#f5a623',
  goldDark:  '#c8831a',
  goldDim:   'rgba(245,166,35,0.10)',
  goldBorder:'rgba(245,166,35,0.28)',
  border:    '#e4e9f2',
  text:      '#1a1f3c',
  muted:     '#7a8599',
  blue:      '#3b82f6',
  blueDim:   'rgba(59,130,246,0.10)',
  green:     '#22c55e',
  greenDim:  'rgba(34,197,94,0.10)',
  red:       '#ef4444',
  redDim:    'rgba(239,68,68,0.10)',
  purple:    '#8b5cf6',
  purpleDim: 'rgba(139,92,246,0.10)',
  orange:    '#f97316',
  orangeDim: 'rgba(249,115,22,0.10)',
  teal:      '#14b8a6',
  tealDim:   'rgba(20,184,166,0.10)',
  sans:      "'Plus Jakarta Sans','Segoe UI',sans-serif",
};

/* ═══════════════════════════════════════════════════════════════
   CONFIGS SEGMENTATION
   ═══════════════════════════════════════════════════════════════ */

/* ─── Types de Client ───────────────────────────────────────── */
const CLIENT_TYPES = {
  entreprise:      { label: 'Entreprise',        icon: '🏢', color: '#3b82f6', bg: 'rgba(59,130,246,0.10)',  border: 'rgba(59,130,246,0.25)' },
  agence:          { label: 'Agence Marketing',  icon: '🏛️', color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)',  border: 'rgba(139,92,246,0.25)' },
  centre_formation:{ label: 'Centre de Formation',icon: '🎓', color: '#f97316', bg: 'rgba(249,115,22,0.10)',  border: 'rgba(249,115,22,0.25)' },
  association:     { label: 'Association',       icon: '🤝', color: '#22c55e', bg: 'rgba(34,197,94,0.10)',   border: 'rgba(34,197,94,0.25)' },
  particulier:     { label: 'Particulier',       icon: '👤', color: '#14b8a6', bg: 'rgba(20,184,166,0.10)',  border: 'rgba(20,184,166,0.25)' },
};

/* ─── Segments de Contact ───────────────────────────────────── */
const CONTACT_SEGMENTS = {
  etudiant:    { label: 'Étudiant',    icon: '🎓', color: '#3b82f6', bg: 'rgba(59,130,246,0.10)',  border: 'rgba(59,130,246,0.25)' },
  employe:     { label: 'Employé',     icon: '💼', color: '#22c55e', bg: 'rgba(34,197,94,0.10)',   border: 'rgba(34,197,94,0.25)' },
  manager:     { label: 'Manager',     icon: '👔', color: '#f5a623', bg: 'rgba(245,166,35,0.10)',  border: 'rgba(245,166,35,0.25)' },
  entrepreneur:{ label: 'Entrepreneur',icon: '🚀', color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)',  border: 'rgba(139,92,246,0.25)' },
  autre:       { label: 'Autre',       icon: '❓', color: '#6b7280', bg: 'rgba(107,114,128,0.10)', border: 'rgba(107,114,128,0.25)' },
};

/* ─── Secteurs d'activité ──────────────────────────────────── */
const SECTEURS = [
  'Télécommunications', 'Finance', 'Marketing Digital', 'Technologie',
  'Tourisme', 'Automobile', 'Éducation', 'Santé', 'Commerce', 'Industrie'
];

/* ─── Régions ──────────────────────────────────────────────── */
const REGIONS = ['Tunis', 'Sfax', 'Sousse', 'Nabeul', 'Bizerte', 'Gabès', 'Kairouan', 'Monastir'];

/* ─── Tailles d'organisation ─────────────────────────────── */
const TAILLES = ['1-10', '11-50', '51-200', '201-500', '500+', 'Particulier'];

/* ═══════════════════════════════════════════════════════════════
   DONNÉES UNIFIÉES - CLIENTS AVEC CONTACTS SEGMENTÉS
   ═══════════════════════════════════════════════════════════════ */
const DIGILAB_CLIENTS = [
  {
    id: 1,
    type: 'entreprise',
    name: 'Tunisie Telecom',
    email: 'marketing@tunisietelecom.tn',
    phone: '+216 71 000 000',
    sector: 'Télécommunications',
    region: 'Tunis',
    taille: '500+',
    centresInteret: ['Marketing Digital', 'Télécom', 'Formation'],
    status: 'active',
    createdAt: '2026-01-15',
    // Contacts segmentés automatiquement
    contacts: [
      { id: 101, name: 'Ahmed Ben Salah', email: 'ahmed@tt.tn', phone: '+216 20 111 222', segment: 'employe', departement: 'Marketing', niveau: 'professionnel', status: 'active' },
      { id: 102, name: 'Fatima Trabelsi', email: 'fatima@tt.tn', phone: '+216 21 333 444', segment: 'manager', departement: 'Digital', niveau: 'professionnel', status: 'active' },
      { id: 103, name: 'Karim Mansour', email: 'karim@tt.tn', phone: '+216 22 555 666', segment: 'employe', departement: 'IT', niveau: 'etudiant', status: 'inactive' },
    ],
  },
  {
    id: 2,
    type: 'agence',
    name: 'DigiLab Solutions',
    email: 'contact@digilab.tn',
    phone: '+216 74 600 500',
    sector: 'Marketing Digital',
    region: 'Sfax',
    taille: '11-50',
    centresInteret: ['IA', 'Marketing', 'Formation', 'Web'],
    status: 'active',
    createdAt: '2026-01-10',
    contacts: [
      { id: 104, name: 'Ameni Bahri', email: 'ameni@digilab.tn', phone: '+216 20 777 888', segment: 'entrepreneur', departement: 'Direction', niveau: 'professionnel', status: 'active' },
      { id: 105, name: 'Yasmine Khemiri', email: 'yasmine@digilab.tn', phone: '+216 21 999 000', segment: 'employe', departement: 'Marketing', niveau: 'professionnel', status: 'active' },
    ],
  },
  {
    id: 3,
    type: 'entreprise',
    name: 'Banque Zitouna',
    email: 'digital@zitouna.tn',
    phone: '+216 71 111 222',
    sector: 'Finance',
    region: 'Tunis',
    taille: '500+',
    centresInteret: ['Finance Islamique', 'Digital Banking', 'Marketing'],
    status: 'active',
    createdAt: '2026-02-01',
    contacts: [
      { id: 106, name: 'Hassan Belhadj', email: 'hassan@zitouna.tn', phone: '+216 23 111 222', segment: 'manager', departement: 'Digital', niveau: 'professionnel', status: 'active' },
    ],
  },
  {
    id: 4,
    type: 'entreprise',
    name: 'Ooredoo Tunisie',
    email: 'marketing@ooredoo.tn',
    phone: '+216 71 333 444',
    sector: 'Télécommunications',
    region: 'Tunis',
    taille: '500+',
    centresInteret: ['Télécom', 'Jeunes', 'Digital'],
    status: 'active',
    createdAt: '2026-01-20',
    contacts: [
      { id: 107, name: 'Ahmed Ben Salah', email: 'ahmed@ooredoo.tn', phone: '+216 24 444 555', segment: 'employe', departement: 'Marketing', niveau: 'professionnel', status: 'active' },
      { id: 108, name: 'Mohamed Ali', email: 'mohamed@ooredoo.tn', phone: '+216 25 666 777', segment: 'etudiant', departement: 'Stage', niveau: 'etudiant', status: 'active' },
    ],
  },
  {
    id: 5,
    type: 'centre_formation',
    name: 'Medina Tech',
    email: 'contact@medinatech.tn',
    phone: '+216 71 555 666',
    sector: 'Éducation',
    region: 'Sfax',
    taille: '51-200',
    centresInteret: ['Technologie', 'Formation', 'Startup'],
    status: 'active',
    createdAt: '2026-03-01',
    contacts: [
      { id: 109, name: 'Sami Dridi', email: 'sami@medinatech.tn', phone: '+216 26 888 999', segment: 'etudiant', departement: 'Étudiant', niveau: 'etudiant', status: 'active' },
      { id: 110, name: 'Yasmine Khemiri', email: 'yasmine@medinatech.tn', phone: '+216 27 111 222', segment: 'etudiant', departement: 'Étudiant', niveau: 'etudiant', status: 'active' },
    ],
  },
  {
    id: 6,
    type: 'association',
    name: 'StartUp Sfax',
    email: 'hello@startupsfax.tn',
    phone: '+216 74 111 222',
    sector: 'Technologie',
    region: 'Sfax',
    taille: '1-10',
    centresInteret: ['Startup', 'Entrepreneuriat', 'Innovation'],
    status: 'active',
    createdAt: '2026-04-01',
    contacts: [
      { id: 111, name: 'Yasmine Khemiri', email: 'yasmine@startupsfax.tn', phone: '+216 29 444 555', segment: 'entrepreneur', departement: 'Fondatrice', niveau: 'professionnel', status: 'active' },
    ],
  },
  {
    id: 7,
    type: 'particulier',
    name: 'Ahmed Ben Salah',
    email: 'ahmed.bensalah@gmail.com',
    phone: '+216 20 111 222',
    sector: 'Marketing Digital',
    region: 'Tunis',
    taille: 'Particulier',
    centresInteret: ['Formation', 'Marketing', 'IA'],
    status: 'active',
    createdAt: '2026-02-15',
    contacts: [
      { id: 112, name: 'Ahmed Ben Salah', email: 'ahmed.bensalah@gmail.com', phone: '+216 20 111 222', segment: 'employe', departement: 'Indépendant', niveau: 'professionnel', status: 'active' },
    ],
  },
  {
    id: 8,
    type: 'particulier',
    name: 'Fatima Trabelsi',
    email: 'fatima.trabelsi@yahoo.fr',
    phone: '+216 21 333 444',
    sector: 'Consulting',
    region: 'Sousse',
    taille: 'Particulier',
    centresInteret: ['Consulting', 'Formation', 'Digital'],
    status: 'active',
    createdAt: '2026-02-20',
    contacts: [
      { id: 113, name: 'Fatima Trabelsi', email: 'fatima.trabelsi@yahoo.fr', phone: '+216 21 333 444', segment: 'entrepreneur', departement: 'Consultante', niveau: 'professionnel', status: 'active' },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
const AVATAR_COLORS = [T.gold, T.blue, T.green, T.purple, T.orange, T.teal, '#ec4899', '#6366f1'];
const avatarColor = n => AVATAR_COLORS[(n?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const initials = n => n ? n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '??';
const fmtDate = d => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

function Skel({ w = '100%', h = 16, r = 6 }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg,#eef1f8 25%,#f6f8fd 50%,#eef1f8 75%)', backgroundSize: '500px 100%', animation: 'shimmer 1.4s infinite linear' }} />;
}

function Pill({ label, color, bg, border }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 700, color,
      background: bg, border: `1px solid ${border}`,
      whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MODAL: DÉTAIL CLIENT (avec segmentation des contacts)
   ═══════════════════════════════════════════════════════════════ */
function ClientDetailModal({ client, onClose }) {
  const [activeTab, setActiveTab] = useState('contacts');
  const typeInfo = CLIENT_TYPES[client.type];

  const tabs = [
    ['contacts', '👥 Contacts segmentés', client.contacts.length],
    ['infos', 'ℹ️ Informations', null],
  ];

  // Répartition des contacts par segment
  const segmentCounts = client.contacts.reduce((acc, c) => {
    acc[c.segment] = (acc[c.segment] || 0) + 1;
    return acc;
  }, {});

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(10,14,42,0.55)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{
        background: T.card, borderRadius: 22, width: 850, maxHeight: '90vh',
        boxShadow: '0 24px 80px rgba(10,14,42,0.25)', border: `1.5px solid ${T.border}`,
        animation: 'slideUp 0.3s ease', overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ background: T.navy, padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: `${avatarColor(client.name)}20`,
              border: `2px solid ${avatarColor(client.name)}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 800, color: avatarColor(client.name),
            }}>{initials(client.name)}</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{client.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                <Pill label={`${typeInfo?.icon} ${typeInfo?.label}`} color={typeInfo?.color} bg={typeInfo?.bg} border={typeInfo?.border} />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{client.sector}</span>
                <span style={{ fontSize: 12, color: client.status === 'active' ? T.green : T.red }}>
                  {client.status === 'active' ? '🟢 Actif' : '🔴 Inactif'}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: T.border }}>
          {[
            { label: 'Contacts', value: client.contacts.length, color: T.blue },
            { label: 'Région', value: client.region, color: T.green },
            { label: 'Taille', value: client.taille, color: T.purple },
            { label: 'Inscrit le', value: fmtDate(client.createdAt), color: T.gold },
          ].map((s, i) => (
            <div key={i} style={{ background: '#fafbfd', padding: '16px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Répartition par segment */}
        <div style={{ padding: '16px 28px', background: '#fafbfd', borderBottom: `1.5px solid ${T.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 10 }}>Répartition des contacts par segment</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(segmentCounts).map(([seg, count]) => {
              const segInfo = CONTACT_SEGMENTS[seg];
              return (
                <div key={seg} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 20,
                  background: segInfo?.bg, border: `1px solid ${segInfo?.border}`,
                }}>
                  <span style={{ fontSize: 14 }}>{segInfo?.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: segInfo?.color }}>{segInfo?.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: T.text }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1.5px solid ${T.border}`, background: '#fafbfd' }}>
          {tabs.map(([key, label, count]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              style={{
                padding: '14px 20px', border: 'none', background: 'none',
                fontSize: 13, fontWeight: activeTab === key ? 700 : 500,
                color: activeTab === key ? T.goldDark : T.muted,
                borderBottom: `2px solid ${activeTab === key ? T.gold : 'transparent'}`,
                cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
              {label}
              {count !== null && (
                <span style={{
                  background: activeTab === key ? T.goldDim : 'rgba(107,114,128,0.1)',
                  color: activeTab === key ? T.goldDark : T.muted,
                  padding: '1px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                }}>{count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          
          {/* TAB: CONTACTS SEGMENTÉS */}
          {activeTab === 'contacts' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text, margin: 0 }}>
                    Contacts segmentés · {client.name}
                  </h3>
                  <p style={{ fontSize: 12, color: T.muted, margin: '4px 0 0' }}>
                    Segmentation automatique : Type de client → Secteur → Région → Taille → Centres d'intérêt
                  </p>
                </div>
                <Pill label="🔒 Données isolées" color={T.green} bg={T.greenDim} border="rgba(34,197,94,0.25)" />
              </div>

              {client.contacts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: T.muted }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
                  <div>Aucun contact</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {client.contacts.map(contact => {
                    const seg = CONTACT_SEGMENTS[contact.segment];
                    return (
                      <div key={contact.id} style={{
                        background: '#fafbfd', borderRadius: 12,
                        border: `1px solid ${T.border}`, padding: '14px 18px',
                        display: 'flex', alignItems: 'center', gap: 14,
                      }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%',
                          background: `${avatarColor(contact.name)}15`,
                          border: `1.5px solid ${avatarColor(contact.name)}30`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, fontWeight: 700, color: avatarColor(contact.name),
                          flexShrink: 0,
                        }}>{initials(contact.name)}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{contact.name}</div>
                          <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                            {contact.email} · {contact.phone}
                          </div>
                          <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>
                            {contact.departement} · {contact.niveau}
                          </div>
                        </div>
                        <Pill label={`${seg?.icon} ${seg?.label}`} color={seg?.color} bg={seg?.bg} border={seg?.border} />
                        <Pill label={contact.status === 'active' ? '✓ Actif' : '✕ Inactif'} 
                          color={contact.status === 'active' ? T.green : T.red}
                          bg={contact.status === 'active' ? T.greenDim : T.redDim}
                          border={contact.status === 'active' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: INFOS */}
          {activeTab === 'infos' && (
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text, margin: '0 0 16px' }}>Informations de segmentation</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Type de client', value: `${typeInfo?.icon} ${typeInfo?.label}` },
                  { label: 'Secteur d\'activité', value: client.sector },
                  { label: 'Région', value: client.region },
                  { label: 'Taille', value: client.taille },
                  { label: 'Email', value: client.email },
                  { label: 'Téléphone', value: client.phone },
                ].map((info, i) => (
                  <div key={i} style={{ background: '#fafbfd', borderRadius: 10, padding: '14px 18px', border: `1px solid ${T.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{info.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{info.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Centres d'intérêt</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {client.centresInteret.map((ci, i) => (
                    <span key={i} style={{ padding: '6px 14px', background: T.goldDim, borderRadius: 20, fontSize: 12, fontWeight: 700, color: T.goldDark, border: `1px solid ${T.goldBorder}` }}>
                      {ci}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MODAL: Ajout / Édition client avec segmentation
   ═══════════════════════════════════════════════════════════════ */
function ClientModal({ client, onClose, onSave }) {
  const isEdit = !!client;
  const [form, setForm] = useState({
    type: client?.type || 'entreprise',
    name: client?.name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    sector: client?.sector || '',
    region: client?.region || 'Tunis',
    taille: client?.taille || '11-50',
    centresInteret: client?.centresInteret || [],
    status: client?.status || 'active',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Nom requis';
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email invalide';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handle = () => {
    if (!validate()) return;
    setSaving(true);

    const newClient = {
      id: isEdit ? client.id : Date.now(),
      ...form,
      createdAt: isEdit ? client.createdAt : new Date().toISOString(),
      contacts: isEdit ? client.contacts : [],
    };

    setTimeout(() => {
      onSave(newClient, isEdit);
      setSaving(false);
      onClose();
    }, 500);
  };

  const toggleInteret = (interet) => {
    setForm(p => ({
      ...p,
      centresInteret: p.centresInteret.includes(interet)
        ? p.centresInteret.filter(i => i !== interet)
        : [...p.centresInteret, interet]
    }));
  };

  const Field = ({ fkey, label, placeholder, type = 'text' }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: T.text, display: 'block', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</label>
      <input
        type={type} placeholder={placeholder} value={form[fkey]}
        onChange={e => { setForm(p => ({ ...p, [fkey]: e.target.value })); setErrors(p => ({ ...p, [fkey]: '' })); }}
        style={{
          width: '100%', padding: '10px 14px',
          border: `1.5px solid ${errors[fkey] ? T.red : T.border}`, borderRadius: 10,
          fontSize: 13, color: T.text, background: errors[fkey] ? 'rgba(239,68,68,0.03)' : '#fafbfd',
          boxSizing: 'border-box', fontFamily: T.sans, outline: 'none',
        }}
        onFocus={e => e.target.style.borderColor = errors[fkey] ? T.red : T.gold}
        onBlur={e => e.target.style.borderColor = errors[fkey] ? T.red : T.border}
      />
      {errors[fkey] && <div style={{ fontSize: 11, color: T.red, marginTop: 4 }}>⚠ {errors[fkey]}</div>}
    </div>
  );

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(10,14,42,0.55)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{
        background: T.card, borderRadius: 22, width: 520, maxHeight: '90vh', overflowY: 'auto',
        padding: '32px', boxShadow: '0 24px 80px rgba(10,14,42,0.25)', border: `1.5px solid ${T.border}`,
        animation: 'slideUp 0.3s ease',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 26 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: T.goldDim, border: `1px solid ${T.goldBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              {isEdit ? '✏️' : '👤'}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.text }}>{isEdit ? 'Modifier' : 'Nouveau'} client</div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Segmentation automatique</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: `1.5px solid ${T.border}`, background: 'none', cursor: 'pointer', fontSize: 14, color: T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {/* Type de client */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.text, display: 'block', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Type de client *</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {Object.entries(CLIENT_TYPES).map(([key, info]) => (
              <button key={key} onClick={() => setForm(p => ({ ...p, type: key }))}
                style={{
                  padding: '12px', borderRadius: 10,
                  border: `2px solid ${form.type === key ? info.color : T.border}`,
                  background: form.type === key ? info.bg : '#fff',
                  color: form.type === key ? info.color : T.muted,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                <span style={{ fontSize: 16 }}>{info.icon}</span>
                {info.label}
              </button>
            ))}
          </div>
        </div>

        <Field fkey="name" label="Nom / Raison sociale *" placeholder="Ex: DigiLab Solutions" />
        <Field fkey="email" label="Email" placeholder="contact@exemple.com" type="email" />
        <Field fkey="phone" label="Téléphone" placeholder="+216 XX XXX XXX" type="tel" />

        {/* Secteur & Région */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.text, display: 'block', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Secteur</label>
            <select value={form.sector} onChange={e => setForm(p => ({ ...p, sector: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.text, background: '#fafbfd', boxSizing: 'border-box', fontFamily: T.sans }}>
              <option value="">Sélectionner...</option>
              {SECTEURS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.text, display: 'block', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Région</label>
            <select value={form.region} onChange={e => setForm(p => ({ ...p, region: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.text, background: '#fafbfd', boxSizing: 'border-box', fontFamily: T.sans }}>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* Taille */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.text, display: 'block', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Taille</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TAILLES.map(t => (
              <button key={t} onClick={() => setForm(p => ({ ...p, taille: t }))}
                style={{
                  padding: '8px 16px', borderRadius: 20,
                  border: `2px solid ${form.taille === t ? T.gold : T.border}`,
                  background: form.taille === t ? T.goldDim : '#fff',
                  color: form.taille === t ? T.goldDark : T.muted,
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Centres d'intérêt */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.text, display: 'block', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Centres d'intérêt</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['Marketing', 'Digital', 'IA', 'Formation', 'Web', 'Télécom', 'Finance', 'Startup'].map(ci => (
              <button key={ci} onClick={() => toggleInteret(ci)}
                style={{
                  padding: '6px 14px', borderRadius: 20,
                  border: `2px solid ${form.centresInteret.includes(ci) ? T.gold : T.border}`,
                  background: form.centresInteret.includes(ci) ? T.goldDim : '#fff',
                  color: form.centresInteret.includes(ci) ? T.goldDark : T.muted,
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}>
                {form.centresInteret.includes(ci) ? '✓ ' : ''}{ci}
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.text, display: 'block', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Statut</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {['active', 'inactive'].map(st => (
              <button key={st} onClick={() => setForm(p => ({ ...p, status: st }))}
                style={{
                  flex: 1, padding: '10px', borderRadius: 10,
                  border: `2px solid ${form.status === st ? (st === 'active' ? T.green : T.red) : T.border}`,
                  background: form.status === st ? (st === 'active' ? T.greenDim : T.redDim) : '#fff',
                  color: form.status === st ? (st === 'active' ? T.green : T.red) : T.muted,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}>
                {st === 'active' ? '🟢 Actif' : '🔴 Inactif'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 10, border: `1.5px solid ${T.border}`, background: 'none', fontSize: 13, fontWeight: 700, color: T.muted, cursor: 'pointer' }}>Annuler</button>
          <button onClick={handle} disabled={saving} style={{
            flex: 2, padding: '11px', borderRadius: 10, border: 'none',
            background: saving ? T.muted : T.gold, fontSize: 13, fontWeight: 800, color: T.navy,
            cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: saving ? 'none' : '0 4px 14px rgba(245,166,35,0.30)',
          }}>
            {saving ? '⏳ ...' : isEdit ? '✓ Enregistrer' : '+ Créer'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE SEGMENTS (Clients + Contacts unifiés avec segmentation)
   ═══════════════════════════════════════════════════════════════ */
export default function Segments() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [detailClient, setDetailClient] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [segmentFilter, setSegmentFilter] = useState('all');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

  useEffect(() => {
    const timer = setTimeout(() => {
      setClients(DIGILAB_CLIENTS);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = (newClient, isEdit) => {
    if (isEdit) {
      setClients(prev => prev.map(c => c.id === newClient.id ? newClient : c));
    } else {
      setClients(prev => [...prev, newClient]);
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm('Supprimer ce client ? Tous ses contacts seront supprimés.')) return;
    setClients(prev => prev.filter(c => c.id !== id));
  };

  // Recalcul automatique des segments
  const filtered = clients.filter(c => {
    const mSearch = c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase());
    const mType = typeFilter === 'all' || c.type === typeFilter;
    const mSegment = segmentFilter === 'all' || c.contacts.some(contact => contact.segment === segmentFilter);
    const mSector = sectorFilter === 'all' || c.sector === sectorFilter;
    const mRegion = regionFilter === 'all' || c.region === regionFilter;
    return mSearch && mType && mSegment && mSector && mRegion;
  });

  const totalContacts = clients.reduce((a, c) => a + c.contacts.length, 0);

  // Stats par type de client
  const stats = [
    { label: 'Total clients', value: clients.length, color: T.gold, dim: T.goldDim, icon: '🏢' },
    { label: 'Total contacts', value: totalContacts, color: T.blue, dim: T.blueDim, icon: '👥' },
    { label: 'Entreprises', value: clients.filter(c => c.type === 'entreprise').length, color: T.purple, dim: T.purpleDim, icon: '🏢' },
    { label: 'Particuliers', value: clients.filter(c => c.type === 'particulier').length, color: T.teal, dim: T.tealDim, icon: '👤' },
  ];

  return (
    <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 32px', fontFamily: T.sans, color: T.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes shimmer { 0%{background-position:-500px 0} 100%{background-position:500px 0} }
        .kcard:hover { transform:translateY(-3px)!important; box-shadow:0 8px 28px rgba(245,166,35,0.14)!important; border-color:#f5a623!important; }
        .crow:hover td { background:rgba(245,166,35,0.03)!important; }
      `}</style>

      {/* Modals */}
      {modal && <ClientModal client={modal === 'add' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}
      {detailClient && <ClientDetailModal client={detailClient} onClose={() => setDetailClient(null)} />}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, animation: 'fadeUp 0.35s ease both' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
            <div style={{ width: 4, height: 24, background: `linear-gradient(180deg,${T.gold},${T.goldDark})`, borderRadius: 2 }} />
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Segments DigiLab</h1>
          </div>
          <p style={{ color: T.muted, fontSize: 13, margin: '0 0 0 14px' }}>
            Segmentation clients & contacts · {clients.length} clients · {totalContacts} contacts · Recalcul automatique
          </p>
        </div>
        <button onClick={() => setModal('add')} style={{
          background: T.gold, color: T.navy, border: 'none',
          padding: '11px 22px', borderRadius: 11, fontSize: 13, fontWeight: 800,
          cursor: 'pointer', boxShadow: '0 4px 14px rgba(245,166,35,0.25)',
          display: 'flex', alignItems: 'center', gap: 7,
        }}>
          <span style={{ fontSize: 16 }}>+</span> Ajouter
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
        {stats.map((s, i) => (
          <div key={i} className="kcard" style={{
            background: T.card, borderRadius: 14, border: `1.5px solid ${T.border}`,
            padding: '18px 20px', boxShadow: '0 1px 8px rgba(10,14,42,0.06)',
            display: 'flex', alignItems: 'center', gap: 14,
            animation: `fadeUp 0.4s ease ${i * 65}ms both`,
          }}>
            <div style={{ width: 46, height: 46, borderRadius: '50%', background: s.dim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1 }}>
                {loading ? <Skel w={40} h={24} /> : s.value.toLocaleString('fr-FR')}
              </div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtres de segmentation */}
      <div style={{
        background: T.card, borderRadius: 14, border: `1.5px solid ${T.border}`,
        padding: '16px', marginBottom: 18,
        boxShadow: '0 1px 8px rgba(10,14,42,0.05)',
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 12, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          🔍 Filtres de segmentation (recalcul automatique)
        </div>
        
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Recherche */}
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: T.muted }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
              style={{
                width: '100%', padding: '9px 14px 9px 36px',
                border: `1.5px solid ${T.border}`, borderRadius: 10,
                fontSize: 13, color: T.text, background: '#fafbfd',
                boxSizing: 'border-box', fontFamily: T.sans,
              }}
              onFocus={e => e.target.style.borderColor = T.gold}
              onBlur={e => e.target.style.borderColor = T.border}
            />
          </div>

          {/* Type de client */}
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            style={{ padding: '9px 14px', borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 13, color: T.text, background: '#fafbfd', fontFamily: T.sans, cursor: 'pointer' }}>
            <option value="all">Tous types</option>
            {Object.entries(CLIENT_TYPES).map(([key, info]) => (
              <option key={key} value={key}>{info.icon} {info.label}</option>
            ))}
          </select>

          {/* Segment de contact */}
          <select value={segmentFilter} onChange={e => setSegmentFilter(e.target.value)}
            style={{ padding: '9px 14px', borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 13, color: T.text, background: '#fafbfd', fontFamily: T.sans, cursor: 'pointer' }}>
            <option value="all">Tous segments</option>
            {Object.entries(CONTACT_SEGMENTS).map(([key, info]) => (
              <option key={key} value={key}>{info.icon} {info.label}</option>
            ))}
          </select>

          {/* Secteur */}
          <select value={sectorFilter} onChange={e => setSectorFilter(e.target.value)}
            style={{ padding: '9px 14px', borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 13, color: T.text, background: '#fafbfd', fontFamily: T.sans, cursor: 'pointer' }}>
            <option value="all">Tous secteurs</option>
            {SECTEURS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Région */}
          <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)}
            style={{ padding: '9px 14px', borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 13, color: T.text, background: '#fafbfd', fontFamily: T.sans, cursor: 'pointer' }}>
            <option value="all">Toutes régions</option>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <span style={{ fontSize: 12, color: T.muted }}>{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: T.card, borderRadius: 16, border: `1.5px solid ${T.border}`, boxShadow: '0 1px 8px rgba(10,14,42,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '13px 20px', borderBottom: `1.5px solid ${T.border}`, background: '#fafbfd' }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>Clients segmentés · <span style={{ fontSize: 11, fontWeight: 700, background: T.goldDim, color: T.goldDark, border: `1px solid ${T.goldBorder}`, padding: '2px 9px', borderRadius: 20 }}>{filtered.length}</span></span>
        </div>

        {loading ? (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Skel w={42} h={42} r={12} /><div style={{ flex: 1 }}><Skel h={13} w="35%" /></div>
                <Skel w={150} h={12} r={4} /><Skel w={60} h={24} r={20} /><Skel w={100} h={30} r={8} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: T.muted }}>
            <div style={{ fontSize: 44, opacity: 0.18, marginBottom: 14 }}>🎯</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Aucun résultat</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: T.navy }}>
                {['Client', 'Type', 'Secteur', 'Région', 'Taille', 'Contacts', 'Segments', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', color: T.gold }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const color = avatarColor(c.name);
                const typeInfo = CLIENT_TYPES[c.type];
                // Compte des segments de contacts
                const contactSegments = c.contacts.reduce((acc, contact) => {
                  acc[contact.segment] = (acc[contact.segment] || 0) + 1;
                  return acc;
                }, {});
                
                return (
                  <tr key={c.id} className="crow" style={{ borderBottom: `1px solid ${T.border}`, cursor: 'pointer' }}
                    onClick={() => setDetailClient(c)}>
                    <td style={{ padding: '13px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: `${color}15`, border: `1.5px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color }}>{initials(c.name)}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{c.name}</div>
                          <div style={{ fontSize: 11, color: T.muted }}>{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '13px 18px' }}>
                      <Pill label={`${typeInfo?.icon} ${typeInfo?.label}`} color={typeInfo?.color} bg={typeInfo?.bg} border={typeInfo?.border} />
                    </td>
                    <td style={{ padding: '13px 18px', fontSize: 13, color: T.text }}>{c.sector}</td>
                    <td style={{ padding: '13px 18px', fontSize: 13, color: T.muted }}>{c.region}</td>
                    <td style={{ padding: '13px 18px' }}>
                      <span style={{ background: T.purpleDim, color: T.purple, border: `1px solid rgba(139,92,246,0.25)`, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{c.taille}</span>
                    </td>
                    <td style={{ padding: '13px 18px' }}>
                      <span style={{ background: T.blueDim, color: T.blue, border: `1px solid rgba(59,130,246,0.25)`, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>👥 {c.contacts.length}</span>
                    </td>
                    <td style={{ padding: '13px 18px' }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {Object.entries(contactSegments).map(([seg, count]) => {
                          const segInfo = CONTACT_SEGMENTS[seg];
                          return (
                            <span key={seg} style={{ fontSize: 10, fontWeight: 700, color: segInfo?.color, background: segInfo?.bg, border: `1px solid ${segInfo?.border}`, padding: '2px 8px', borderRadius: 20 }}>
                              {segInfo?.icon} {count}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td style={{ padding: '13px 18px' }}>
                      <div style={{ display: 'flex', gap: 7 }}>
                        <button onClick={(e) => { e.stopPropagation(); setModal(c); }} style={{ background: T.blueDim, color: T.blue, border: `1px solid rgba(59,130,246,0.2)`, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>✏</button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }} style={{ background: T.redDim, color: T.red, border: `1px solid rgba(239,68,68,0.2)`, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>✕</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 32, padding: '20px 0', borderTop: `1px solid ${T.border}`, textAlign: 'center' }}>
        <span style={{ fontSize: 12, color: T.muted }}>
          © 2026 DigiLab Solutions · Segmentation automatique · DigiPip Cloud Engine
        </span>
      </div>
    </div>
  );
}