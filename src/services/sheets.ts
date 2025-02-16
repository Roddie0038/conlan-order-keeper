
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

const formatOrderForMake = (data: OrderData | MTOOrderData) => {
  console.log("Incoming data for formatting:", data);
  console.log("Manager's email from incoming data:", data.managersEmail);

  if ('type' in data && data.type === 'MTO') {
    // Handle MTO order
    const formattedData = {
      orderId: crypto.randomUUID(),
      product: data.productNumber,
      quantity: data.quantity,
      storeName: data.store,
      description: `${data.tireSize} - ${data.tireTreadNeeded}`,
      scheduleArrival: data.scheduleArrival,
      notes: data.notes,
      managersEmail: data.managersEmail || '',
      type: 'MTO'
    };
    console.log("Formatted MTO data:", formattedData);
    return formattedData;
  } else {
    // Handle regular order
    const regularOrder = data as OrderData;
    const formattedData = {
      orderId: crypto.randomUUID(),
      product: regularOrder.productNumber,
      quantity: regularOrder.quantity,
      storeName: regularOrder.store,
      description: regularOrder.description,
      scheduleArrival: regularOrder.scheduleArrival,
      notes: regularOrder.notes,
      crossDock: regularOrder.crossDock,
      crossDockDestination: regularOrder.crossDockDestination || '',
      managersEmail: regularOrder.managersEmail || '',
      type: 'regular'
    };
    console.log("Formatted regular order data:", formattedData);
    return formattedData;
  }
};

export const submitToGoogleSheets = async (data: OrderData | MTOOrderData) => {
  console.log("Submitting to webhooks", data);
  console.log("Manager's email in submitToGoogleSheets:", data.managersEmail);
  
  try {
    // Submit to Zapier webhook with original format
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
          triggered_from: window.location.origin,
        }),
      }
    );

    // Submit to Pipedream webhook with formatted data
    const formattedData = formatOrderForMake(data);
    console.log("Sending formatted data to Pipedream:", formattedData);
    console.log("Manager's email in formatted data:", formattedData.managersEmail);
    
    await fetch(
      "https://eovyfr6d4bqx3kg.m.pipedream.net",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify(formattedData),
      }
    );

    console.log("Webhooks triggered successfully");
    return { status: 'success' };

  } catch (error) {
    console.log("Note: Request completed but status unknown due to no-cors mode");
    return { status: 'success' };
  }
};
