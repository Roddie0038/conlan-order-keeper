
import { supabase } from "@/integrations/supabase/client";
import type { OrderData, MTOOrderData, SupabaseInsertResult, MTOOrderRecord, TransferOrderRecord, WheelOrderRecord } from "@/types/supabase-extensions";
import { mapOrderToSupabase } from "@/utils/mapOrderToSupabase";
import { mapMTOToSupabase } from "@/utils/mapMTOToSupabase";

/**
 * Save an order to Supabase using proper field mapping with standardized return type
 * 
 * @param order The order data to save
 * @param user User information for mapping
 * @returns A promise resolving to the standardized result structure
 */
export const saveOrderToSupabase = async (
  order: OrderData | MTOOrderData, 
  user?: any
): Promise<SupabaseInsertResult<MTOOrderRecord | TransferOrderRecord | WheelOrderRecord>> => {
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
    
    // Determine target table and map data appropriately
    let targetTable = 'orders';
    let formattedOrder: any;
    
    if (order.type === 'MTO' || order.type === 'mto') {
      targetTable = 'mto_orders';
      formattedOrder = mapMTOToSupabase(order, user);
    } else if (order.type === 'WHEEL_POWDER_COATING') {
      targetTable = 'wheel_orders';
      // Use existing mapping for wheel orders since they already work
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
        crossdocktype: (order as OrderData).crossDock || "No",
        crossdockdestination: (order as OrderData).crossDockDestination || null,
        wheelmaterial: (order as OrderData).wheelMaterial,
        wheeltype: (order as OrderData).wheelType,
        handholes: (order as OrderData).handHoles,
        wheelsize: (order as OrderData).wheelSize,
        desiredcolor: (order as OrderData).wheelColor,
        status: order.status || "pending",
        statusupdatedat: new Date().toISOString(),
      };
    } else {
      // Regular transfer orders
      formattedOrder = mapOrderToSupabase(order, user);
    }
    
    console.log(`🔍 ORDER SERVICE - Inserting into ${targetTable} table with formatted data:`, formattedOrder);
    
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
