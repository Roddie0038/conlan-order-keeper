import { supabase } from "@/integrations/supabase/client";
import type { OrderData } from "@/types/supabase-extensions";

/**
 * Save an order to Supabase
 * 
 * @param order The order data to save
 * @returns A promise resolving to the saved order or an error
 */
export const saveOrderToSupabase = async (order: OrderData) => {
  console.log("🔍 ORDER SERVICE - Saving order to Supabase:", order);
  
  try {
    // Ensure we have the required fields
    if (!order.store || !order.product_number) {
      console.error("❌ ORDER SERVICE - Missing required fields:", { 
        hasStore: !!order.store, 
        hasProductNumber: !!order.product_number
      });
      return { 
        data: null, 
        error: new Error("Missing required fields: store and product_number are required") 
      };
    }
    
    // Convert the order type based on the type field
    let targetTable = 'orders';
    if (order.type === 'MTO') {
      targetTable = 'mto_orders';
    } else if (order.type === 'WHEEL_POWDER_COATING') {
      targetTable = 'wheel_orders';
    }

    // Format data for Supabase - convert frontend field names to database column names
    const formattedOrder = {
      // For the id field, use numeric ID for orders table, keep UUID for other tables
      ...(targetTable === 'orders' ? {} : { id: order.id }),
      name: order.yourName || order.name,
      store: order.store,
      product_number: order.product_number,
      description: order.description,
      quantity: order.quantity,
      schedule_arrival: order.schedule_arrival,
      notes: order.notes,
      email: order.email || order.managerEmail || order.managersEmail,
      timestamp: order.timestamp || new Date().toISOString(),
      plant: order.plant,
      order_type: order.type,
      
      // Cross-dock specific fields - use database column names
      cross_dock_type: order.crossDock || order.cross_dock_type || "No",
      cross_dock_destination: order.crossDockDestination || order.cross_dock_destination || null,
      cross_dock_receiver_number: order.receiverNo || order.cross_dock_receiver_number || null,
      cross_dock_eta_date: order.etaDate || order.cross_dock_eta_date || null,
      destination_manager_email: order.destinationManagerEmail || order.destination_manager_email || null,
      
      // Status fields
      status: order.status || "pending",
      status_updated_at: new Date().toISOString(),
    };
    
    console.log(`🔍 ORDER SERVICE - Inserting into ${targetTable} table with formatted data:`, formattedOrder);
    
    // Force a network request by disabling cache
    const { data, error } = await supabase
      .from(targetTable as any)
      .insert(formattedOrder)
      .select()
      .single();
      
    if (error) {
      console.error(`❌ ORDER SERVICE - Error saving to ${targetTable}:`, error);
      return { data: null, error };
    }
    
    console.log(`✅ ORDER SERVICE - Successfully saved to ${targetTable}:`, data);
    return { data, error: null };
  } catch (error) {
    console.error("❌ ORDER SERVICE - Unexpected error in saveOrderToSupabase:", error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error("Unknown error in saveOrderToSupabase") 
    };
  }
};

/**
 * Get all orders from Supabase
 * 
 * @returns A promise resolving to the orders or an error
 */
export const getAllOrders = async () => {
  try {
    console.log("🔍 ORDER SERVICE - Fetching all orders");
    
    // Add a timestamp to avoid cached results
    const timestamp = Date.now();
    
    // Query orders table
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('timestamp', { ascending: false });
      
    if (ordersError) {
      console.error("❌ ORDER SERVICE - Error fetching orders:", ordersError);
      return { data: [], error: ordersError };
    }
    
    // Query MTO orders table
    const { data: mtoOrders, error: mtoError } = await supabase
      .from('mto_orders')
      .select('*')
      .order('timestamp', { ascending: false });
      
    if (mtoError) {
      console.error("❌ ORDER SERVICE - Error fetching MTO orders:", mtoError);
      return { data: orders || [], error: mtoError };
    }
    
    // Query wheel orders table
    const { data: wheelOrders, error: wheelError } = await supabase
      .from('wheel_orders')
      .select('*')
      .order('timestamp', { ascending: false });
      
    if (wheelError) {
      console.error("❌ ORDER SERVICE - Error fetching wheel orders:", wheelError);
      return { data: [...(orders || []), ...(mtoOrders || [])], error: wheelError };
    }
    
    // Combine all orders
    const allOrders = [
      ...(orders || []).map(order => ({ ...order, order_type: order.order_type || 'TRANSFER' })),
      ...(mtoOrders || []).map(order => ({ ...order, order_type: 'MTO' })),
      ...(wheelOrders || []).map(order => ({ ...order, order_type: 'WHEEL_POWDER_COATING' }))
    ];
    
    console.log(`✅ ORDER SERVICE - Successfully fetched ${allOrders.length} orders`);
    return { data: allOrders, error: null };
  } catch (error) {
    console.error("❌ ORDER SERVICE - Unexpected error in getAllOrders:", error);
    return { 
      data: [], 
      error: error instanceof Error ? error : new Error("Unknown error in getAllOrders") 
    };
  }
};
