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
    const { data, error } = await supabase
      .from('platform_users')
      .select('store, normalized_store')
      .eq('status', 'active')
      .order('normalized_store', { ascending: true });

    if (error) {
      console.error('❌ STORES - Failed to fetch stores:', error);
      throw error;
    }

    // Get unique normalized stores or store values
    const uniqueStores = Array.from(
      new Set(
        (data ?? [])
          .map(r => r.normalized_store || r.store)
          .filter(Boolean)
      )
    );

    console.log(`✅ STORES - Loaded ${uniqueStores.length} unique stores from database`);

    // If we have fewer than 5 stores, fallback to storeData for full list
    if (uniqueStores.length < 5) {
      console.log('⚠️ STORES - Using storeData fallback for comprehensive store list');
      const { storeData } = await import('@/config/storeData');
      const fallbackStores = storeData.map(s => `${s.name} ${s.storeNumber}`);
      console.log(`✅ STORES - Loaded ${fallbackStores.length} stores from storeData`);
      return fallbackStores.map(store => ({
        value: store,
        label: store
      }));
    }

    return uniqueStores.map(store => ({
      value: store!,
      label: store!
    }));
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
