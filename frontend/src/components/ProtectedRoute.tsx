import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // We can replace this with a beautiful loader later
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}
