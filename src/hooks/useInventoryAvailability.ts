import { useEffect, useState } from "react";
import { checkInventoryAvailability, subscribeToInventoryUpdates } from "@/services/otPlatformClient";

interface InventoryData {
  available: boolean;
  quantity: number;
  status: string;
  lastUpdated: string;
}

export function useInventoryAvailability(productNumber: string, plant: string) {
  const [loading, setLoading] = useState(false);
  const [inventory, setInventory] = useState<InventoryData | null>(null);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!productNumber || !plant) {
        setInventory(null);
        return;
      }

      setLoading(true);
      try {
        const result = await checkInventoryAvailability(productNumber, plant);
        setInventory(result);
      } catch (error) {
        console.error('Failed to check inventory:', error);
        setInventory(null);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the check to avoid too many requests
    const timer = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timer);
  }, [productNumber, plant]);

  // Set up real-time subscription
  useEffect(() => {
    if (!productNumber || !plant) return;

    console.log(`[Inventory] Subscribing to real-time updates for ${productNumber} @ ${plant}`);
    
    const unsubscribe = subscribeToInventoryUpdates(
      productNumber,
      plant,
      (update) => {
        console.log(`[Inventory] Real-time update received:`, update);
        setInventory({
          available: update.status === 'available' && update.quantity > 0,
          quantity: update.quantity,
          status: update.status,
          lastUpdated: update.last_updated_at
        });
      }
    );

    return unsubscribe;
  }, [productNumber, plant]);

  return { loading, inventory };
}
