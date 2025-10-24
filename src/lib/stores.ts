// src/lib/stores.ts
// Fetch store list via Ordering → OT proxy Edge Function

import { supabase } from "@/integrations/supabase/client";

export type StoreOption = { value: string; label: string; plant?: string };

/**
 * Fetch all unique stores via the get-stores Edge Function
 * Used by admins and unassigned users to select a store
 * Falls back to storeData if Edge Function call fails
 */
export async function fetchAllStores(): Promise<StoreOption[]> {
  try {
    const { data, error } = await supabase.functions.invoke("get-stores");

    if (error) {
      console.error("❌ STORES - get-stores failed:", error);
      throw error;
    }

    const rows = (data?.data ?? []) as Array<{ label: string; store_ref: string; plant: string }>;
    const options = rows.map((d) => ({ value: d.store_ref, label: d.label, plant: d.plant }));

    if (options.length < 5) {
      console.warn("⚠️ STORES - Using storeData fallback");
      const { storeData } = await import("@/config/storeData");
      return storeData.map((s: any) => ({ value: s.storeNumber, label: `${s.name} ${s.storeNumber}` }));
    }

    console.log(`✅ STORES - Loaded ${options.length} stores via get-stores`);
    return options;
  } catch (error) {
    console.error("❌ STORES - Error in fetchAllStores, using storeData fallback:", error);
    const { storeData } = await import("@/config/storeData");
    return storeData.map((s: any) => ({ value: s.storeNumber, label: `${s.name} ${s.storeNumber}` }));
  }
}
