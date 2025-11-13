import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RegionalTransferRecord {
  id: string;
  submitted_by_name: string;
  submitted_by_email: string;
  submitted_by_store: string;
  date_received: string;
  product_number: string;
  product_description: string;
  quantity: number;
  transport_method: string;
  transport_custom_carrier: string | null;
  transport_cost_responsibility: string;
  transfer_type: string;
  source_plant: string;
  target_store: string;
  target_plant: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useFetchRegionalTransfers() {
  const [transfers, setTransfers] = useState<RegionalTransferRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('regional_transfers' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransfers((data as any) || []);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching regional transfers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  return {
    transfers,
    loading,
    error,
    refreshTransfers: fetchTransfers
  };
}
