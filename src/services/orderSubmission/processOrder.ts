
import { OrderSummary } from "@/hooks/useOrderSubmission";
import { submitToGoogleSheets } from "@/services/sheets";
import { saveOrderToSupabase } from "@/services/orderService";
import { storeData } from "@/config/storeData";
import { OrderType } from "@/services/webhook/config";
import { getPlantForStore } from "@/utils/plantMapping";
import { getStoreEmailRecipients } from "@/services/emailRouting";
import type { OrderData } from "@/types/supabase-extensions";
import { formatDateForSupabase } from "@/utils/dateTime";
import { supabase } from "@/integrations/supabase/client";
import { normalizeStoreForSubmission, normalizeOrderStoreFields, extractStoreNumber } from "@/utils/storeNormalization";
import { storeSanitizeForSupabase, logStoreFormatTransformation } from "@/utils/storeSanitization";

/**
 * Create a service role Supabase client for bypassing RLS
 */
const createServiceRoleClient = () => {
  const SUPABASE_URL = "https://cdbixtaqjppvdkyfbhkz.supabase.co";
  const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkYml4dGFxanBwdmRreWZiaGt6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMzNzA2MSwiZXhwIjoyMDU1OTEzMDYxfQ.xrKT5y3yRVZiHyc4pQPxXXBfnqcQqQOPjZyZPAkSWcU";
  
  return supabase.createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
};

/**
 * Process an individual order - handle Google Sheets submission and Supabase storage
 * 
 * @param order - The order to process
 * @param selectedPlant - The currently selected plant from PlantContext
 * @returns The processed order with additional metadata
 */
export const processOrder = async (order: OrderSummary, selectedPlant: string) => {
  console.log("🔍 SUBMIT - Processing order:", order.id);
  console.log("🔍 SUBMIT - Original order data:", order);
  
  // PHASE 1: Store format handling - different formats for different destinations
  const originalStore = order.store;
  const displayStore = normalizeStoreForSubmission(originalStore); // For Google Sheets display
  const supabaseStore = storeSanitizeForSupabase(displayStore); // For Supabase storage
  
  logStoreFormatTransformation('DISPLAY_FORMAT', originalStore, displayStore, 'Google Sheets');
  logStoreFormatTransformation('SUPABASE_FORMAT', displayStore, supabaseStore, 'Supabase');
  
  console.log("🔄 PROCESS ORDER STORE FORMATS:", {
    original: originalStore,
    display: displayStore,
    supabase: supabaseStore,
    phase: 'store_format_handling'
  });
  
  // Get store manager email from database
  const storeNumber = extractStoreNumber(displayStore);
  const storeManagerEmail = "";
  
  // PHASE 2: Plant determination
  const mappedPlant = getPlantForStore(displayStore);
  const finalPlant = selectedPlant || mappedPlant || 'Grand Prairie 097';
  
  console.log("🔍 SUBMIT - Plant selection logic:", {
    selectedPlant,
    mappedPlant,
    finalPlant,
    store: displayStore
  });
  
  if (!mappedPlant && !selectedPlant) {
    console.warn(`⚠️ SUBMIT - Could not determine plant for store: ${displayStore}`);
    console.warn(`⚠️ SUBMIT - Using fallback plant: Grand Prairie 097`);
  }
  
  // PHASE 3: Order type determination
  let orderType: OrderType = "TRANSFER";
  
  if ('qtyWheels' in order && order.qtyWheels) {
    orderType = "WHEEL_POWDER_COATING";
  } else if (order.type === 'MTO' || ('casingGrade' in order && order.casingGrade)) {
    orderType = "MTO";
  }
  
  console.log("🔍 SUBMIT - Determined order type:", orderType, "for order:", order.id);
  
  // PHASE 4: Cross-dock processing with improved email lookup
  let destinationManagerEmail = "";
  let formattedCrossDockDestination = "";
  
  if (order.crossDock === "Yes" && order.crossDockDestination) {
    // Format destination for display
    formattedCrossDockDestination = normalizeStoreForSubmission(order.crossDockDestination);
    
    // Get destination manager email using improved lookup
    const destinationStoreNumber = extractStoreNumber(formattedCrossDockDestination);
    if (destinationStoreNumber) {
      try {
        const emailResult = await getStoreEmailRecipients(destinationStoreNumber, 'transfer');
        destinationManagerEmail = emailResult.recipients[0] || "";
        
        console.log("🔍 SUBMIT - Cross-dock destination email lookup:", {
          destinationStore: formattedCrossDockDestination,
          destinationStoreNumber,
          emailResult: emailResult,
          destinationManagerEmail
        });
      } catch (error) {
        console.error("❌ SUBMIT - Failed to get destination manager email:", error);
      }
    }
    
    console.log("🔍 SUBMIT - Cross-dock processing:", {
      crossDockDestination: order.crossDockDestination,
      formattedCrossDockDestination,
      destinationManagerEmail,
      receiverNo: order.receiverNo,
      etaDate: order.etaDate
    });
  }
  
  // PHASE 5: Create payloads with different store formats
  const formattedTimestamp = formatDateForSupabase(new Date());
  
  // Google Sheets payload (display format)
  const baseGoogleSheetsPayload = {
    ...order,
    store: displayStore, // Use display format "Store 27"
    plant: finalPlant,
    type: orderType,
    name: order.yourName || order.name || "Unknown",
    email: storeManagerEmail,
    crossDock: (order.crossDock === "Yes" ? "Yes" : "No") as "Yes" | "No",
    crossDockDestination: formattedCrossDockDestination,
    receiverNo: order.receiverNo || "",
    etaDate: order.etaDate || "",
    destinationManagerEmail: destinationManagerEmail,
    timestamp: formattedTimestamp,
    managerEmail: storeManagerEmail,
    managersEmail: storeManagerEmail
  };
  
  const googleSheetsPayload = normalizeOrderStoreFields(baseGoogleSheetsPayload);

  // Supabase payload (database format)
  let baseSupabaseOrder: any = {
    name: order.yourName || order.name || "Unknown",
    store: supabaseStore, // Use database format "27"
    product_number: order.productNumber,
    description: order.description,
    quantity: parseInt(order.quantity?.toString() || "0") || 0,
    schedule_arrival: order.scheduleArrival,
    notes: order.notes,
    email: storeManagerEmail,
    plant: finalPlant,
    order_type: orderType,
    timestamp: formattedTimestamp,
    status: 'pending',
    status_updated_at: new Date().toISOString()
  };
  
  // Add cross-dock fields for transfer orders
  if (orderType === 'TRANSFER') {
    const crossDockDestinationForDb = storeSanitizeForSupabase(formattedCrossDockDestination);
    
    baseSupabaseOrder = {
      ...baseSupabaseOrder,
      cross_dock_type: (order.crossDock === "Yes" ? "Yes" : "No") as "Yes" | "No",
      cross_dock_destination: crossDockDestinationForDb,
      cross_dock_receiver_number: order.receiverNo || "",
      cross_dock_eta_date: order.etaDate || "",
      destination_manager_email: destinationManagerEmail
    };
    
    logStoreFormatTransformation('CROSS_DOCK_DEST', formattedCrossDockDestination, crossDockDestinationForDb, 'Cross-dock destination');
  }
  
  let supabaseOrder = normalizeOrderStoreFields(baseSupabaseOrder);
  
  console.log("🔍 SUBMIT - Final Google Sheets payload:", googleSheetsPayload);
  console.log("🔍 SUBMIT - Final Supabase payload:", supabaseOrder);
  
  // PHASE 6: Submit to systems with proper error handling
  try {
    console.log("🔍 SUBMIT - Beginning webhook submission at:", new Date().toISOString());
    
    // Submit to Google Sheets
    const webhookData = { ...googleSheetsPayload, _nocache: Date.now() };
    const result = await submitToGoogleSheets(webhookData as any);
    console.log("🔍 SUBMIT - submitToGoogleSheets result:", result);
    
    // Submit to Supabase using service role to bypass RLS
    console.log("🔍 SUBMIT - Saving order to Supabase with service role authentication");
    const tableName = orderType === 'MTO' ? 'mto_orders' : orderType === 'WHEEL_POWDER_COATING' ? 'wheel_orders' : 'orders';
    
    console.log("🔍 SUBMIT - Using table:", tableName);
    console.log("🔍 SUBMIT - Final payload before insert:", supabaseOrder);
    
    // Create service role client for RLS bypass
    const serviceRoleClient = createServiceRoleClient();
    
    const { data, error } = await serviceRoleClient
      .from(tableName)
      .insert(supabaseOrder)
      .select()
      .single();
    
    if (error) {
      console.error("❌ SUBMIT - Supabase insert error:", error);
      console.error("❌ SUBMIT - Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Supabase insert failed: ${error.message}`);
    } else {
      console.log("✅ SUBMIT - Successfully saved to Supabase:", data);
      console.log("✅ SUBMIT - Verified store field in saved data:", data.store);
    }
    
    // PHASE 7: Send email notifications
    if (storeNumber) {
      let emailRecipients: string[] = [];
      let emailType: 'transfer' | 'mto' | 'wheel' = 'transfer';
      
      if (orderType === 'TRANSFER') {
        emailType = 'transfer';
        const emailResult = await getStoreEmailRecipients(storeNumber, emailType);
        emailRecipients = emailResult.recipients;
        
        console.log(`📧 SUBMIT - Transfer email recipients (${emailResult.source}):`, emailRecipients);
        if (emailResult.source === 'fallback') {
          console.warn(`📧 SUBMIT - Using fallback routing: ${emailResult.fallbackReason}`);
        }
        
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
        emailType = 'wheel';
        const emailResult = await getStoreEmailRecipients(storeNumber, emailType);
        emailRecipients = emailResult.recipients;
        
        console.log(`📧 SUBMIT - Wheel email recipients (${emailResult.source}):`, emailRecipients);
        if (emailResult.source === 'fallback') {
          console.warn(`📧 SUBMIT - Using fallback routing: ${emailResult.fallbackReason}`);
        }
        
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
    
    // Enhanced error reporting
    if (error instanceof Error) {
      console.error("❌ SUBMIT - Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    throw error;
  }
};
