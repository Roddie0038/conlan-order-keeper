
interface BaseOrderData {
  timestamp: string;
  store: string;
  managersEmail?: string;
}

export interface OrderData extends BaseOrderData {
  yourName: string;
  dateReceived: string;
  productNumber: string;
  description: string;
  quantity: string;
  scheduleArrival: string;
  notes: string;
  crossDock: string;
  crossDockDestination?: string;
}

export interface MTOOrderData extends BaseOrderData {
  name: string;
  productNumber: string;
  casingGrade: string;
  tireSize: string;
  tireTreadNeeded: string;
  quantity: string;
  scheduleArrival: string;
  notes: string;
  type: 'MTO';
}

const submitToWebhook = async (url: string, data: any) => {
  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors",
      body: JSON.stringify({
        ...data,
        orderId: crypto.randomUUID(),
        triggered_from: window.location.origin,
      }),
    });
    console.log(`Successfully triggered webhook: ${url}`);
    return true;
  } catch (error) {
    console.error(`Error triggering webhook ${url}:`, error);
    return false;
  }
};

export const submitToGoogleSheets = async (data: OrderData | MTOOrderData) => {
  console.log("Submitting to webhooks:", data);
  console.log("Manager's email in submitToGoogleSheets:", data.managersEmail);
  
  const webhooks = [
    "https://hooks.zapier.com/hooks/catch/21441385/2fo5hcr/",
    "https://conlantire97.app.n8n.cloud/webhook/7da289f6-a1b9-41fe-9a0c-f9d441b7f835",
    "https://conlantire97.app.n8n.cloud/webhook-test/7da289f6-a1b9-41fe-9a0c-f9d441b7f835"
  ];

  try {
    // Submit to all webhooks concurrently
    const results = await Promise.all(
      webhooks.map(webhook => submitToWebhook(webhook, data))
    );

    // Check if all webhooks were successful
    const allSuccessful = results.every(result => result === true);
    
    if (allSuccessful) {
      console.log("All webhooks triggered successfully");
      return { status: 'success' };
    } else {
      console.log("Some webhooks failed to trigger");
      return { status: 'partial_success' };
    }

  } catch (error) {
    console.error("Error submitting to webhooks:", error);
    return { status: 'error' };
  }
};
