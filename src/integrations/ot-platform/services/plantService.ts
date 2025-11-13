import { otClient } from '../client';
import type { OTPlant } from '../types';

/**
 * Fetch all active plants from OT Platform
 * SINGLE SOURCE OF TRUTH - OT Platform /admin/plants
 */
export async function fetchOTPlants(): Promise<OTPlant[]> {
  const startTime = performance.now();
  
  try {
    const { data, error } = await otClient
      .from('app_plants')
      .select('*')
      .eq('status', 'active')
      .order('plant_code');

    const duration = Math.round(performance.now() - startTime);

    if (error) {
      console.error(`❌ OT PLANTS - Failed to fetch plants (${duration}ms):`, error);
      throw error;
    }

    console.log(`✅ OT PLANTS - Loaded ${data.length} plants from OT Platform (${duration}ms)`);
    return data as OTPlant[];
  } catch (error) {
    console.error('❌ OT PLANTS - Exception during fetch:', error);
    return [];
  }
}
