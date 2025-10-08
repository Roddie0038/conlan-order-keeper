// src/services/orderService.ts
// @ts-nocheck

/**
 * ORDER SERVICE — MIGRATION MODE
 * ----------------------------------------
 * - All writes to the Ordering DB are disabled (orders, mto_orders, wheel_orders).
 * - OT is the system of record via the ingest edge function.
 * - Reads are allowed (best-effort) so dashboards can still show history.
 */

import { supabase } from "@/integrations/supabase/client";
import type {
  OrderData,
  MTOOrderData,
  SupabaseInsertResult,
  MTOOrderRecord,
  TransferOrderRecord,
  WheelOrderRecord,
} from "@/types/supabase-extensions";

// ---- Feature flag (leave FALSE during the OT migration) ---------------------
const ENABLE_ORDERING_DB_WRITES = false;

// Small helper for consistent console messages
const DISABLED_PREFIX = "🚫 ORDER SERVICE";
const DISABLED_REASON = "Ordering DB writes are disabled – OT ingest is the system of record.";

// When writes are disabled, return a standardized shape that won’t crash callers
function disabledResult(): SupabaseInsertResult<MTOOrderRecord | TransferOrderRecord | WheelOrderRecord> {
  // Keep data/error null to avoid surfacing failures to the UI toasts,
  // but log loudly in the console for dev visibility.
  return { data: null, error: null, disabled: true };
}

/**
 * Save an order to Supabase (DISABLED)
 * - During migration, do NOT write to the Ordering DB.
 * - Calls should route to the OT ingest edge function instead.
 */
export const saveOrderToSupabase = async (
  _order: OrderData | MTOOrderData,
  _user?: any,
): Promise<SupabaseInsertResult<MTOOrderRecord | TransferOrderRecord | WheelOrderRecord>> => {
  if (!ENABLE_ORDERING_DB_WRITES) {
    console.warn(`${DISABLED_PREFIX} - saveOrderToSupabase: ${DISABLED_REASON}`);
    return disabledResult();
  }

  // If you ever flip the flag back on, you can restore the original insert logic here.
  // (Intentionally omitted while migration is active.)
};

/**
 * Optional legacy entry points (no-ops)
 * If any older code paths still import these, they’ll be safely disabled too.
 */
export async function saveMTOOrder(_order: MTOOrderData): Promise<SupabaseInsertResult<MTOOrderRecord>> {
  if (!ENABLE_ORDERING_DB_WRITES) {
    console.warn(`${DISABLED_PREFIX} - saveMTOOrder: ${DISABLED_REASON}`);
    return { data: null, error: null, disabled: true };
  }
}

export async function saveWheelOrder(_order: OrderData): Promise<SupabaseInsertResult<WheelOrderRecord>> {
  if (!ENABLE_ORDERING_DB_WRITES) {
    console.warn(`${DISABLED_PREFIX} - saveWheelOrder: ${DISABLED_REASON}`);
    return { data: null, error: null, disabled: true };
  }
}

export async function saveAnyOrder(_order: unknown): Promise<SupabaseInsertResult<any>> {
  if (!ENABLE_ORDERING_DB_WRITES) {
    console.warn(`${DISABLED_PREFIX} - saveAnyOrder: ${DISABLED_REASON}`);
    return { data: null, error: null, disabled: true };
  }
}

/**
 * Best-effort readers
 * - Safely read from whatever tables exist.
 * - If a table is missing or errors, we log and keep going with the rest.
 */
export const getAllOrders = async () => {
  console.log("🔍 ORDER SERVICE - Fetching all orders (best-effort)");

  // Helper to run a query and swallow “relation does not exist” (or any) errors
  const safeSelect = async <T,>(table: string) => {
    try {
      const { data, error } = await supabase.from<T>(table).select("*").order("timestamp", { ascending: false });
      if (error) {
        // Common during migration if the table isn’t present yet
        console.warn(`⚠️ ORDER SERVICE - Error fetching ${table}:`, error?.message ?? error);
        return [] as T[];
      }
      return (data ?? []) as T[];
    } catch (err) {
      console.warn(`⚠️ ORDER SERVICE - Exception fetching ${table}:`, err);
      return [] as T[];
    }
  };

  const [orders, mtoOrders, wheelOrders] = await Promise.all([
    safeSelect<TransferOrderRecord>("orders"),
    safeSelect<MTOOrderRecord>("mto_orders"),
    safeSelect<WheelOrderRecord>("wheel_orders"),
  ]);

  // Normalize shape a bit so consumers can render a unified list
  const all = [
    ...orders.map((o: any) => ({ ...o, order_type: o.order_type || "TRANSFER" })),
    ...mtoOrders.map((o: any) => ({ ...o, order_type: "MTO" })),
    ...wheelOrders.map((o: any) => ({ ...o, order_type: "WHEEL_POWDER_COATING" })),
  ];

  console.log(`✅ ORDER SERVICE - Successfully fetched ${all.length} rows (combined)`);
  return { data: all, error: null };
};
