import React, { useState, useEffect } from 'react';
import api from '../api';

const gold = '#f5a623';
const dark = '#0A0A0A';
const white = '#FFFFFF';
const gray = '#F5F5F5';
const textGray = '#666666';

const ROLE_COLORS = {
  'ADMIN': { bg: '#FEE2E2', color: '#DC2626', border: '#EF4444', label: 'Administrateur' },
  'RESPONSABLE_MARKETING': { bg: '#FEF3C7', color: '#D97706', border: '#F59E0B', label: 'Resp. Marketing' },
  'CLIENT': { bg: '#DBEAFE', color: '#2563EB', border: '#3B82F6', label: 'Client' }
};

const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Administrateur', description: 'Accès complet à toutes les fonctionnalités' },
  { value: 'RESPONSABLE_MARKETING', label: 'Responsable Marketing', description: 'Gestion des campagnes et clients' },
  { value: 'CLIENT', label: 'Client', description: 'Accès aux formations et inscriptions' }
];

const FALLBACK_USERS = [
  { id: 1, name: 'Ahmed Ben Ali', email: 'ahmed@digilab.tn', role: 'CLIENT', clientId: 1, createdAt: '2026-01-15', status: 'active', lastLogin: '2026-06-08', type: 'particulier', secteur: 'Marketing Digital' },
  { id: 2, name: 'Fatima Trabelsi', email: 'fatima@digilab.tn', role: 'CLIENT', clientId: 2, createdAt: '2026-02-20', status: 'active', lastLogin: '2026-06-07', type: 'entreprise', secteur: 'E-commerce' },
  { id: 3, name: 'Karim Mansour', email: 'karim@digilab.tn', role: 'RESPONSABLE_MARKETING', clientId: null, createdAt: '2026-01-10', status: 'active', lastLogin: '2026-06-08', type: null, secteur: null },
  { id: 4, name: 'Leila Ben Ammar', email: 'leila@digilab.tn', role: 'CLIENT', clientId: 3, createdAt: '2026-03-05', status: 'inactive', lastLogin: '2026-05-20', type: 'agence', secteur: 'Design' },
  { id: 5, name: 'Sami Ben Salah', email: 'sami@digilab.tn', role: 'CLIENT', clientId: 4, createdAt: '2026-04-12', status: 'active', lastLogin: '2026-06-06', type: 'particulier', secteur: 'Développement' },
  { id: 6, name: 'Admin Principal', email: 'admin@digilab.tn', role: 'ADMIN', clientId: null, createdAt: '2025-12-01', status: 'active', lastLogin: '2026-06-08', type: null, secteur: null },
];

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('tous');
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [apiConnected, setApiConnected] = useState(false);

  const [newUser, setNewUser] = useState({
    name: '', email: '', password: '', role: 'CLIENT', clientId: '', type: 'particulier', secteur: ''
  });

  const [editUser, setEditUser] = useState({
    name: '', email: '', role: 'CLIENT', status: 'active'
  });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true); setError(null);
      const response = await api.get('/api/auth/users');
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setUsers(response.data); setApiConnected(true);
      } else {
        setUsers(FALLBACK_USERS); setApiConnected(false);
      }
    } catch (err) {
      setError('API non disponible - Mode hors ligne activé');
      setUsers(FALLBACK_USERS); setApiConnected(false);
      setTimeout(() => setError(null), 5000);
    } finally { setLoading(false); }
  };

  const filteredUsers = users.filter(user => {
    if (filter !== 'tous' && user.role !== filter) return false;
    if (search && !user.name?.toLowerCase().includes(search.toLowerCase()) && !user.email?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    const aVal = a[sortBy] || ''; const bVal = b[sortBy] || '';
    if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
    return aVal < bVal ? 1 : -1;
  });

  const handleCreateUser = async () => {
    try {
      setError(null);
      if (!newUser.name || !newUser.email || !newUser.password) { setError('Veuillez remplir tous les champs obligatoires'); return; }
      if (newUser.password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères'); return; }

      if (apiConnected) {
        const payload = { name: newUser.name, email: newUser.email, password: newUser.password, role: newUser.role, type: newUser.type, secteur: newUser.secteur };
        const response = await api.post('/api/auth/create-client', payload);
        setSuccess(`Utilisateur "${newUser.name}" créé avec succès !`);
        setUsers([...users, response.data.user || response.data]);
      } else {
        const user = { id: users.length + 1, name: newUser.name, email: newUser.email, role: newUser.role, status: 'active', createdAt: new Date().toISOString().split('T')[0], lastLogin: '-', clientId: newUser.role === 'CLIENT' ? users.length + 1 : null, type: newUser.type, secteur: newUser.secteur };
        setUsers([...users, user]);
        setSuccess(`Utilisateur "${newUser.name}" créé (mode hors ligne)`);
      }
      setShowCreateModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'CLIENT', clientId: '', type: 'particulier', secteur: '' });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditUser({ name: user.name || '', email: user.email || '', role: user.role || 'CLIENT', status: user.status || 'active' });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    try {
      setError(null);
      if (apiConnected) await api.put(`/api/auth/users/${selectedUser.id}`, editUser);
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...editUser } : u));
      setShowEditModal(false); setSelectedUser(null);
      setSuccess('Utilisateur modifié avec succès !');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) { setError(err.response?.data?.message || 'Erreur lors de la modification'); }
  };

  const handleDeleteUser = async (userId) => {
    try {
      setError(null);
      if (apiConnected) await api.delete(`/api/auth/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      setShowDeleteConfirm(false); setSelectedUser(null);
      setSuccess('Utilisateur supprimé avec succès !');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) { setError(err.response?.data?.message || 'Erreur lors de la suppression'); }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const user = users.find(u => u.id === userId);
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      if (apiConnected) await api.put(`/api/auth/users/${userId}`, { status: newStatus });
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      setSuccess(`Statut mis à jour : ${newStatus === 'active' ? 'Actif' : 'Inactif'}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) { setError('Erreur lors du changement de statut'); }
  };

  const getInitials = (name) => { if (!name) return '?'; return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2); };
  const getAvatarColor = (role) => { if (role === 'ADMIN') return '#DC2626'; if (role === 'RESPONSABLE_MARKETING') return '#D97706'; return '#2563EB'; };
  const formatDate = (dateStr) => { if (!dateStr || dateStr === '-') return '-'; try { return new Date(dateStr).toLocaleDateString('fr-FR'); } catch { return dateStr; } };

  return (
    <div style={{ minHeight: '100vh', background: '#f6f3ee', fontFamily: "'Inter', sans-serif", padding: '32px' }}>
      {/* Notifications */}
      {error && (
        <div style={{ position: 'fixed', top: 80, right: 20, background: '#FEE2E2', color: '#DC2626', padding: '16px 24px', borderRadius: 12, border: '1px solid #EF4444', fontWeight: 600, zIndex: 9999, animation: 'slideIn 0.3s ease', maxWidth: 400 }}>
          ⚠️ {error} <button onClick={() => setError(null)} style={{ marginLeft: 12, background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
        </div>
      )}
      {success && (
        <div style={{ position: 'fixed', top: 80, right: 20, background: '#ECFDF5', color: '#047857', padding: '16px 24px', borderRadius: 12, border: '1px solid #10B981', fontWeight: 600, zIndex: 9999, animation: 'slideIn 0.3s ease', maxWidth: 400 }}>
          ✅ {success} <button onClick={() => setSuccess(null)} style={{ marginLeft: 12, background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
        </div>
      )}

      {/* Header de page (sans le grand titre, juste les actions) */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: dark, margin: '0 0 4px' }}>Gestion des Utilisateurs</h1>
            <p style={{ color: textGray, margin: 0, fontSize: '0.875rem' }}>
              {users.length} utilisateur{users.length > 1 ? 's' : ''} enregistré{users.length > 1 ? 's' : ''}
              {!apiConnected && <span style={{ color: '#D97706', marginLeft: 8 }}>(Mode hors ligne)</span>}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={fetchUsers} style={{ padding: '12px 18px', borderRadius: 10, border: '1px solid #E5E5E5', background: white, color: dark, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem' }}>🔄 Rafraîchir</button>
            <button onClick={() => setShowCreateModal(true)} style={{ padding: '12px 24px', borderRadius: 10, border: 'none', background: gold, color: 'white', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', boxShadow: '0 2px 8px rgba(245, 166, 35, 0.3)' }}><span>+</span> Nouvel Utilisateur</button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['tous', 'ADMIN', 'RESPONSABLE_MARKETING', 'CLIENT'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 16px', borderRadius: 20, border: '1px solid #E5E5E5', background: filter === f ? gold : white, color: filter === f ? 'white' : dark, fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', transition: 'all 0.2s' }}>
              {f === 'tous' ? 'Tous' : f === 'ADMIN' ? 'Admins' : f === 'RESPONSABLE_MARKETING' ? 'Resp.Marketing' : 'Clients'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select value={`${sortBy}-${sortOrder}`} onChange={(e) => { const [field, order] = e.target.value.split('-'); setSortBy(field); setSortOrder(order); }} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #E5E5E5', background: white, fontSize: '0.875rem', cursor: 'pointer' }}>
            <option value="createdAt-desc">Plus récents</option>
            <option value="createdAt-asc">Plus anciens</option>
            <option value="name-asc">Nom A-Z</option>
            <option value="name-desc">Nom Z-A</option>
            <option value="lastLogin-desc">Dernière connexion</option>
          </select>
          <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #E5E5E5', background: white, width: 240, fontSize: '0.875rem' }} />
        </div>
      </div>

      {/* Loading */}
      {loading && <div style={{ textAlign: 'center', padding: '60px 20px', color: textGray }}><div style={{ fontSize: '2rem', marginBottom: 16, animation: 'spin 1s linear infinite' }}>⏳</div><p>Chargement...</p></div>}

      {/* Table */}
      {!loading && (
        <div style={{ background: white, borderRadius: 14, border: '1px solid #E5E5E5', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr 1.5fr 1fr', padding: '14px 20px', background: '#FAFAFA', borderBottom: '1px solid #E5E5E5', fontWeight: 700, fontSize: '0.75rem', color: textGray, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <div>Utilisateur</div><div>Email</div><div>Rôle</div><div>Statut</div><div>Créé le</div><div>Connexion</div><div style={{ textAlign: 'center' }}>Actions</div>
          </div>
          {filteredUsers.map(user => {
            const roleStyle = ROLE_COLORS[user.role] || ROLE_COLORS.CLIENT;
            return (
              <div key={user.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr 1.5fr 1fr', padding: '14px 20px', borderBottom: '1px solid #F0F0F0', alignItems: 'center', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: getAvatarColor(user.role), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem' }}>{getInitials(user.name)}</div>
                  <div><div style={{ fontWeight: 600, color: dark, fontSize: '0.875rem' }}>{user.name}</div>{user.clientId && <div style={{ fontSize: '0.75rem', color: textGray }}>Client ID: {user.clientId}</div>}</div>
                </div>
                <div style={{ fontSize: '0.875rem', color: textGray }}>{user.email}</div>
                <div><span style={{ padding: '4px 10px', borderRadius: 20, background: roleStyle.bg, color: roleStyle.color, fontSize: '0.75rem', fontWeight: 700, border: `1px solid ${roleStyle.border}` }}>{roleStyle.label}</span></div>
                <div><button onClick={() => handleToggleStatus(user.id)} style={{ padding: '4px 10px', borderRadius: 20, border: 'none', background: user.status === 'active' ? '#ECFDF5' : '#F3F4F6', color: user.status === 'active' ? '#047857' : '#6B7280', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>{user.status === 'active' ? '🟢 Actif' : '⚪ Inactif'}</button></div>
                <div style={{ fontSize: '0.875rem', color: textGray }}>{formatDate(user.createdAt)}</div>
                <div style={{ fontSize: '0.875rem', color: textGray }}>{formatDate(user.lastLogin)}</div>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                  <button onClick={() => { setSelectedUser(user); setShowDetailsModal(true); }} style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid #E5E5E5', background: white, cursor: 'pointer', fontSize: '0.75rem' }}>👁</button>
                  <button onClick={() => handleEditUser(user)} style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid #E5E5E5', background: white, cursor: 'pointer', fontSize: '0.75rem' }}>✏️</button>
                  <button onClick={() => { setSelectedUser(user); setShowDeleteConfirm(true); }} style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid #E5E5E5', background: white, cursor: 'pointer', fontSize: '0.75rem' }}>🗑</button>
                </div>
              </div>
            );
          })}
          {filteredUsers.length === 0 && <div style={{ textAlign: 'center', padding: '40px 20px', color: textGray }}><div style={{ fontSize: '2rem', marginBottom: 8 }}>🔍</div><p>Aucun utilisateur trouvé</p></div>}
        </div>
      )}

      {/* Modals identiques... */}
      {/* ... (même code pour les modals Create/Edit/Details/Delete) ... */}
      
      <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default UsersPage;