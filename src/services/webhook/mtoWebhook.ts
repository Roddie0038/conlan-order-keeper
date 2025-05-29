
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
    
    // Use the correct snake_case field names from MTOOrderData
    const casingGrade = data.casing_grade || "";
    
    // Determine if they have casings based on the casing grade field
    const haveCasings = casingGrade && casingGrade.length > 0 ? "Yes" : "No";
    
    // Map the data to the format expected by the MTO Orders webhook
    // Use snake_case field names that actually exist in the data
    const mappedData = {
      store: data.store || "",
      date_received: formatDate(new Date().toISOString()),
      name: data.name || "",
      product_number: data.product_number || "",
      casing_grade: casingGrade,
      tire_size: data.tire_size || "",
      tread: data.tread || data.tire_tread_needed || "",
      quantity: typeof data.quantity === 'string' ? parseInt(data.quantity, 10) : data.quantity || 0,
      notes: data.notes || "",
      have_casings: haveCasings,
      projected_delivery: data.schedule_arrival ? formatDate(data.schedule_arrival) : formatDate(new Date().toISOString()),
      tread_inventory: "To Be Determined", // Default value
      submitted_by: data.name || "",
      email: data.email || "",
      order_source: "web_app", // Add source for tracking purposes
      order_type: "MTO" // Explicitly mark the order type
    };

    console.log("🔍 MTO WEBHOOK - Sending mapped data to MTO Orders webhook:", mappedData);
    console.log("🔍 MTO WEBHOOK - Using MTO Orders webhook URL:", WEBHOOK_URLS.MTO_ORDERS);

    const response = await fetch(WEBHOOK_URLS.MTO_ORDERS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors", // Use no-cors to avoid CORS issues
      body: JSON.stringify(mappedData),
    });

    console.log("✅ MTO WEBHOOK - Successfully triggered MTO Orders webhook");
    return true;
  } catch (error) {
    console.error("❌ MTO WEBHOOK - Error triggering MTO Orders webhook:", error);
    return false;
  }
};
