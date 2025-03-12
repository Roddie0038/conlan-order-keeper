
import { supabase } from "@/integrations/supabase/client";
import { InventoryItem, InventoryItemUpdateData } from "@/types/inventory";

/**
 * Adds multiple inventory items at once
 */
export const addInventoryItems = async (items: Omit<InventoryItem, 'id' | 'last_updated' | 'low_stock'>[]) => {
  try {
    // Prepare items for insertion with additional required fields
    const itemsToInsert = items.map(item => ({
      ...item,
      last_updated: new Date().toISOString(),
      // Calculate low_stock flag based on quantity and min_threshold
      low_stock: item.quantity <= item.min_threshold
    }));

    const { data, error } = await supabase
      .from('inventory')
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
  data: InventoryItemUpdateData, 
  currentItem?: InventoryItem
) => {
  try {
    // If we have current item and quantity/threshold is being updated,
    // calculate if it's low stock
    let updateData = { ...data };
    
    if (
      currentItem && 
      (data.quantity !== undefined || data.min_threshold !== undefined)
    ) {
      const newQuantity = data.quantity ?? currentItem.quantity;
      const newThreshold = data.min_threshold ?? currentItem.min_threshold;
      updateData.low_stock = newQuantity <= newThreshold;
    }
    
    // Always update the last_updated timestamp
    updateData.last_updated = new Date().toISOString();

    const { data: updatedItem, error } = await supabase
      .from('inventory')
      .update(updateData)
      .eq('id', id)
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
      .from('inventory')
      .delete()
      .in('id', ids);

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
