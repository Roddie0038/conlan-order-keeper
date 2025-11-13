// src/services/stores.ts
// DEPRECATED - Use OT Platform hooks instead: useOTStores() from @/integrations/ot-platform/hooks/useOTStores
// This file kept for backward compatibility but should be replaced

import { supabase } from "@/integrations/supabase/client";

export type StoreOption = { value: string; label: string; plant?: string };

/**
 * @deprecated Use useOTStores() hook instead
 */
export async function fetchAllStores(): Promise<StoreOption[]> {
  const { data, error } = await supabase.functions.invoke("get-stores");

  if (error) {
    console.error("❌ STORES - get-stores failed:", error);
    return [];
  }

  const rows = (data?.data ?? []) as Array<{ label: string; store_ref: string; plant: string }>;
  const options = rows.map((d) => ({ value: d.store_ref, label: d.label, plant: d.plant }));

  console.log(`✅ STORES - Loaded ${options.length} stores via get-stores`);
  return options;
}
