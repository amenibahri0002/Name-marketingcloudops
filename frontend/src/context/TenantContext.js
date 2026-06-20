// frontend/src/context/TenantContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import api from '../api';

const TenantContext = createContext();

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant doit être utilisé dans un TenantProvider');
  }
  return context;
};

// Instance axios sans intercepteurs pour la résolution du tenant
const tenantApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

export const TenantProvider = ({ children }) => {
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Résoudre le tenant depuis le sous-domaine ou le localStorage
  const resolveTenant = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Vérifier le localStorage
      const storedTenant = localStorage.getItem('digipip_tenant');
      if (storedTenant) {
        const parsed = JSON.parse(storedTenant);
        // Vérifier que le tenant est toujours valide (sans token, c'est public)
        const response = await tenantApi.get(`/tenants/resolve?slug=${parsed.slug}`);
        if (response.data.status !== 'ACTIVE') {
          localStorage.removeItem('digipip_tenant');
          throw new Error('Tenant suspendu ou inactif');
        }
        setTenant(response.data);
        // Injecter le tenantId dans les headers API
        api.defaults.headers.common['X-Tenant-ID'] = response.data.id;
        return;
      }

      // 2. Résoudre depuis le sous-domaine
      const hostname = window.location.hostname;
      const subdomain = hostname.split('.')[0];

      if (subdomain && subdomain !== 'www' && subdomain !== 'app' && subdomain !== 'localhost') {
        const response = await tenantApi.get(`/tenants/resolve?subdomain=${subdomain}`);
        if (response.data.status === 'ACTIVE') {
          setTenant(response.data);
          localStorage.setItem('digipip_tenant', JSON.stringify(response.data));
          api.defaults.headers.common['X-Tenant-ID'] = response.data.id;
          return;
        }
      }

      // 3. Aucun tenant trouvé — mode sans tenant (landing page)
      setTenant(null);
    } catch (err) {
      console.error('[TenantContext] Erreur résolution:', err.message);
      // Ne PAS bloquer l'app — juste logger l'erreur
      setError(err.response?.data?.error || err.message);
      setTenant(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Changer de tenant manuellement
  const switchTenant = useCallback(async (slug) => {
    try {
      setLoading(true);
      const response = await tenantApi.get(`/tenants/resolve?slug=${slug}`);

      if (response.data.status !== 'ACTIVE') {
        throw new Error('Tenant inactif');
      }

      setTenant(response.data);
      localStorage.setItem('digipip_tenant', JSON.stringify(response.data));
      api.defaults.headers.common['X-Tenant-ID'] = response.data.id;

      // Recharger la page pour réinitialiser les données
      window.location.reload();
    } catch (err) {
      console.error('[TenantContext] Erreur switch:', err);
      setError(err.response?.data?.error || 'Erreur lors du changement de tenant');
    } finally {
      setLoading(false);
    }
  }, []);

  // Déconnecter le tenant
  const clearTenant = useCallback(() => {
    localStorage.removeItem('digipip_tenant');
    delete api.defaults.headers.common['X-Tenant-ID'];
    setTenant(null);
    setError(null);
  }, []);

  useEffect(() => {
    resolveTenant();
  }, [resolveTenant]);

  const value = {
    tenant,
    loading,
    error,
    switchTenant,
    clearTenant,
    isTenantActive: tenant?.status === 'ACTIVE',
    tenantPlan: tenant?.plan,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

export default TenantContext;