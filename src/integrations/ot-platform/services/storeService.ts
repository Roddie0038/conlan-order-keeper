import { otClient } from '../client';
import type { OTStore, OTStoreColor } from '../types';

/**
 * Fetch all active stores from OT Platform
 * SINGLE SOURCE OF TRUTH - OT Platform /admin/stores
 */
export async function fetchOTStores(): Promise<OTStore[]> {
  const startTime = performance.now();
  
  try {
    const { data, error } = await otClient
      .from('stores')
      .select('*')
      .eq('is_active', true)
      .order('store_number');

    const duration = Math.round(performance.now() - startTime);

    if (error) {
      console.error(`❌ OT STORES - Failed to fetch stores (${duration}ms):`, error);
      throw error;
    }

    console.log(`✅ OT STORES - Loaded ${data.length} stores from OT Platform (${duration}ms)`);
    return data as OTStore[];
  } catch (error) {
    console.error('❌ OT STORES - Exception during fetch:', error);
    return [];
  }
}

/**
 * Fetch store colors from OT Platform's app_store_colors table
 * SINGLE SOURCE OF TRUTH - OT Platform /admin/store-colors
 * Managed ONLY by Super Admins / Operations Managers
 */
export async function fetchOTStoreColors(): Promise<Map<string, OTStoreColor>> {
  const startTime = performance.now();
  
  try {
    const { data, error } = await otClient
      .from('app_store_colors')
      .select('*')
      .order('store_code');

    const duration = Math.round(performance.now() - startTime);

    if (error) {
      console.error(`❌ OT COLORS - Failed to fetch store colors (${duration}ms):`, error);
      throw error;
    }

    const colorMap = new Map<string, OTStoreColor>();
    (data as OTStoreColor[]).forEach(color => {
      colorMap.set(color.store_code, color);
    });

    console.log(`✅ OT COLORS - Loaded ${colorMap.size} store colors from OT Platform (${duration}ms)`);
    return colorMap;
  } catch (error) {
    console.error('❌ OT COLORS - Exception during fetch:', error);
    return new Map();
  }
}

/**
 * Get store by store number
 */
export async function getOTStoreByNumber(storeNumber: string): Promise<OTStore | null> {
  try {
    const { data, error } = await otClient
      .from('stores')
      .select('*')
      .eq('store_number', storeNumber)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error(`❌ OT STORES - Failed to fetch store ${storeNumber}:`, error);
      return null;
    }
    
    return data as OTStore;
  } catch (error) {
    console.error(`❌ OT STORES - Exception fetching store ${storeNumber}:`, error);
    return null;
  }
}
