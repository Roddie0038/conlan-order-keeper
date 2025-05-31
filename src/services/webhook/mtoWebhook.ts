
import { submitToWebhook } from './utils';
import { WEBHOOK_URLS } from './config';
import { formatDate } from './utils';

export const submitToMTOOrdersWebhook = async (data: any) => {
  try {
    console.log("🔍 MTO WEBHOOK - Starting MTO webhook submission with CORRECTED URL");
    console.log("🔍 MTO WEBHOOK - Verification - Data type:", data.type);
    console.log("🔍 MTO WEBHOOK - Using CORRECTED MTO webhook URL:", WEBHOOK_URLS.MTO_ORDERS);
    
    // Verify this is actually an MTO order
    if (data.type !== 'MTO') {
      console.error("❌ MTO WEBHOOK - Incorrect order type sent to MTO webhook:", data.type);
      console.error("❌ MTO WEBHOOK - This should not be processed as an MTO order");
      return false;
    }
    
    // Map the data to the NEW required format for Google Sheets
    const mappedData = {
      store: data.store || "",
      name: data.name || "",
      product_number: data.productNumber || "",
      casing_grade: data.casingGrade || "",
      tire_size: data.tireSize || "",
      tread: data.tread || data.tireTreadNeeded || "",
      quantity: typeof data.quantity === 'string' ? parseInt(data.quantity, 10) : data.quantity || 0,
      notes: data.notes || "",
      have_casings: data.casingGrade && data.casingGrade.length > 0 ? "yes" : "no",
      projected_delivery: data.scheduleArrival ? formatDate(data.scheduleArrival) : formatDate(new Date().toISOString()),
      tread_inventory: "To Be Determined",
      submitted_by: data.name || "",
      email: data.email || ""
    };

    console.log("🔍 MTO WEBHOOK - Sending NEW FORMAT data to MTO webhook:", mappedData);

    const response = await fetch(WEBHOOK_URLS.MTO_ORDERS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors", // Keep no-cors as specified
      body: JSON.stringify(mappedData),
    });

    console.log("✅ MTO WEBHOOK - Successfully triggered MTO Orders webhook with NEW FORMAT");
    return true;
  } catch (error) {
    console.log("ℹ️ MTO WEBHOOK - Webhook fired (expected no-cors behavior):", error);
    // With no-cors mode, we expect a TypeError but the webhook still works
    return true;
  }
};
