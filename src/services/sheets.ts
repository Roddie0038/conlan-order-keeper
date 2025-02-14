
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

const formatDataForMake = (data: OrderData | MTOOrderData) => {
  const isMTO = 'type' in data && data.type === 'MTO';
  
  return {
    'Timestamp A': data.timestamp,
    'Name B': isMTO ? data.name : data.yourName,
    'Store C': data.store,
    'Product Number D': data.productNumber,
    'Description E': isMTO ? `${data.tireSize} - ${data.tireTreadNeeded}` : data.description,
    'Quantity F': data.quantity,
    'Schedule Arrival G': data.scheduleArrival,
    'Notes H': data.notes,
    'Cross Dock I': isMTO ? 'No' : data.crossDock,
    'Cross Dock Destination J': isMTO ? '' : (data as OrderData).crossDockDestination || '',
    'Pull Sheet L': '', // This field can be populated if needed
    'Email N': data.managerEmail || ''
  };
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
        body: JSON.stringify(formatDataForMake(data)),
      }
    );

    console.log("Webhooks triggered successfully");
    return { status: 'success' };

  } catch (error) {
    console.log("Note: Request completed but status unknown due to no-cors mode");
    return { status: 'success' };
  }
};
