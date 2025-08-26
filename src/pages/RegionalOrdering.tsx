import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { hasRegionalOrderingAccess } from '@/utils/regionalOrderingAccess';
import { RegionalOrderingForm } from '@/components/regional-ordering/RegionalOrderingForm';
import { RoleAccessGuard } from '@/components/regional-ordering/RoleAccessGuard';
import { RegionalOrderingHeader } from '@/components/regional-ordering/RegionalOrderingHeader';

export default function RegionalOrdering() {
  const { user } = useAuth();

  if (!hasRegionalOrderingAccess(user)) {
    return <RoleAccessGuard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <RegionalOrderingHeader />
        <RegionalOrderingForm />
      </div>
    </div>
  );
}