
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { setupRealtimeSubscription, setupLowStockSubscription } from '@/services/inventoryService';

export function useInventorySubscription(refreshInventory: () => Promise<void>) {
  const { toast } = useToast();

  // Set up real-time updates
  useEffect(() => {
    console.log('Setting up real-time updates for inventory items');
    
    const channel = setupRealtimeSubscription(refreshInventory);

    // Cleanup function
    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [refreshInventory]);

  // Set up filtered channel for low stock items
  useEffect(() => {
    console.log('Setting up filtered real-time updates for low stock items');
    
    const handleLowStockUpdate = () => {
      toast({
        title: "Low Stock Alert",
        description: "An item with low stock has been updated",
        variant: "destructive"
      });
      refreshInventory();
    };

    const lowStockChannel = setupLowStockSubscription(handleLowStockUpdate);

    return () => {
      supabase.removeChannel(lowStockChannel);
    };
  }, [refreshInventory, toast]);
}
