
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  InventoryItem, 
  InventoryContextType,
  InventoryItemUpdateData
} from '@/types/inventory';
import {
  fetchInventory,
  addInventoryItems as addItems,
  updateInventoryItem as updateItem,
  deleteInventoryItem as deleteItem,
  deleteMultipleItems as deleteItems,
  setupRealtimeSubscription,
  setupLowStockSubscription
} from '@/services/inventoryService';

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const refreshInventory = async () => {
    try {
      setLoading(true);
      const formattedData = await fetchInventory();
      setInventory(formattedData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching inventory:', err);
      setError('Failed to load inventory data');
      toast({
        title: 'Error',
        description: 'Failed to load inventory data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addInventoryItems = async (items: Omit<InventoryItem, 'id' | 'last_updated' | 'low_stock'>[]) => {
    try {
      await addItems(items);
      // Refresh inventory to get the latest data
      await refreshInventory();
    } catch (err: any) {
      console.error('Error adding inventory items:', err);
      toast({
        title: 'Error',
        description: 'Failed to add inventory items. Please try again.',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const updateInventoryItem = async (id: string, data: InventoryItemUpdateData) => {
    try {
      // Find current item for low_stock calculation
      const currentItem = inventory.find(item => item.id === id);
      // Fix by removing the third argument since updateItem only expects 2 arguments
      await updateItem(id, data);
      // Refresh inventory to get the latest data
      await refreshInventory();
    } catch (err: any) {
      console.error('Error updating inventory item:', err);
      toast({
        title: 'Error',
        description: 'Failed to update inventory item. Please try again.',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const deleteInventoryItem = async (id: string) => {
    try {
      await deleteItem(id);
      // Update local state
      setInventory(inventory.filter(item => item.id !== id));
    } catch (err: any) {
      console.error('Error deleting inventory item:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete inventory item. Please try again.',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const deleteMultipleItems = async (ids: string[]) => {
    try {
      await deleteItems(ids);
      // Update local state
      setInventory(inventory.filter(item => !ids.includes(item.id)));
      
      toast({
        title: 'Items Deleted',
        description: `${ids.length} inventory items have been removed.`
      });
    } catch (err: any) {
      console.error('Error deleting multiple inventory items:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete inventory items. Please try again.',
        variant: 'destructive'
      });
      throw err;
    }
  };

  // Load initial inventory data
  useEffect(() => {
    console.log('InventoryProvider mounted, fetching initial data');
    refreshInventory();
  }, []);

  // Set up real-time updates
  useEffect(() => {
    const channel = setupRealtimeSubscription(refreshInventory);
    
    // Cleanup function
    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, []);

  // Set up low stock real-time updates
  useEffect(() => {
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
  }, [toast]);

  const value = {
    inventory,
    loading,
    error,
    refreshInventory,
    addInventoryItems,
    updateInventoryItem,
    deleteInventoryItem,
    deleteMultipleItems
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventoryContext() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventoryContext must be used within an InventoryProvider');
  }
  return context;
}

// Export types for convenience
export type { InventoryItem, InventoryItemUpdateData } from '@/types/inventory';
