
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Sets up a realtime subscription for inventory changes
 */
export const setupRealtimeSubscription = (callback: () => Promise<void>): RealtimeChannel => {
  console.log('Setting up realtime subscription for inventory');
  
  const channel = supabase.channel('inventory-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'inventory',
      },
      (payload) => {
        console.log('Received realtime update:', payload);
        callback();
      }
    )
    .subscribe((status) => {
      console.log('Realtime subscription status:', status);
    });

  return channel;
};

/**
 * Sets up a filtered subscription for low stock inventory items
 */
export const setupLowStockSubscription = (callback: () => void): RealtimeChannel => {
  console.log('Setting up filtered subscription for low stock items');
  
  const channel = supabase.channel('low-stock-changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'inventory',
        filter: 'low_stock=eq.true',
      },
      (payload) => {
        console.log('Low stock item updated:', payload);
        callback();
      }
    )
    .subscribe((status) => {
      console.log('Low stock subscription status:', status);
    });

  return channel;
};
