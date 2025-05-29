import { supabase } from "@/integrations/supabase/client";
import type { OrderData, MTOOrderData } from "@/types/supabase-extensions";

/**
 * Save an order to Supabase
 * 
 * @param order The order data to save
 * @returns A promise resolving to the saved order or an error
 */
export const saveOrderToSupabase = async (order: OrderData | MTOOrderData) => {
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
    if (order.type === 'MTO' || order.type === 'mto') {
      targetTable = 'mto_orders';
    } else if (order.type === 'WHEEL_POWDER_COATING') {
      targetTable = 'wheel_orders';
    }

    // Format data for Supabase - convert frontend field names to database column names
    let formattedOrder: any;
    
    if (targetTable === 'mto_orders') {
      // Handle MTO-specific fields
      const mtoOrder = order as MTOOrderData;
      formattedOrder = {
        // For the id field, use UUID for MTO orders
        id: mtoOrder.id,
        name: mtoOrder.name,
        store: mtoOrder.store,
        product_number: mtoOrder.product_number,
        casing_grade: mtoOrder.casing_grade,
        tire_size: mtoOrder.tire_size,
        tread: mtoOrder.tread || mtoOrder.tire_tread_needed,
        quantity: mtoOrder.quantity,
        notes: mtoOrder.notes,
        email: mtoOrder.email || mtoOrder.manager_email,
        plant: mtoOrder.plant,
        timestamp: mtoOrder.timestamp || new Date().toISOString(),
        order_type: mtoOrder.order_type || 'MTO',
        type: mtoOrder.type || 'MTO',
        status: mtoOrder.status || "pending",
        status_updated_at: new Date().toISOString(),
        
        // Additional MTO fields
        have_casings: mtoOrder.have_casings || false,
        tread_in_inventory: mtoOrder.tread_in_inventory || false,
        projected_delivery: mtoOrder.projected_delivery,
        completed: mtoOrder.completed || false,
        send_invoice: mtoOrder.send_invoice || false,
        send_email_trigger: mtoOrder.send_email_trigger || false,
        ready_to_ship_at: mtoOrder.ready_to_ship_at,
        in_transit_at: mtoOrder.in_transit_at,
        received_at: mtoOrder.received_at,
        completed_at: mtoOrder.completed_at,
        cross_dock_form_link: mtoOrder.cross_dock_form_link,
        email_message: mtoOrder.email_message,
        destination_manager_email: mtoOrder.destination_manager_email,
        order_completion_link: mtoOrder.order_completion_link,
        invoice_number: mtoOrder.invoice_number,
        description: mtoOrder.description,
      };
    } else {
      // Handle regular orders and wheel orders
      formattedOrder = {
        // For the id field, use numeric ID for orders table, keep UUID for other tables
        ...(targetTable === 'orders' ? {} : { id: order.id }),
        name: (order as OrderData).yourName || order.name,
        store: order.store,
        product_number: order.product_number,
        description: (order as OrderData).description,
        quantity: order.quantity,
        schedule_arrival: (order as OrderData).schedule_arrival,
        notes: order.notes,
        email: order.email || (order as OrderData).managerEmail || (order as OrderData).managersEmail,
        timestamp: order.timestamp || new Date().toISOString(),
        plant: order.plant,
        order_type: order.type,
        
        // Cross-dock specific fields - use database column names
        cross_dock_type: (order as OrderData).crossDock || (order as OrderData).cross_dock_type || "No",
        cross_dock_destination: (order as OrderData).crossDockDestination || (order as OrderData).cross_dock_destination || null,
        cross_dock_receiver_number: (order as OrderData).receiverNo || (order as OrderData).cross_dock_receiver_number || null,
        cross_dock_eta_date: (order as OrderData).etaDate || (order as OrderData).cross_dock_eta_date || null,
        destination_manager_email: (order as OrderData).destinationManagerEmail || (order as OrderData).destination_manager_email || null,
        
        // Status fields
        status: order.status || "pending",
        status_updated_at: new Date().toISOString(),
      };
    }
    
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
