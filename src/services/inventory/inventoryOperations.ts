
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { InventoryItem } from "@/types/inventory";

/**
 * Fetches all inventory items from the database
 */
export const fetchInventory = async (): Promise<InventoryItem[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*');

    if (error) {
      console.error("Error fetching inventory:", error);
      toast({
        title: "Error",
        description: "Failed to fetch inventory. Please try again.",
        variant: "destructive"
      });
      return [];
    }

    return data.map(item => ({
      id: item.product_number, // Using product_number as id since it's unique
      product_number: item.product_number,
      description: item.description,
      quantity: item.quantity,
      min_threshold: 0, // Set default min_threshold to 0
      last_updated: new Date().toISOString(),
      low_stock: item.quantity <= 0 // Update low_stock check to use 0 as the threshold
    })) || [];
  } catch (error: any) {
    console.error("Unexpected error fetching inventory:", error.message);
    toast({
      title: "Error",
      description: `Unexpected error: ${error.message}. Please contact support.`,
      variant: "destructive"
    });
    return [];
  }
};

/**
 * Updates the quantity of an inventory item
 */
export const updateInventoryQuantity = async (productNumber: string, newQuantity: number) => {
  try {
    const { data: existingItems, error: fetchError } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('product_number', productNumber);

    if (fetchError) {
      console.error('Error fetching inventory:', fetchError);
      return { success: false, error: fetchError };
    }

    if (existingItems && existingItems.length > 0) {
      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({ quantity: newQuantity })
        .eq('product_number', productNumber);

      if (updateError) {
        console.error('Error updating inventory:', updateError);
        return { success: false, error: updateError };
      }

      return { success: true };
    }

    return { success: false, error: 'Item not found' };
  } catch (error: any) {
    console.error("Unexpected error updating inventory:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Decreases the quantity of an inventory item
 */
export const decreaseInventoryQuantity = async (productNumber: string, amount: number) => {
  const { data: existingItems, error: fetchError } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('product_number', productNumber);

  if (fetchError) {
    console.error('Error fetching inventory:', fetchError);
    return { success: false, error: fetchError };
  }

  if (existingItems && existingItems.length > 0) {
    const item = existingItems[0];
    const newQuantity = Math.max(0, item.quantity - amount);
    const oldQuantity = item.quantity;

    // Use a simpler approach to avoid deep type instantiation
    const updatePayload = {
      quantity: newQuantity,
      last_updated: new Date().toISOString(),
    };

    // Check if quantity is below threshold (now zero)
    const threshold = 0; // Set threshold to 0
    const isLow = newQuantity <= threshold;

    const { error: updateError } = await supabase
      .from('inventory_items')
      .update(updatePayload)
      .eq('product_number', productNumber);

    if (updateError) {
      console.error('Error updating inventory:', updateError);
      return { success: false, error: updateError };
    }

    return { 
      success: true, 
      isLow, 
      newQuantity,
      status: 'success',
      message: `Inventory updated successfully`,
      productNumber: item.product_number,
      previous: oldQuantity,
      current: newQuantity
    };
  }

  return { 
    success: false, 
    error: 'Item not found',
    status: 'error',
    message: 'Item not found'
  };
};

/**
 * Increases the quantity of an inventory item
 */
export const increaseInventoryQuantity = async (productNumber: string, amount: number) => {
  try {
    const { data: existingItems, error: fetchError } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('product_number', productNumber);

    if (fetchError) {
      console.error('Error fetching inventory:', fetchError);
      return { success: false, error: fetchError };
    }

    if (existingItems && existingItems.length > 0) {
      const item = existingItems[0];
      const newQuantity = item.quantity + amount;

      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({ quantity: newQuantity, last_updated: new Date().toISOString() })
        .eq('product_number', productNumber);

      if (updateError) {
        console.error('Error updating inventory:', updateError);
        return { success: false, error: updateError };
      }

      return { success: true, newQuantity };
    }

    return { success: false, error: 'Item not found' };
  } catch (error: any) {
    console.error("Unexpected error increasing inventory:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Creates a new inventory item
 */
export const createInventoryItem = async (
  productNumber: string, 
  description: string, 
  quantity: number, 
  minThreshold: number
) => {
  try {
    const { error } = await supabase
      .from('inventory_items')
      .insert([{
        product_number: productNumber,
        description: description,
        quantity: quantity
      }]);

    if (error) {
      console.error('Error creating inventory item:', error);
      return { success: false, error: error };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Unexpected error creating inventory item:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Deletes an inventory item
 */
export const deleteInventoryItem = async (productNumber: string) => {
  try {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('product_number', productNumber);

    if (error) {
      console.error('Error deleting inventory item:', error);
      return { success: false, error: error };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Unexpected error deleting inventory item:", error.message);
    return { success: false, error: error.message };
  }
};
