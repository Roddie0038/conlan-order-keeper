
import { submitToWebhook } from './utils';
import { WEBHOOK_URLS } from './config';
import { formatDate } from './utils';

export const submitToWheelOrdersWebhook = async (data: any) => {
  try {
    console.log("🚀 WHEEL WEBHOOK - ENTRY POINT - submitToWheelOrdersWebhook called");
    console.log("🚀 WHEEL WEBHOOK - Raw data received:", JSON.stringify(data, null, 2));
    console.log("🚀 WHEEL WEBHOOK - Target URL:", WEBHOOK_URLS.WHEEL_ORDERS);
    
    // Verify this is actually a wheel order
    if (data.type !== 'WHEEL_POWDER_COATING' && !('qtyWheels' in data && data.qtyWheels)) {
      console.error("❌ WHEEL WEBHOOK - Incorrect order type sent to wheel webhook:", data.type);
      console.error("❌ WHEEL WEBHOOK - This should not be processed as a wheel order");
      return false;
    }
    
    console.log("✅ WHEEL WEBHOOK - Order type verified as wheel order");
    
    // Map the data to the EXACT required format for Google Sheets
    const mappedData = {
      store_location_number: data.store || "",
      name: data.yourName || data.name || "",
      date_received: data.dateReceived ? formatDate(data.dateReceived) : formatDate(new Date().toISOString()),
      quantity: parseInt(data.qtyWheels || data.quantity || "0", 10),
      customer_name: data.customerName || "",
      wheel_material: data.wheelMaterial || "",
      wheel_type: data.wheelType || "",
      hand_holes: String(data.handHoles || ""),
      wheel_size: data.wheelSize || "",
      desired_color: data.wheelColor || "",
      email: data.managersEmail || data.managerEmail || data.email || "",
      store_colors: data.storeColors || "Yellow"
    };

    console.log("✅ WHEEL WEBHOOK - Data mapped for Google Sheets:", JSON.stringify(mappedData, null, 2));
    
    // Verify all critical wheel data is present
    if (!mappedData.desired_color || !mappedData.wheel_size || !mappedData.wheel_type || !mappedData.customer_name) {
      console.error("❌ WHEEL WEBHOOK - Missing critical wheel data:", {
        hasCustomerName: !!mappedData.customer_name,
        hasWheelColor: !!mappedData.desired_color,
        hasWheelSize: !!mappedData.wheel_size,
        hasWheelType: !!mappedData.wheel_type,
        hasWheelMaterial: !!mappedData.wheel_material,
        hasHandHoles: !!mappedData.hand_holes
      });
      return false;
    }

    console.log("✅ WHEEL WEBHOOK - All validation passed, making fetch request");
    console.log("🚀 Submitting to Google Sheets Webhook", mappedData);
    console.log("🚀 FETCH REQUEST - URL:", WEBHOOK_URLS.WHEEL_ORDERS);
    console.log("🚀 FETCH REQUEST - Payload:", JSON.stringify(mappedData));
    
    // CRITICAL: Direct fetch call with detailed logging
    const response = await fetch(WEBHOOK_URLS.WHEEL_ORDERS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors",
      body: JSON.stringify(mappedData),
    });

    console.log("✅ WHEEL WEBHOOK - Fetch completed successfully");
    console.log("✅ WHEEL WEBHOOK - Response type (no-cors mode):", response.type);
    console.log("✅ WHEEL WEBHOOK - POST request sent to Google Sheets webhook");
    return true;
  } catch (error) {
    console.error("❌ WHEEL WEBHOOK - Error in fetch request:", error);
    console.error("❌ WHEEL WEBHOOK - URL that failed:", WEBHOOK_URLS.WHEEL_ORDERS);
    return false;
  }
};
