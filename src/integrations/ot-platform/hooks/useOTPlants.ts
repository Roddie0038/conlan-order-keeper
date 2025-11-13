import { useQuery } from '@tanstack/react-query';
import { fetchOTPlants } from '../services/plantService';

/**
 * Fetch plants from OT Platform
 * SINGLE SOURCE OF TRUTH - OT Platform /admin/plants
 * Real-time sync managed by OTSyncProvider - DO NOT create subscriptions here
 */
export function useOTPlants() {
  return useQuery({
    queryKey: ['ot-plants'],
    queryFn: fetchOTPlants,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000,    // 20 minutes
    refetchOnWindowFocus: false,
  });
}
