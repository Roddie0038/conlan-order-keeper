
import { OrderSummary } from "@/hooks/useOrderSubmission";
import { submitToGoogleSheets } from "@/services/sheets";
import { saveOrderToSupabase } from "@/services/orderService";
import { storeData } from "@/config/storeData";

/**
 * Process an individual order - handle Google Sheets submission and Supabase storage
 * 
 * @param order - The order to process
 * @param selectedPlant - The currently selected plant
 * @returns The processed order with additional metadata
 */
export const processOrder = async (order: OrderSummary, selectedPlant: string) => {
  console.log("🔍 SUBMIT - Processing order:", order.id);
  
  // Find the store manager email from storeData
  const storeNumber = order.store.match(/\d+$/)?.[0] || "";
  const matchedStore = storeData.find(s => s.storeNumber === storeNumber);
  const storeManagerEmail = matchedStore?.managerEmails || "";
  
  // Ensure proper plant information is included
  const orderWithPlant = {
    ...order,
    plant: selectedPlant,
    type: 'TRANSFER', // Explicitly set the order type
    name: order.yourName || order.name || "Unknown", // Ensure name is set
    email: storeManagerEmail, // Ensure email is set with the manager's email
    dateReceived: order.dateReceived || new Date().toISOString(), // Add dateReceived
    crossDock: (order.crossDock === "Yes" ? "Yes" : "No") as "Yes" | "No" // Ensure crossDock is correctly typed
  };
  
  console.log("🔍 SUBMIT - Using sheets service with order:", orderWithPlant);
  const result = await submitToGoogleSheets(orderWithPlant);
  console.log("🔍 SUBMIT - submitToGoogleSheets result:", result);
  
  // Save the order to Supabase
  console.log("🔍 SUBMIT - Saving order to Supabase:", orderWithPlant);
  const { data, error } = await saveOrderToSupabase(orderWithPlant);
  
  if (error) {
    console.error("❌ SUBMIT - Error saving to Supabase:", error);
    throw error;
  } else {
    console.log("✅ SUBMIT - Successfully saved to Supabase:", data);
  }
  
  return orderWithPlant;
};
