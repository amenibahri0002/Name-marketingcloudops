// frontend/src/components/TenantSelector/TenantSelector.js
import React, { useState, useEffect } from 'react';
import { useTenant } from '../../context/TenantContext';
import api from '../../services/api';
import './TenantSelector.css';

const TenantSelector = () => {
  const { tenant, switchTenant, clearTenant } = useTenant();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tenants?page=1&limit=50');
      setTenants(response.data.tenants || []);
    } catch (err) {
      console.error('[TenantSelector] Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (slug) => {
    switchTenant(slug);
    setIsOpen(false);
  };

  const handleClear = () => {
    clearTenant();
    setIsOpen(false);
  };

  return (
    <div className="tenant-selector">
      <button 
        className="tenant-selector__trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        {tenant ? (
          <>
            <span className="tenant-selector__logo">
              {tenant.logo ? (
                <img src={tenant.logo} alt={tenant.name} />
              ) : (
                <div className="tenant-selector__placeholder">
                  {tenant.name.charAt(0).toUpperCase()}
                </div>
              )}
            </span>
            <span className="tenant-selector__name">{tenant.name}</span>
            <span className="tenant-selector__plan">{tenant.plan}</span>
          </>
        ) : (
          <>
            <span className="tenant-selector__placeholder">?</span>
            <span className="tenant-selector__name">Selectionner un tenant</span>
          </>
        )}
        <svg className={`tenant-selector__arrow ${isOpen ? 'open' : ''}`} viewBox="0 0 24 24">
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {isOpen && (
        <div className="tenant-selector__dropdown">
          <div className="tenant-selector__search">
            <input 
              type="text" 
              placeholder="Rechercher un tenant..."
              onChange={(e) => {
                const term = e.target.value.toLowerCase();
                const filtered = tenants.filter(t => 
                  t.name.toLowerCase().includes(term) || 
                  t.slug.toLowerCase().includes(term)
                );
                setTenants(filtered);
              }}
            />
          </div>

          <div className="tenant-selector__list">
            {loading ? (
              <div className="tenant-selector__loading">Chargement...</div>
            ) : tenants.length === 0 ? (
              <div className="tenant-selector__empty">Aucun tenant disponible</div>
            ) : (
              tenants.map(t => (
                <button
                  key={t.id}
                  className={`tenant-selector__item ${tenant?.id === t.id ? 'active' : ''}`}
                  onClick={() => handleSelect(t.slug)}
                >
                  <span className="tenant-selector__item-logo">
                    {t.logo ? (
                      <img src={t.logo} alt={t.name} />
                    ) : (
                      <div className="tenant-selector__item-placeholder">
                        {t.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </span>
                  <div className="tenant-selector__item-info">
                    <span className="tenant-selector__item-name">{t.name}</span>
                    <span className="tenant-selector__item-slug">@{t.slug}</span>
                  </div>
                  <span className={`tenant-selector__item-status tenant-selector__item-status--${t.status.toLowerCase()}`}>
                    {t.status}
                  </span>
                  <span className="tenant-selector__item-plan">{t.plan}</span>
                </button>
              ))
            )}
          </div>

          {tenant && (
            <button className="tenant-selector__clear" onClick={handleClear}>
              <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              Deconnecter le tenant
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TenantSelector;