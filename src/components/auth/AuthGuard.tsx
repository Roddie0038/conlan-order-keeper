import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { auth, user, isEnriching } = useAuth();
  const location = useLocation();
  
  // Show loading only while auth event is still unknown (initial load)
  if (auth.event === "UNKNOWN") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Handle authentication requirements - check auth state directly
  if (requireAuth && !auth.userId) {
    // Save the attempted location for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect authenticated users away from login page
  if (!requireAuth && auth.userId && location.pathname === '/login') {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  // Signed in: render immediately, don't block on enrichment
  return (
    <>
      {children}
      {/* Optional: subtle non-blocking indicator */}
      {isEnriching && (
        <div className="fixed bottom-2 right-2 text-xs opacity-60 bg-background/80 px-2 py-1 rounded">
          Loading profile…
        </div>
      )}
    </>
  );
}