
import { submitToWebhook, formatDate } from './utils';
import { WEBHOOK_URLS } from './config';

export const submitToWheelOrdersWebhook = async (data: any) => {
  try {
    console.log("🔍 WHEEL ORDER WEBHOOK - Starting webhook submission process");
    console.log("🔍 WHEEL ORDER WEBHOOK - Data type:", data.type);
    console.log("🔍 WHEEL ORDER WEBHOOK - Has qtyWheels:", 'qtyWheels' in data);
    
    // Extract the store number from the store name (e.g., "Fort Worth 22" -> "22")
    const storeMatch = data.store?.match(/\d+/);
    const storeNumber = storeMatch ? storeMatch[0] : "";
    
    // Map the data to the format expected by the Wheel Orders webhook
    const mappedData = {
      store_location_number: data.store || "",
      name: data.yourName || data.name || "",
      date_received: data.dateReceived ? formatDate(data.dateReceived) : formatDate(new Date().toISOString()),
      quantity: data.qtyWheels || data.quantity || 0,
      customer_name: data.customerName || "",
      wheel_material: data.wheelMaterial || "",
      wheel_type: data.wheelType || "",
      hand_holes: data.handHoles || 0,
      wheel_size: data.wheelSize || "",
      desired_color: data.wheelColor || "",
      email: data.managersEmail || data.managerEmail || "",
      store_colors: "" // This could be populated if available
    };

    // Log exactly what we're sending and to which URL
    console.log("📤 WHEEL ORDER WEBHOOK - Sending mapped data:", JSON.stringify(mappedData, null, 2));
    console.log("📤 WHEEL ORDER WEBHOOK - Using Wheel Orders webhook URL:", WEBHOOK_URLS.WHEEL_ORDERS);
    
    // Verify it's a wheel order by checking the required wheel-specific fields
    if (!data.wheelColor || !data.wheelSize || !data.wheelType) {
      console.warn("⚠️ Missing critical wheel data. This may not be a proper wheel order:", {
        hasWheelColor: !!data.wheelColor,
        hasWheelSize: !!data.wheelSize,
        hasWheelType: !!data.wheelType
      });
    }

    // Confirm the type is set correctly
    console.log("📤 WHEEL ORDER WEBHOOK - Order type:", data.type);
    
    // Send the wheel order data to the webhook
    return await submitToWebhook(WEBHOOK_URLS.WHEEL_ORDERS, mappedData);
  } catch (error) {
    console.error("❌ WHEEL ORDER WEBHOOK - Error triggering Wheel Orders webhook:", error);
    return false;
  }
};
