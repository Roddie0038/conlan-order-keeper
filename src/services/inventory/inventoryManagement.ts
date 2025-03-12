
import { supabase } from "@/integrations/supabase/client";
import { InventoryItem, InventoryItemUpdateData } from "@/types/inventory";

/**
 * Adds multiple inventory items at once
 */
export const addInventoryItems = async (items: Omit<InventoryItem, 'id' | 'last_updated' | 'low_stock'>[]) => {
  try {
    const itemsToInsert = items.map(item => ({
      product_number: item.product_number,
      description: item.description,
      quantity: item.quantity
    }));

    const { data, error } = await supabase
      .from('inventory_items')
      .insert(itemsToInsert)
      .select();

    if (error) {
      console.error('Error adding inventory items:', error);
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error("Failed to add inventory items:", error.message);
    throw error;
  }
};

/**
 * Updates an inventory item with new data
 */
export const updateInventoryItem = async (
  id: string, 
  data: InventoryItemUpdateData
) => {
  try {
    const updateData = {
      product_number: data.product_number,
      description: data.description,
      quantity: data.quantity
    };

    const { data: updatedItem, error } = await supabase
      .from('inventory_items')
      .update(updateData)
      .eq('product_number', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }

    return updatedItem;
  } catch (error: any) {
    console.error("Failed to update inventory item:", error.message);
    throw error;
  }
};

/**
 * Deletes multiple inventory items by their IDs
 */
export const deleteMultipleItems = async (ids: string[]) => {
  try {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .in('product_number', ids);

    if (error) {
      console.error('Error deleting multiple inventory items:', error);
      throw error;
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete inventory items:", error.message);
    throw error;
  }
};
