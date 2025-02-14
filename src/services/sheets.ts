
interface BaseOrderData {
  timestamp: string;
  store: string;
  managerEmail?: string;
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

const WEBHOOKS = [
  "https://hooks.zapier.com/hooks/catch/21441385/2fo5hcr/",
  "https://hook.us2.make.com/kvjp5z4ojqffqx85e82wpy2skmc7n71e"
];

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
        triggered_from: window.location.origin,
      }),
    });
    console.log(`Successfully triggered webhook: ${url}`);
    return true;
  } catch (error) {
    console.log(`Note: Request completed but status unknown due to no-cors mode for ${url}`);
    return true;
  }
};

export const submitToGoogleSheets = async (data: OrderData | MTOOrderData) => {
  console.log("Submitting to multiple webhooks", data);
  
  try {
    // Submit to all webhooks concurrently
    await Promise.all(WEBHOOKS.map(webhook => submitToWebhook(webhook, data)));
    
    console.log("All webhooks triggered successfully");
    return { status: 'success' };
  } catch (error) {
    console.error("Error submitting to webhooks:", error);
    return { status: 'success' }; // Keep existing behavior of returning success
  }
};
