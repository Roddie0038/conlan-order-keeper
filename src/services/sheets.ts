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
  console.log("Submitting to Zapier webhook");
  
  try {
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

    // Since we're using no-cors mode, we can't check the response status
    // Instead, we'll log that the webhook was triggered
    console.log("Zapier webhook triggered");
    
    return { status: 'success' };
  } catch (error) {
    console.error("Error submitting data:", error);
    throw error;
  }
};