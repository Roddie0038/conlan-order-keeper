
import { submitToWebhook } from './utils';
import { WEBHOOK_URLS } from './config';
import { formatDate } from './utils';

export const submitToMTOOrdersWebhook = async (data: any) => {
  try {
    console.log("🔍 MTO WEBHOOK - Starting MTO webhook submission");
    console.log("🔍 MTO WEBHOOK - Verification - Data type:", data.type);
    console.log("🔍 MTO WEBHOOK - Verification - Is this wheel order?", {
      isWheelType: data.type === 'WHEEL_POWDER_COATING',
      hasQtyWheels: 'qtyWheels' in data && Boolean(data.qtyWheels),
      hasWheelProperties: Boolean(data.wheelColor || data.wheelSize || data.wheelType)
    });
    
    // If this is a wheel order that somehow got routed here, log a warning
    if (data.type === 'WHEEL_POWDER_COATING' || ('qtyWheels' in data && data.qtyWheels)) {
      console.error("⚠️ MTO WEBHOOK - WARNING: Wheel order incorrectly routed to MTO webhook!");
      console.error("⚠️ MTO WEBHOOK - This should never happen. Please check routing logic.");
      return false;
    }
    
    // Format casing grade - convert array to string if needed
    const casingGrade = Array.isArray(data.casingGrade) 
      ? data.casingGrade.join(', ') 
      : data.casingGrade || "";
    
    // Determine if they have casings based on the selected casing grades
    const haveCasings = casingGrade && casingGrade.length > 0 ? "Yes" : "No";
    
    // Map the data to the format expected by the MTO Orders webhook
    const mappedData = {
      store: data.store || "",
      date_received: formatDate(new Date().toISOString()),
      name: data.yourName || data.name || "",
      product_number: data.productNumber || "",
      casing_grade: casingGrade,
      tire_size: data.tireSize || data.customTireSize || "",
      tread: data.tireTreadNeeded || "",
      quantity: data.quantity || 0,
      notes: data.notes || "",
      have_casings: haveCasings,
      projected_delivery: data.scheduleArrival ? formatDate(data.scheduleArrival) : formatDate(new Date().toISOString()),
      tread_inventory: "To Be Determined", // Default value
      submitted_by: data.yourName || data.name || "",
      email: data.managersEmail || data.managerEmail || ""
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

