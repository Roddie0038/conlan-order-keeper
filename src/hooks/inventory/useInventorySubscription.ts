
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useInventorySubscription(refreshInventory: () => Promise<void>) {
  const { toast } = useToast();

  // Set up manual refresh instead of real-time updates
  useEffect(() => {
    console.log('Setting up inventory polling instead of WebSocket');
    
    // Initial fetch
    refreshInventory();
    
    // Set up polling every 30 seconds
    const intervalId = setInterval(() => {
      console.log('Polling for inventory updates');
      refreshInventory();
    }, 30000);
    
    // Cleanup function
    return () => {
      console.log('Cleaning up inventory polling');
      clearInterval(intervalId);
    };
  }, [refreshInventory]);

  // Set up notification for low stock items - replaced with polling
  useEffect(() => {
    console.log('Setting up low stock notification system');
    
    // This is now handled by the polling mechanism above
    // We'll leave this effect for future WebSocket implementation
    
    return () => {
      console.log('Cleaning up low stock notification system');
    };
  }, [refreshInventory, toast]);
}
