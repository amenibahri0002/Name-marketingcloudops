import React, { useState, useEffect } from 'react';
import api from '../api';

function Clients() {
  const [clients, setClients] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const fetchClients = async () => {
    const res = await api.get('/api/clients');
    setClients(res.data);
  };

  useEffect(() => { fetchClients(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await api.post('/api/clients', { name, email });
    setName(''); setEmail('');
    fetchClients();
  };

  const handleDelete = async (id) => {
    await api.delete(`/api/clients/${id}`);
    fetchClients();
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>👥 Clients</h2>
      <form onSubmit={handleAdd} style={{ marginBottom: 20 }}>
        <input placeholder="Nom" value={name} onChange={e => setName(e.target.value)}
          style={{ marginRight: 10, padding: 8 }} required />
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
          style={{ marginRight: 10, padding: 8 }} required />
        <button type="submit" style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' }}>
          Ajouter
        </button>
      </form>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f3f4f6' }}>
            <th style={{ padding: 10, textAlign: 'left' }}>Nom</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Email</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(c => (
            <tr key={c.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: 10 }}>{c.name}</td>
              <td style={{ padding: 10 }}>{c.email}</td>
              <td style={{ padding: 10 }}>
                <button onClick={() => handleDelete(c.id)}
                  style={{ padding: '4px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' }}>
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Clients;