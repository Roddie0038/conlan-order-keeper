
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InventoryItem {
  id: string;
  product_number: string;
  description: string;
  quantity: number;
  min_threshold: number;
  last_updated: string;
  low_stock: boolean;
}

interface InventoryContextType {
  inventory: InventoryItem[];
  loading: boolean;
  error: string | null;
  refreshInventory: () => Promise<void>;
  addInventoryItems: (items: Omit<InventoryItem, 'id' | 'last_updated' | 'low_stock'>[]) => Promise<void>;
  updateInventoryItem: (id: string, data: Partial<Omit<InventoryItem, 'id' | 'last_updated'>>) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  deleteMultipleItems: (ids: string[]) => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const refreshInventory = async () => {
    try {
      setLoading(true);
      console.log('Fetching inventory from Supabase...');
      
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('product_number');

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Fetched inventory data:', data);

      // Map database column names to our component's expected format
      // This is needed because the Supabase database schema has limited columns
      // compared to what our front-end expects
      const formattedData = data.map(item => ({
        id: item.id || crypto.randomUUID(), // Generate ID if not in database
        product_number: item.product_number,
        description: item.description,
        quantity: item.quantity,
        min_threshold: item.min_threshold || 5, // Default to 5 if not in DB
        last_updated: item.last_updated || new Date().toISOString(), // Default to now if not in DB
        low_stock: item.low_stock || (item.quantity <= (item.min_threshold || 5)) // Calculate if not in DB
      }));

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
      // Map each item to check for low stock and format for database
      const itemsToInsert = items.map(item => ({
        product_number: item.product_number,
        description: item.description,
        quantity: item.quantity,
        min_threshold: item.min_threshold,
        low_stock: item.quantity <= item.min_threshold
      }));

      const { error } = await supabase
        .from('inventory_items')
        .upsert(
          itemsToInsert,
          { 
            onConflict: 'product_number',
            ignoreDuplicates: false
          }
        );

      if (error) throw error;

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

  const updateInventoryItem = async (id: string, data: Partial<Omit<InventoryItem, 'id' | 'last_updated'>>) => {
    try {
      // If quantity or min_threshold is updated, recalculate low_stock
      let updateData = { ...data };
      
      if (data.quantity !== undefined || data.min_threshold !== undefined) {
        // Find the current item
        const currentItem = inventory.find(item => item.id === id);
        if (currentItem) {
          const newQuantity = data.quantity ?? currentItem.quantity;
          const newThreshold = data.min_threshold ?? currentItem.min_threshold;
          updateData.low_stock = newQuantity <= newThreshold;
        }
      }

      const { error } = await supabase
        .from('inventory_items')
        .update({
          ...updateData,
          last_updated: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

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
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

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
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .in('id', ids);

      if (error) throw error;

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
