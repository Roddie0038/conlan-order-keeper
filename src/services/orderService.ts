
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
    // Initial validation for non-MTO orders only
    if (order.type !== 'MTO' && order.type !== 'mto') {
      console.log("🔍 ORDER SERVICE - Validating non-MTO fields:", {
        hasStore: !!order.store,
        storeValue: order.store,
        hasProductNumber: !!order.productNumber,
        productNumberValue: order.productNumber,
        orderType: order.type,
        allKeys: Object.keys(order)
      });
      
      if (!order.store || !order.productNumber) {
        console.error("❌ ORDER SERVICE - Missing required fields:", { 
          hasStore: !!order.store, 
          hasProductNumber: !!order.productNumber,
          storeValue: order.store,
          productNumberValue: order.productNumber
        });
        return { 
          data: null, 
          error: new Error("Missing required fields: store and productNumber are required") 
        };
      }
    }
    
    // Handle MTO orders
    if (order.type === 'MTO' || order.type === 'mto') {
      console.log("🔍 ORDER SERVICE - Processing MTO order with original data:", {
        hasStore: !!order.store,
        storeValue: order.store,
        hasProductNumber: !!order.productNumber,
        productNumberValue: order.productNumber,
        orderType: order.type
      });
      
      const formattedOrder = mapMTOToSupabase(order, user);
      
      // Validate mapped MTO fields
      console.log("🔍 ORDER SERVICE - Post-mapping MTO validation:", {
        hasRequiredFields: !!(formattedOrder.store && formattedOrder.product_number),
        store: formattedOrder.store,
        product_number: formattedOrder.product_number,
        userContext: user ? { id: user.id, email: user.email } : 'No user',
        formattedOrder: formattedOrder
      });
      
      if (!formattedOrder.store || !formattedOrder.product_number) {
        console.error("❌ ORDER SERVICE - Missing required fields after mapping:", { 
          hasStore: !!formattedOrder.store, 
          hasProductNumber: !!formattedOrder.product_number,
          storeValue: formattedOrder.store,
          productNumberValue: formattedOrder.product_number,
          originalForm: { store: order.store, productNumber: order.productNumber }
        });
        return { 
          data: null, 
          error: new Error("Missing required fields after mapping: store and product_number are required") 
        };
      }
      
      // Deep inspection of payload before any processing
      console.log("🔍 ORDER SERVICE - RAW payload inspection:", {
        fullPayload: JSON.stringify(formattedOrder, null, 2),
        allKeys: Object.keys(formattedOrder),
        idKeys: Object.keys(formattedOrder).filter(key => key.toLowerCase().includes('id')),
        hasOrderId: 'order_id' in formattedOrder,
        hasId: 'id' in formattedOrder,
        orderIdValue: formattedOrder.order_id,
        idValue: formattedOrder.id
      });

      // CRITICAL: Completely scrub any ID fields that could cause UUID conflicts
      const scrubber = (obj: any): any => {
        const scrubbed = { ...obj };
        
        // Remove any variation of order_id or id
        delete scrubbed.order_id;
        delete scrubbed.id;
        delete scrubbed.orderId;
        delete scrubbed.ID;
        delete scrubbed.ORDER_ID;
        
        return scrubbed;
      };

      const cleanData = scrubber(formattedOrder);
      
      // Assertion safeguard - force delete if somehow still present
      if ('order_id' in cleanData) {
        delete cleanData.order_id;
        console.warn("⚠️ ORDER SERVICE - Forcibly removed order_id that somehow persisted");
      }
      
      if ('id' in cleanData) {
        delete cleanData.id;
        console.warn("⚠️ ORDER SERVICE - Forcibly removed id that somehow persisted");
      }
      
      console.log("🔍 ORDER SERVICE - Final scrubbed payload:", {
        originalKeys: Object.keys(formattedOrder),
        scrubbedKeys: Object.keys(cleanData),
        removedFields: Object.keys(formattedOrder).filter(key => !Object.keys(cleanData).includes(key)),
        finalPayload: JSON.stringify(cleanData, null, 2),
        hasAnyIdFields: Object.keys(cleanData).some(key => key.toLowerCase().includes('id'))
      });

      // COMPREHENSIVE PAYLOAD DEBUG - Before Supabase call
      console.log("🔍 FINAL PAYLOAD ANALYSIS - About to call Supabase:");
      console.log("🔍 PAYLOAD - Raw object:", cleanData);
      console.log("🔍 PAYLOAD - All keys:", Object.keys(cleanData));
      console.log("🔍 PAYLOAD - ID-related keys:", Object.keys(cleanData).filter(k => k.toLowerCase().includes('id')));
      console.log("🔍 PAYLOAD - Stringified:", JSON.stringify(cleanData, null, 2));
      
      // Check for any hidden properties
      for (const key in cleanData) {
        if (cleanData.hasOwnProperty(key)) {
          console.log(`🔍 PAYLOAD - ${key}:`, typeof cleanData[key], cleanData[key]);
        }
      }
      
      // Check prototype chain for hidden properties
      const allKeys = Object.getOwnPropertyNames(cleanData);
      console.log("🔍 PAYLOAD - All property names:", allKeys);
      
      // FINAL CRITICAL CHECK for order_id before Supabase call
      if ('order_id' in cleanData) {
        console.error("🚨 CRITICAL - order_id FOUND IN PAYLOAD BEFORE SUPABASE CALL:", cleanData.order_id);
        delete cleanData.order_id;
        console.log("🧹 EMERGENCY - DELETED order_id from payload");
      }

      // Double check for any remaining problematic fields
      const problematicFields = ['order_id', 'orderId', 'ORDER_ID', 'id', 'ID'];
      problematicFields.forEach(field => {
        if (field in cleanData) {
          console.error(`🚨 CRITICAL - ${field} FOUND IN PAYLOAD:`, cleanData[field]);
          delete cleanData[field];
          console.log(`🧹 EMERGENCY - DELETED ${field} from payload`);
        }
      });

      const { data, error } = await supabase
        .from('mto_orders')
        .insert(cleanData)
        .select()
        .single();
        
      console.log("🔍 ORDER SERVICE - MTO insert response:", {
        hasData: !!data,
        hasError: !!error,
        data: data,
        error: error
      });
        
      if (error) {
        console.error("❌ ORDER SERVICE - Error saving to mto_orders:", error);
        return { data: null, error };
      }
      
      if (!data) {
        console.error("❌ ORDER SERVICE - No data returned from mto_orders insert");
        return { data: null, error: new Error("No data returned from Supabase insert") };
      }
      
      console.log("✅ ORDER SERVICE - Successfully saved to mto_orders:", data);
      return { data: data as MTOOrderRecord, error: null };
    }
    
    // Handle Wheel orders
    if (order.type === 'WHEEL_POWDER_COATING') {
      const formattedOrder = {
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
      
      console.log("🔍 ORDER SERVICE - Inserting into wheel_orders table with formatted data:", formattedOrder);
      
      const { data, error } = await supabase
        .from('wheel_orders')
        .insert(formattedOrder)
        .select()
        .single();
        
      if (error) {
        console.error("❌ ORDER SERVICE - Error saving to wheel_orders:", error);
        return { data: null, error };
      }
      
      console.log("✅ ORDER SERVICE - Successfully saved to wheel_orders:", data);
      return { data: data as WheelOrderRecord, error: null };
    }
    
    // Handle regular transfer orders (default case)
    const formattedOrder = mapOrderToSupabase(order, user);
    console.log("🔍 ORDER SERVICE - Inserting into orders table with formatted data:", formattedOrder);
    
    const { data, error } = await supabase
      .from('orders')
      .insert(formattedOrder)
      .select()
      .single();
      
    if (error) {
      console.error("❌ ORDER SERVICE - Error saving to orders:", error);
      return { data: null, error };
    }
    
    console.log("✅ ORDER SERVICE - Successfully saved to orders:", data);
    return { data: data as TransferOrderRecord, error: null };
    
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
