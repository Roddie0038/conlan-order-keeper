
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

  const formattedData = data.map((item: DatabaseInventoryItem) => {
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

interface UpdateDataType {
  product_number?: string;
  description?: string;
  quantity?: number;
  min_threshold?: number;
  low_stock?: boolean;
  last_updated: string;
}

export async function updateInventoryItem(
  id: string, 
  data: InventoryItemUpdateData,
  currentItem?: InventoryItem
) {
  const updateData: UpdateDataType = { 
    ...data,
    last_updated: new Date().toISOString() 
  };
  
  if (data.quantity !== undefined || data.min_threshold !== undefined) {
    if (currentItem) {
      const newQuantity = data.quantity ?? currentItem.quantity;
      const newThreshold = data.min_threshold ?? currentItem.min_threshold;
      updateData.low_stock = newQuantity <= newThreshold;
    }
  }

  const { error } = await supabase
    .from('inventory_items')
    .update(updateData)
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

export async function decreaseInventoryQuantity(productNumber: string, quantityToDecrease: number) {
  console.log(`Attempting to decrease inventory for ${productNumber} by ${quantityToDecrease}`);
  
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .ilike('product_number', productNumber)
    .limit(1);
  
  if (error) {
    console.error('Error finding inventory item:', error);
    return { status: 'error', message: 'Item not found in inventory', error };
  }
  
  if (!data || data.length === 0) {
    console.error(`Product not found in inventory: ${productNumber}`);
    return { 
      status: 'error', 
      message: `Product ${productNumber} not found in inventory` 
    };
  }
  
  const inventoryItem = data[0] as DatabaseInventoryItem;
  console.log('Found inventory item:', inventoryItem);
  
  // Set default min_threshold if it's undefined
  const minThreshold = inventoryItem.min_threshold ?? 5;
  const currentQuantity = inventoryItem.quantity;
  const newQuantity = Math.max(0, currentQuantity - quantityToDecrease);
  
  console.log(`Updating inventory: Current quantity: ${currentQuantity}, New quantity: ${newQuantity}`);
  
  // Use a simplified update payload to avoid type issues
  const updatePayload = { 
    quantity: newQuantity,
    low_stock: newQuantity <= minThreshold,
    last_updated: new Date().toISOString()
  };
  
  const { error: updateError } = await supabase
    .from('inventory_items')
    .update(updatePayload)
    .eq('id', inventoryItem.id);
  
  if (updateError) {
    console.error('Error updating inventory:', updateError);
    return { status: 'error', message: 'Failed to update inventory', error: updateError };
  }
  
  return { 
    status: 'success', 
    previous: currentQuantity, 
    current: newQuantity,
    productNumber: inventoryItem.product_number
  };
}

export function setupRealtimeSubscription(onUpdate: () => void) {
  console.log('Setting up real-time updates for inventory items');
  
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
