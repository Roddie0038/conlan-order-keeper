
import { submitToWebhook } from './utils';
import { WEBHOOK_URLS } from './config';
import { formatDate } from './utils';

export const submitToOrdersWebhook = async (data: any) => {
  try {
    // Check if scheduleArrival is a weekday name
    const isWeekdayName = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Will Call Pick Up)$/i.test(data.scheduleArrival);
    
    // Map the data to the format expected by the Orders webhook
    const mappedData = {
      name: data.yourName || data.name || "",
      store: data.store || "",
      product_number: data.productNumber || "",
      description: data.description || "",
      quantity: data.quantity || 0,
      // Preserve weekday name for schedule_arrival
      schedule_arrival: isWeekdayName ? data.scheduleArrival : (data.scheduleArrival ? formatDate(data.scheduleArrival) : ""),
      notes: data.notes || "",
      cross_dock: data.crossDock?.toLowerCase() === "yes" ? "Yes" : "No",
      cross_dock_dest: data.crossDockDestination || "",
      email: data.managersEmail || data.managerEmail || ""
    };

    console.log("📤 ORDERS WEBHOOK - Sending mapped data:", JSON.stringify(mappedData, null, 2));
    console.log("📤 ORDERS WEBHOOK - Using Orders webhook URL:", WEBHOOK_URLS.ORDERS);
    console.log("📤 ORDERS WEBHOOK - Schedule arrival value being sent:", mappedData.schedule_arrival);

    return await submitToWebhook(WEBHOOK_URLS.ORDERS, mappedData);
  } catch (error) {
    console.error("❌ ORDERS WEBHOOK - Error triggering Orders webhook:", error);
    return false;
  }
};
