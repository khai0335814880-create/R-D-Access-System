import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Redirect theo role
const getRedirectPath = (role) => {
  switch (role) {
    case 'engineer':
      return '/devices';
    case 'manager':
      return '/dashboard';
    case 'security':
      return '/dashboard';
    default:
      return '/dashboard';
  }
};

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role)) {
      return <Navigate to={getRedirectPath(user.role)} />;
    }
  }

  return children;
};

export default ProtectedRoute;
