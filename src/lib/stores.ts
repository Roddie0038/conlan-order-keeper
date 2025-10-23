import { supabase } from '@/integrations/supabase/client';

export type StoreOption = { 
  value: string; 
  label: string; 
};

/**
 * Fetch all unique stores from platform_users for dropdown population
 * Used by admins and unassigned users to select a store
 * Falls back to storeData if database returns insufficient results
 */
export async function fetchAllStores(): Promise<StoreOption[]> {
  try {
    const { data, error } = await (supabase as any)
      .from('ordering_store_list')
      .select('label, store_ref, plant')
      .order('label', { ascending: true });

    if (error) {
      console.error('❌ STORES - Failed to fetch stores:', error);
      throw error;
    }

    // Map dropdown options
    const options = (data ?? []).map((d: any) => ({ 
      value: d.store_ref, 
      label: d.label 
    }));

    console.log(`✅ STORES - Loaded ${options.length} stores from ordering_store_list`);

    // If we have fewer than 5 stores, fallback to storeData for full list
    if (options.length < 5) {
      console.log('⚠️ STORES - Using storeData fallback for comprehensive store list');
      const { storeData } = await import('@/config/storeData');
      const fallbackStores = storeData.map(s => `${s.name} ${s.storeNumber}`);
      console.log(`✅ STORES - Loaded ${fallbackStores.length} stores from storeData`);
      return fallbackStores.map(store => ({
        value: store,
        label: store
      }));
    }

    return options;
  } catch (error) {
    console.error('❌ STORES - Error in fetchAllStores, using storeData fallback:', error);
    const { storeData } = await import('@/config/storeData');
    const fallbackStores = storeData.map(s => `${s.name} ${s.storeNumber}`);
    return fallbackStores.map(store => ({
      value: store,
      label: store
    }));
  }
}
