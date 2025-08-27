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
  const origin = searchParams.get('origin');
  const dest = searchParams.get('dest');
  const kind = searchParams.get('kind');

  useEffect(() => {
    if (!origin || !dest || !kind) {
      console.log('🧭 NAV: Missing regional ordering params, redirecting to step 1');
      navigate('/regional-ordering', { replace: true });
    }
  }, [origin, dest, kind, navigate]);

  if (!hasRegionalOrderingAccess(user)) return <Navigate to="/" replace />;
  if (!origin || !dest || !kind) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <RegionalOrderingStep2 origin={origin} dest={dest} kind={kind} />
      </div>
    </div>
  );
}