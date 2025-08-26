import React, { useEffect } from 'react';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { hasRegionalOrderingAccess } from '@/utils/regionalOrderingAccess';
import { RegionalOrderingStep2 } from '@/components/regional-ordering/RegionalOrderingStep2';

export default function RegionalOrderingSubmit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check for required parameters
  const plant = searchParams.get('plant');
  const store = searchParams.get('store');

  useEffect(() => {
    if (!plant || !store) navigate('/regional-ordering', { replace: true });
  }, [plant, store, navigate]);

  if (!hasRegionalOrderingAccess(user)) return <Navigate to="/" replace />;
  if (!plant || !store) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <RegionalOrderingStep2 plant={plant} store={store} />
      </div>
    </div>
  );
}