import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children, roles = [] }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérification du rôle
  if (roles.length > 0) {
    let userRole = '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userRole = (payload.role || '').toUpperCase();
    } catch (e) {
      return <Navigate to="/login" replace />;
    }

    if (!roles.includes(userRole)) {
      return <Navigate to="/access-denied" replace />;
    }
  }

  return children;
};

export default PrivateRoute;
