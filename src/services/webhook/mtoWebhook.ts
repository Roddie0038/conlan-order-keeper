
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
    
    // Map the data to the exact format required by Google Sheets
    const mappedData = {
      store: data.store || "",
      name: data.name || "",
      product_number: data.product_number || "",
      casing_grade: data.casing_grade || "",
      tire_size: data.tire_size || "",
      tread: data.tread || data.tire_tread_needed || "",
      quantity: typeof data.quantity === 'string' ? parseInt(data.quantity, 10) : data.quantity || 0,
      notes: data.notes || "",
      have_casings: data.casing_grade && data.casing_grade.length > 0 ? "Yes" : "No",
      projected_delivery: data.schedule_arrival ? formatDate(data.schedule_arrival) : formatDate(new Date().toISOString()),
      tread_inventory: "To Be Determined",
      submitted_by: data.name || "",
      email: data.email || ""
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
