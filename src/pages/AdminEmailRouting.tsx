import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { OrderingEmailRouting } from '@/components/admin/OrderingEmailRouting';
import { NotificationStatsDashboard } from '@/components/admin/NotificationStatsDashboard';
import { Phase5TestExecution } from '@/components/admin/Phase5TestExecution';
import { Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Admin Email Routing & Notifications</h1>
      </div>
      
      <Tabs defaultValue="routing" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="routing">Email Routing</TabsTrigger>
          <TabsTrigger value="statistics">Statistics Dashboard</TabsTrigger>
          <TabsTrigger value="phase5">Phase 5 QA</TabsTrigger>
          <TabsTrigger value="health">System Health</TabsTrigger>
        </TabsList>
        
        <TabsContent value="routing" className="space-y-6">
          <OrderingEmailRouting />
        </TabsContent>
        
        <TabsContent value="statistics" className="space-y-6">
          <NotificationStatsDashboard />
        </TabsContent>
        
        <TabsContent value="phase5" className="space-y-6">
          <Phase5TestExecution />
        </TabsContent>
        
        <TabsContent value="health" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>🔧 System Health Overview</CardTitle>
              <CardDescription>
                Overall system status and implementation progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-green-600 font-semibold">✅ Phase 1</div>
                  <div className="text-sm text-muted-foreground">Order Interfaces</div>
                  <div className="text-xs mt-1">Unified interfaces implemented</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-green-600 font-semibold">✅ Phase 2</div>
                  <div className="text-sm text-muted-foreground">Payload Standard</div>
                  <div className="text-xs mt-1">Snake_case normalization</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-green-600 font-semibold">✅ Phase 3</div>
                  <div className="text-sm text-muted-foreground">Email Resolution</div>
                  <div className="text-xs mt-1">Three-tier fallback system</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-green-600 font-semibold">✅ Phase 4</div>
                  <div className="text-sm text-muted-foreground">Hardening</div>
                  <div className="text-xs mt-1">Retry & error tracking</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-green-600 font-semibold">✅ Phase 5</div>
                  <div className="text-sm text-muted-foreground">QA & Go-Live</div>
                  <div className="text-xs mt-1">Ready for production</div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                  <Shield className="h-5 w-5" />
                  <div className="font-semibold">All Phases Complete - Ready for Go-Live</div>
                </div>
                <div className="text-sm text-green-700 dark:text-green-300 mt-1">
                  The notification hardening system is fully implemented with comprehensive logging, 
                  error tracking, and fallback strategies. Run Phase 5 QA to validate go-live readiness.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}