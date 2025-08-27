import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { hasRegionalOrderingAccess } from '@/utils/regionalOrderingAccess';
import { RegionalOrderingStep1 } from '@/components/regional-ordering/RegionalOrderingStep1';
import { RoleAccessGuard } from '@/components/regional-ordering/RoleAccessGuard';

export default function RegionalOrdering() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!hasRegionalOrderingAccess(user)) {
    return <RoleAccessGuard />;
  }

  const handleContinue = (originOtId: string, destinationOtId: string, destinationKind: 'plant' | 'store') => {
    const params = new URLSearchParams({
      origin: originOtId,
      dest: destinationOtId,
      kind: destinationKind,
    });
    navigate(`/regional-ordering/submit?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <RegionalOrderingStep1 onContinue={handleContinue} />
      </div>
    </div>
  );
}