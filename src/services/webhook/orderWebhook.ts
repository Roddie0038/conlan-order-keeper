
import { submitToWebhook } from './utils';
import { WEBHOOK_URLS } from './config';
import { formatDate } from './utils';

export const submitToOrdersWebhook = async (data: any) => {
  try {
    // Check if scheduleArrival is a weekday name
    const isWeekdayName = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Will Call Pick Up)$/i.test(data.scheduleArrival);
    
    // Prepare cross dock fields only when crossDock is "Yes"
    const crossDockFields = data.crossDock?.toLowerCase() === "yes" ? {
      cross_dock: "Yes",
      cross_dock_from: data.store || "", // FROM Store (full name)
      cross_dock_dest: data.crossDockDestination || "", // TO Store (full name)
      destination_manager_email: data.destinationManagerEmail || "", // Destination manager email
      receiver_no: data.receiverNo || "", // Receiver number
      eta_date: data.etaDate ? formatDate(data.etaDate) : "", // ETA date formatted
    } : {
      cross_dock: "No",
      cross_dock_dest: ""
    };
    
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
      email: data.managersEmail || data.managerEmail || "",
      ...crossDockFields // Spread the cross dock fields
    };

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
