import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;   // set false on public routes like /login
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { auth } = useAuth();
  const location = useLocation();

  // Public routes (requireAuth === false): never block on UNKNOWN
  if (!requireAuth && auth.event === "UNKNOWN") {
    return <>{children}</>;
  }

  // Protected routes: briefly block while resolving initial session
  if (requireAuth && auth.event === "UNKNOWN") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Protected routes: not signed in -> fallback / your redirect to /login
  if (requireAuth && !auth.userId) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect authenticated users away from login page
  if (!requireAuth && auth.userId && location.pathname === '/login') {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  // Signed in: render immediately (enrichment continues in background)
  return <>{children}</>;
}