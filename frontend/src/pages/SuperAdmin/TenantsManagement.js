// frontend/src/pages/SuperAdmin/TenantsManagement.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './TenantsManagement.css';

const TenantsManagement = () => {
  const [tenants, setTenants] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [filter, setFilter] = useState({ status: '', plan: '', search: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

  // Formulaire création
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    plan: 'FREE',
    domain: '',
    subdomain: '',
    adminEmail: '',
    adminPassword: '',
    adminName: '',
  });

  useEffect(() => {
    fetchTenants();
  }, [pagination.page, filter]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filter.status && { status: filter.status }),
        ...(filter.plan && { plan: filter.plan }),
        ...(filter.search && { search: filter.search }),
      });

      const response = await api.get(`/tenants?${params}`);
      setTenants(response.data.tenants || []);
      setPagination(response.data.pagination || pagination);
    } catch (err) {
      console.error('[TenantsManagement] Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTenantStats = async (tenantId) => {
    try {
      const response = await api.get(`/tenants/${tenantId}/stats`);
      setStats(prev => ({ ...prev, [tenantId]: response.data }));
    } catch (err) {
      console.error('[Stats] Erreur:', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/tenants', formData);
      setShowModal(false);
      setFormData({
        name: '', slug: '', description: '', plan: 'FREE',
        domain: '', subdomain: '',
        adminEmail: '', adminPassword: '', adminName: '',
      });
      fetchTenants();
      alert(`Tenant "${response.data.tenant.name}" cree avec succes!`);
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de la creation');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/tenants/${id}`, { status });
      fetchTenants();
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment suspendre ce tenant ?')) return;
    try {
      await api.delete(`/tenants/${id}`);
      fetchTenants();
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur');
    }
  };

  const getPlanColor = (plan) => {
    const colors = {
      FREE: '#94a3b8',
      STARTER: '#3b82f6',
      PRO: '#8b5cf6',
      ENTERPRISE: '#f59e0b',
    };
    return colors[plan] || colors.FREE;
  };

  const getStatusBadge = (status) => {
    const badges = {
      ACTIVE: { bg: '#dcfce7', color: '#166534', label: 'Actif' },
      SUSPENDED: { bg: '#fef3c7', color: '#92400e', label: 'Suspendu' },
      PENDING: { bg: '#dbeafe', color: '#1e40af', label: 'En attente' },
      CANCELLED: { bg: '#fee2e2', color: '#991b1b', label: 'Annule' },
    };
    return badges[status] || badges.PENDING;
  };

  return (
    <div className="tenants-management">
      <div className="tenants-management__header">
        <div>
          <h1>Gestion des Tenants</h1>
          <p>Administration multi-tenant de DigiPip</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          Nouveau Tenant
        </button>
      </div>

      {/* Filtres */}
      <div className="tenants-management__filters">
        <input
          type="text"
          placeholder="Rechercher..."
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
        />
        <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
          <option value="">Tous les statuts</option>
          <option value="ACTIVE">Actif</option>
          <option value="SUSPENDED">Suspendu</option>
          <option value="PENDING">En attente</option>
          <option value="CANCELLED">Annule</option>
        </select>
        <select value={filter.plan} onChange={(e) => setFilter({ ...filter, plan: e.target.value })}>
          <option value="">Tous les plans</option>
          <option value="FREE">Free</option>
          <option value="STARTER">Starter</option>
          <option value="PRO">Pro</option>
          <option value="ENTERPRISE">Enterprise</option>
        </select>
      </div>

      {/* Tableau */}
      <div className="tenants-management__table-container">
        <table className="tenants-management__table">
          <thead>
            <tr>
              <th>Tenant</th>
              <th>Plan</th>
              <th>Statut</th>
              <th>Utilisateurs</th>
              <th>Campagnes</th>
              <th>Inscriptions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="loading">Chargement...</td></tr>
            ) : tenants.length === 0 ? (
              <tr><td colSpan="7" className="empty">Aucun tenant trouve</td></tr>
            ) : (
              tenants.map(tenant => {
                const badge = getStatusBadge(tenant.status);
                return (
                  <tr key={tenant.id}>
                    <td>
                      <div className="tenant-cell">
                        <div className="tenant-cell__logo">
                          {tenant.logo ? (
                            <img src={tenant.logo} alt={tenant.name} />
                          ) : (
                            <div className="tenant-cell__placeholder" style={{ background: getPlanColor(tenant.plan) }}>
                              {tenant.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="tenant-cell__info">
                          <span className="tenant-cell__name">{tenant.name}</span>
                          <span className="tenant-cell__slug">@{tenant.slug}</span>
                          {tenant.domain && <span className="tenant-cell__domain">{tenant.domain}</span>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="plan-badge" style={{ background: getPlanColor(tenant.plan) + '20', color: getPlanColor(tenant.plan) }}>
                        {tenant.plan}
                      </span>
                    </td>
                    <td>
                      <span className="status-badge" style={{ background: badge.bg, color: badge.color }}>
                        {badge.label}
                      </span>
                    </td>
                    <td>{tenant._count?.users || 0}</td>
                    <td>{tenant._count?.campagnes || 0}</td>
                    <td>{tenant._count?.inscriptions || 0}</td>
                    <td>
                      <div className="actions">
                        <button className="action-btn" onClick={() => { setSelectedTenant(tenant); fetchTenantStats(tenant.id); }} title="Stats">
                          <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
                        </button>
                        {tenant.status === 'ACTIVE' ? (
                          <button className="action-btn action-btn--warning" onClick={() => handleUpdateStatus(tenant.id, 'SUSPENDED')} title="Suspendre">
                            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                          </button>
                        ) : (
                          <button className="action-btn action-btn--success" onClick={() => handleUpdateStatus(tenant.id, 'ACTIVE')} title="Activer">
                            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                          </button>
                        )}
                        <button className="action-btn action-btn--danger" onClick={() => handleDelete(tenant.id)} title="Supprimer">
                          <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="tenants-management__pagination">
        <button disabled={pagination.page <= 1} onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}>
          Precedent
        </button>
        <span>Page {pagination.page} sur {pagination.pages}</span>
        <button disabled={pagination.page >= pagination.pages} onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}>
          Suivant
        </button>
      </div>

      {/* Modal Creation */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>Nouveau Tenant</h2>
              <button className="modal__close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreate} className="modal__form">
              <div className="form-group">
                <label>Nom du tenant *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Slug * (identifiant unique)</label>
                <input type="text" required pattern="[a-z0-9-]+" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} />
                <small>Ex: digilab-solutions, acme-corp</small>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Plan</label>
                  <select value={formData.plan} onChange={(e) => setFormData({ ...formData, plan: e.target.value })}>
                    <option value="FREE">Free (3 users, 5 campagnes)</option>
                    <option value="STARTER">Starter (10 users, 20 campagnes)</option>
                    <option value="PRO">Pro (50 users, 100 campagnes)</option>
                    <option value="ENTERPRISE">Enterprise (Illimite)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Sous-domaine</label>
                  <input type="text" value={formData.subdomain} onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })} placeholder="mon-entreprise" />
                  <small>.digipip.tn</small>
                </div>
              </div>
              <div className="form-group">
                <label>Domaine personnalise</label>
                <input type="text" value={formData.domain} onChange={(e) => setFormData({ ...formData, domain: e.target.value })} placeholder="campagnes.mon-entreprise.tn" />
              </div>
              <hr />
              <h3>Administrateur du tenant</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Nom</label>
                  <input type="text" value={formData.adminName} onChange={(e) => setFormData({ ...formData, adminName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" required value={formData.adminEmail} onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Mot de passe *</label>
                <input type="password" required minLength="8" value={formData.adminPassword} onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })} />
              </div>
              <div className="modal__actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Creer le tenant</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Stats */}
      {selectedTenant && stats[selectedTenant.id] && (
        <div className="modal-overlay" onClick={() => setSelectedTenant(null)}>
          <div className="modal modal--large" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>Statistiques — {selectedTenant.name}</h2>
              <button className="modal__close" onClick={() => setSelectedTenant(null)}>×</button>
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-card__value">{stats[selectedTenant.id].stats.users}</span>
                <span className="stat-card__label">Utilisateurs</span>
                <div className="stat-card__bar">
                  <div className="stat-card__fill" style={{ width: `${Math.min((stats[selectedTenant.id].stats.users / stats[selectedTenant.id].limits.users) * 100, 100)}%` }}></div>
                </div>
                <span className="stat-card__limit">{stats[selectedTenant.id].stats.users} / {stats[selectedTenant.id].limits.users === Infinity ? '∞' : stats[selectedTenant.id].limits.users}</span>
              </div>
              <div className="stat-card">
                <span className="stat-card__value">{stats[selectedTenant.id].stats.campagnes}</span>
                <span className="stat-card__label">Campagnes</span>
                <div className="stat-card__bar">
                  <div className="stat-card__fill" style={{ width: `${Math.min((stats[selectedTenant.id].stats.campagnes / stats[selectedTenant.id].limits.campagnes) * 100, 100)}%` }}></div>
                </div>
                <span className="stat-card__limit">{stats[selectedTenant.id].stats.campagnes} / {stats[selectedTenant.id].limits.campagnes === Infinity ? '∞' : stats[selectedTenant.id].limits.campagnes}</span>
              </div>
              <div className="stat-card">
                <span className="stat-card__value">{stats[selectedTenant.id].stats.inscriptions}</span>
                <span className="stat-card__label">Inscriptions</span>
                <div className="stat-card__bar">
                  <div className="stat-card__fill" style={{ width: `${Math.min((stats[selectedTenant.id].stats.inscriptions / stats[selectedTenant.id].limits.inscriptions) * 100, 100)}%` }}></div>
                </div>
                <span className="stat-card__limit">{stats[selectedTenant.id].stats.inscriptions} / {stats[selectedTenant.id].limits.inscriptions === Infinity ? '∞' : stats[selectedTenant.id].limits.inscriptions}</span>
              </div>
              <div className="stat-card">
                <span className="stat-card__value">{stats[selectedTenant.id].stats.clients}</span>
                <span className="stat-card__label">Clients</span>
              </div>
              <div className="stat-card">
                <span className="stat-card__value">{stats[selectedTenant.id].stats.paiements}</span>
                <span className="stat-card__label">Paiements</span>
              </div>
              <div className="stat-card">
                <span className="stat-card__value">{stats[selectedTenant.id].stats.feedbacks}</span>
                <span className="stat-card__label">Feedbacks</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantsManagement;