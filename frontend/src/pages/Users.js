import React, { useState, useEffect } from 'react';
import api from '../api';

function Users() {
  const [users, setUsers]       = useState([]);
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState('RESPONSABLE_MARKETING');
  const [loading, setLoading]   = useState(false);
  const [message, setMessage]   = useState('');

  useEffect(function() {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await api.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await api.post('/api/users', { name, email, password, role });
      setName(''); setEmail(''); setPassword('');
      setMessage('Utilisateur cree avec succes !');
      fetchUsers();
    } catch (err) {
      setMessage('Erreur : ' + (err.response?.data?.message || err.message));
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    try {
      await api.delete('/api/users/' + id);
      fetchUsers();
    } catch (err) {
      alert('Erreur suppression');
    }
  }

  async function handleRoleChange(id, newRole) {
    try {
      await api.patch('/api/users/' + id, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert('Erreur modification role');
    }
  }

  const roleColor = (role) => {
    if (role === 'ADMIN') return { bg: '#fee2e2', color: '#dc2626' }
    if (role === 'RESPONSABLE_MARKETING') return { bg: '#e0f2fe', color: '#0891b2' }
    if (role === 'CLIENT') return { bg: '#ecfdf5', color: '#059669' }
    return { bg: '#f3f4f6', color: '#6b7280' }
  }

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', marginBottom: 24 }}>
        Gestion des comptes
      </h2>

      {/* Formulaire ajout */}
      <div style={{ background: 'white', border: '1px solid #e8e8f0', borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1f2937', marginBottom: 16 }}>
          Ajouter un utilisateur
        </h3>
        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Nom complet</label>
            <input value={name} onChange={e => setName(e.target.value)} required
              placeholder="Ex : Mohamed Ali"
              style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14 }}/>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="email@exemple.com"
              style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14 }}/>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••"
              style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14 }}/>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Role</label>
            <select value={role} onChange={e => setRole(e.target.value)}
              style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14 }}>
              <option value="RESPONSABLE_MARKETING">Responsable Marketing</option>
              <option value="CLIENT">Client</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" disabled={loading}
              style={{ padding: '10px 24px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', width: '100%' }}>
              {loading ? 'Ajout...' : '+ Ajouter'}
            </button>
          </div>
        </form>
        {message && (
          <p style={{ marginTop: 12, fontSize: 13, color: message.includes('Erreur') ? '#dc2626' : '#059669' }}>
            {message}
          </p>
        )}
      </div>

      {/* Liste utilisateurs */}
      <div style={{ background: 'white', border: '1px solid #e8e8f0', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1f2937', margin: 0 }}>
            Tous les utilisateurs ({users.length})
          </h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['Nom', 'Email', 'Role', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr><td colSpan="4" style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>Aucun utilisateur</td></tr>
            )}
            {users.map(function(u) {
              const rc = roleColor(u.role);
              return (
                <tr key={u.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                  <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 500, color: '#1f2937' }}>{u.name}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>{u.email}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: rc.bg, color: rc.color, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
                      {u.role === 'RESPONSABLE_MARKETING' ? 'Resp. Marketing' : u.role === 'ADMIN' ? 'Admin' : 'Client'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', display: 'flex', gap: 8 }}>
                    <select onChange={e => handleRoleChange(u.id, e.target.value)} defaultValue={u.role}
                      style={{ padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12 }}>
                      <option value="RESPONSABLE_MARKETING">Resp. Marketing</option>
                      <option value="CLIENT">Client</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <button onClick={() => handleDelete(u.id)}
                      style={{ padding: '6px 12px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>
                      Supprimer
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Users;