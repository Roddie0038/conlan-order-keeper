
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
  
  // Determine correct plant based on store - this is critical for cross-platform routing
  const plant = getPlantForStore(order.store);
  console.log(`🔍 SUBMIT - Determined plant '${plant}' for store: ${order.store}`);
  
  // Validate plant determination
  if (!plant) {
    console.warn(`⚠️ SUBMIT - Could not determine plant for store: ${order.store}`);
    console.warn(`⚠️ SUBMIT - Defaulting to selected plant: ${selectedPlant}`);
  }
  
  // Get destination manager email for cross dock orders
  let destinationManagerEmail = "";
  let formattedCrossDockDestination = order.crossDockDestination || "";
  
  if (order.crossDock === "Yes" && order.crossDockDestination) {
    // Check if crossDockDestination already contains store name
    if (!/\s/.test(order.crossDockDestination) && /^\d+$/.test(order.crossDockDestination.trim())) {
      // If it only contains a number, we need to find the full store name
      const destStoreNumber = order.crossDockDestination.trim();
      const destStore = storeData.find(s => s.storeNumber === destStoreNumber);
      
      if (destStore) {
        // Use the full store name with number from storeData
        formattedCrossDockDestination = destStore.name;
        console.log(`🔍 SUBMIT - Formatted cross dock destination: ${formattedCrossDockDestination}`);
      } else {
        console.warn(`🔍 SUBMIT - Could not find store with number ${destStoreNumber}, using original value`);
      }
    }
    
    // Get the destination manager email
    const destStoreNumber = formattedCrossDockDestination.match(/\d+$/)?.[0] || "";
    const destStore = storeData.find(s => s.storeNumber === destStoreNumber);
    destinationManagerEmail = destStore?.managerEmails || "";
    console.log(`🔍 SUBMIT - Destination manager email: ${destinationManagerEmail}`);
  }
  
  // Format timestamp for Supabase in MM/DD-YYYY HH:MM AM/PM format
  const formattedTimestamp = formatDateForSupabase(new Date());
  
  // Ensure proper plant information is included for cross-platform routing
  const orderWithPlant = {
    ...order,
    plant: plant || selectedPlant, // Use the determined plant, fall back to selectedPlant if needed
    type: 'TRANSFER' as OrderType, // Cast to OrderType to fix the TypeScript error
    name: order.yourName || order.name || "Unknown", // Ensure name is set
    email: storeManagerEmail, // Ensure email is set with the manager's email
    dateReceived: order.dateReceived || new Date().toISOString(), // Add dateReceived
    
    // Keep the frontend field names for Google Sheets/Zapier
    crossDock: (order.crossDock === "Yes" ? "Yes" : "No") as "Yes" | "No", 
    crossDockDestination: formattedCrossDockDestination, // Use the formatted destination
    receiverNo: order.receiverNo || null,
    etaDate: order.etaDate || null,
    
    // Include destination manager email for cross-dock orders
    destinationManagerEmail: destinationManagerEmail,
    
    // Also include database column names for Supabase
    cross_dock_type: (order.crossDock === "Yes" ? "Yes" : "No") as "Yes" | "No",
    cross_dock_destination: formattedCrossDockDestination, // Use the formatted destination
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
    plant: orderWithPlant.plant, // Ensure plant is always set for cross-platform routing
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
      console.log("✅ SUBMIT - Successfully saved to Supabase with plant:", data?.plant);
    }
    
    return orderWithPlant;
  } catch (error) {
    console.error("❌ SUBMIT - Error in processOrder:", error);
    throw error;
  }
};
