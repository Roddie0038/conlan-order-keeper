import { submitToWebhook } from './utils';
import { WEBHOOK_URLS } from './config';
import { formatDate } from './utils';
import { CrossDockWebhookPayload } from '@/types/webhook.types';
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
    console.log("🔍 ORDER WEBHOOK - Using updated Orders webhook URL:", WEBHOOK_URLS.ORDERS);
    
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
    
    // Map the data to the strict type for webhook payload
    // This is for Google Sheets webhook - keep the frontend naming convention
    const mappedData = {
      name: data.yourName || data.name || "",
      store: data.store || "",
      product_number: data.productNumber || "",
      description: data.description || "",
      quantity: Number(data.quantity) || 0,
      // Preserve weekday name for schedule_arrival
      schedule_arrival: isWeekdayName ? data.scheduleArrival : (data.scheduleArrival ? formatDate(data.scheduleArrival) : ""),
      notes: data.notes || "",
      email: data.managersEmail || data.managerEmail || data.email || "",
      cross_dock: data.crossDock?.toLowerCase() === "yes" ? "Yes" : "No",
      order_source: "web_app", // Add source for tracking purposes
      order_type: "TRANSFER", // Explicitly mark the order type
    } as CrossDockWebhookPayload;

    // Add timestamp separately since it's not part of the type definition
    const webhookPayload = {
      ...mappedData,
      timestamp: formattedTimestamp, // Include the formatted timestamp
    };
    
    // Only add cross dock specific fields when crossDock is "Yes"
    if (data.crossDock?.toLowerCase() === "yes") {
      webhookPayload.cross_dock_from = data.store || "";
      webhookPayload.cross_dock_dest = crossDockDestination || data.crossDockDestination || "";
      webhookPayload.destination_manager_email = data.destinationManagerEmail || data.destination_manager_email || "";
      webhookPayload.receiver_no = data.receiverNo || "";
      webhookPayload.eta_date = data.etaDate ? formatDate(data.etaDate) : "";
    }

    console.log("🔍 ORDER WEBHOOK - Sending mapped data to Orders webhook:", webhookPayload);
    console.log("🔍 ORDER WEBHOOK - Using Orders webhook URL:", WEBHOOK_URLS.ORDERS);

    // Submit to Google Sheets webhook
    const googleSheetsResponse = await fetch(WEBHOOK_URLS.ORDERS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors", // Use no-cors to avoid CORS issues
      body: JSON.stringify(webhookPayload),
    });

    console.log("🔍 ORDER WEBHOOK - Successfully triggered Orders Google Sheets webhook");
    
    // Also submit to plant-specific Zapier webhook (already handled in sheets.ts)
    
    return true;
  } catch (error) {
    console.error("❌ ORDER WEBHOOK - Error triggering Orders webhooks:", error);
    return false;
  }
};
