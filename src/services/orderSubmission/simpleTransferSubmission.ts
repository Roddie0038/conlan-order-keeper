import { TransferOrderSummary } from "@/components/transfer-request/TransferRequestForm";
import { submitToGoogleSheets } from "@/services/sheets";
import { supabase } from "@/integrations/supabase/client";
import { getStoreEmailRecipients } from "@/services/emailRouting";
import { formatDateForSupabase } from "@/utils/dateTime";

export interface SimpleTransferResult {
  successes: number;
  failures: number;
  results: Array<{
    orderId: string;
    status: 'success' | 'failure';
    error?: string;
  }>;
}

/**
 * Simple transfer submission utility - NO regional logic, NO plant mapping
 * Uses selected plant directly, simple store → plant transfers only
 */
export async function simpleTransferSubmission(
  selectedOrders: TransferOrderSummary[],
  selectedPlant: string
): Promise<SimpleTransferResult> {
  console.log("[SUBMIT] Starting simple transfer submission utility");
  console.log(`[SUBMIT] Processing ${selectedOrders.length} transfers to plant: ${selectedPlant}`);
  
  // Snapshot the orders at submission time to prevent race conditions
  const ordersSnapshot = [...selectedOrders];
  
  const results: SimpleTransferResult['results'] = [];
  let successes = 0;
  let failures = 0;
  
  // Process each order sequentially
  for (let i = 0; i < ordersSnapshot.length; i++) {
    const order = ordersSnapshot[i];
    const orderNum = i + 1;
    
    console.log(`[SUBMIT] Processing transfer ${orderNum}/${ordersSnapshot.length} - ID: ${order.id}`);
    
    try {
      // Get store manager email from database (no hardcoded emails)
      const storeNumber = order.store.match(/\d+$/)?.[0] || "";
      
      // Format timestamp for Supabase in MM/DD-YYYY HH:MM AM/PM format
      const formattedTimestamp = formatDateForSupabase(new Date());
      
      // Create Google Sheets payload (camelCase format) - SIMPLE TRANSFER
      const googleSheetsPayload = {
        ...order,
        plant: selectedPlant, // Use selected plant directly - NO getPlantForStore()
        type: "TRANSFER", // Always transfer type
        name: order.yourName || order.name || "Unknown",
        email: "", // Will be retrieved from database during email routing
        
        // Keep the frontend field names for Google Sheets/Zapier (camelCase)
        crossDock: (order.crossDock === "Yes" ? "Yes" : "No") as "Yes" | "No", 
        crossDockDestination: order.crossDockDestination || "",
        receiverNo: order.receiverNo || null,
        etaDate: order.etaDate || null,
        
        timestamp: formattedTimestamp,
        // Add manager email fields for webhook compatibility
        managerEmail: "",
        managersEmail: ""
      };

      // Create Supabase payload (snake_case format)
      const supabaseOrder: any = {
        name: order.yourName || order.name || "Unknown",
        store: order.store,
        product_number: order.productNumber, // snake_case for Supabase
        description: order.description,
        quantity: parseInt(order.quantity?.toString() || "0") || 0,
        schedule_arrival: order.scheduleArrival, // snake_case for Supabase
        notes: order.notes,
        email: "", // Email routing handled dynamically
        plant: selectedPlant, // Use selected plant directly
        order_type: "TRANSFER",
        timestamp: formattedTimestamp,
        status: 'pending',
        status_updated_at: new Date().toISOString(),
        // Cross dock fields
        cross_dock_type: (order.crossDock === "Yes" ? "Yes" : "No") as "Yes" | "No",
        cross_dock_destination: order.crossDockDestination || "",
        cross_dock_receiver_number: order.receiverNo || null,
        cross_dock_eta_date: order.etaDate || null,
        destination_manager_email: ""
      };
      
      console.log(`[SUBMIT] Transfer ${orderNum}: Simple store → plant transfer to ${selectedPlant}`);
      console.log(`[SUBMIT] Transfer ${orderNum}: Google Sheets payload:`, googleSheetsPayload);
      console.log(`[SUBMIT] Transfer ${orderNum}: Supabase payload:`, supabaseOrder);
      
      // Submit to Google Sheets with cache-busting parameter
      const webhookData = {
        ...googleSheetsPayload,
        _nocache: Date.now()
      };
      
      const result = await submitToGoogleSheets(webhookData as any);
      console.log(`[SUBMIT] Transfer ${orderNum}: submitToGoogleSheets result:`, result);
      
      // Save the order to Supabase
      const { data, error } = await supabase
        .from('orders')
        .insert(supabaseOrder)
        .select()
        .single();
      
      if (error) {
        console.error(`[SUBMIT] Transfer ${orderNum}: Error saving to Supabase:`, error);
        throw error;
      } else {
        console.log(`[SUBMIT] Transfer ${orderNum}: Successfully saved to Supabase:`, data);
      }
      
      // Send email notifications using centralized routing
      if (storeNumber) {
        const emailResult = await getStoreEmailRecipients(storeNumber, 'transfer');
        const emailRecipients = emailResult.recipients;
        
        console.log(`[SUBMIT] Transfer ${orderNum}: Email recipients (${emailResult.source}):`, emailRecipients);
        if (emailResult.source === 'fallback') {
          console.warn(`[SUBMIT] Transfer ${orderNum}: Using fallback routing: ${emailResult.fallbackReason}`);
        }
        
        if (emailRecipients.length > 0) {
          try {
            console.log(`[SUBMIT] Transfer ${orderNum}: Calling transfer-notification edge function for store:`, storeNumber);
            const emailResponse = await fetch
              (`https://cdbixtaqjppvdkyfbhkz.supabase.co/functions/v1/transfer-notification`,
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
              console.log(`[SUBMIT] Transfer ${orderNum}: Email notification sent successfully:`, emailResult);
            } else {
              const emailError = await emailResponse.text();
              console.error(`[SUBMIT] Transfer ${orderNum}: Email notification failed:`, emailError);
            }
          } catch (emailError) {
            console.error(`[SUBMIT] Transfer ${orderNum}: Error sending transfer email:`, emailError);
          }
        }
      }
      
      console.log(`[SUBMIT] ✅ SUCCESS - Transfer ${orderNum}/${ordersSnapshot.length} processed successfully`);
      successes++;
      results.push({
        orderId: order.id,
        status: 'success'
      });
      
    } catch (error) {
      console.error(`[SUBMIT] ❌ FAILURE - Transfer ${orderNum}/${ordersSnapshot.length} failed:`, error);
      failures++;
      results.push({
        orderId: order.id,
        status: 'failure',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Continue with other orders even if one fails
    }
  }
  
  // Log final summary
  console.log(`[SUBMIT] 📊 FINAL SUMMARY: ${successes} transfers succeeded, ${failures} failed`);
  console.log(`[SUBMIT] Detailed results:`, results);
  
  return {
    successes,
    failures,
    results
  };
}
