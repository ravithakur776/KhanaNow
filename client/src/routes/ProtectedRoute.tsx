import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { useUIStore } from '../stores/useUIStore';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useUIStore();

  if (!isAuthenticated) {
    // Open auth modal and redirect to home
    openAuthModal('login');
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
