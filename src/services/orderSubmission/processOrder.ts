
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
  
  // CRITICAL: Preserve the original store value - do not override it
  const originalStore = order.store;
  const normalizedStore = normalizeStoreForSubmission(originalStore);
  console.log("🔄 PROCESS ORDER STORE PRESERVATION:", {
    original: originalStore,
    normalized: normalizedStore,
    shouldNotChange: true
  });
  
  // Get store manager email from database (no hardcoded emails)
  const storeNumber = extractStoreNumber(normalizedStore);
  const storeManagerEmail = ""; // Will be retrieved from database during email routing
  
  // CRITICAL FIX: Use selectedPlant first, then fallback to store mapping
  const mappedPlant = getPlantForStore(normalizedStore);
  const finalPlant = selectedPlant || mappedPlant || 'Grand Prairie 097';
  
  console.log("🔍 SUBMIT - Plant selection logic:", {
    selectedPlant,
    mappedPlant,
    finalPlant,
    store: normalizedStore
  });
  
  // Validate plant determination
  if (!mappedPlant && !selectedPlant) {
    console.warn(`⚠️ SUBMIT - Could not determine plant for normalized store: ${normalizedStore}`);
    console.warn(`⚠️ SUBMIT - Using fallback plant: Grand Prairie 097`);
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
  
  // ✅ CRITICAL FIX: Properly handle cross-dock fields from the order
  let destinationManagerEmail = "";
  let formattedCrossDockDestination = "";
  
  if (order.crossDock === "Yes" && order.crossDockDestination) {
    // Use the destination manager email from the form if available
    destinationManagerEmail = order.destinationManagerEmail || "";
    
    // Normalize the cross-dock destination
    formattedCrossDockDestination = normalizeStoreForSubmission(order.crossDockDestination);
    
    console.log("🔍 SUBMIT - Cross-dock processing:", {
      crossDockDestination: order.crossDockDestination,
      formattedCrossDockDestination,
      destinationManagerEmail,
      receiverNo: order.receiverNo,
      etaDate: order.etaDate
    });
  }
  
  // Format timestamp for Supabase in MM/DD-YYYY HH:MM AM/PM format
  const formattedTimestamp = formatDateForSupabase(new Date());
  
  // Create Google Sheets payload (camelCase format) with preserved store
  const baseGoogleSheetsPayload = {
    ...order,
    store: normalizedStore, // ✅ Use preserved original store
    plant: finalPlant,
    type: orderType,
    name: order.yourName || order.name || "Unknown",
    email: storeManagerEmail,
    
    // ✅ CRITICAL FIX: Use actual cross-dock values from the order
    crossDock: (order.crossDock === "Yes" ? "Yes" : "No") as "Yes" | "No", 
    crossDockDestination: formattedCrossDockDestination,
    receiverNo: order.receiverNo || "",
    etaDate: order.etaDate || "",
    destinationManagerEmail: destinationManagerEmail,
    
    timestamp: formattedTimestamp,
    managerEmail: storeManagerEmail,
    managersEmail: storeManagerEmail
  };
  
  // Apply comprehensive normalization to all store fields
  const googleSheetsPayload = normalizeOrderStoreFields(baseGoogleSheetsPayload);

  // Create Supabase payload (snake_case format)
  let baseSupabaseOrder: any = {
    name: order.yourName || order.name || "Unknown",
    store: normalizedStore, // ✅ Use preserved original store
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
  
  // Apply comprehensive normalization to all store fields
  let supabaseOrder = normalizeOrderStoreFields(baseSupabaseOrder);
  
  // ✅ CRITICAL FIX: Only add cross dock fields for transfer orders and use actual values
  if (orderType === 'TRANSFER') {
    supabaseOrder = {
      ...supabaseOrder,
      cross_dock_type: (order.crossDock === "Yes" ? "Yes" : "No") as "Yes" | "No",
      cross_dock_destination: formattedCrossDockDestination,
      cross_dock_receiver_number: order.receiverNo || "",
      cross_dock_eta_date: order.etaDate || "",
      destination_manager_email: destinationManagerEmail
    };
  }
  
  console.log("🔍 SUBMIT - Final Google Sheets payload:", googleSheetsPayload);
  console.log("🔍 SUBMIT - Final Supabase payload:", supabaseOrder);
  
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
    
    // Save the order to Supabase using the properly formatted data
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
    
    // Send email notifications for ALL stores using centralized routing
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
    throw error;
  }
};
