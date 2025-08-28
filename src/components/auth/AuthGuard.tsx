import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { user, loading, isEnriching } = useAuth();
  const location = useLocation();
  
  // Show loading while auth is being determined or user data is being enriched
  if (loading || isEnriching) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">
            {loading ? 'Checking authentication...' : 'Loading user data...'}
          </p>
        </div>
      </div>
    );
  }

  // Handle authentication requirements
  if (requireAuth && !user) {
    // Save the attempted location for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect authenticated users away from login page
  if (!requireAuth && user && location.pathname === '/login') {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}