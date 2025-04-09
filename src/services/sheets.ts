
import { PLANT_WEBHOOKS } from '@/contexts/PlantContext';

interface BaseOrderData {
  timestamp: string;
  store: string;
  managersEmail?: string;
  managerEmail?: string; // Add both formats to ensure compatibility
  plant: string;
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
      dateReceived: data.dateReceived ? formatDate(data.dateReceived) : formatDate(new Date().toISOString()),
      timestamp: formatDate(new Date().toISOString()),
      orderId: crypto.randomUUID(),
      triggered_from: window.location.origin,
      // Ensure manager's email is included with the consistent property name
      managersEmail: data.managerEmail || data.managersEmail,
      managerEmail: data.managerEmail || data.managersEmail,
      // Join multiple casing grades into a comma-separated string if it's an array
      casingGrade: Array.isArray(data.casingGrade) ? data.casingGrade.join(', ') : data.casingGrade
    };

    console.log("Sending formatted data to webhook:", formattedData);
    console.log("Using webhook URL:", url);

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
  console.log("Manager's email in submitToGoogleSheets:", data.managersEmail || data.managerEmail);
  
  // Ensure a plant is specified, default to Grand Prairie 97 if not
  const plant = data.plant || "Grand Prairie 97";
  console.log("Selected plant for webhook submission:", plant);
  
  // Get the relevant webhooks based on the plant
  let url = '';
  
  if ('type' in data) {
    if (data.type === 'MTO') {
      url = PLANT_WEBHOOKS[plant as keyof typeof PLANT_WEBHOOKS].mtoOrders;
    } else if (data.type === 'WHEEL_POWDER_COATING') {
      url = PLANT_WEBHOOKS[plant as keyof typeof PLANT_WEBHOOKS].wheelOrders;
    }
  } else {
    // Default to transfer requests webhook
    url = PLANT_WEBHOOKS[plant as keyof typeof PLANT_WEBHOOKS].transferRequests;
  }
  
  try {
    // Submit to the selected webhook
    const result = await submitToWebhook(url, data);
    
    if (result) {
      console.log("Webhook triggered successfully");
      return { status: 'success' };
    } else {
      console.log("Webhook failed to trigger");
      return { status: 'error' };
    }

  } catch (error) {
    console.error("Error submitting to webhook:", error);
    return { status: 'error' };
  }
};
