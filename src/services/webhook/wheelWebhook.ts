
import { submitToWebhook } from './utils';
import { WEBHOOK_URLS } from './config';
import { formatDate } from './utils';

export const submitToWheelOrdersWebhook = async (data: any) => {
  try {
    console.log("🔍 WHEEL ORDER WEBHOOK - Starting webhook submission process");
    console.log("🔍 WHEEL ORDER WEBHOOK - Data type:", data.type);
    console.log("🔍 WHEEL ORDER WEBHOOK - Has qtyWheels:", 'qtyWheels' in data);
    console.log("🔍 WHEEL ORDER WEBHOOK - Full data received:", JSON.stringify(data, null, 2));
    
    // Log specific wheel specification fields
    console.log("🔍 WHEEL ORDER WEBHOOK - Wheel specifications check:", {
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
    // CRITICAL FIX: Ensure all field mappings are correct
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

    // CRITICAL: Log exactly what we're sending and validate all fields are present
    console.log("🔍 WHEEL ORDER WEBHOOK - Sending EXACT FORMAT data:", JSON.stringify(mappedData, null, 2));
    console.log("🔍 WHEEL ORDER WEBHOOK - Field validation:", {
      hasWheelMaterial: !!mappedData.wheel_material,
      hasWheelType: !!mappedData.wheel_type,
      hasHandHoles: !!mappedData.hand_holes,
      hasWheelSize: !!mappedData.wheel_size,
      hasDesiredColor: !!mappedData.desired_color,
      hasCustomerName: !!mappedData.customer_name,
      hasQuantity: !!mappedData.quantity
    });
    console.log("🔍 WHEEL ORDER WEBHOOK - Using Wheel Orders webhook URL:", WEBHOOK_URLS.WHEEL_ORDERS);
    
    // Verify it's a wheel order by checking the required wheel-specific fields
    if (!mappedData.desired_color || !mappedData.wheel_size || !mappedData.wheel_type) {
      console.warn("⚠️ Missing critical wheel data. This may not be a proper wheel order:", {
        hasWheelColor: !!mappedData.desired_color,
        hasWheelSize: !!mappedData.wheel_size,
        hasWheelType: !!mappedData.wheel_type,
        hasWheelMaterial: !!mappedData.wheel_material,
        hasHandHoles: !!mappedData.hand_holes
      });
    }

    // Log the exact URL being used for final verification
    console.log("🔍 WHEEL ORDER WEBHOOK - Final webhook URL check:", WEBHOOK_URLS.WHEEL_ORDERS);
    
    const response = await fetch(WEBHOOK_URLS.WHEEL_ORDERS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors", // Use no-cors to avoid CORS issues
      body: JSON.stringify(mappedData),
    });

    console.log("✅ Successfully triggered Wheel Orders webhook with EXACT FORMAT");
    return true;
  } catch (error) {
    console.error("❌ Error triggering Wheel Orders webhook:", error);
    return false;
  }
};
