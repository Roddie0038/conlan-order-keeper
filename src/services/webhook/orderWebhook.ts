
import { submitToWebhook } from './utils';
import { WEBHOOK_URLS } from './config';
import { formatDate } from './utils';
import { CrossDockWebhookPayload } from '@/types/webhook.types';

// Webhook URLs for transfer orders
const N8N_WEBHOOK_URL = "https://roddie.app.n8n.cloud/webhook-test/b3ecab16-dd6a-4c2e-b88f-ffd741f8d6b2";
const N8N_NEW_ORDER_WEBHOOK_URL = "https://roddie.app.n8n.cloud/webhook/New Order";
const NEW_N8N_WEBHOOK_URL = "https://roddie.app.n8n.cloud/webhook/b3ecab16-dd6a-4c2e-b88f-ffd741f8d6b2";

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
    
    // Map the data to the strict type for webhook payload
    const mappedData: CrossDockWebhookPayload = {
      name: data.yourName || data.name || "",
      store: data.store || "",
      product_number: data.productNumber || "",
      description: data.description || "",
      quantity: Number(data.quantity) || 0,
      // Preserve weekday name for schedule_arrival
      schedule_arrival: isWeekdayName ? data.scheduleArrival : (data.scheduleArrival ? formatDate(data.scheduleArrival) : ""),
      notes: data.notes || "",
      email: data.managersEmail || data.managerEmail || "",
      cross_dock: data.crossDock?.toLowerCase() === "yes" ? "Yes" : "No",
      order_source: "web_app", // Add source for tracking purposes
      order_type: "TRANSFER" // Explicitly mark the order type
    };
    
    // Only add cross dock specific fields when crossDock is "Yes"
    if (data.crossDock?.toLowerCase() === "yes") {
      mappedData.cross_dock_from = data.store || "";
      mappedData.cross_dock_dest = data.crossDockDestination || "";
      mappedData.destination_manager_email = data.destinationManagerEmail || "";
      mappedData.receiver_no = data.receiverNo || "";
      mappedData.eta_date = data.etaDate ? formatDate(data.etaDate) : "";
    }

    console.log("🔍 ORDER WEBHOOK - Sending mapped data to Orders webhook:", mappedData);
    console.log("🔍 ORDER WEBHOOK - Using Orders webhook URL:", WEBHOOK_URLS.ORDERS);

    // Submit to Google Sheets webhook
    const googleSheetsResponse = await fetch(WEBHOOK_URLS.ORDERS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors", // Use no-cors to avoid CORS issues
      body: JSON.stringify(mappedData),
    });

    console.log("🔍 ORDER WEBHOOK - Successfully triggered Orders Google Sheets webhook");
    
    // Submit to first n8n webhook
    console.log("🔍 ORDER WEBHOOK - Sending data to first n8n webhook:", N8N_WEBHOOK_URL);
    
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors", // Use no-cors to avoid CORS issues
      body: JSON.stringify(mappedData),
    });
    
    console.log("🔍 ORDER WEBHOOK - Successfully triggered first n8n webhook");
    
    // Submit to new n8n webhook
    console.log("🔍 ORDER WEBHOOK - Sending data to new n8n webhook:", N8N_NEW_ORDER_WEBHOOK_URL);
    
    const newN8nResponse = await fetch(N8N_NEW_ORDER_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors", // Use no-cors to avoid CORS issues
      body: JSON.stringify(mappedData),
    });
    
    console.log("🔍 ORDER WEBHOOK - Successfully triggered new n8n webhook");
    
    // Submit to newest n8n webhook
    console.log("🔍 ORDER WEBHOOK - Sending data to newest n8n webhook:", NEW_N8N_WEBHOOK_URL);
    
    const newestN8nResponse = await fetch(NEW_N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors", // Use no-cors to avoid CORS issues
      body: JSON.stringify(mappedData),
    });
    
    console.log("🔍 ORDER WEBHOOK - Successfully triggered newest n8n webhook");
    
    // Also submit to plant-specific Zapier webhook (already handled in sheets.ts)
    
    return true;
  } catch (error) {
    console.error("❌ ORDER WEBHOOK - Error triggering Orders webhooks:", error);
    return false;
  }
};
