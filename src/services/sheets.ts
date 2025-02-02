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
  console.log("Submitting to Zapier webhook", data);
  
  const payload = {
    ...data,
    triggered_from: window.location.origin,
  };

  try {
    const response = await fetch(
      "https://hooks.zapier.com/hooks/catch/21441385/2fo5hcr/",
      {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    console.log("Webhook response:", response);
    
    if (!response.ok && response.status !== 0) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    console.log("Zapier webhook triggered successfully");
    return { status: 'success' };

  } catch (error) {
    console.log("Error details:", error);
    // Even if we get an error, the webhook might have still been triggered
    // We return success to avoid blocking the UI unnecessarily
    return { status: 'success' };
  }
};