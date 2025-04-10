
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

// Webhook URLs for Google Apps Script
const WEBHOOK_URLS = {
  // New Orders (Orders Tab)
  ORDERS: "https://script.google.com/macros/s/AKfycbwlFNudZkk0jFFORdU-Tr-Ma-iNytJQ8b4nq3H7IXhsiFov1iGX8uCs2AF0eMrMbrpXcg/exec",
  // Wheel Orders (Stores Wheel Orders Tab)
  WHEEL_ORDERS: "https://script.google.com/macros/s/AKfycbw_PHHn33ELTWnvQHG49VWew18L11EKaF0nHbMFLZvT2C_CNOLs-smLd4aHNxDF7CIEQA/exec",
  // MTO Orders (MTO'S Tab)
  MTO_ORDERS: "https://script.google.com/macros/s/AKfycbySpbQtyGFnhR1pvMq53HwBAUXGI-TS5j7wcaCq0m9zotDyvV-IzGXJJCU3nOrUc5z-wQ/exec"
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    // Format as YYYY-MM-DD
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
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
      timestamp: new Date().toISOString(),
      orderId: crypto.randomUUID(),
      triggered_from: window.location.origin,
      // Ensure manager's email is included with the consistent property name
      managersEmail: data.managerEmail || data.managersEmail,
      managerEmail: data.managerEmail || data.managersEmail,
      // Join multiple casing grades into a comma-separated string if it's an array
      casingGrade: Array.isArray(data.casingGrade) ? data.casingGrade.join(', ') : data.casingGrade
    };

    console.log("Sending formatted data to plant webhook:", formattedData);
    console.log("Using plant webhook URL:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors", // Keep no-cors mode for CORS handling
      body: JSON.stringify(formattedData),
    });

    // With no-cors, we won't get a meaningful status, but the request will go through
    console.log(`Successfully triggered plant webhook: ${url}`);
    return true;
  } catch (error) {
    console.error(`Error triggering plant webhook ${url}:`, error);
    return false;
  }
};

// Function to submit to the new Orders Google Sheet webhook
const submitToOrdersWebhook = async (data: any) => {
  try {
    // Map the data to the format expected by the Orders webhook
    const mappedData = {
      name: data.yourName || data.name || "",
      store: data.store || "",
      product_number: data.productNumber || "",
      description: data.description || "",
      quantity: data.quantity || 0,
      schedule_arrival: data.scheduleArrival ? formatDate(data.scheduleArrival) : "",
      notes: data.notes || "",
      cross_dock: data.crossDock?.toLowerCase() === "yes" ? "Yes" : "No",
      cross_dock_dest: data.crossDockDestination || "",
      email: data.managersEmail || data.managerEmail || ""
    };

    console.log("Sending mapped data to Orders webhook:", mappedData);
    console.log("Using Orders webhook URL:", WEBHOOK_URLS.ORDERS);

    const response = await fetch(WEBHOOK_URLS.ORDERS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors", // Use no-cors to avoid CORS issues
      body: JSON.stringify(mappedData),
    });

    console.log("Successfully triggered Orders webhook");
    return true;
  } catch (error) {
    console.error("Error triggering Orders webhook:", error);
    return false;
  }
};

// Function to submit to the new Wheel Orders Google Sheet webhook
const submitToWheelOrdersWebhook = async (data: any) => {
  try {
    // Extract the store number from the store name (e.g., "Fort Worth 22" -> "22")
    const storeMatch = data.store?.match(/\d+/);
    const storeNumber = storeMatch ? storeMatch[0] : "";
    
    // Map the data to the format expected by the Wheel Orders webhook
    const mappedData = {
      store_location_number: data.store || "",
      name: data.yourName || data.name || "",
      date_received: data.dateReceived ? formatDate(data.dateReceived) : formatDate(new Date().toISOString()),
      quantity: data.qtyWheels || data.quantity || 0,
      customer_name: data.customerName || "",
      wheel_material: data.wheelMaterial || "",
      wheel_type: data.wheelType || "",
      hand_holes: data.handHoles || 0,
      wheel_size: data.wheelSize || "",
      desired_color: data.wheelColor || "",
      email: data.managersEmail || data.managerEmail || "",
      store_colors: "" // This could be populated if available
    };

    console.log("Sending mapped data to Wheel Orders webhook:", mappedData);
    console.log("Using Wheel Orders webhook URL:", WEBHOOK_URLS.WHEEL_ORDERS);

    const response = await fetch(WEBHOOK_URLS.WHEEL_ORDERS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors", // Use no-cors to avoid CORS issues
      body: JSON.stringify(mappedData),
    });

    console.log("Successfully triggered Wheel Orders webhook");
    return true;
  } catch (error) {
    console.error("Error triggering Wheel Orders webhook:", error);
    return false;
  }
};

// Function to submit to the new MTO Orders Google Sheet webhook
const submitToMTOOrdersWebhook = async (data: any) => {
  try {
    // Format casing grade - convert array to string if needed
    const casingGrade = Array.isArray(data.casingGrade) 
      ? data.casingGrade.join(', ') 
      : data.casingGrade || "";
    
    // Determine if they have casings based on the selected casing grades
    const haveCasings = casingGrade && casingGrade.length > 0 ? "Yes" : "No";
    
    // Map the data to the format expected by the MTO Orders webhook
    const mappedData = {
      store: data.store || "",
      date_received: formatDate(new Date().toISOString()),
      name: data.yourName || data.name || "",
      product_number: data.productNumber || "",
      casing_grade: casingGrade,
      tire_size: data.tireSize || data.customTireSize || "",
      tread: data.tireTreadNeeded || "",
      quantity: data.quantity || 0,
      notes: data.notes || "",
      have_casings: haveCasings,
      projected_delivery: data.scheduleArrival ? formatDate(data.scheduleArrival) : formatDate(new Date().toISOString()),
      tread_inventory: "To Be Determined", // Default value
      submitted_by: data.yourName || data.name || "",
      email: data.managersEmail || data.managerEmail || ""
    };

    console.log("Sending mapped data to MTO Orders webhook:", mappedData);
    console.log("Using MTO Orders webhook URL:", WEBHOOK_URLS.MTO_ORDERS);

    const response = await fetch(WEBHOOK_URLS.MTO_ORDERS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors", // Use no-cors to avoid CORS issues
      body: JSON.stringify(mappedData),
    });

    console.log("Successfully triggered MTO Orders webhook");
    return true;
  } catch (error) {
    console.error("Error triggering MTO Orders webhook:", error);
    return false;
  }
};

export const submitToGoogleSheets = async (data: OrderData | MTOOrderData) => {
  console.log("Submitting to webhooks:", data);
  console.log("Manager's email in submitToGoogleSheets:", data.managersEmail || data.managerEmail);
  
  // Ensure a plant is specified, default to Grand Prairie 97 if not
  const plant = data.plant || "Grand Prairie 97";
  console.log("Selected plant for webhook submission:", plant);
  
  try {
    // Create an array to hold our promise results
    const results = [];
    
    // Determine which type of order it is and submit to appropriate webhooks
    if ('type' in data && data.type === 'MTO') {
      // Send to the plant-specific MTO webhook
      const plantUrl = PLANT_WEBHOOKS[plant as keyof typeof PLANT_WEBHOOKS].mtoOrders;
      const plantWebhookResult = await submitToWebhook(plantUrl, data);
      results.push(plantWebhookResult);
      
      // Send to the new MTO Orders webhook
      const mtoOrdersResult = await submitToMTOOrdersWebhook(data);
      results.push(mtoOrdersResult);
    } 
    else if ('qtyWheels' in data || ('type' in data && data.type === 'WHEEL_POWDER_COATING')) {
      // Send to the plant-specific Wheel Orders webhook
      const plantUrl = PLANT_WEBHOOKS[plant as keyof typeof PLANT_WEBHOOKS].wheelOrders;
      const plantWebhookResult = await submitToWebhook(plantUrl, data);
      results.push(plantWebhookResult);
      
      // Send to the new Wheel Orders webhook
      const wheelOrdersResult = await submitToWheelOrdersWebhook(data);
      results.push(wheelOrdersResult);
    }
    else {
      // Send to the plant-specific webhook
      const plantUrl = PLANT_WEBHOOKS[plant as keyof typeof PLANT_WEBHOOKS].transferRequests;
      const plantWebhookResult = await submitToWebhook(plantUrl, data);
      results.push(plantWebhookResult);
      
      // Send to the new Orders webhook
      const ordersResult = await submitToOrdersWebhook(data);
      results.push(ordersResult);
    }
    
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
