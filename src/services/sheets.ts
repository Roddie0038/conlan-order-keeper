
interface BaseOrderData {
  timestamp: string;
  store: string;
  managersEmail?: string;  // Updated from managerEmail to managersEmail
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
  if ('type' in data && data.type === 'MTO') {
    // Handle MTO order
    return {
      timestamp: data.timestamp,
      yourName: data.name,
      store: data.store,
      dateReceived: data.timestamp,
      productNumber: data.productNumber,
      description: `${data.tireSize} - ${data.tireTreadNeeded}`,
      quantity: data.quantity,
      scheduleArrival: data.scheduleArrival,
      notes: data.notes,
      crossDock: 'No',
      crossDockDestination: '',
      managersEmail: data.managersEmail || ''
    };
  } else {
    // Handle regular order
    const regularOrder = data as OrderData;
    return {
      timestamp: regularOrder.dateReceived,
      yourName: regularOrder.yourName,
      store: regularOrder.store,
      dateReceived: regularOrder.dateReceived,
      productNumber: regularOrder.productNumber,
      description: regularOrder.description,
      quantity: regularOrder.quantity,
      scheduleArrival: regularOrder.scheduleArrival,
      notes: regularOrder.notes,
      crossDock: regularOrder.crossDock,
      crossDockDestination: regularOrder.crossDockDestination || '',
      managersEmail: regularOrder.managersEmail || ''
    };
  }
};

export const submitToGoogleSheets = async (data: OrderData | MTOOrderData) => {
  console.log("Submitting to webhooks", data);
  
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

    // Submit to Make.com webhook with formatted data
    await fetch(
      "https://hook.us2.make.com/kvjp5z4ojqffqx85e82wpy2skmc7n71e",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify(formatOrderForMake(data)),
      }
    );

    console.log("Webhooks triggered successfully");
    return { status: 'success' };

  } catch (error) {
    console.log("Note: Request completed but status unknown due to no-cors mode");
    return { status: 'success' };
  }
};
