import { supabase } from "@/integrations/supabase/client";

export interface InventoryCacheItem {
  id: string;
  product_number: string;
  plant: string;
  quantity: number;
  status: string;
  last_updated_at: string;
  min_threshold?: number;
  low_stock: boolean;
}

export async function fetchInventoryCache() {
  const { data, error } = await supabase
    .from('inventory_cache' as any)
    .select('*')
    .order('last_updated_at', { ascending: false });

  if (error) {
    console.error('[InventoryCache] Fetch error:', error);
    throw error;
  }

  return ((data || []) as unknown) as InventoryCacheItem[];
}

export function subscribeToInventoryCache(callback: (payload: any) => void) {
  const channel = supabase
    .channel('inventory_cache_changes')
    .on(
      'postgres_changes' as any,
      {
        event: '*',
        schema: 'public',
        table: 'inventory_cache'
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
