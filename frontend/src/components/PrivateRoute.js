// src/components/PrivateRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children, roles = [] }) => {
  const location = useLocation();
  
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let user = {};
  
  try {
    user = JSON.parse(userStr || '{}');
  } catch (e) {
    user = {};
  }
  
  // Si pas de token, rediriger vers login
  if (!token) {
    return React.createElement(Navigate, { to: '/login', state: { from: location }, replace: true });
  }
  
  // Si pas de rôles spécifiés, tout utilisateur connecté peut accéder
  if (roles.length === 0) {
    return children;
  }
  
  // Normaliser les rôles
  const userRole = (user.role || '').toUpperCase();
  const normalizedRoles = roles.map(r => r.toUpperCase());
  
  // 🔑 CORRECTION : L'admin a accès à TOUT
  if (userRole === 'ADMIN') {
    return children;
  }
  
  // Vérifier si le rôle est autorisé
  if (!normalizedRoles.includes(userRole)) {
    console.log('Accès refusé - Rôle actuel:', userRole, '| Rôles requis:', normalizedRoles);
    return React.createElement(Navigate, { to: '/access-denied', replace: true });
  }
  
  return children;
};

export default PrivateRoute;