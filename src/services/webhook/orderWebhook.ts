
import { submitToWebhook } from './utils';
import { WEBHOOK_URLS } from './config';
import { formatDate } from './utils';
import { CrossDockWebhookPayload } from '@/types/webhook.types';

export const submitToOrdersWebhook = async (data: any) => {
  try {
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
    };
    
    // Only add cross dock specific fields when crossDock is "Yes"
    if (data.crossDock?.toLowerCase() === "yes") {
      mappedData.cross_dock_from = data.store || "";
      mappedData.cross_dock_dest = data.crossDockDestination || "";
      mappedData.destination_manager_email = data.destinationManagerEmail || "";
      mappedData.receiver_no = data.receiverNo || "";
      mappedData.eta_date = data.etaDate ? formatDate(data.etaDate) : "";
    }

    console.log("Sending mapped data to Orders webhook:", mappedData);
    console.log("Using Orders webhook URL:", WEBHOOK_URLS.ORDERS);
    console.log("Schedule arrival value being sent:", mappedData.schedule_arrival);

    const response = await fetch(WEBHOOK_URLS.ORDERS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors", // Use no-cors to avoid CORS issues
      body: JSON.stringify(mappedData),
    });

    console.log("Successfully triggered Orders webhook");
    return true;
  } catch (error) {
    console.error("Error triggering Orders webhook:", error);
    return false;
  }
};
