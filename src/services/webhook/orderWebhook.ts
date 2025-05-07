
import { submitToWebhook } from './utils';
import { WEBHOOK_URLS } from './config';
import { formatDate } from './utils';
import { CrossDockWebhookPayload } from '@/types/webhook.types';

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
    
    // Add admin test mode flag if applicable
    if (data.isTestData || data.testMode) {
      mappedData.test_data = true;
      mappedData.notes = `[TEST DATA - NO NOTIFICATIONS] ${mappedData.notes}`;
      console.log("🔍 ORDER WEBHOOK - Admin test mode detected - marking as test data");
    }

    console.log("🔍 ORDER WEBHOOK - Sending mapped data to Orders webhook:", mappedData);
    console.log("🔍 ORDER WEBHOOK - Using Orders webhook URL:", WEBHOOK_URLS.ORDERS);

    // Submit to Google Sheets webhook - TEMPORARILY REMOVED mode: "no-cors" for debugging
    try {
      console.log("🔍 ORDER WEBHOOK - Initiating fetch request to Google Sheets webhook...");
      
      const googleSheetsResponse = await fetch(WEBHOOK_URLS.ORDERS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // mode: "no-cors" has been temporarily removed for debugging
        body: JSON.stringify(mappedData),
      });
      
      // Log detailed response information
      console.log("🔍 ORDER WEBHOOK - Response received from Google Sheets webhook");
      console.log("🔍 ORDER WEBHOOK - HTTP Status:", googleSheetsResponse.status);
      console.log("🔍 ORDER WEBHOOK - Status Text:", googleSheetsResponse.statusText);
      
      // Log response headers
      const headers: Record<string, string> = {};
      googleSheetsResponse.headers.forEach((value, key) => {
        headers[key] = value;
      });
      console.log("🔍 ORDER WEBHOOK - Response Headers:", headers);
      
      // Attempt to parse and log the response body
      try {
        const responseText = await googleSheetsResponse.text();
        console.log("🔍 ORDER WEBHOOK - Response Body Text:", responseText);
        
        try {
          // Try to parse as JSON if possible
          const responseJson = JSON.parse(responseText);
          console.log("🔍 ORDER WEBHOOK - Response Body JSON:", responseJson);
        } catch (jsonError) {
          console.log("🔍 ORDER WEBHOOK - Response is not JSON format");
        }
      } catch (textError) {
        console.error("❌ ORDER WEBHOOK - Error reading response body:", textError);
      }
      
      // Check if response was successful
      if (googleSheetsResponse.ok) {
        console.log("🔍 ORDER WEBHOOK - Successfully triggered Orders Google Sheets webhook");
        return true;
      } else {
        console.error(`❌ ORDER WEBHOOK - Error from Google Sheets webhook: ${googleSheetsResponse.status} ${googleSheetsResponse.statusText}`);
        return false;
      }
    } catch (fetchError) {
      console.error("❌ ORDER WEBHOOK - Fetch error triggering Orders webhook:", fetchError);
      return false;
    }
  } catch (error) {
    console.error("❌ ORDER WEBHOOK - Error triggering Orders webhooks:", error);
    return false;
  }
};
