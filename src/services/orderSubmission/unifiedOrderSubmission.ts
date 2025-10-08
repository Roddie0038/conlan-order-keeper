// src/services/orderSubmission/unifiedOrderSubmission.ts

/**
 * Unified order submission pipeline:
 * - Processes orders sequentially via `processOrder`
 * - Always calls `processWebhook` after processing (current behavior retained)
 * - No DB writes here; `processOrder` handles OT ingest and Sheets backup
 */

import { OrderSummary } from "@/hooks/useOrderSubmission";
import { processOrder } from "./processOrder";
import { processWebhook } from "./processWebhook";
import { storeCompletedOrders } from "./storeStorage";

export interface SubmissionResult {
  successes: number;
  failures: number;
  results: Array<{
    orderId: string;
    status: "success" | "failure";
    error?: string;
  }>;
}

export async function unifiedOrderSubmission(
  selectedOrders: OrderSummary[],
  selectedPlant: string,
  PLANT_WEBHOOKS: any,
  isAdmin: boolean = false,
): Promise<SubmissionResult> {
  console.log("[SUBMIT] Starting unified submission utility");
  console.log(`[SUBMIT] Processing ${selectedOrders.length} orders sequentially`);

  const ordersSnapshot = [...selectedOrders];
  const results: SubmissionResult["results"] = [];
  let successes = 0;
  let failures = 0;

  for (let i = 0; i < ordersSnapshot.length; i++) {
    const order = ordersSnapshot[i];
    const orderNum = i + 1;

    console.log(`[SUBMIT] Processing order ${orderNum}/${ordersSnapshot.length} - ID: ${order.id}`);

    try {
      // 1) Process (OT ingest + optional Sheets backup)
      const processedOrder = await processOrder(order, selectedPlant);

      // 2) Run any remaining webhook logic (kept for compatibility / UI flow)
      await processWebhook(
        processedOrder,
        true, // testMode=true — do not block on external side-effects
        isAdmin,
        selectedPlant,
        PLANT_WEBHOOKS,
      );

      console.log(`[SUBMIT] ✅ SUCCESS - Order ${orderNum}/${ordersSnapshot.length} processed successfully`);
      successes++;
      results.push({ orderId: order.id, status: "success" });
    } catch (error) {
      console.error(`[SUBMIT] ❌ FAILURE - Order ${orderNum}/${ordersSnapshot.length} failed:`, error);
      failures++;
      results.push({
        orderId: order.id,
        status: "failure",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      // Continue with remaining orders
    }
  }

  // Persist only the successful original orders to local storage for UX
  const successfulOrders = ordersSnapshot.filter((_o, idx) => results[idx]?.status === "success");
  if (successfulOrders.length > 0) {
    storeCompletedOrders(successfulOrders, selectedPlant);
  }

  console.log(`[SUBMIT] 📊 FINAL SUMMARY: ${successes} orders succeeded, ${failures} failed`);
  console.log("[SUBMIT] Detailed results:", results);

  return { successes, failures, results };
}
