import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CrossDockRequest {
  id: string;
  request_number: string;
  requesting_store: string;
  sending_store: string;
  plant: string;
  status: string;
  created_at: string;
  updated_at: string;
  desired_delivery_date: string | null;
  notes: string | null;
  submitted_by_name: string | null;
  submitted_by_email: string | null;
}

export function useFetchCrossDockRequests() {
  const [requests, setRequests] = useState<CrossDockRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchRequests = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await (supabase as any)
        .from('cross_dock_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setRequests((data || []) as CrossDockRequest[]);
    } catch (err) {
      console.error('Error fetching cross-dock requests:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    // Set up real-time subscription
    const channel = (supabase as any)
      .channel('cross_dock_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cross_dock_requests'
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      (supabase as any).removeChannel(channel);
    };
  }, [user]);

  return {
    requests,
    loading,
    error,
    refreshRequests: fetchRequests
  };
}
