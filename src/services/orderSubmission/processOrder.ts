
import { OrderSummary } from "@/hooks/useOrderSubmission";
import { submitToGoogleSheets } from "@/services/sheets";
import { saveOrderToSupabase } from "@/services/orderService";
import { storeData } from "@/config/storeData";
import { OrderType } from "@/services/webhook/config";
import { getPlantForStore } from "@/utils/plantMapping";
import type { OrderData } from "@/types/supabase-extensions";
import { formatDateForSupabase } from "@/utils/dateTime";

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
  
  // Get destination manager email for cross dock orders
  let destinationManagerEmail = "";
  if (order.crossDock === "Yes" && order.crossDockDestination) {
    const destStoreNumber = order.crossDockDestination.match(/\d+$/)?.[0] || "";
    const destStore = storeData.find(s => s.storeNumber === destStoreNumber);
    destinationManagerEmail = destStore?.managerEmails || "";
  }
  
  // Format timestamp for Supabase in MM/DD-YYYY HH:MM AM/PM format
  const formattedTimestamp = formatDateForSupabase(new Date());
  
  // Ensure proper plant information is included
  const orderWithPlant = {
    ...order,
    plant: plant, // Use the determined plant instead of selectedPlant
    type: 'TRANSFER' as OrderType, // Cast to OrderType to fix the TypeScript error
    name: order.yourName || order.name || "Unknown", // Ensure name is set
    email: storeManagerEmail, // Ensure email is set with the manager's email
    dateReceived: order.dateReceived || new Date().toISOString(), // Add dateReceived
    
    // Keep the frontend field names for Google Sheets/Zapier
    crossDock: (order.crossDock === "Yes" ? "Yes" : "No") as "Yes" | "No", 
    crossDockDestination: order.crossDockDestination || null,
    receiverNo: order.receiverNo || null,
    etaDate: order.etaDate || null,
    
    // Include destination manager email for cross-dock orders
    destinationManagerEmail: destinationManagerEmail,
    
    // Also include database column names for Supabase
    cross_dock_type: (order.crossDock === "Yes" ? "Yes" : "No") as "Yes" | "No",
    cross_dock_destination: order.crossDockDestination || null,
    cross_dock_receiver_number: order.receiverNo || null,
    cross_dock_eta_date: order.etaDate || null,
    destination_manager_email: destinationManagerEmail,
    
    timestamp: formattedTimestamp, // Use formatted timestamp
    // Add manager email fields for webhook compatibility
    managerEmail: storeManagerEmail,
    managersEmail: storeManagerEmail
  };

  // Create a new object formatted specifically for Supabase submission
  const supabaseOrder: OrderData = {
    // For regular orders, don't include the UUID id field
    ...(orderWithPlant.type !== 'TRANSFER' ? { id: order.id } : {}),
    name: orderWithPlant.name,
    yourName: orderWithPlant.yourName || orderWithPlant.name,
    store: orderWithPlant.store,
    productNumber: orderWithPlant.productNumber,
    description: orderWithPlant.description,
    quantity: String(orderWithPlant.quantity), // Convert to string to match OrderData type
    scheduleArrival: orderWithPlant.scheduleArrival,
    notes: orderWithPlant.notes,
    
    // Use database column names for Supabase
    cross_dock_type: orderWithPlant.cross_dock_type,
    cross_dock_destination: orderWithPlant.cross_dock_destination,
    cross_dock_receiver_number: orderWithPlant.cross_dock_receiver_number,
    cross_dock_eta_date: orderWithPlant.cross_dock_eta_date,
    destination_manager_email: orderWithPlant.destination_manager_email, // Include destination manager email
    
    dateReceived: orderWithPlant.dateReceived,
    email: orderWithPlant.email,
    plant: orderWithPlant.plant,
    type: orderWithPlant.type,
    timestamp: orderWithPlant.timestamp, // Use the formatted timestamp
  };
  
  console.log("🔍 SUBMIT - Using sheets service with order:", orderWithPlant);
  
  // Force the network request by adding a random parameter to avoid caching
  try {
    console.log("🔍 SUBMIT - Beginning webhook submission at:", new Date().toISOString());
    
    // Create a copy with cache-busting parameter for Google Sheets
    const webhookData = {
      ...orderWithPlant,
      _nocache: Date.now()
    };
    
    // Submit to Google Sheets with cache-busting (using frontend field names)
    const result = await submitToGoogleSheets(webhookData as any);
    console.log("🔍 SUBMIT - submitToGoogleSheets result:", result);
    
    // Save the order to Supabase using the properly formatted data
    console.log("🔍 SUBMIT - Saving order to Supabase:", supabaseOrder);
    const { data, error } = await saveOrderToSupabase(supabaseOrder);
    
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
