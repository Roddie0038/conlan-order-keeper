import { OrderSummary } from "@/hooks/useOrderSubmission";
import { processOrder } from "./processOrder";
import { processWebhook } from "./processWebhook";
import { storeCompletedOrders } from "./storeStorage";

export interface SubmissionResult {
  successes: number;
  failures: number;
  results: Array<{
    orderId: string;
    status: 'success' | 'failure';
    error?: string;
  }>;
}

/**
 * Unified order submission utility that processes multiple orders sequentially
 * with proper logging and state management. Both Transfer Request and Regional Orders use this.
 */
export async function unifiedOrderSubmission(
  selectedOrders: OrderSummary[],
  selectedPlant: string,
  PLANT_WEBHOOKS: any,
  isAdmin: boolean = false
): Promise<SubmissionResult> {
  console.log("[SUBMIT] Starting unified submission utility");
  console.log(`[SUBMIT] Processing ${selectedOrders.length} orders sequentially`);
  
  // Snapshot the orders at submission time to prevent race conditions
  const ordersSnapshot = [...selectedOrders];
  
  const results: SubmissionResult['results'] = [];
  let successes = 0;
  let failures = 0;
  
  // Process each order sequentially
  for (let i = 0; i < ordersSnapshot.length; i++) {
    const order = ordersSnapshot[i];
    const orderNum = i + 1;
    
    console.log(`[SUBMIT] Processing order ${orderNum}/${ordersSnapshot.length} - ID: ${order.id}`);
    
    try {
      // Process the order through the standard pipeline
      const processedOrder = await processOrder(order, selectedPlant);
      
      // Always process webhook for all orders regardless of admin status
      await processWebhook(
        processedOrder, 
        true, // Always send notifications (testMode=true)
        isAdmin, 
        selectedPlant, 
        PLANT_WEBHOOKS
      );
      
      console.log(`[SUBMIT] ✅ SUCCESS - Order ${orderNum}/${ordersSnapshot.length} processed successfully`);
      successes++;
      results.push({
        orderId: order.id,
        status: 'success'
      });
      
    } catch (error) {
      console.error(`[SUBMIT] ❌ FAILURE - Order ${orderNum}/${ordersSnapshot.length} failed:`, error);
      failures++;
      results.push({
        orderId: order.id,
        status: 'failure',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Continue with other orders even if one fails
    }
  }
  
  // Store successfully processed orders in local storage
  const successfulOrders = ordersSnapshot.filter((_, index) => 
    results[index]?.status === 'success'
  );
  
  if (successfulOrders.length > 0) {
    storeCompletedOrders(successfulOrders, selectedPlant);
  }
  
  // Log final summary
  console.log(`[SUBMIT] 📊 FINAL SUMMARY: ${successes} orders succeeded, ${failures} failed`);
  console.log(`[SUBMIT] Detailed results:`, results);
  
  return {
    successes,
    failures,
    results
  };
}