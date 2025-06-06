
import { OrderSummary } from "@/hooks/useOrderSubmission";
import { submitToGoogleSheets } from "@/services/sheets";
import { saveOrderToSupabase } from "@/services/orderService";
import { storeData } from "@/config/storeData";
import { OrderType } from "@/services/webhook/config";
import { getPlantForStore } from "@/utils/plantMapping";
import { getTransferEmailRecipients, getRefurbishedEmailRecipients } from "@/config/contactSystem";
import type { OrderData } from "@/types/supabase-extensions";
import { formatDateForSupabase } from "@/utils/dateTime";
import { supabase } from "@/integrations/supabase/extended-client";

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
  
  // CRITICAL FIX: Determine order type based on order properties
  let orderType: OrderType = "TRANSFER"; // Default to TRANSFER
  
  // Check if it's a wheel order
  if ('qtyWheels' in order && order.qtyWheels) {
    orderType = "WHEEL_POWDER_COATING";
  }
  // Check if it's explicitly marked as MTO
  else if (order.type === 'MTO' || ('casingGrade' in order && order.casingGrade)) {
    orderType = "MTO";
  }
  
  console.log("🔍 SUBMIT - Determined order type:", orderType, "for order:", order.id);
  
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
  
  // Create Google Sheets payload (camelCase format)
  const googleSheetsPayload = {
    ...order,
    plant: plant || selectedPlant,
    type: orderType, // Use the determined order type for proper routing
    name: order.yourName || order.name || "Unknown",
    email: storeManagerEmail,
    
    // Keep the frontend field names for Google Sheets/Zapier (camelCase)
    crossDock: (order.crossDock === "Yes" ? "Yes" : "No") as "Yes" | "No", 
    crossDockDestination: formattedCrossDockDestination,
    receiverNo: order.receiverNo || null,
    etaDate: order.etaDate || null,
    
    // Include destination manager email for cross-dock orders
    destinationManagerEmail: destinationManagerEmail,
    
    timestamp: formattedTimestamp,
    // Add manager email fields for webhook compatibility
    managerEmail: storeManagerEmail,
    managersEmail: storeManagerEmail
  };

  // Create Supabase payload (snake_case format) - CRITICAL FIX: Remove dateReceived
  let supabaseOrder: any = {
    name: order.yourName || order.name || "Unknown",
    store: order.store,
    product_number: order.productNumber, // snake_case for Supabase
    description: order.description,
    quantity: parseInt(order.quantity?.toString() || "0") || 0,
    schedule_arrival: order.scheduleArrival, // snake_case for Supabase
    notes: order.notes,
    email: storeManagerEmail,
    plant: plant || selectedPlant,
    order_type: orderType,
    timestamp: formattedTimestamp, // Use formatted timestamp - NO dateReceived
    status: 'pending',
    status_updated_at: new Date().toISOString()
  };
  
  // Only add cross dock fields for regular transfer orders (not MTO/Wheel)
  if (orderType === 'TRANSFER') {
    supabaseOrder = {
      ...supabaseOrder,
      cross_dock_type: (order.crossDock === "Yes" ? "Yes" : "No") as "Yes" | "No",
      cross_dock_destination: formattedCrossDockDestination,
      cross_dock_receiver_number: order.receiverNo || null,
      cross_dock_eta_date: order.etaDate || null,
      destination_manager_email: destinationManagerEmail
    };
  }
  
  console.log("🔍 SUBMIT - Using sheets service with order type:", orderType);
  console.log("🔍 SUBMIT - Google Sheets payload:", googleSheetsPayload);
  console.log("🔍 SUBMIT - Supabase payload (NO dateReceived):", supabaseOrder);
  
  // Force the network request by adding a random parameter to avoid caching
  try {
    console.log("🔍 SUBMIT - Beginning webhook submission at:", new Date().toISOString());
    
    // Create a copy with cache-busting parameter for Google Sheets
    const webhookData = {
      ...googleSheetsPayload,
      _nocache: Date.now()
    };
    
    // Submit to Google Sheets with cache-busting (using camelCase field names and correct type)
    const result = await submitToGoogleSheets(webhookData as any);
    console.log("🔍 SUBMIT - submitToGoogleSheets result:", result);
    
    // Save the order to Supabase using the properly formatted data (snake_case, NO dateReceived)
    console.log("🔍 SUBMIT - Saving order to Supabase with type:", orderType);
    
    // Use the appropriate table based on order type
    const tableName = orderType === 'MTO' ? 'mto_orders' : orderType === 'WHEEL_POWDER_COATING' ? 'wheel_orders' : 'orders';
    console.log("🔍 SUBMIT - Using table:", tableName);
    
    const { data, error } = await supabase
      .from(tableName)
      .insert(supabaseOrder)
      .select()
      .single();
    
    if (error) {
      console.error("❌ SUBMIT - Error saving to Supabase:", error);
      throw error;
    } else {
      console.log("✅ SUBMIT - Successfully saved to Supabase:", data);
    }
    
    // Send email notifications for ALL stores (removed Grand Prairie exclusion)
    if (storeNumber) {
      let emailRecipients: string[] = [];
      
      if (orderType === 'TRANSFER') {
        // For Grand Prairie stores, use fallback email if no specific recipients configured
        if (["22", "27", "28", "29", "30", "32", "33", "35", "36", "39"].includes(storeNumber)) {
          emailRecipients = getTransferEmailRecipients(storeNumber);
          
          // If no recipients found for Grand Prairie stores, use fallback
          if (emailRecipients.length === 0) {
            emailRecipients = ["conlantire97@gmail.com"];
            console.log("📧 SUBMIT - Using fallback email for Grand Prairie store:", storeNumber);
          }
        } else {
          // For other stores, use the contact system
          emailRecipients = getTransferEmailRecipients(storeNumber);
        }
        
        console.log("📧 SUBMIT - Transfer email recipients:", emailRecipients);
        
        if (emailRecipients.length > 0) {
          try {
            console.log("📧 SUBMIT - Calling transfer-notification edge function for store:", storeNumber);
            const emailResponse = await fetch(
              `https://cdbixtaqjppvdkyfbhkz.supabase.co/functions/v1/transfer-notification`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkYml4dGFxanBwdmRreWZiaGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzcwNjEsImV4cCI6MjA1NTkxMzA2MX0.mkeq7GvLjzw8om8t9mnlLLozHimoYy-HsRgJ65RRc10`
                },
                body: JSON.stringify({
                  transferData: googleSheetsPayload,
                  orderId: data?.id || 'unknown',
                  recipients: emailRecipients
                })
              }
            );
            
            if (emailResponse.ok) {
              const emailResult = await emailResponse.json();
              console.log("✅ SUBMIT - Transfer email notification sent successfully:", emailResult);
            } else {
              const emailError = await emailResponse.text();
              console.error("❌ SUBMIT - Email notification failed:", emailError);
            }
          } catch (emailError) {
            console.error("❌ SUBMIT - Error sending transfer email:", emailError);
          }
        }
      } else if (orderType === 'WHEEL_POWDER_COATING') {
        // For Grand Prairie stores, use fallback email if no specific recipients configured
        if (["22", "27", "28", "29", "30", "32", "33", "35", "36", "39"].includes(storeNumber)) {
          emailRecipients = getRefurbishedEmailRecipients(storeNumber);
          
          // If no recipients found for Grand Prairie stores, use fallback
          if (emailRecipients.length === 0) {
            emailRecipients = ["conlantire97@gmail.com"];
            console.log("📧 SUBMIT - Using fallback email for Grand Prairie wheel order:", storeNumber);
          }
        } else {
          // For other stores, use the contact system
          emailRecipients = getRefurbishedEmailRecipients(storeNumber);
        }
        
        console.log("📧 SUBMIT - Refurbished email recipients:", emailRecipients);
        
        if (emailRecipients.length > 0) {
          try {
            console.log("📧 SUBMIT - Calling transfer-notification edge function for wheel order, store:", storeNumber);
            const emailResponse = await fetch(
              `https://cdbixtaqjppvdkyfbhkz.supabase.co/functions/v1/transfer-notification`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkYml4dGFxanBwdmRreWZiaGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzcwNjEsImV4cCI6MjA1NTkxMzA2MX0.mkeq7GvLjzw8om8t9mnlLLozHimoYy-HsRgJ65RRc10`
                },
                body: JSON.stringify({
                  transferData: { ...googleSheetsPayload, orderType: 'Refurbished' },
                  orderId: data?.id || 'unknown', 
                  recipients: emailRecipients
                })
              }
            );
            
            if (emailResponse.ok) {
              const emailResult = await emailResponse.json();
              console.log("✅ SUBMIT - Refurbished email notification sent successfully:", emailResult);
            } else {
              const emailError = await emailResponse.text();
              console.error("❌ SUBMIT - Email notification failed:", emailError);
            }
          } catch (emailError) {
            console.error("❌ SUBMIT - Error sending refurbished email:", emailError);
          }
        }
      }
    }
    
    return googleSheetsPayload;
  } catch (error) {
    console.error("❌ SUBMIT - Error in processOrder:", error);
    throw error;
  }
};
