import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children, roles = [] }) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userRole = payload.role?.toUpperCase().trim(); // Normalisation en MAJUSCULE

    // Si aucun rôle n'est spécifié → on autorise tous les utilisateurs connectés
    if (roles.length === 0) {
      return children;
    }

    // Sinon on vérifie si le rôle de l'utilisateur est dans la liste autorisée
    if (roles.includes(userRole)) {
      return children;
    }

    console.warn(`Accès refusé - Rôle actuel: ${userRole} | Rôles requis:`, roles);
    return <Navigate to="/access-denied" replace />;
  } catch (err) {
    console.error("Erreur lors du décodage du token:", err);
    return <Navigate to="/login" replace />;
  }
}

export default PrivateRoute;