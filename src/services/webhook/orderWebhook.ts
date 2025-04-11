
import { submitToWebhook } from './utils';
import { WEBHOOK_URLS } from './config';
import { formatDate } from './utils';

export const submitToOrdersWebhook = async (data: any) => {
  try {
    // Map the data to the format expected by the Orders webhook
    const mappedData = {
      name: data.yourName || data.name || "",
      store: data.store || "",
      product_number: data.productNumber || "",
      description: data.description || "",
      quantity: data.quantity || 0,
      schedule_arrival: data.scheduleArrival ? formatDate(data.scheduleArrival) : "",
      notes: data.notes || "",
      cross_dock: data.crossDock?.toLowerCase() === "yes" ? "Yes" : "No",
      cross_dock_dest: data.crossDockDestination || "",
      email: data.managersEmail || data.managerEmail || ""
    };

    console.log("Sending mapped data to Orders webhook:", mappedData);
    console.log("Using Orders webhook URL:", WEBHOOK_URLS.ORDERS);

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
