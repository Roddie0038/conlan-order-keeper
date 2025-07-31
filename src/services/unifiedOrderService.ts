/**
 * Phase 2: Unified Order Submission Service
 * This service standardizes all order submission logic using unified interfaces
 * and Supabase normalization utilities from Phase 1
 */

import { supabase } from "@/integrations/supabase/client";
import { 
  OrderFormData, 
  MTOFormData, 
  WheelFormData
} from "@/types/orders";
import type { 
  TransferOrderRecord as OrderRecord,
  MTOOrderRecord,
  WheelOrderRecord,
  WarrantyOrderRecord 
} from "@/types/supabase-extensions";
import { 
  normalizeOrderFields, 
  transformToSnakeCase,
  normalizeStoreFormatSync,
  normalizePlantNameSync
} from "@/utils/supabaseNormalization";
import { OrderType } from "@/services/OrderIDService";

// Standardized result type for all order submissions
export interface OrderSubmissionResult<T> {
  data: T | null;
  error: Error | null;
  success: boolean;
}

/**
 * Submit Transfer Order with standardized payload and normalization
 */
export async function submitTransferOrder(
  formData: OrderFormData,
  user?: any
): Promise<OrderSubmissionResult<OrderRecord>> {
  try {
    console.log("🔍 TRANSFER ORDER SUBMIT - Starting with form data:", formData);
    
    // Normalize store and plant fields using Supabase functions
    const normalizedData = await normalizeOrderFields(formData);
    
    // Add standard fields and ensure proper types matching database schema
    const standardizedPayload: Record<string, any> = {
      timestamp: new Date().toISOString(),
      name: normalizedData.name,
      store: normalizedData.store,
      product_number: normalizedData.productNumber,
      description: normalizedData.description,
      quantity: Number(normalizedData.quantity),
      schedule_arrival: normalizedData.scheduleArrival || new Date().toISOString(),
      notes: normalizedData.notes || "",
      status: 'pending',
      completed: false,
      completed_at: null,
      order_type: 'TRANSFER',
      email: normalizedData.email || "",
      plant: normalizedData.plant || "",
      cross_dock_type: normalizedData.crossDock || "No",
      cross_dock_destination: normalizedData.crossDockDestination || null,
      cross_dock_receiver_number: normalizedData.crossDockReceiverNumber || null,
      cross_dock_eta_date: normalizedData.crossDockEtaDate || null,
      destination_manager_email: normalizedData.destinationManagerEmail || null,
      invoice_number: null,
      out_of_stock: null,
      out_of_stock_eta: null,
      out_of_stock_notes: null,
      warehouse_received: null,
      received_at_warehouse: null,
      cross_plant_order: null,
      response_deadline: null,
      store_response_status: null,
      confirmation_token: null,
      archived: false
    };
    
    console.log("🔍 TRANSFER ORDER - Final payload:", standardizedPayload);
    
    const { data, error } = await supabase
      .from('orders')
      .insert(standardizedPayload as any)
      .select()
      .single();
      
    if (error) {
      console.error("❌ TRANSFER ORDER - Supabase error:", error);
      return { data: null, error, success: false };
    }
    
    console.log("✅ TRANSFER ORDER - Successfully saved:", data);
    return { data: data as OrderRecord, error: null, success: true };
    
  } catch (error) {
    const err = error instanceof Error ? error : new Error("Unknown error in submitTransferOrder");
    console.error("❌ TRANSFER ORDER - Unexpected error:", err);
    return { data: null, error: err, success: false };
  }
}

/**
 * Submit MTO Order with standardized payload and normalization
 */
export async function submitMTOOrder(
  formData: MTOFormData,
  user?: any
): Promise<OrderSubmissionResult<MTOOrderRecord>> {
  try {
    console.log("🔍 MTO ORDER SUBMIT - Starting with form data:", formData);
    
    // Normalize store and plant fields using Supabase functions
    const normalizedData = await normalizeOrderFields(formData);
    
    // Add standard fields and ensure proper types for MTO orders matching database schema
    const standardizedPayload: Record<string, any> = {
      timestamp: new Date().toISOString(),
      name: normalizedData.name,
      store: normalizedData.store,
      product_number: normalizedData.productNumber,
      casing_grade: normalizedData.casingGrade || "",
      tire_size: normalizedData.tireSize || "",
      tread: normalizedData.tread || "",
      quantity: Number(normalizedData.quantity),
      notes: normalizedData.notes || "",
      status: 'pending',
      completed: false,
      completed_at: null,
      order_type: 'MTO',
      email: normalizedData.email || "",
      plant: normalizedData.plant || "",
      description: normalizedData.description || "",
      // MTO-specific defaults
      have_casings: false,
      projected_delivery: null, // Use null for date fields when not provided
      tread_in_inventory: false,
      send_invoice: false,
      send_email_trigger: false,
      status_updated_at: new Date().toISOString(),
      ready_to_ship_at: null,
      in_transit_at: null,
      received_at: null,
      shipped_quantity: 0,
      pending_quantity: Number(normalizedData.quantity),
      last_shipment_date: null,
      casings_in_stock: null,
      tread_in_stock: null,
      casings_eta: null,
      tread_eta: null,
      warehouse_notified_at: null,
      retread_notified_at: null,
      store_notified_at: null,
      inventory_last_updated: null,
      deleted_at: null,
      invoice_number: null,
      order_completion_link: null,
      destination_manager_email: null,
      email_message: null,
      cross_dock_form_link: null,
      type: 'MTO',
      updated_by: null
    };
    
    console.log("🔍 MTO ORDER - Final payload:", standardizedPayload);
    
    const { data, error } = await supabase
      .from('mto_orders')
      .insert(standardizedPayload as any)
      .select()
      .single();
      
    if (error) {
      console.error("❌ MTO ORDER - Supabase error:", error);
      return { data: null, error, success: false };
    }
    
    console.log("✅ MTO ORDER - Successfully saved:", data);
    return { data: data as MTOOrderRecord, error: null, success: true };
    
  } catch (error) {
    const err = error instanceof Error ? error : new Error("Unknown error in submitMTOOrder");
    console.error("❌ MTO ORDER - Unexpected error:", err);
    return { data: null, error: err, success: false };
  }
}

/**
 * Submit Wheel Order with standardized payload and normalization
 */
export async function submitWheelOrder(
  formData: WheelFormData,
  user?: any
): Promise<OrderSubmissionResult<WheelOrderRecord>> {
  try {
    console.log("🔍 WHEEL ORDER SUBMIT - Starting with form data:", formData);
    
    // Transform wheel form data to OrderFormData structure
    const orderFormData: OrderFormData = {
      name: formData.yourName,
      store: formData.storeName,
      productNumber: "WHEEL-COATING",
      description: `Wheel coating - ${formData.wheelColor} - ${formData.wheelSize}`,
      quantity: parseInt(formData.qtyWheels) || 0,
      scheduleArrival: formData.scheduleArrival,
      notes: "",
      plant: formData.destinationPlant,
      timestamp: new Date().toISOString(),
      type: "WHEEL_POWDER_COATING" as OrderType,
      // Wheel-specific fields
      customerName: formData.customerName,
      wheelMaterial: formData.wheelMaterial,
      wheelType: formData.wheelType,
      handHoles: parseInt(formData.handHoles) || 0,
      wheelSize: formData.wheelSize,
      wheelColor: formData.wheelColor,
      storeColors: formData.storeColors
    };
    
    // Normalize store and plant fields using Supabase functions
    const normalizedData = await normalizeOrderFields(orderFormData);
    
    // Map to wheel_orders table schema (snake_case with wheel-specific field names)
    const wheelPayload = {
      timestamp: new Date().toISOString(),
      name: normalizedData.name,
      store: normalizedData.store,
      productnumber: normalizedData.productNumber,
      wheeltype: normalizedData.wheelType,
      wheelsize: normalizedData.wheelSize,
      desiredcolor: normalizedData.wheelColor,
      quantity: normalizedData.quantity,
      schedulearrival: normalizedData.scheduleArrival,
      notes: normalizedData.notes || "",
      status: 'pending',
      completed: false,
      plant: normalizedData.plant,
      email: user?.email || "",
      ordertype: 'WHEEL_POWDER_COATING',
      wheelmaterial: normalizedData.wheelMaterial,
      handholes: normalizedData.handHoles,
      // Optional fields
      customerName: normalizedData.customerName,
      dateReceived: formData.dateReceived,
      userStore: normalizedData.store,
      storeColors: normalizedData.storeColors,
      destinationPlant: normalizedData.plant
    };
    
    console.log("🔍 WHEEL ORDER - Final payload:", wheelPayload);
    
    const { data, error } = await supabase
      .from('wheel_orders')
      .insert(wheelPayload)
      .select()
      .single();
      
    if (error) {
      console.error("❌ WHEEL ORDER - Supabase error:", error);
      return { data: null, error, success: false };
    }
    
    console.log("✅ WHEEL ORDER - Successfully saved:", data);
    return { data: data as WheelOrderRecord, error: null, success: true };
    
  } catch (error) {
    const err = error instanceof Error ? error : new Error("Unknown error in submitWheelOrder");
    console.error("❌ WHEEL ORDER - Unexpected error:", err);
    return { data: null, error: err, success: false };
  }
}

/**
 * Universal order submission function that routes to appropriate handler
 */
export async function submitOrder(
  formData: OrderFormData | MTOFormData | WheelFormData,
  orderType: OrderType,
  user?: any
): Promise<OrderSubmissionResult<OrderRecord | MTOOrderRecord | WheelOrderRecord>> {
  
  console.log("🔍 UNIVERSAL SUBMIT - Order type:", orderType, "Form data:", formData);
  
  switch (orderType) {
    case 'TRANSFER':
      return submitTransferOrder(formData as OrderFormData, user);
      
    case 'MTO':
      return submitMTOOrder(formData as MTOFormData, user);
      
    case 'WHEEL_POWDER_COATING':
      return submitWheelOrder(formData as WheelFormData, user);
      
    default:
      return {
        data: null,
        error: new Error(`Unsupported order type: ${orderType}`),
        success: false
      };
  }
}

/**
 * Legacy function for backward compatibility - will be deprecated
 * @deprecated Use submitOrder() or specific submit functions instead
 */
export const saveOrderToSupabase = async (
  order: any,
  user?: any
): Promise<{ data: any | null; error: Error | null }> => {
  console.warn("⚠️ Using deprecated saveOrderToSupabase - consider migrating to new submit functions");
  
  // Determine order type
  let orderType: OrderType = 'TRANSFER';
  if (order.type === 'MTO' || order.orderType === 'MTO') {
    orderType = 'MTO';
  } else if (order.type === 'WHEEL_POWDER_COATING' || order.orderType === 'WHEEL_POWDER_COATING') {
    orderType = 'WHEEL_POWDER_COATING';
  }
  
  const result = await submitOrder(order, orderType, user);
  return { data: result.data, error: result.error };
};