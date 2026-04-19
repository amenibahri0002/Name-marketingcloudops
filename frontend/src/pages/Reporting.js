import React, { useState, useEffect } from 'react';
import api from '../api';
const handleExport = async (type) => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(
      `https://marketingcloudops-backend.onrender.com/api/export/${type}`,
      { headers: { Authorization: 'Bearer ' + token } }
    )
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${type}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Erreur export:', err)
  }
}
function Reporting() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    api.get('/api/stats').then(res => setStats(res.data));
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h2>Reporting des campagnes</h2>
      {stats.length === 0 ? (
        <p style={{ color: '#6b7280' }}>Aucune statistique disponible.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ padding: 10, textAlign: 'left' }}>Campagne</th>
              <th style={{ padding: 10, textAlign: 'left' }}>Client</th>
              <th style={{ padding: 10, textAlign: 'left' }}>Envoyes</th>
              <th style={{ padding: 10, textAlign: 'left' }}>Ouvertures</th>
              <th style={{ padding: 10, textAlign: 'left' }}>Clics</th>
              <th style={{ padding: 10, textAlign: 'left' }}>Conversions</th>
              <th style={{ padding: 10, textAlign: 'left' }}>Taux ouverture</th>
            </tr>
          </thead>
          <tbody>
            {stats.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: 10 }}>{s.campagne ? s.campagne.title : ''}</td>
                <td style={{ padding: 10 }}>{s.campagne && s.campagne.client ? s.campagne.client.name : ''}</td>
                <td style={{ padding: 10 }}>
                  <span style={{ background: '#4f46e5', color: 'white', padding: '2px 8px', borderRadius: 10 }}>
                    {s.emailsSent}
                  </span>
                </td>
                <td style={{ padding: 10 }}>
                  <span style={{ background: '#0891b2', color: 'white', padding: '2px 8px', borderRadius: 10 }}>
                    {s.opens}
                  </span>
                </td>
                <td style={{ padding: 10 }}>
                  <span style={{ background: '#059669', color: 'white', padding: '2px 8px', borderRadius: 10 }}>
                    {s.clicks}
                  </span>
                </td>
                <td style={{ padding: 10 }}>
                  <span style={{ background: '#d97706', color: 'white', padding: '2px 8px', borderRadius: 10 }}>
                    {s.conversions}
                  </span>
                </td>
                <td style={{ padding: 10 }}>
                  {s.emailsSent > 0 ? Math.round((s.opens / s.emailsSent) * 100) + '%' : '0%'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Reporting;