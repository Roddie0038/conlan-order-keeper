import { supabase } from '@/integrations/supabase/client';

export type StoreOption = { 
  value: string; 
  label: string; 
};

/**
 * Fetch all unique stores from platform_users for dropdown population
 * Used by admins and unassigned users to select a store
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

    // Get unique normalized stores
    const uniqueStores = Array.from(
      new Set(
        (data ?? [])
          .map(r => r.normalized_store || r.store)
          .filter(Boolean)
      )
    );

    console.log(`✅ STORES - Loaded ${uniqueStores.length} unique stores`);

    return uniqueStores.map(store => ({
      value: store!,
      label: store!
    }));
  } catch (error) {
    console.error('❌ STORES - Error in fetchAllStores:', error);
    return [];
  }
}
