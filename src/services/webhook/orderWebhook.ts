
import { submitToWebhook } from './utils';
import { WEBHOOK_URLS } from './config';
import { formatDate } from './utils';
import { formatDateForSheets } from '@/utils/dateTime';

export const submitToOrdersWebhook = async (data: any) => {
  try {
    // Skip if this isn't a transfer order
    if (data.type === 'WHEEL_POWDER_COATING' || data.type === 'MTO') {
      console.warn("❌ ORDER WEBHOOK - Non-transfer order type sent to order webhook:", data.type);
      console.warn("❌ ORDER WEBHOOK - This should not be processed as a transfer order");
      return false;
    }

    console.log("🔍 ORDER WEBHOOK - Processing transfer order");
    console.log("🔍 ORDER WEBHOOK - Using CORRECTED Transfer Orders webhook URL:", WEBHOOK_URLS.ORDERS);
    
    // Check if scheduleArrival is a weekday name
    const isWeekdayName = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Will Call Pick Up)$/i.test(data.scheduleArrival);
    
    // Ensure cross dock destination has full store name
    let crossDockDestination = data.crossDockDestination || '';
    if (crossDockDestination && !crossDockDestination.includes(' ') && /^\d+$/.test(crossDockDestination.trim())) {
      console.warn("🔍 ORDER WEBHOOK - Cross dock destination needs formatting:", crossDockDestination);
      
      // Try to find the store name based on the store number
      // This is just a placeholder - the actual store name should come from the form submission
      crossDockDestination = `Store ${crossDockDestination}`;
    }
    
    // Format timestamp for Google Sheets in MM/DD/YYYY hh:mm AM/PM format
    const formattedTimestamp = formatDateForSheets(new Date());
    
    // Create camelCase payload for Google Sheets (no type casting)
    const googleSheetsPayload: any = {
      name: data.yourName || data.name || "",
      store: data.store || "",
      productNumber: data.productNumber || "",
      description: data.description || "",
      quantity: Number(data.quantity) || 0,
      scheduleArrival: isWeekdayName ? data.scheduleArrival : (data.scheduleArrival ? formatDate(data.scheduleArrival) : ""),
      notes: data.notes || "",
      email: data.managersEmail || data.managerEmail || data.email || "",
      crossDock: data.crossDock?.toLowerCase() === "yes" ? "Yes" : "No",
      orderSource: "web_app",
      orderType: "TRANSFER",
      timestamp: formattedTimestamp
    };
    
    // Only add cross dock specific fields when crossDock is "Yes"
    if (googleSheetsPayload.crossDock === "Yes") {
      googleSheetsPayload.crossDockFrom = data.store || "";
      googleSheetsPayload.crossDockDest = crossDockDestination || data.crossDockDestination || "";
      googleSheetsPayload.destinationManagerEmail = data.destinationManagerEmail || data.destination_manager_email || "";
      googleSheetsPayload.receiverNo = data.receiverNo || "";
      googleSheetsPayload.etaDate = data.etaDate ? formatDate(data.etaDate) : "";
    }

    console.log("🔍 ORDER WEBHOOK - Sending camelCase data to Transfer webhook:", googleSheetsPayload);

    // Submit to Google Sheets webhook
    const googleSheetsResponse = await fetch(WEBHOOK_URLS.ORDERS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors", // Use no-cors to avoid CORS issues
      body: JSON.stringify(googleSheetsPayload),
    });

    console.log("🔍 ORDER WEBHOOK - Successfully triggered CORRECTED Transfer Orders Google Sheets webhook");
    
    return true;
  } catch (error) {
    console.error("❌ ORDER WEBHOOK - Error triggering Transfer Orders webhooks:", error);
    return false;
  }
};
