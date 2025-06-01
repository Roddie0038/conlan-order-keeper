
import { submitToWebhook } from './utils';
import { WEBHOOK_URLS } from './config';
import { formatDate } from './utils';

export const submitToWheelOrdersWebhook = async (data: any) => {
  try {
    console.log("🔍 WHEEL ORDER WEBHOOK - Starting webhook submission process");
    console.log("🔍 WHEEL ORDER WEBHOOK - Raw data received:", JSON.stringify(data, null, 2));
    console.log("🔍 WHEEL ORDER WEBHOOK - Critical field verification:", {
      customerName: data.customerName,
      wheelMaterial: data.wheelMaterial,
      wheelType: data.wheelType,
      handHoles: data.handHoles,
      wheelSize: data.wheelSize,
      wheelColor: data.wheelColor
    });
    
    // Verify this is actually a wheel order
    if (data.type !== 'WHEEL_POWDER_COATING' && !('qtyWheels' in data && data.qtyWheels)) {
      console.error("❌ WHEEL ORDER WEBHOOK - Incorrect order type sent to wheel webhook:", data.type);
      console.error("❌ WHEEL ORDER WEBHOOK - This should not be processed as a wheel order");
      return false;
    }
    
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

    console.log("🔍 WHEEL ORDER WEBHOOK - Final mapped data for submission:", JSON.stringify(mappedData, null, 2));
    console.log("🔍 WHEEL ORDER WEBHOOK - Field mapping verification:", {
      customer_name: mappedData.customer_name,
      wheel_material: mappedData.wheel_material,
      wheel_type: mappedData.wheel_type,
      hand_holes: mappedData.hand_holes,
      wheel_size: mappedData.wheel_size,
      desired_color: mappedData.desired_color
    });
    
    // Verify all critical wheel data is present
    if (!mappedData.desired_color || !mappedData.wheel_size || !mappedData.wheel_type || !mappedData.customer_name) {
      console.error("❌ WHEEL ORDER WEBHOOK - Missing critical wheel data in mapped payload:", {
        hasCustomerName: !!mappedData.customer_name,
        hasWheelColor: !!mappedData.desired_color,
        hasWheelSize: !!mappedData.wheel_size,
        hasWheelType: !!mappedData.wheel_type,
        hasWheelMaterial: !!mappedData.wheel_material,
        hasHandHoles: !!mappedData.hand_holes
      });
      return false;
    }

    console.log("🔍 WHEEL ORDER WEBHOOK - Using Wheel Orders webhook URL:", WEBHOOK_URLS.WHEEL_ORDERS);
    console.log("🔍 WHEEL ORDER WEBHOOK - CRITICAL: Making direct POST request to Google Sheets");
    
    // CRITICAL FIX: Make direct POST request to ensure it reaches Google Sheets
    const response = await fetch(WEBHOOK_URLS.WHEEL_ORDERS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors",
      body: JSON.stringify(mappedData),
    });

    console.log("✅ WHEEL ORDER WEBHOOK - Successfully triggered Wheel Orders webhook with complete data");
    console.log("✅ WHEEL ORDER WEBHOOK - POST request sent to:", WEBHOOK_URLS.WHEEL_ORDERS);
    return true;
  } catch (error) {
    console.error("❌ WHEEL ORDER WEBHOOK - Error triggering Wheel Orders webhook:", error);
    return false;
  }
};
