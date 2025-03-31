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
  casingGrade: string[];  // Updated to string array
  tireSize: string;
  tireTreadNeeded: string;
  quantity: string;
  scheduleArrival: string;
  notes: string;
  type: 'MTO';
}

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    // Format as MM/DD/YYYY HH:mm
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${month}/${day}/${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString; // Return original string if parsing fails
  }
};

const submitToWebhook = async (url: string, data: any) => {
  try {
    // Format the date before sending
    const formattedData = {
      ...data,
      dateReceived: formatDate(data.dateReceived),
      timestamp: formatDate(new Date().toISOString()),
      orderId: crypto.randomUUID(),
      triggered_from: window.location.origin,
      // Ensure manager's email is included with the consistent property name
      managersEmail: data.managerEmail || data.managersEmail,
      // Join multiple casing grades into a comma-separated string if it's an array
      casingGrade: Array.isArray(data.casingGrade) ? data.casingGrade.join(', ') : data.casingGrade
    };

    console.log("Sending formatted data to webhook:", formattedData);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors", // Keep no-cors mode for CORS handling
      body: JSON.stringify(formattedData),
    });

    // With no-cors, we won't get a meaningful status, but the request will go through
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
  
  // Determine which webhooks to use based on order type
  const webhooks = [];
  
  if ('type' in data) {
    if (data.type === 'MTO') {
      webhooks.push("https://hooks.zapier.com/hooks/catch/21741437/2wax8rh/"); // MTO orders webhook
    } else if (data.type === 'WHEEL_POWDER_COATING') {
      webhooks.push("https://hooks.zapier.com/hooks/catch/21741437/2c1zjty/"); // Updated wheel powder coating webhook
    }
  }
  
  if (webhooks.length === 0) {
    // If no specific type or not matched, use the default webhooks
    webhooks.push(
      "https://hooks.zapier.com/hooks/catch/21741437/2wk9kll/", // Original regular orders webhook
      "https://hooks.zapier.com/hooks/catch/22118763/2lnbpor/"  // New additional webhook
    );
  }

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
