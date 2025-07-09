import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { OrderingEmailRouting } from '@/components/admin/OrderingEmailRouting';
import { Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminEmailRouting() {
  const { user } = useAuth();

  // Super Admin access check
  const isSuperAdmin = user?.email === 'roderickdemarais@aol.com';

  if (!isSuperAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>
              This page is restricted to Super Admin only.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              You do not have permission to access the email routing configuration panel.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <OrderingEmailRouting />;
}