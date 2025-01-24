interface OrderData {
  timestamp: string;
  yourName: string;
  store: string;
  dateReceived: string;
  productNumber: string;
  description: string;
  quantity: string;
  scheduleArrival: string;
  notes: string;
  crossDock: string;
}

export const submitToGoogleSheets = async (data: OrderData) => {
  console.log("Submitting order to Google Sheets:", data);
  
  try {
    // Submit to Google Sheets
    const sheetsResponse = await fetch(
      "https://script.google.com/macros/s/AKfycbzufv7QnjIXPRvBHJkxLq3tmJ3wD6M9DboOCmQIVe0wABhGuBBLdRCkBeOZ6CQ-Orms/exec",
      {
        method: "POST",
        body: JSON.stringify({
          yourName: data.yourName,
          store: data.store,
          dateReceived: data.dateReceived,
          productNumber: data.productNumber,
          description: data.description,
          quantity: data.quantity,
          scheduleArrival: data.scheduleArrival,
          notes: data.notes,
          crossDock: data.crossDock
        }),
      }
    );

    const sheetsResult = await sheetsResponse.json();
    console.log("Google Sheets response:", sheetsResult);

    if (sheetsResult.status === "error") {
      throw new Error(sheetsResult.message || "Failed to submit order to Google Sheets");
    }

    // Submit to Zapier webhook
    console.log("Submitting to Zapier webhook");
    const zapierResponse = await fetch(
      "https://hooks.zapier.com/hooks/catch/21441385/2fo5hcr/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors", // Required for Zapier webhooks
        body: JSON.stringify({
          ...data,
          triggered_from: window.location.origin,
        }),
      }
    );

    console.log("Zapier webhook triggered");
    return sheetsResult;
  } catch (error) {
    console.error("Error submitting data:", error);
    throw error;
  }
};