import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const DP = {
  gold:     '#f5a623',
  goldDark: '#d4881a',
  goldGlow: 'rgba(245,166,35,0.12)',
  dark:     '#16120d',
  bg:       '#f6f3ee',
  card:     '#ffffff',
  border:   '#ede8df',
  text:     '#1a160e',
  muted:    '#9c8f7a',
  blue:     '#3b82f6',
  green:    '#22c55e',
  red:      '#ef4444',
  font:     "'Montserrat', 'Open Sans', sans-serif",
};

const TYPE = {
  email: { label: 'Email', icon: '📧', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  sms:   { label: 'SMS',   icon: '📱', color: '#22c55e', bg: 'rgba(34,197,94,0.1)'  },
  push:  { label: 'Push',  icon: '🔔', color: '#f5a623', bg: 'rgba(245,166,35,0.1)' },
};

const STATUS_STYLE = {
  sent:      { bg: 'rgba(34,197,94,0.1)',   color: '#16a34a', label: 'Envoyée'   },
  scheduled: { bg: 'rgba(59,130,246,0.1)',  color: '#2563eb', label: 'Planifiée' },
  draft:     { bg: 'rgba(245,166,35,0.1)',  color: '#d97706', label: 'Brouillon' },
};

/* ── Pill ── */
function Pill({ text, bg, color }) {
  return (
    <span style={{ background: bg, color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'inline-block' }}>
      {text}
    </span>
  );
}

/* ── Carte campagne pour CLIENT ── */
function ClientCampagneCard({ campagne, inscriptions, onInscrire, loadingId }) {
  const navigate  = useNavigate();
  const tc        = TYPE[campagne.type?.toLowerCase()] || TYPE.email;
  const isInscrit = inscriptions.includes(campagne.id);
  const isLoading = loadingId === campagne.id;

  return (
    <div style={{
      background: DP.card, border: `1px solid ${isInscrit ? 'rgba(34,197,94,0.3)' : DP.border}`,
      borderRadius: 14, padding: '18px', transition: 'all 0.2s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <span style={{ background: tc.bg, color: tc.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
          {tc.icon} {tc.label}
        </span>
        {isInscrit && (
          <span style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
            ✅ Inscrit
          </span>
        )}
      </div>

      <h3 style={{ fontSize: 14, fontWeight: 800, color: DP.text, margin: '0 0 6px' }}>{campagne.title}</h3>

      {campagne.client?.name && (
        <div style={{ fontSize: 12, color: DP.muted, marginBottom: 10 }}>🏢 {campagne.client.name}</div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button
          onClick={() => navigate(`/campagnes/${campagne.id}`)}
          style={{ flex: 1, padding: '8px', borderRadius: 8, background: DP.bg, border: `1px solid ${DP.border}`, fontSize: 12, fontWeight: 600, color: DP.muted, cursor: 'pointer' }}>
          Voir détails
        </button>
        {!isInscrit ? (
          <button
            onClick={() => onInscrire(campagne)}
            disabled={isLoading}
            style={{ flex: 2, padding: '8px', borderRadius: 8, background: DP.gold, border: 'none', fontSize: 12, fontWeight: 800, color: DP.dark, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? 'Inscription...' : "✓ S'inscrire"}
          </button>
        ) : (
          <button
            onClick={() => navigate(`/campagnes/${campagne.id}`)}
            style={{ flex: 2, padding: '8px', borderRadius: 8, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', fontSize: 12, fontWeight: 700, color: '#16a34a', cursor: 'pointer' }}>
            ✅ Voir ma campagne
          </button>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
export default function MesCampagnes() {
  const navigate = useNavigate();

  // Récupérer le rôle depuis le token
  const token   = localStorage.getItem('token');
  const user    = JSON.parse(localStorage.getItem('user') || '{}');
  const role    = user.role || 'CLIENT';
  const isAdmin = role === 'ADMIN' || role === 'RESPONSABLE_MARKETING';

  const [campagnes,     setCampagnes]     = useState([]);
  const [inscriptions,  setInscriptions]  = useState([]); // IDs des campagnes où client est inscrit
  const [loading,       setLoading]       = useState(true);
  const [loadingId,     setLoadingId]     = useState(null);
  const [search,        setSearch]        = useState('');
  const [typeFilter,    setTypeFilter]    = useState('all');
  const [statusFilter,  setStatusFilter]  = useState('all');
  const [expandedClient, setExpandedClient] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isAdmin) {
          // Admin/Marketing → toutes les campagnes
          const res = await api.get('/api/campagnes');
          setCampagnes(Array.isArray(res.data) ? res.data : res.data.data || []);
        } else {
          // Client → campagnes publiques + ses inscriptions
          const [pubRes, inscRes] = await Promise.all([
            api.get('/api/campagnes/public'),
            api.get('/api/campagnes/mes-inscriptions').catch(() => ({ data: [] })),
          ]);
          setCampagnes(Array.isArray(pubRes.data) ? pubRes.data : []);
          const inscData = Array.isArray(inscRes.data) ? inscRes.data : [];
          setInscriptions(inscData.map(c => c.id));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdmin]);

  const handleInscrire = async (campagne) => {
    if (!token) { navigate('/login', { state: { from: '/mes-campagnes' } }); return; }
    setLoadingId(campagne.id);
    try {
      await api.post(`/api/campagnes/${campagne.id}/inscrire`);
      setInscriptions(prev => [...prev, campagne.id]);
    } catch (err) {
      if (err.response?.data?.message === 'Vous êtes déjà inscrit') {
        setInscriptions(prev => [...prev, campagne.id]);
      } else {
        alert('Erreur: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setLoadingId(null);
    }
  };

  // Filtrage
  const filtered = campagnes.filter(c => {
    const mT = typeFilter   === 'all' || c.type?.toLowerCase()   === typeFilter;
    const mS = statusFilter === 'all' || c.status?.toLowerCase() === statusFilter;
    const mQ = !search || c.title?.toLowerCase().includes(search.toLowerCase()) || c.client?.name?.toLowerCase().includes(search.toLowerCase());
    return mT && mS && mQ;
  });

  // Grouper par client (pour Admin/Marketing)
  const grouped = filtered.reduce((acc, c) => {
    const key = c.client?.name || 'Sans client';
    if (!acc[key]) acc[key] = { client: c.client, campagnes: [] };
    acc[key].campagnes.push(c);
    return acc;
  }, {});

  const firstName = user.name?.split(' ')[0] || '';

  return (
    <div style={{ fontFamily: DP.font, color: DP.text }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <p style={{ color: DP.muted, fontSize: 13, margin: 0 }}>
            {isAdmin
              ? 'Toutes les campagnes de chaque client sur la plateforme'
              : `Bonjour ${firstName} — campagnes disponibles & vos inscriptions`}
          </p>
        </div>
        {!isAdmin && (
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ background: DP.goldGlow, border: '1px solid rgba(245,166,35,0.3)', borderRadius: 10, padding: '7px 14px', fontSize: 12, fontWeight: 700, color: DP.goldDark }}>
              ✅ {inscriptions.length} inscription{inscriptions.length > 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>

      {/* Stats rapides — Admin/Marketing */}
      {isAdmin && !loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Total campagnes', value: campagnes.length,                                      color: DP.gold,  bg: DP.goldGlow,               icon: '📢' },
            { label: 'Envoyées',        value: campagnes.filter(c => c.status === 'sent').length,      color: DP.green, bg: 'rgba(34,197,94,0.1)',      icon: '✅' },
            { label: 'Planifiées',      value: campagnes.filter(c => c.status === 'scheduled').length, color: DP.blue,  bg: 'rgba(59,130,246,0.1)',     icon: '🕐' },
            { label: 'Clients actifs',  value: Object.keys(grouped).length,                           color: '#8b5cf6',bg: 'rgba(139,92,246,0.1)',     icon: '🏢' },
          ].map(s => (
            <div key={s.label} style={{ background: DP.card, border: `1px solid ${DP.border}`, borderLeft: `3px solid ${s.color}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: DP.muted, marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 20, background: DP.card, border: `1px solid ${DP.border}`, borderRadius: 12, padding: '12px 16px' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher..."
          style={{ flex: 1, minWidth: 180, padding: '8px 12px', border: `1px solid ${DP.border}`, borderRadius: 8, fontSize: 13, fontFamily: DP.font, outline: 'none', background: DP.bg }} />

        <div style={{ display: 'flex', gap: 5 }}>
          {[['all','Tous'], ['email','📧 Email'], ['sms','📱 SMS'], ['push','🔔 Push']].map(([val, lbl]) => (
            <button key={val} onClick={() => setTypeFilter(val)} style={{ padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, border: `1px solid ${typeFilter === val ? DP.gold : DP.border}`, background: typeFilter === val ? DP.goldGlow : 'transparent', color: typeFilter === val ? DP.goldDark : DP.muted, cursor: 'pointer' }}>{lbl}</button>
          ))}
        </div>

        {isAdmin && (
          <div style={{ display: 'flex', gap: 5 }}>
            {[['all','Tous statuts'], ['sent','Envoyées'], ['scheduled','Planifiées'], ['draft','Brouillons']].map(([val, lbl]) => (
              <button key={val} onClick={() => setStatusFilter(val)} style={{ padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, border: `1px solid ${statusFilter === val ? DP.blue : DP.border}`, background: statusFilter === val ? 'rgba(59,130,246,0.1)' : 'transparent', color: statusFilter === val ? DP.blue : DP.muted, cursor: 'pointer' }}>{lbl}</button>
            ))}
          </div>
        )}
      </div>

      {/* Contenu */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: DP.muted }}>Chargement...</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: DP.card, borderRadius: 14, border: `1px solid ${DP.border}`, padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>📢</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Aucune campagne trouvée</div>
          <p style={{ fontSize: 13, color: DP.muted }}>Essayez un autre filtre ou revenez plus tard.</p>
        </div>

      ) : isAdmin ? (
        /* ── VUE ADMIN / MARKETING — groupée par client ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {Object.entries(grouped).map(([clientName, group]) => (
            <div key={clientName} style={{ background: DP.card, border: `1px solid ${DP.border}`, borderRadius: 16, overflow: 'hidden' }}>

              {/* En-tête client */}
              <div
                onClick={() => setExpandedClient(expandedClient === clientName ? null : clientName)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', cursor: 'pointer', borderBottom: expandedClient === clientName ? `1px solid ${DP.border}` : 'none', background: expandedClient === clientName ? DP.bg : DP.card, transition: 'background 0.15s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: DP.goldGlow, border: `1px solid rgba(245,166,35,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: DP.gold }}>
                    {clientName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: DP.text }}>🏢 {clientName}</div>
                    <div style={{ fontSize: 11, color: DP.muted, marginTop: 2 }}>
                      {group.campagnes.length} campagne{group.campagnes.length > 1 ? 's' : ''} ·{' '}
                      {group.campagnes.filter(c => c.status === 'sent').length} envoyée{group.campagnes.filter(c => c.status === 'sent').length > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {/* Compteurs par type */}
                  {['email', 'sms', 'push'].map(t => {
                    const count = group.campagnes.filter(c => c.type?.toLowerCase() === t).length;
                    if (!count) return null;
                    const tc = TYPE[t];
                    return (
                      <span key={t} style={{ background: tc.bg, color: tc.color, padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                        {tc.icon} {count}
                      </span>
                    );
                  })}
                  <span style={{ fontSize: 18, color: DP.muted, marginLeft: 8 }}>
                    {expandedClient === clientName ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {/* Campagnes du client */}
              {expandedClient === clientName && (
                <div style={{ padding: '16px 20px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['Titre', 'Canal', 'Statut', 'Date planifiée', 'Stats'].map(h => (
                          <th key={h} style={{ padding: '6px 12px', textAlign: 'left', fontSize: 10, color: DP.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', borderBottom: `1px solid ${DP.border}` }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {group.campagnes.map((c, i) => {
                        const tc = TYPE[c.type?.toLowerCase()] || TYPE.email;
                        const sc = STATUS_STYLE[c.status] || STATUS_STYLE.draft;
                        return (
                          <tr key={c.id} onClick={() => navigate(`/campagnes/${c.id}`)}
                            style={{ borderBottom: i < group.campagnes.length - 1 ? `1px solid ${DP.bg}` : 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = DP.bg}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 600, color: DP.text }}>{c.title}</td>
                            <td style={{ padding: '10px 12px' }}><Pill text={`${tc.icon} ${tc.label}`} bg={tc.bg} color={tc.color} /></td>
                            <td style={{ padding: '10px 12px' }}><Pill text={sc.label} bg={sc.bg} color={sc.color} /></td>
                            <td style={{ padding: '10px 12px', fontSize: 12, color: DP.muted }}>
                              {c.dateScheduled ? new Date(c.dateScheduled).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              {c.stats ? (
                                <div style={{ display: 'flex', gap: 8, fontSize: 11 }}>
                                  <span style={{ color: DP.blue }}>📧 {c.stats.emailsSent ?? 0}</span>
                                  <span style={{ color: DP.green }}>👁 {c.stats.opens ?? 0}</span>
                                  <span style={{ color: DP.gold }}>🖱 {c.stats.clicks ?? 0}</span>
                                </div>
                              ) : <span style={{ fontSize: 11, color: DP.muted }}>—</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>

      ) : (
        /* ── VUE CLIENT — grille campagnes avec bouton inscription ── */
        <div>
          {/* Mes inscriptions en haut */}
          {inscriptions.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: DP.text, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 3, height: 16, background: DP.green, borderRadius: 2, display: 'inline-block' }} />
                Mes inscriptions ({inscriptions.length})
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                {filtered.filter(c => inscriptions.includes(c.id)).map(c => (
                  <ClientCampagneCard key={c.id} campagne={c} inscriptions={inscriptions} onInscrire={handleInscrire} loadingId={loadingId} />
                ))}
              </div>
            </div>
          )}

          {/* Autres campagnes disponibles */}
          {filtered.filter(c => !inscriptions.includes(c.id)).length > 0 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: DP.text, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 3, height: 16, background: DP.gold, borderRadius: 2, display: 'inline-block' }} />
                Campagnes disponibles ({filtered.filter(c => !inscriptions.includes(c.id)).length})
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                {filtered.filter(c => !inscriptions.includes(c.id)).map(c => (
                  <ClientCampagneCard key={c.id} campagne={c} inscriptions={inscriptions} onInscrire={handleInscrire} loadingId={loadingId} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}