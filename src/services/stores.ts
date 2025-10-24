// src/services/stores.ts
// Fetch store list via Ordering → OT proxy Edge Function

import { supabase } from "@/integrations/supabase/client";

export type StoreOption = { value: string; label: string; plant?: string };

export async function fetchAllStores(): Promise<StoreOption[]> {
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
}
