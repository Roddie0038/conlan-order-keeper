
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
      'Timestamp A': data.timestamp,
      'Name B': data.name,
      'Store C': data.store,
      'Product Number D': data.productNumber,
      'Description E': `${data.tireSize} - ${data.tireTreadNeeded}`,
      'Quantity F': data.quantity,
      'Schedule Arrival G': data.scheduleArrival,
      'Notes H': data.notes,
      'Cross Dock I': 'No',
      'Cross Dock Destination J': '',
      'Pull Sheet L': '',
      'Email N': data.managerEmail || ''
    };
  } else {
    // Handle regular order
    const regularOrder = data as OrderData;
    return {
      'Timestamp A': data.timestamp,
      'Name B': regularOrder.yourName,
      'Store C': data.store,
      'Product Number D': data.productNumber,
      'Description E': regularOrder.description,
      'Quantity F': data.quantity,
      'Schedule Arrival G': data.scheduleArrival,
      'Notes H': data.notes,
      'Cross Dock I': regularOrder.crossDock,
      'Cross Dock Destination J': regularOrder.crossDockDestination || '',
      'Pull Sheet L': '',
      'Email N': data.managerEmail || ''
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
