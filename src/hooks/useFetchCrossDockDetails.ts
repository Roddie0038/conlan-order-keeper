import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CrossDockRequestItem {
  id: string;
  request_id: string;
  product_number: string;
  description: string | null;
  quantity: number;
  created_at: string;
}

export interface CrossDockRequestAudit {
  id: string;
  request_id: string;
  action: string;
  old_status: string | null;
  new_status: string | null;
  notes: string | null;
  user_email: string | null;
  created_at: string;
}

export function useFetchCrossDockDetails(requestId: string | null) {
  const [items, setItems] = useState<CrossDockRequestItem[]>([]);
  const [auditLog, setAuditLog] = useState<CrossDockRequestAudit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!requestId) {
      setItems([]);
      setAuditLog([]);
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch items
        const { data: itemsData, error: itemsError } = await (supabase as any)
          .from('cross_dock_request_items')
          .select('*')
          .eq('request_id', requestId)
          .order('created_at', { ascending: true });

        if (itemsError) throw itemsError;

        // Fetch audit log
        const { data: auditData, error: auditError } = await (supabase as any)
          .from('cross_dock_request_audit')
          .select('*')
          .eq('request_id', requestId)
          .order('created_at', { ascending: false });

        if (auditError) throw auditError;

        setItems((itemsData || []) as CrossDockRequestItem[]);
        setAuditLog((auditData || []) as CrossDockRequestAudit[]);
      } catch (err) {
        console.error('Error fetching cross-dock details:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [requestId]);

  return {
    items,
    auditLog,
    loading,
    error
  };
}
