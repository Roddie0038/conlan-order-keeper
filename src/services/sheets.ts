
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

// New webhook URL for Google Sheets App Script
const NEW_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbwlFNudZkk0jFFORdU-Tr-Ma-iNytJQ8b4nq3H7IXhsiFov1iGX8uCs2AF0eMrMbrpXcg/exec";

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

// Function to submit to the existing plant-specific webhooks
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

// New function to submit to the App Script webhook with the specific format
const submitToAppScriptWebhook = async (data: any) => {
  try {
    // Map the data to the format expected by the new webhook
    const mappedData = {
      name: data.yourName || data.name || "",
      store: data.store || "",
      product_number: data.productNumber || "",
      description: data.description || "",
      quantity: data.quantity || 0,
      schedule_arrival: data.scheduleArrival || "",
      notes: data.notes || "",
      cross_dock: data.crossDock?.toLowerCase() === "yes" ? "Yes" : "No",
      cross_dock_dest: data.crossDockDestination || "",
      email: data.managersEmail || data.managerEmail || "",
      // Include additional data that might be useful
      plant: data.plant || "",
      timestamp: new Date().toISOString(),
      order_id: crypto.randomUUID()
    };

    console.log("Sending mapped data to App Script webhook:", mappedData);
    console.log("Using App Script webhook URL:", NEW_WEBHOOK_URL);

    const response = await fetch(NEW_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors", // Use no-cors to avoid CORS issues
      body: JSON.stringify(mappedData),
    });

    console.log("Successfully triggered App Script webhook");
    return true;
  } catch (error) {
    console.error("Error triggering App Script webhook:", error);
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
    // Create an array to hold our promise results
    const results = [];
    
    // Submit to the selected plant-specific webhook
    const plantWebhookResult = await submitToWebhook(url, data);
    results.push(plantWebhookResult);
    
    // Submit to the new App Script webhook (for all order types)
    const appScriptResult = await submitToAppScriptWebhook(data);
    results.push(appScriptResult);
    
    // Check if at least one webhook succeeded
    if (results.some(result => result === true)) {
      console.log("At least one webhook triggered successfully");
      return { status: 'success' };
    } else {
      console.log("All webhooks failed to trigger");
      return { status: 'error' };
    }

  } catch (error) {
    console.error("Error submitting to webhooks:", error);
    return { status: 'error' };
  }
};
