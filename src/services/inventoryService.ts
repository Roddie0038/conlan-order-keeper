
import { supabase } from '@/integrations/supabase/client';
import { 
  InventoryItem, 
  DatabaseInventoryItem, 
  InventoryItemUpdateData 
} from '@/types/inventory';

export async function fetchInventory() {
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
  const formattedData = data.map((item: DatabaseInventoryItem) => {
    // TypeScript treats item as the database schema type, so we need to be careful
    // about accessing properties that may not exist yet
    const baseItem = {
      product_number: item.product_number,
      description: item.description,
      quantity: item.quantity,
    };

    return {
      id: item.id || crypto.randomUUID(),
      ...baseItem,
      min_threshold: item.min_threshold || 5,
      last_updated: item.last_updated || new Date().toISOString(),
      low_stock: item.low_stock !== undefined 
        ? item.low_stock 
        : baseItem.quantity <= (item.min_threshold || 5)
    } as InventoryItem;
  });

  return formattedData;
}

export async function addInventoryItems(items: Omit<InventoryItem, 'id' | 'last_updated' | 'low_stock'>[]) {
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
}

export async function updateInventoryItem(
  id: string, 
  data: InventoryItemUpdateData,
  currentItem?: InventoryItem
) {
  // If quantity or min_threshold is updated, recalculate low_stock
  const updateData = { ...data };
  
  if (data.quantity !== undefined || data.min_threshold !== undefined) {
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
}

export async function deleteInventoryItem(id: string) {
  const { error } = await supabase
    .from('inventory_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function deleteMultipleItems(ids: string[]) {
  const { error } = await supabase
    .from('inventory_items')
    .delete()
    .in('id', ids);

  if (error) throw error;
}

export function setupRealtimeSubscription(onUpdate: () => void) {
  console.log('Setting up real-time updates for inventory items');
  
  // Subscribe to all changes to inventory_items table
  const channel = supabase.channel('inventory-updates')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'inventory_items' },
      (payload) => {
        console.log('Real-time inventory update received:', payload);
        onUpdate();
      }
    )
    .subscribe((status) => {
      console.log('Realtime subscription status:', status);
    });

  return channel;
}

export function setupLowStockSubscription(onLowStockUpdate: () => void) {
  console.log('Setting up filtered real-time updates for low stock items');
  
  const lowStockChannel = supabase.channel('low-stock-updates')
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'inventory_items',
        filter: 'low_stock=eq.true' 
      },
      (payload) => {
        console.log('Low stock item updated:', payload);
        onLowStockUpdate();
      }
    )
    .subscribe();

  return lowStockChannel;
}
