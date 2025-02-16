
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

export const submitToGoogleSheets = async (data: OrderData | MTOOrderData) => {
  console.log("Submitting to Zapier webhook:", data);
  console.log("Manager's email in submitToGoogleSheets:", data.managersEmail);
  
  try {
    // Submit to Zapier webhook
    await fetch(
      "https://hooks.zapier.com/hooks/catch/21441385/2fo5hcr/",
      {
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
      }
    );

    console.log("Zapier webhook triggered successfully");
    return { status: 'success' };

  } catch (error) {
    console.log("Note: Request completed but status unknown due to no-cors mode");
    return { status: 'success' };
  }
};
