import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldX, ArrowLeft } from 'lucide-react';

export function RoleAccessGuard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <ShieldX className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Access Restricted
          </h1>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-slate-600 dark:text-slate-400">
            Regional ordering is only available to plant management roles including:
          </p>
          
          <ul className="text-sm text-slate-500 dark:text-slate-500 space-y-1">
            <li>• Super Admin</li>
            <li>• Warehouse Manager</li>
            <li>• Retread Manager</li>
            <li>• Plant Manager</li>
            <li>• Operations Manager</li>
          </ul>
          
          <div className="pt-4">
            <Button 
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}