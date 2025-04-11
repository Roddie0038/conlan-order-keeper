
import { submitToWebhook } from './utils';
import { WEBHOOK_URLS } from './config';
import { formatDate } from './utils';

export const submitToWheelOrdersWebhook = async (data: any) => {
  try {
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

    console.log("Sending mapped data to Wheel Orders webhook:", mappedData);
    console.log("Using Wheel Orders webhook URL:", WEBHOOK_URLS.WHEEL_ORDERS);

    const response = await fetch(WEBHOOK_URLS.WHEEL_ORDERS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors", // Use no-cors to avoid CORS issues
      body: JSON.stringify(mappedData),
    });

    console.log("Successfully triggered Wheel Orders webhook");
    return true;
  } catch (error) {
    console.error("Error triggering Wheel Orders webhook:", error);
    return false;
  }
};
