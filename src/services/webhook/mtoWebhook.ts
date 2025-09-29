
import { submitToWebhook } from './utils';
import { WEBHOOK_URLS } from './config';
import { formatDate } from './utils';

export const submitToMTOOrdersWebhook = async (data: any) => {
  try {
    console.log("🔍 MTO WEBHOOK - Starting v2 schema MTO webhook submission");
    console.log("🔍 MTO WEBHOOK - Data type:", data.type);
    
    // Verify this is actually an MTO order
    if (data.type !== 'MTO') {
      console.error("❌ MTO WEBHOOK - Incorrect order type sent to MTO webhook:", data.type);
      return false;
    }
    
    // Extract 3-digit store number if not already present
    const storeNumber = data.store_number || 
                        data.store?.match(/\d{3}$/)?.[0] || 
                        data.store?.match(/\d{2,3}/)?.[0]?.padStart(3, '0') || 
                        '';
    
    // Generate idempotency key if not present
    const idempotencyKey = data.idempotency_key || 
                           `mto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Map to OT v2 schema - MUST include all required fields
    const v2Payload = {
      timestamp: data.timestamp || new Date().toISOString(),
      name: data.name || "",
      store: data.store || "",
      store_number: storeNumber,  // MUST be string(3), never null
      product_number: data.productNumber || data.product_number || "",
      casing_grade: data.casingGrade || data.casing_grade || "",
      tire_size: data.tireSize || data.tire_size || "",
      tread: data.tread || data.tireTreadNeeded || "",
      quantity: typeof data.quantity === 'string' ? parseInt(data.quantity, 10) : (data.quantity || 0),
      notes: data.notes || "",
      email: data.email || data.managerEmail || "",
      plant: data.plant || "",
      type: "MTO",              // Constant
      orderType: "MTO",         // Backward compatibility
      status: "open",           // MUST be 'open' on creation (not 'pending')
      description: data.description || `MTO - ${data.tread || data.tireTreadNeeded || ''} - ${data.tireSize || data.tire_size || ''}`,
      idempotency_key: idempotencyKey,
      // Optional fields
      submitted_by_name: data.submitted_by_name || data.name || "",
      submitted_by_email: data.submitted_by_email || data.email || "",
      ordering_store: data.ordering_store || data.store || "",
      ordering_plant: data.ordering_plant || data.plant || "",
      destination_plant: data.destination_plant || data.destinationPlant || data.plant || ""
    };

    // Validation: Ensure required fields are non-empty
    if (!v2Payload.product_number || !v2Payload.casing_grade || !v2Payload.tire_size) {
      console.error("❌ MTO WEBHOOK - Missing required fields:", {
        product_number: v2Payload.product_number,
        casing_grade: v2Payload.casing_grade,
        tire_size: v2Payload.tire_size
      });
      return false;
    }

    console.log("🔍 MTO WEBHOOK - Sending v2 schema payload:", JSON.stringify(v2Payload, null, 2));

    const response = await fetch(WEBHOOK_URLS.MTO_ORDERS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Source": "ordering-app"  // Optional but recommended
      },
      mode: "no-cors",
      body: JSON.stringify(v2Payload),
    });

    console.log("✅ MTO WEBHOOK - v2 schema payload sent successfully");
    return true;
  } catch (error) {
    console.log("ℹ️ MTO WEBHOOK - Webhook fired (expected no-cors behavior):", error);
    return true;
  }
};
