import React, { useState, useEffect } from 'react';
import api from '../api';

function Campagnes() {
  const [campagnes, setCampagnes] = useState([]);
  const [clients, setClients] = useState([]);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('email');
  const [clientId, setClientId] = useState('');
  const [dateScheduled, setDateScheduled] = useState('');

  const fetchAll = async () => {
    const [c, cl] = await Promise.all([
      api.get('/api/campagnes'),
      api.get('/api/clients')
    ]);
    setCampagnes(c.data);
    setClients(cl.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await api.post('/api/campagnes', { title, type, clientId, dateScheduled });
    setTitle(''); setType('email'); setClientId(''); setDateScheduled('');
    fetchAll();
  };

  const handleDelete = async (id) => {
    await api.delete('/api/campagnes/' + id);
    fetchAll();
  };

  const handleStatus = async (id, status) => {
    await api.patch('/api/campagnes/' + id, { status });
    fetchAll();
  };

  const statusColor = (status) => {
    if (status === 'sent') return '#059669';
    if (status === 'scheduled') return '#0891b2';
    return '#6b7280';
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Campagnes</h2>
      <form onSubmit={handleAdd} style={{ marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input placeholder="Titre" value={title} onChange={e => setTitle(e.target.value)} style={{ padding: 8 }} required />
        <select value={type} onChange={e => setType(e.target.value)} style={{ padding: 8 }}>
          <option value="email">Email</option>
          <option value="sms">SMS</option>
          <option value="push">Push</option>
        </select>
        <select value={clientId} onChange={e => setClientId(e.target.value)} style={{ padding: 8 }} required>
          <option value="">-- Client --</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="datetime-local" value={dateScheduled} onChange={e => setDateScheduled(e.target.value)} style={{ padding: 8 }} />
        <button type="submit" style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' }}>
          Ajouter
        </button>
      </form>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f3f4f6' }}>
            <th style={{ padding: 10, textAlign: 'left' }}>Titre</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Type</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Status</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Client</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Date</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {campagnes.map(c => (
            <tr key={c.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: 10 }}>{c.title}</td>
              <td style={{ padding: 10 }}>{c.type}</td>
              <td style={{ padding: 10 }}>
                <span style={{ background: statusColor(c.status), color: 'white', padding: '2px 8px', borderRadius: 10, fontSize: 12 }}>
                  {c.status}
                </span>
              </td>
              <td style={{ padding: 10 }}>{c.client ? c.client.name : ''}</td>
              <td style={{ padding: 10 }}>{c.dateScheduled ? new Date(c.dateScheduled).toLocaleString() : '-'}</td>
              <td style={{ padding: 10, display: 'flex', gap: 5 }}>
                <button onClick={() => handleStatus(c.id, 'scheduled')} style={{ padding: '4px 8px', background: '#0891b2', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 12 }}>
                  Planifier
                </button>
                <button onClick={() => handleStatus(c.id, 'sent')} style={{ padding: '4px 8px', background: '#059669', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 12 }}>
                  Envoyer
                </button>
                <button onClick={() => handleDelete(c.id)} style={{ padding: '4px 8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 12 }}>
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

export default Campagnes;