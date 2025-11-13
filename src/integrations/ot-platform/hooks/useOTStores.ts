import { useQuery } from '@tanstack/react-query';
import { fetchOTStores, fetchOTStoreColors } from '../services/storeService';

/**
 * Fetch stores from OT Platform
 * Real-time sync managed by OTSyncProvider - DO NOT create subscriptions here
 */
export function useOTStores() {
  return useQuery({
    queryKey: ['ot-stores'],
    queryFn: fetchOTStores,
    staleTime: 5 * 60 * 1000,  // 5 minutes
    gcTime: 10 * 60 * 1000,    // 10 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Fetch store colors from OT Platform
 * SINGLE SOURCE OF TRUTH - OT Platform /admin/store-colors
 * Real-time sync managed by OTSyncProvider - DO NOT create subscriptions here
 */
export function useOTStoreColors() {
  return useQuery({
    queryKey: ['ot-store-colors'],
    queryFn: fetchOTStoreColors,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000,    // 20 minutes
    refetchOnWindowFocus: false,
  });
}
