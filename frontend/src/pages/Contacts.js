import React, { useState, useEffect } from 'react';
import api from '../api';

function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [clients, setClients] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [clientId, setClientId] = useState('');

  const fetchAll = async () => {
    const [co, cl] = await Promise.all([
      api.get('/api/contacts'),
      api.get('/api/clients')
    ]);
    setContacts(co.data);
    setClients(cl.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await api.post('/api/contacts', { name, email, phone, clientId });
    setName(''); setEmail(''); setPhone(''); setClientId('');
    fetchAll();
  };

  const handleDelete = async (id) => {
    await api.delete(`/api/contacts/${id}`);
    fetchAll();
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>📋 Contacts</h2>
      <form onSubmit={handleAdd} style={{ marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input placeholder="Nom" value={name} onChange={e => setName(e.target.value)}
          style={{ padding: 8 }} required />
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
          style={{ padding: 8 }} required />
        <input placeholder="Téléphone" value={phone} onChange={e => setPhone(e.target.value)}
          style={{ padding: 8 }} required />
        <select value={clientId} onChange={e => setClientId(e.target.value)} style={{ padding: 8 }}>
          <option value="">-- Client --</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button type="submit" style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' }}>
          Ajouter
        </button>
      </form>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f3f4f6' }}>
            <th style={{ padding: 10, textAlign: 'left' }}>Nom</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Email</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Téléphone</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Client</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map(c => (
            <tr key={c.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: 10 }}>{c.name}</td>
              <td style={{ padding: 10 }}>{c.email}</td>
              <td style={{ padding: 10 }}>{c.phone}</td>
              <td style={{ padding: 10 }}>{c.client?.name}</td>
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

export default Contacts;