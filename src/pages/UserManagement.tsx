import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { UserManagementDashboard } from '@/components/user-management/UserManagementDashboard';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export default function UserManagement() {
  const { user, session } = useAuth();

  // Enhanced Super Admin access check
  const isSuperAdmin = user?.email?.toLowerCase() === 'roderickdemarais@aol.com';
  const hasValidSession = session?.access_token && session?.user;
  
  if (!hasValidSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <CardTitle>Loading Session...</CardTitle>
            </div>
            <CardDescription>
              Please wait while we verify your authentication.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <CardTitle>Access Denied</CardTitle>
            </div>
            <CardDescription>
              Only Super Admins (roderickdemarais@aol.com) can access User Management.
              {user?.email && (
                <>
                  <br />
                  <span className="text-xs text-muted-foreground">
                    Current user: {user.email}
                  </span>
                </>
              )}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <ErrorBoundary context="User Management Page" onError={(error) => {
      console.error('[UserManagement] Page error:', error);
    }}>
      <UserManagementDashboard />
    </ErrorBoundary>
  );
}