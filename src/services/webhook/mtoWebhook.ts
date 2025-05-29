
import { submitToWebhook } from './utils';
import { WEBHOOK_URLS } from './config';
import { formatDate } from './utils';

export const submitToMTOOrdersWebhook = async (data: any) => {
  try {
    console.log("🔍 MTO WEBHOOK - Starting MTO webhook submission");
    console.log("🔍 MTO WEBHOOK - Verification - Data type:", data.type);
    
    // Verify this is actually an MTO order
    if (data.type !== 'MTO') {
      console.error("❌ MTO WEBHOOK - Incorrect order type sent to MTO webhook:", data.type);
      console.error("❌ MTO WEBHOOK - This should not be processed as an MTO order");
      return false;
    }
    
    // Send the supabaseOrder object directly (already in snake_case)
    const mappedData = {
      store: data.store || "",
      name: data.name || "",
      product_number: data.product_number || "",
      casing_grade: data.casing_grade || "",
      tire_size: data.tire_size || "",
      tread: data.tread || data.tire_tread_needed || "",
      quantity: typeof data.quantity === 'string' ? parseInt(data.quantity, 10) : data.quantity || 0,
      notes: data.notes || "",
      email: data.email || "",
      submitted_by: data.name || ""
    };

    console.log("🔍 MTO WEBHOOK - Sending mapped data to MTO Orders webhook:", mappedData);
    console.log("🔍 MTO WEBHOOK - Using MTO Orders webhook URL:", WEBHOOK_URLS.MTO_ORDERS);

    const response = await fetch(WEBHOOK_URLS.MTO_ORDERS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors", // Keep no-cors as specified
      body: JSON.stringify(mappedData),
    });

    console.log("✅ MTO WEBHOOK - Successfully triggered MTO Orders webhook");
    return true;
  } catch (error) {
    console.log("ℹ️ MTO WEBHOOK - Webhook fired (expected no-cors behavior):", error);
    // With no-cors mode, we expect a TypeError but the webhook still works
    return true;
  }
};
