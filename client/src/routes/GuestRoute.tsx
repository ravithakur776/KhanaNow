import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

export const GuestRoute: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'restaurant_owner') return <Navigate to="/merchant/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
