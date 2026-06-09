import React, { useState } from 'react';

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

const INITIAL_USERS = [
  { id: 1, name: 'Ahmed Ben Ali', email: 'ahmed@digilab.tn', role: 'CLIENT', clientId: 1, createdAt: '2026-01-15', status: 'active', lastLogin: '2026-06-08' },
  { id: 2, name: 'Fatima Trabelsi', email: 'fatima@digilab.tn', role: 'CLIENT', clientId: 2, createdAt: '2026-02-20', status: 'active', lastLogin: '2026-06-07' },
  { id: 3, name: 'Karim Mansour', email: 'karim@digilab.tn', role: 'RESPONSABLE_MARKETING', clientId: null, createdAt: '2026-01-10', status: 'active', lastLogin: '2026-06-08' },
  { id: 4, name: 'Leila Ben Ammar', email: 'leila@digilab.tn', role: 'CLIENT', clientId: 3, createdAt: '2026-03-05', status: 'inactive', lastLogin: '2026-05-20' },
  { id: 5, name: 'Sami Ben Salah', email: 'sami@digilab.tn', role: 'CLIENT', clientId: 4, createdAt: '2026-04-12', status: 'active', lastLogin: '2026-06-06' },
  { id: 6, name: 'Admin Principal', email: 'admin@digilab.tn', role: 'ADMIN', clientId: null, createdAt: '2025-12-01', status: 'active', lastLogin: '2026-06-08' },
];

function UsersPage() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [filter, setFilter] = useState('tous');
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CLIENT',
    clientId: ''
  });

  const [editUser, setEditUser] = useState({
    name: '',
    email: '',
    role: 'CLIENT',
    status: 'active'
  });

  const filteredUsers = users.filter(user => {
    if (filter !== 'tous' && user.role !== filter) return false;
    if (search && !user.name.toLowerCase().includes(search.toLowerCase()) && 
        !user.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
    return aVal < bVal ? 1 : -1;
  });

  const handleCreateUser = () => {
    const user = {
      ...newUser,
      id: users.length + 1,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active',
      lastLogin: '-'
    };
    setUsers([...users, user]);
    setShowCreateModal(false);
    setNewUser({ name: '', email: '', password: '', role: 'CLIENT', clientId: '' });
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditUser({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = () => {
    setUsers(users.map(u => 
      u.id === selectedUser.id ? { ...u, ...editUser } : u
    ));
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = (userId) => {
    setUsers(users.filter(u => u.id !== userId));
    setShowDeleteConfirm(false);
    setSelectedUser(null);
  };

  const handleToggleStatus = (userId) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
    ));
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (role) => {
    if (role === 'ADMIN') return '#DC2626';
    if (role === 'RESPONSABLE_MARKETING') return '#D97706';
    return '#2563EB';
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: gray, 
      fontFamily: "'Inter', sans-serif",
      padding: '40px 60px'
    }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: dark, margin: '0 0 8px' }}>
              Gestion des Utilisateurs
            </h1>

          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '14px 28px',
              borderRadius: 12,
              border: 'none',
              background: gold,
              color: 'white',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '1rem'
            }}
          >
            <span>+</span>
            Nouvel Utilisateur
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['tous', 'ADMIN', 'RESPONSABLE_MARKETING', 'CLIENT'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '10px 20px',
                borderRadius: 20,
                border: '1px solid #E5E5E5',
                background: filter === f ? gold : white,
                color: filter === f ? 'white' : dark,
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              {f === 'tous' ? 'Tous' : f === 'ADMIN' ? 'Admins' : f === 'RESPONSABLE_MARKETING' ? 'Resp.Marketing' : 'Clients'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            style={{
              padding: '10px 16px',
              borderRadius: 10,
              border: '1px solid #E5E5E5',
              background: white,
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            <option value="createdAt-desc">Plus récents</option>
            <option value="createdAt-asc">Plus anciens</option>
            <option value="name-asc">Nom A-Z</option>
            <option value="name-desc">Nom Z-A</option>
            <option value="lastLogin-desc">Dernière connexion</option>
          </select>

          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '10px 20px',
              borderRadius: 12,
              border: '1px solid #E5E5E5',
              background: white,
              width: 280,
              fontSize: '0.875rem'
            }}
          />
        </div>
      </div>

      {/* Users Table */}
      <div style={{
        background: white,
        borderRadius: 16,
        border: '1px solid #E5E5E5',
        overflow: 'hidden'
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr 1.5fr 1fr',
          padding: '16px 24px',
          background: '#FAFAFA',
          borderBottom: '1px solid #E5E5E5',
          fontWeight: 700,
          fontSize: '0.875rem',
          color: textGray
        }}>
          <div>Utilisateur</div>
          <div>Email</div>
          <div>Rôle</div>
          <div>Statut</div>
          <div>Créé le</div>
          <div>Dernière connexion</div>
          <div style={{ textAlign: 'center' }}>Actions</div>
        </div>

        {/* Table Body */}
        {filteredUsers.map(user => {
          const roleStyle = ROLE_COLORS[user.role] || ROLE_COLORS.CLIENT;

          return (
            <div key={user.id} style={{
              display: 'grid',
              gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr 1.5fr 1fr',
              padding: '16px 24px',
              borderBottom: '1px solid #F0F0F0',
              alignItems: 'center'
            }}>
              {/* User */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: getAvatarColor(user.role),
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.875rem'
                }}>
                  {getInitials(user.name)}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: dark, fontSize: '0.875rem' }}>
                    {user.name}
                  </div>
                  {user.clientId && (
                    <div style={{ fontSize: '0.75rem', color: textGray }}>
                      Client ID: {user.clientId}
                    </div>
                  )}
                </div>
              </div>

              {/* Email */}
              <div style={{ fontSize: '0.875rem', color: textGray }}>
                {user.email}
              </div>

              {/* Role */}
              <div>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: 20,
                  background: roleStyle.bg,
                  color: roleStyle.color,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: `1px solid ${roleStyle.border}`
                }}>
                  {roleStyle.label}
                </span>
              </div>

              {/* Status */}
              <div>
                <button
                  onClick={() => handleToggleStatus(user.id)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 20,
                    border: 'none',
                    background: user.status === 'active' ? '#ECFDF5' : '#F3F4F6',
                    color: user.status === 'active' ? '#047857' : '#6B7280',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  {user.status === 'active' ? '🟢' : '⚪'}
                  {user.status === 'active' ? 'Actif' : 'Inactif'}
                </button>
              </div>

              {/* Created At */}
              <div style={{ fontSize: '0.875rem', color: textGray }}>
                {user.createdAt}
              </div>

              {/* Last Login */}
              <div style={{ fontSize: '0.875rem', color: textGray }}>
                {user.lastLogin}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                <button
                  onClick={() => { setSelectedUser(user); setShowDetailsModal(true); }}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: '1px solid #E5E5E5',
                    background: white,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem'
                  }}
                  title="Voir détails"
                >
                  👁
                </button>
                <button
                  onClick={() => handleEditUser(user)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: '1px solid #E5E5E5',
                    background: white,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem'
                  }}
                  title="Modifier"
                >
                  ✏️
                </button>
                <button
                  onClick={() => { setSelectedUser(user); setShowDeleteConfirm(true); }}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: '1px solid #E5E5E5',
                    background: white,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem'
                  }}
                  title="Supprimer"
                >
                  🗑
                </button>
              </div>
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: textGray }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
            <p>Aucun utilisateur trouvé</p>
          </div>
        )}
      </div>

      {/* Modal: Create User */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: white,
            borderRadius: 20,
            width: '100%',
            maxWidth: 550,
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '40px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: dark, margin: 0 }}>
                Nouvel Utilisateur
              </h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #E5E5E5', background: white, cursor: 'pointer', fontSize: '1.25rem' }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: dark, fontSize: '0.875rem' }}>Nom complet</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="Ex: Ahmed Ben Ali"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #E5E5E5', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: dark, fontSize: '0.875rem' }}>Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="exemple@digilab.tn"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #E5E5E5', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: dark, fontSize: '0.875rem' }}>Mot de passe</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="Minimum 8 caractères"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #E5E5E5', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: dark, fontSize: '0.875rem' }}>Rôle</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {ROLE_OPTIONS.map(role => (
                    <button
                      key={role.value}
                      onClick={() => setNewUser({...newUser, role: role.value})}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 10,
                        border: newUser.role === role.value ? `2px solid ${gold}` : '1px solid #E5E5E5',
                        background: newUser.role === role.value ? '#FFF8E7' : white,
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12
                      }}
                    >
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        border: newUser.role === role.value ? `2px solid ${gold}` : '2px solid #E5E5E5',
                        background: newUser.role === role.value ? gold : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {newUser.role === role.value && <span style={{ color: 'white', fontSize: '0.75rem' }}>✓</span>}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: dark, fontSize: '0.875rem' }}>{role.label}</div>
                        <div style={{ fontSize: '0.75rem', color: textGray }}>{role.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {newUser.role === 'CLIENT' && (
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: dark, fontSize: '0.875rem' }}>ID Client (optionnel)</label>
                  <input
                    type="number"
                    value={newUser.clientId}
                    onChange={(e) => setNewUser({...newUser, clientId: e.target.value})}
                    placeholder="Numéro de client"
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #E5E5E5', fontSize: '0.875rem' }}
                  />
                </div>
              )}

              <button
                onClick={handleCreateUser}
                disabled={!newUser.name || !newUser.email || !newUser.password}
                style={{
                  padding: '14px 24px',
                  borderRadius: 12,
                  border: 'none',
                  background: (!newUser.name || !newUser.email || !newUser.password) ? '#D1D5DB' : gold,
                  color: 'white',
                  fontWeight: 700,
                  cursor: (!newUser.name || !newUser.email || !newUser.password) ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  marginTop: 8
                }}
              >
                Créer l'utilisateur
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit User */}
      {showEditModal && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: white,
            borderRadius: 20,
            width: '100%',
            maxWidth: 550,
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '40px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: dark, margin: 0 }}>
                Modifier l'Utilisateur
              </h2>
              <button 
                onClick={() => { setShowEditModal(false); setSelectedUser(null); }}
                style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #E5E5E5', background: white, cursor: 'pointer', fontSize: '1.25rem' }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: dark, fontSize: '0.875rem' }}>Nom complet</label>
                <input
                  type="text"
                  value={editUser.name}
                  onChange={(e) => setEditUser({...editUser, name: e.target.value})}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #E5E5E5', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: dark, fontSize: '0.875rem' }}>Email</label>
                <input
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #E5E5E5', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: dark, fontSize: '0.875rem' }}>Rôle</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {ROLE_OPTIONS.map(role => (
                    <button
                      key={role.value}
                      onClick={() => setEditUser({...editUser, role: role.value})}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 10,
                        border: editUser.role === role.value ? `2px solid ${gold}` : '1px solid #E5E5E5',
                        background: editUser.role === role.value ? '#FFF8E7' : white,
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12
                      }}
                    >
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        border: editUser.role === role.value ? `2px solid ${gold}` : '2px solid #E5E5E5',
                        background: editUser.role === role.value ? gold : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {editUser.role === role.value && <span style={{ color: 'white', fontSize: '0.75rem' }}>✓</span>}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: dark, fontSize: '0.875rem' }}>{role.label}</div>
                        <div style={{ fontSize: '0.75rem', color: textGray }}>{role.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: dark, fontSize: '0.875rem' }}>Statut</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setEditUser({...editUser, status: 'active'})}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: editUser.status === 'active' ? '2px solid #10B981' : '1px solid #E5E5E5',
                      background: editUser.status === 'active' ? '#ECFDF5' : white,
                      cursor: 'pointer',
                      fontWeight: 600,
                      color: editUser.status === 'active' ? '#047857' : textGray
                    }}
                  >
                    🟢 Actif
                  </button>
                  <button
                    onClick={() => setEditUser({...editUser, status: 'inactive'})}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: editUser.status === 'inactive' ? '2px solid #6B7280' : '1px solid #E5E5E5',
                      background: editUser.status === 'inactive' ? '#F3F4F6' : white,
                      cursor: 'pointer',
                      fontWeight: 600,
                      color: editUser.status === 'inactive' ? '#6B7280' : textGray
                    }}
                  >
                    ⚪ Inactif
                  </button>
                </div>
              </div>

              <button
                onClick={handleUpdateUser}
                style={{
                  padding: '14px 24px',
                  borderRadius: 12,
                  border: 'none',
                  background: gold,
                  color: 'white',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '1rem',
                  marginTop: 8
                }}
              >
                💾 Enregistrer les modifications
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: User Details */}
      {showDetailsModal && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: white,
            borderRadius: 20,
            width: '100%',
            maxWidth: 500,
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '40px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: dark, margin: 0 }}>
                Détails de l'Utilisateur
              </h2>
              <button 
                onClick={() => { setShowDetailsModal(false); setSelectedUser(null); }}
                style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #E5E5E5', background: white, cursor: 'pointer', fontSize: '1.25rem' }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: getAvatarColor(selectedUser.role),
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.5rem',
                marginBottom: 16
              }}>
                {getInitials(selectedUser.name)}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: dark, margin: '0 0 4px' }}>
                {selectedUser.name}
              </h3>
              <p style={{ color: textGray, margin: 0 }}>{selectedUser.email}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'ID', value: selectedUser.id },
                { label: 'Rôle', value: (ROLE_COLORS[selectedUser.role] || ROLE_COLORS.CLIENT).label },
                { label: 'Statut', value: selectedUser.status === 'active' ? '🟢 Actif' : '⚪ Inactif' },
                { label: 'Date de création', value: selectedUser.createdAt },
                { label: 'Dernière connexion', value: selectedUser.lastLogin },
                { label: 'ID Client', value: selectedUser.clientId || 'N/A' }
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: gray,
                  borderRadius: 10
                }}>
                  <span style={{ color: textGray, fontSize: '0.875rem' }}>{item.label}</span>
                  <span style={{ color: dark, fontWeight: 600, fontSize: '0.875rem' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {showDeleteConfirm && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: white,
            borderRadius: 20,
            width: '100%',
            maxWidth: 450,
            padding: '40px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: dark, margin: '0 0 12px' }}>
              Confirmer la suppression
            </h2>
            <p style={{ color: textGray, fontSize: '1rem', marginBottom: 24 }}>
              Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>"{selectedUser.name}"</strong> ?<br/>
              Cette action est irréversible.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => { setShowDeleteConfirm(false); setSelectedUser(null); }}
                style={{
                  padding: '12px 24px',
                  borderRadius: 12,
                  border: '1px solid #E5E5E5',
                  background: white,
                  color: dark,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                ❌ Annuler
              </button>
              <button
                onClick={() => handleDeleteUser(selectedUser.id)}
                style={{
                  padding: '12px 24px',
                  borderRadius: 12,
                  border: 'none',
                  background: '#EF4444',
                  color: 'white',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                🗑 Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersPage;