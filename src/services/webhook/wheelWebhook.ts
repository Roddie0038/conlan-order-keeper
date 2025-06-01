
import { submitToWebhook } from './utils';
import { WEBHOOK_URLS } from './config';
import { formatDate } from './utils';

export const submitToWheelOrdersWebhook = async (data: any) => {
  try {
    console.log("🚀 WHEEL WEBHOOK - ENTRY POINT - submitToWheelOrdersWebhook called");
    console.log("🚀 WHEEL WEBHOOK - Raw wheel order data received:", JSON.stringify(data, null, 2));
    
    // Verify this is actually a wheel order
    if (data.type !== 'WHEEL_POWDER_COATING' && !('qtyWheels' in data && data.qtyWheels)) {
      console.error("❌ WHEEL WEBHOOK - Incorrect order type sent to wheel webhook:", data.type);
      console.error("❌ WHEEL WEBHOOK - This should not be processed as a wheel order");
      return false;
    }
    
    console.log("✅ WHEEL WEBHOOK - Order type verified as wheel order");
    
    // Map the wheel order data to the EXACT required format for Google Sheets
    // Using the original wheel order fields to preserve all wheel-specific data
    const mappedData = {
      store_location_number: data.store || data.storeName || "",
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
    const missingFields = [];
    if (!mappedData.customer_name) missingFields.push('customer_name');
    if (!mappedData.desired_color) missingFields.push('desired_color');
    if (!mappedData.wheel_size) missingFields.push('wheel_size');
    if (!mappedData.wheel_type) missingFields.push('wheel_type');
    if (!mappedData.wheel_material) missingFields.push('wheel_material');
    if (!mappedData.hand_holes) missingFields.push('hand_holes');
    
    if (missingFields.length > 0) {
      console.error("❌ WHEEL WEBHOOK - Missing critical wheel data fields:", missingFields);
      console.error("❌ WHEEL WEBHOOK - Original data check:", {
        hasCustomerName: !!data.customerName,
        hasWheelColor: !!data.wheelColor,
        hasWheelSize: !!data.wheelSize,
        hasWheelType: !!data.wheelType,
        hasWheelMaterial: !!data.wheelMaterial,
        hasHandHoles: !!data.handHoles
      });
      return false;
    }

    console.log("✅ WHEEL WEBHOOK - All validation passed, calling Supabase Edge Function");
    console.log("🚀 WHEEL WEBHOOK - Using Edge Function to proxy request to Google Sheets");
    
    // Call our Supabase Edge Function instead of Google Apps Script directly
    const edgeFunctionUrl = "https://cdbixtaqjppvdkyfbhkz.supabase.co/functions/v1/wheel-order-webhook";
    console.log("🚀 WHEEL WEBHOOK - EDGE FUNCTION URL:", edgeFunctionUrl);
    console.log("🚀 WHEEL WEBHOOK - EDGE FUNCTION Payload:", JSON.stringify(mappedData));
    
    const response = await fetch(edgeFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkYml4dGFxanBwdmRreWZiaGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzcwNjEsImV4cCI6MjA1NTkxMzA2MX0.mkeq7GvLjzw8om8t9mnlLLozHimoYy-HsRgJ65RRc10`
      },
      body: JSON.stringify(mappedData),
    });

    console.log("✅ WHEEL WEBHOOK - Edge Function response status:", response.status);
    console.log("✅ WHEEL WEBHOOK - Edge Function response statusText:", response.statusText);
    
    if (response.ok) {
      const result = await response.json();
      console.log("✅ WHEEL WEBHOOK - Edge Function response:", result);
      console.log("✅ WHEEL WEBHOOK - Successfully submitted wheel order via Edge Function");
      return true;
    } else {
      console.error("❌ WHEEL WEBHOOK - Edge Function failed:", response.status, response.statusText);
      return false;
    }
    
  } catch (error) {
    console.error("❌ WHEEL WEBHOOK - Error calling Edge Function:", error);
    console.error("❌ WHEEL WEBHOOK - Edge Function URL that failed:", "https://cdbixtaqjppvdkyfbhkz.supabase.co/functions/v1/wheel-order-webhook");
    return false;
  }
};
