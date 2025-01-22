// components/Auth/PrivateRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider.tsx';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'student';
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};