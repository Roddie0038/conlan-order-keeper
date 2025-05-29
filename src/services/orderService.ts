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
    if (!order.store || !order.productNumber) {
      console.error("❌ ORDER SERVICE - Missing required fields:", { 
        hasStore: !!order.store, 
        hasProductNumber: !!order.productNumber
      });
      return { 
        data: null, 
        error: new Error("Missing required fields: store and productNumber are required") 
      };
    }
    
    // Convert the order type based on the type field
    let targetTable = 'orders';
    if (order.type === 'MTO' || order.type === 'mto') {
      targetTable = 'mto_orders';
    } else if (order.type === 'WHEEL_POWDER_COATING') {
      targetTable = 'wheel_orders';
    }

    // Since we're now using camelCase throughout, we only need to map to database snake_case columns
    let formattedOrder: any;
    
    if (targetTable === 'mto_orders') {
      // Handle MTO-specific fields - map camelCase to snake_case for database
      const mtoOrder = order as MTOOrderData;
      formattedOrder = {
        id: mtoOrder.id,
        name: mtoOrder.name,
        store: mtoOrder.store,
        product_number: mtoOrder.productNumber,
        casing_grade: mtoOrder.casingGrade,
        tire_size: mtoOrder.tireSize,
        tread: mtoOrder.tread || mtoOrder.tireTreadNeeded,
        quantity: mtoOrder.quantity,
        notes: mtoOrder.notes,
        email: mtoOrder.email || mtoOrder.managerEmail,
        plant: mtoOrder.plant,
        timestamp: mtoOrder.timestamp || new Date().toISOString(),
        order_type: mtoOrder.orderType || 'MTO',
        type: mtoOrder.type || 'MTO',
        status: mtoOrder.status || "pending",
        status_updated_at: new Date().toISOString(),
        description: mtoOrder.description,
      };
    } else if (targetTable === 'wheel_orders') {
      // Handle wheel orders - mapping camelCase to snake_case for database
      formattedOrder = {
        id: order.id,
        name: (order as OrderData).yourName || order.name,
        store: order.store,
        productnumber: order.productNumber,
        description: (order as OrderData).description,
        quantity: order.quantity,
        schedulearrival: (order as OrderData).scheduleArrival,
        notes: order.notes,
        email: order.email,
        timestamp: order.timestamp || new Date().toISOString(),
        plant: order.plant,
        ordertype: order.type,
        
        // Cross-dock specific fields - use database column names
        crossdocktype: (order as OrderData).crossDock || "No",
        crossdockdestination: (order as OrderData).crossDockDestination || null,
        
        // Wheel-specific fields - map camelCase to snake_case
        wheelmaterial: (order as OrderData).wheelMaterial,
        wheeltype: (order as OrderData).wheelType,
        handholes: (order as OrderData).handHoles,
        wheelsize: (order as OrderData).wheelSize,
        desiredcolor: (order as OrderData).wheelColor,
        
        // Status fields
        status: order.status || "pending",
        statusupdatedat: new Date().toISOString(),
      };
    } else {
      // Handle regular orders - map camelCase to snake_case for database
      formattedOrder = {
        name: (order as OrderData).yourName || order.name,
        store: order.store,
        product_number: order.productNumber,
        description: (order as OrderData).description,
        quantity: order.quantity,
        schedule_arrival: (order as OrderData).scheduleArrival,
        notes: order.notes,
        email: order.email,
        timestamp: order.timestamp || new Date().toISOString(),
        plant: order.plant,
        order_type: order.type,
        
        // Cross-dock specific fields - use database column names
        cross_dock_type: (order as OrderData).crossDock || "No",
        cross_dock_destination: (order as OrderData).crossDockDestination || null,
        
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
