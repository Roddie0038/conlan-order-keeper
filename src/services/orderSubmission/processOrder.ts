
import { OrderSummary } from "@/hooks/useOrderSubmission";
import { submitToGoogleSheets } from "@/services/sheets";
import { saveOrderToSupabase } from "@/services/orderService";
import { storeData } from "@/config/storeData";
import { OrderType } from "@/services/webhook/config";
import { getPlantForStore } from "@/utils/plantMapping";
import type { OrderData } from "@/types/supabase-extensions";

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
  
  // Determine correct plant based on store
  const plant = getPlantForStore(order.store);
  console.log(`🔍 SUBMIT - Determined plant '${plant}' for store: ${order.store}`);
  
  // Ensure proper plant information is included
  const orderWithPlant = {
    ...order,
    plant: plant, // Use the determined plant instead of selectedPlant
    type: 'TRANSFER' as OrderType, // Cast to OrderType to fix the TypeScript error
    name: order.yourName || order.name || "Unknown", // Ensure name is set
    email: storeManagerEmail, // Ensure email is set with the manager's email
    dateReceived: order.dateReceived || new Date().toISOString(), // Add dateReceived
    cross_dock: (order.crossDock === "Yes" ? "Yes" : "No") as "Yes" | "No", // Map to Supabase column name
    timestamp: new Date().toISOString(), // Add timestamp to fix TS error
    // Add manager email fields for webhook compatibility
    managerEmail: storeManagerEmail,
    managersEmail: storeManagerEmail
  };

  // Create a new object with only the fields needed for submission to Supabase
  const submissionOrder: OrderData = {
    id: order.id,
    yourName: orderWithPlant.yourName || orderWithPlant.name, // Make sure this is set
    name: orderWithPlant.name,
    store: orderWithPlant.store,
    productNumber: orderWithPlant.productNumber,
    description: orderWithPlant.description,
    quantity: String(orderWithPlant.quantity), // Convert to string to match OrderData type
    scheduleArrival: orderWithPlant.scheduleArrival,
    notes: orderWithPlant.notes,
    // Map crossDock and related fields to the correct column names expected by Supabase
    cross_dock: orderWithPlant.cross_dock,
    cross_dock_destination: orderWithPlant.crossDockDestination || null,
    cross_dock_receiver_number: orderWithPlant.receiverNo || null,
    cross_dock_eta_date: orderWithPlant.etaDate || null,
    dateReceived: orderWithPlant.dateReceived,
    email: orderWithPlant.email,
    plant: orderWithPlant.plant,
    type: orderWithPlant.type,
    timestamp: orderWithPlant.timestamp,
  };
  
  console.log("🔍 SUBMIT - Using sheets service with order:", submissionOrder);
  
  // Force the network request by adding a random parameter to avoid caching
  try {
    console.log("🔍 SUBMIT - Beginning webhook submission at:", new Date().toISOString());
    
    // Create a copy with cache-busting parameter that will be removed before saving to Supabase
    const webhookData = {
      ...submissionOrder,
      _nocache: Date.now()
    };
    
    // Submit to Google Sheets with cache-busting
    const result = await submitToGoogleSheets(webhookData as any);
    console.log("🔍 SUBMIT - submitToGoogleSheets result:", result);
    
    // Save the order to Supabase (without the nocache parameter)
    console.log("🔍 SUBMIT - Saving order to Supabase:", submissionOrder);
    const { data, error } = await saveOrderToSupabase(submissionOrder);
    
    if (error) {
      console.error("❌ SUBMIT - Error saving to Supabase:", error);
      throw error;
    } else {
      console.log("✅ SUBMIT - Successfully saved to Supabase:", data);
    }
    
    return orderWithPlant;
  } catch (error) {
    console.error("❌ SUBMIT - Error in processOrder:", error);
    throw error;
  }
};
