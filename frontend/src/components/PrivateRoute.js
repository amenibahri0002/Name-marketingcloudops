import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children, roles }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;

  if (roles) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userRole = payload.role;
      if (!roles.includes(userRole)) {
        return <Navigate to="/access-denied" />;
      }
    } catch (err) {
      return <Navigate to="/login" />;
    }
  }

  return children;
}

export default PrivateRoute;