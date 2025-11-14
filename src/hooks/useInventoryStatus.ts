import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface InventoryStatus {
  status: "available" | "low" | "out_of_stock";
  quantity: number;
  lastUpdated: string;
}

export function useInventoryStatus(productNumber: string, plant: string) {
  const [inventoryStatus, setInventoryStatus] = useState<InventoryStatus | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productNumber || !plant) {
      setInventoryStatus(null);
      return;
    }

    const fetchInventoryStatus = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('inventory_cache' as any)
          .select('quantity, status, last_updated_at')
          .eq('product_number', productNumber)
          .eq('plant', plant)
          .maybeSingle();

        if (error) {
          console.error('[Inventory Status] Fetch error:', error);
          setInventoryStatus(null);
          return;
        }

        if (!data) {
          setInventoryStatus(null);
          return;
        }

        // Determine status based on quantity and status field
        let displayStatus: "available" | "low" | "out_of_stock" = "available";
        
        const itemQuantity = (data as any).quantity || 0;
        const itemStatus = (data as any).status || '';
        
        if (itemStatus === 'out_of_stock' || itemQuantity === 0) {
          displayStatus = "out_of_stock";
        } else if (itemQuantity < 10) {
          displayStatus = "low";
        }

        setInventoryStatus({
          status: displayStatus,
          quantity: itemQuantity,
          lastUpdated: (data as any).last_updated_at
        });
      } catch (error) {
        console.error('[Inventory Status] Error:', error);
        setInventoryStatus(null);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryStatus();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`inventory-status-${productNumber}-${plant}`)
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'inventory_cache',
          filter: `product_number=eq.${productNumber},plant=eq.${plant}`
        },
        () => {
          fetchInventoryStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [productNumber, plant]);

  return { inventoryStatus, loading };
}
