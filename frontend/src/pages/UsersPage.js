import React, { useState, useEffect } from 'react';
import api from '../api';

const gold = '#f5a623';
const dark = '#0A0A0A';
const white = '#FFFFFF';
const textGray = '#666666';

const ROLE_COLORS = {
  'ADMIN': { bg: '#FEE2E2', color: '#DC2626', border: '#EF4444', label: 'Administrateur' },
  'RESPONSABLE_MARKETING': { bg: '#FEF3C7', color: '#D97706', border: '#F59E0B', label: 'Resp. Marketing' },
  'CLIENT': { bg: '#DBEAFE', color: '#2563EB', border: '#3B82F6', label: 'Client' }
};

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Actif' },
  { value: 'INACTIVE', label: 'Inactif' },
  { value: 'SUSPENDED', label: 'Suspendu' },
  { value: 'PENDING', label: 'En attente' }
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

  const [newUser, setNewUser] = useState({
    name: '', email: '', password: '', role: 'CLIENT', phone: ''
  });

  const [editUser, setEditUser] = useState({
    name: '', email: '', role: 'CLIENT', status: 'ACTIVE', phone: ''
  });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true); setError(null);
      const response = await api.get('/api/users');
      if (response.data && Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error('Erreur fetch users:', err);
      setError('Erreur lors du chargement des utilisateurs');
      setTimeout(() => setError(null), 5000);
    } finally { setLoading(false); }
  };

  const filteredUsers = users.filter(user => {
    if (filter !== 'tous' && user.role !== filter) return false;
    if (search && !user.name?.toLowerCase().includes(search.toLowerCase()) && 
        !user.email?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    const aVal = a[sortBy] || ''; const bVal = b[sortBy] || '';
    if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
    return aVal < bVal ? 1 : -1;
  });

  // ============================================
  // CRÉER UN UTILISATEUR
  // ============================================
  const handleCreateUser = async () => {
    try {
      setError(null);
      if (!newUser.name || !newUser.email || !newUser.password) {
        setError('Veuillez remplir tous les champs obligatoires (Nom, Email, Mot de passe)');
        return;
      }
      if (newUser.password.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères');
        return;
      }

      const payload = {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        phone: newUser.phone || null
      };

      const response = await api.post('/api/users', payload);
      setSuccess(`Utilisateur "${newUser.name}" créé avec succès !`);
      setUsers([...users, response.data.user || response.data]);
      setShowCreateModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'CLIENT', phone: '' });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erreur création:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Erreur lors de la création');
      setTimeout(() => setError(null), 5000);
    }
  };

  // ============================================
  // ÉDITER UN UTILISATEUR
  // ============================================
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditUser({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'CLIENT',
      status: user.status || 'ACTIVE',
      phone: user.phone || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    try {
      setError(null);
      const payload = {
        name: editUser.name,
        email: editUser.email,
        role: editUser.role,
        status: editUser.status,
        phone: editUser.phone || null
      };

      const response = await api.put(`/api/users/${selectedUser.id}`, payload);
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...payload } : u));
      setShowEditModal(false);
      setSelectedUser(null);
      setSuccess('Utilisateur modifié avec succès !');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erreur modification:', err);
      setError(err.response?.data?.error || 'Erreur lors de la modification');
      setTimeout(() => setError(null), 5000);
    }
  };

  // ============================================
  // SUPPRIMER UN UTILISATEUR
  // ============================================
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteConfirm(true);
  };

  const handleDeleteUser = async () => {
    try {
      setError(null);
      await api.delete(`/api/users/${selectedUser.id}`);
      setUsers(users.filter(u => u.id !== selectedUser.id));
      setShowDeleteConfirm(false);
      setSelectedUser(null);
      setSuccess('Utilisateur supprimé avec succès !');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erreur suppression:', err);
      setError(err.response?.data?.error || 'Erreur lors de la suppression');
      setTimeout(() => setError(null), 5000);
    }
  };

  // ============================================
  // VOIR DÉTAILS
  // ============================================
  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  // ============================================
  // CHANGER STATUT
  // ============================================
  const handleToggleStatus = async (userId) => {
    try {
      const user = users.find(u => u.id === userId);
      const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      
      await api.patch(`/api/users/${userId}/status`, { status: newStatus });
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      setSuccess(`Statut mis à jour : ${newStatus === 'ACTIVE' ? 'Actif' : 'Inactif'}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erreur statut:', err);
      setError('Erreur lors du changement de statut');
      setTimeout(() => setError(null), 5000);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (role) => {
    if (role === 'ADMIN') return '#DC2626';
    if (role === 'RESPONSABLE_MARKETING') return '#D97706';
    return '#2563EB';
  };

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === '-') return '-';
    try { return new Date(dateStr).toLocaleDateString('fr-FR'); } catch { return dateStr; }
  };

  // ============================================
  // STYLES DES MODALS
  // ============================================
  const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999, backdropFilter: 'blur(4px)'
  };

  const modalContentStyle = {
    background: white, borderRadius: 16, padding: 32, width: '100%', maxWidth: 480,
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflow: 'auto'
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #E5E5E5',
    background: white, fontSize: '0.875rem', marginBottom: 16, outline: 'none',
    transition: 'border-color 0.2s'
  };

  const buttonPrimaryStyle = {
    padding: '12px 24px', borderRadius: 10, border: 'none', background: gold, color: 'white',
    fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem'
  };

  const buttonSecondaryStyle = {
    padding: '12px 24px', borderRadius: 10, border: '1px solid #E5E5E5', background: white,
    color: dark, fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem'
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f6f3ee', fontFamily: "'Inter', sans-serif", padding: '32px' }}>
      
      {/* Notifications */}
      {error && (
        <div style={{ position: 'fixed', top: 80, right: 20, background: '#FEE2E2', color: '#DC2626', padding: '16px 24px', borderRadius: 12, border: '1px solid #EF4444', fontWeight: 600, zIndex: 9999, animation: 'slideIn 0.3s ease', maxWidth: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          ⚠️ {error}
          <button onClick={() => setError(null)} style={{ marginLeft: 12, background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
        </div>
      )}
      {success && (
        <div style={{ position: 'fixed', top: 80, right: 20, background: '#ECFDF5', color: '#047857', padding: '16px 24px', borderRadius: 12, border: '1px solid #10B981', fontWeight: 600, zIndex: 9999, animation: 'slideIn 0.3s ease', maxWidth: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          ✅ {success}
          <button onClick={() => setSuccess(null)} style={{ marginLeft: 12, background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: dark, margin: '0 0 4px' }}>Gestion des Utilisateurs</h1>
            <p style={{ color: textGray, margin: 0, fontSize: '0.875rem' }}>
              {users.length} utilisateur{users.length > 1 ? 's' : ''} enregistré{users.length > 1 ? 's' : ''}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={fetchUsers} style={{ padding: '12px 18px', borderRadius: 10, border: '1px solid #E5E5E5', background: white, color: dark, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem' }}>
              🔄 Rafraîchir
            </button>
            <button onClick={() => setShowCreateModal(true)} style={{ padding: '12px 24px', borderRadius: 10, border: 'none', background: gold, color: 'white', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', boxShadow: '0 2px 8px rgba(245, 166, 35, 0.3)' }}>
              <span>+</span> Nouvel Utilisateur
            </button>
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
            <div>Utilisateur</div><div>Email</div><div>Rôle</div><div>Statut</div><div>Créé le</div><div>Téléphone</div><div style={{ textAlign: 'center' }}>Actions</div>
          </div>
          {filteredUsers.map(user => {
            const roleStyle = ROLE_COLORS[user.role] || ROLE_COLORS.CLIENT;
            return (
              <div key={user.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr 1.5fr 1fr', padding: '14px 20px', borderBottom: '1px solid #F0F0F0', alignItems: 'center', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: getAvatarColor(user.role), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem' }}>{getInitials(user.name)}</div>
                  <div><div style={{ fontWeight: 600, color: dark, fontSize: '0.875rem' }}>{user.name}</div></div>
                </div>
                <div style={{ fontSize: '0.875rem', color: textGray }}>{user.email}</div>
                <div><span style={{ padding: '4px 10px', borderRadius: 20, background: roleStyle.bg, color: roleStyle.color, fontSize: '0.75rem', fontWeight: 700, border: `1px solid ${roleStyle.border}` }}>{roleStyle.label}</span></div>
                <div><button onClick={() => handleToggleStatus(user.id)} style={{ padding: '4px 10px', borderRadius: 20, border: 'none', background: user.status === 'ACTIVE' ? '#ECFDF5' : '#F3F4F6', color: user.status === 'ACTIVE' ? '#047857' : '#6B7280', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>{user.status === 'ACTIVE' ? '🟢 Actif' : '⚪ Inactif'}</button></div>
                <div style={{ fontSize: '0.875rem', color: textGray }}>{formatDate(user.createdAt)}</div>
                <div style={{ fontSize: '0.875rem', color: textGray }}>{user.phone || '-'}</div>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                  <button onClick={() => handleViewDetails(user)} style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid #E5E5E5', background: white, cursor: 'pointer', fontSize: '0.75rem' }}>👁</button>
                  <button onClick={() => handleEditUser(user)} style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid #E5E5E5', background: white, cursor: 'pointer', fontSize: '0.75rem' }}>✏️</button>
                  <button onClick={() => handleDeleteClick(user)} style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid #E5E5E5', background: white, cursor: 'pointer', fontSize: '0.75rem' }}>🗑</button>
                </div>
              </div>
            );
          })}
          {filteredUsers.length === 0 && <div style={{ textAlign: 'center', padding: '40px 20px', color: textGray }}><div style={{ fontSize: '2rem', marginBottom: 8 }}>🔍</div><p>Aucun utilisateur trouvé</p></div>}
        </div>
      )}

      {/* ============================================ */}
      {/* MODAL CRÉER UTILISATEUR */}
      {/* ============================================ */}
      {showCreateModal && (
        <div style={modalOverlayStyle} onClick={() => setShowCreateModal(false)}>
          <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: dark }}>Nouvel Utilisateur</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: textGray }}>×</button>
            </div>
            
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: textGray, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Nom complet *</label>
            <input type="text" placeholder="Prénom et nom" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} style={inputStyle} />
            
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: textGray, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email *</label>
            <input type="email" placeholder="email@exemple.com" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} style={inputStyle} />
            
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: textGray, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Mot de passe *</label>
            <input type="password" placeholder="Minimum 6 caractères" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} style={inputStyle} />
            
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: textGray, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Téléphone</label>
            <input type="tel" placeholder="+216 XX XXX XXX" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} style={inputStyle} />
            
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: textGray, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Rôle *</label>
            <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="CLIENT">Client</option>
              <option value="RESPONSABLE_MARKETING">Responsable Marketing</option>
              <option value="ADMIN">Administrateur</option>
            </select>
            
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button onClick={() => setShowCreateModal(false)} style={{ ...buttonSecondaryStyle, flex: 1 }}>Annuler</button>
              <button onClick={handleCreateUser} style={{ ...buttonPrimaryStyle, flex: 1 }}>Créer l'utilisateur</button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* MODAL ÉDITER UTILISATEUR */}
      {/* ============================================ */}
      {showEditModal && selectedUser && (
        <div style={modalOverlayStyle} onClick={() => setShowEditModal(false)}>
          <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: dark }}>Modifier {selectedUser.name}</h2>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: textGray }}>×</button>
            </div>
            
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: textGray, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Nom complet</label>
            <input type="text" value={editUser.name} onChange={e => setEditUser({...editUser, name: e.target.value})} style={inputStyle} />
            
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: textGray, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email</label>
            <input type="email" value={editUser.email} onChange={e => setEditUser({...editUser, email: e.target.value})} style={inputStyle} />
            
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: textGray, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Téléphone</label>
            <input type="tel" value={editUser.phone} onChange={e => setEditUser({...editUser, phone: e.target.value})} style={inputStyle} />
            
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: textGray, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Rôle</label>
            <select value={editUser.role} onChange={e => setEditUser({...editUser, role: e.target.value})} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="CLIENT">Client</option>
              <option value="RESPONSABLE_MARKETING">Responsable Marketing</option>
              <option value="ADMIN">Administrateur</option>
            </select>
            
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: textGray, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Statut</label>
            <select value={editUser.status} onChange={e => setEditUser({...editUser, status: e.target.value})} style={{ ...inputStyle, cursor: 'pointer' }}>
              {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button onClick={() => setShowEditModal(false)} style={{ ...buttonSecondaryStyle, flex: 1 }}>Annuler</button>
              <button onClick={handleUpdateUser} style={{ ...buttonPrimaryStyle, flex: 1 }}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* MODAL CONFIRMATION SUPPRESSION */}
      {/* ============================================ */}
      {showDeleteConfirm && selectedUser && (
        <div style={modalOverlayStyle} onClick={() => setShowDeleteConfirm(false)}>
          <div style={{ ...modalContentStyle, maxWidth: 400, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🗑️</div>
            <h2 style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: 700, color: dark }}>Supprimer {selectedUser.name} ?</h2>
            <p style={{ color: textGray, margin: '0 0 24px', fontSize: '0.875rem' }}>Cette action est irréversible. L'utilisateur sera définitivement supprimé.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ ...buttonSecondaryStyle, flex: 1 }}>Annuler</button>
              <button onClick={handleDeleteUser} style={{ padding: '12px 24px', borderRadius: 10, border: 'none', background: '#DC2626', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', flex: 1 }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* MODAL DÉTAILS UTILISATEUR */}
      {/* ============================================ */}
      {showDetailsModal && selectedUser && (
        <div style={modalOverlayStyle} onClick={() => setShowDetailsModal(false)}>
          <div style={{ ...modalContentStyle, maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: dark }}>Détails</h2>
              <button onClick={() => setShowDetailsModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: textGray }}>×</button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: 16, background: '#FAFAFA', borderRadius: 12 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: getAvatarColor(selectedUser.role), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.25rem' }}>{getInitials(selectedUser.name)}</div>
              <div>
                <div style={{ fontWeight: 700, color: dark, fontSize: '1rem' }}>{selectedUser.name}</div>
                <div style={{ color: textGray, fontSize: '0.875rem' }}>{selectedUser.email}</div>
                <span style={{ padding: '2px 8px', borderRadius: 12, background: (ROLE_COLORS[selectedUser.role] || ROLE_COLORS.CLIENT).bg, color: (ROLE_COLORS[selectedUser.role] || ROLE_COLORS.CLIENT).color, fontSize: '0.75rem', fontWeight: 700, marginTop: 4, display: 'inline-block' }}>{(ROLE_COLORS[selectedUser.role] || ROLE_COLORS.CLIENT).label}</span>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ padding: 12, background: '#FAFAFA', borderRadius: 10 }}>
                <div style={{ fontSize: '0.75rem', color: textGray, marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>ID</div>
                <div style={{ fontWeight: 600, color: dark, fontSize: '0.875rem' }}>{selectedUser.id}</div>
              </div>
              <div style={{ padding: 12, background: '#FAFAFA', borderRadius: 10 }}>
                <div style={{ fontSize: '0.75rem', color: textGray, marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>Statut</div>
                <div style={{ fontWeight: 600, color: dark, fontSize: '0.875rem' }}>{selectedUser.status === 'ACTIVE' ? '🟢 Actif' : '⚪ Inactif'}</div>
              </div>
              <div style={{ padding: 12, background: '#FAFAFA', borderRadius: 10 }}>
                <div style={{ fontSize: '0.75rem', color: textGray, marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>Créé le</div>
                <div style={{ fontWeight: 600, color: dark, fontSize: '0.875rem' }}>{formatDate(selectedUser.createdAt)}</div>
              </div>
              <div style={{ padding: 12, background: '#FAFAFA', borderRadius: 10 }}>
                <div style={{ fontSize: '0.75rem', color: textGray, marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>Téléphone</div>
                <div style={{ fontWeight: 600, color: dark, fontSize: '0.875rem' }}>{selectedUser.phone || '-'}</div>
              </div>
            </div>
            
            <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
              <button onClick={() => { setShowDetailsModal(false); handleEditUser(selectedUser); }} style={{ ...buttonPrimaryStyle, flex: 1 }}>Modifier</button>
              <button onClick={() => setShowDetailsModal(false)} style={{ ...buttonSecondaryStyle, flex: 1 }}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default UsersPage;