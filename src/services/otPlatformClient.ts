import { supabase } from "@/integrations/supabase/client";

/**
 * Check real-time inventory availability from OT Platform cache
 */
export async function checkInventoryAvailability(
  productNumber: string,
  plant: string
): Promise<{
  available: boolean;
  quantity: number;
  status: string;
  lastUpdated: string;
} | null> {
  try {
    const { data, error } = await supabase
      .from('inventory_cache' as any)
      .select('*')
      .eq('product_number', productNumber)
      .eq('plant', plant)
      .single();

    if (error || !data) {
      console.warn(`[OT Client] No inventory data for ${productNumber} @ ${plant}`);
      return null;
    }

    return {
      available: (data as any).status === 'available' && (data as any).quantity > 0,
      quantity: (data as any).quantity,
      status: (data as any).status,
      lastUpdated: (data as any).last_updated_at
    };
  } catch (error) {
    console.error('[OT Client] Failed to check inventory:', error);
    return null;
  }
}

/**
 * Get inventory sync history for a product
 */
export async function getInventorySyncHistory(
  productNumber: string,
  plant: string,
  limit: number = 10
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('inventory_sync_log' as any)
      .select('*')
      .eq('product_number', productNumber)
      .eq('plant', plant)
      .order('synced_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[OT Client] Failed to fetch sync history:', error);
    return [];
  }
}

/**
 * Subscribe to real-time inventory updates for a specific product
 */
export function subscribeToInventoryUpdates(
  productNumber: string,
  plant: string,
  callback: (update: any) => void
) {
  const channel = supabase
    .channel(`inventory-${productNumber}-${plant}`)
    .on(
      'postgres_changes' as any,
      {
        event: '*',
        schema: 'public',
        table: 'inventory_cache',
        filter: `product_number=eq.${productNumber},plant=eq.${plant}`
      },
      (payload) => {
        console.log('[OT Client] Inventory update received:', payload);
        callback(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Get all out-of-stock items for a plant
 */
export async function getOutOfStockItems(plant: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('inventory_cache' as any)
      .select('*')
      .eq('plant', plant)
      .eq('status', 'out_of_stock')
      .order('last_updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[OT Client] Failed to fetch out-of-stock items:', error);
    return [];
  }
}
