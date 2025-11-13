import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { subscribeToOTPlatformChanges } from './services/realtimeService';

/**
 * OT Platform Real-Time Sync Provider
 * 
 * CRITICAL: Single subscription channel for all OT Platform real-time updates
 * - Manages ONE WebSocket connection to OT Platform
 * - Invalidates React Query caches when OT data changes
 * - Must be placed at app root, above all components using OT hooks
 * 
 * Individual hooks (useOTStores, useOTStoreColors, etc.) DO NOT create their own subscriptions
 */
export function OTSyncProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('🔄 OTSyncProvider - Initializing real-time sync...');

    const unsubscribe = subscribeToOTPlatformChanges(
      // onStoresUpdate
      () => {
        console.log('🔄 Invalidating ot-stores cache');
        queryClient.invalidateQueries({ queryKey: ['ot-stores'] });
      },
      // onColorsUpdate
      () => {
        console.log('🔄 Invalidating ot-store-colors cache');
        queryClient.invalidateQueries({ queryKey: ['ot-store-colors'] });
      },
      // onUsersUpdate
      () => {
        console.log('🔄 Invalidating ot-user and ot-ordering-users caches');
        queryClient.invalidateQueries({ queryKey: ['ot-user'] });
        queryClient.invalidateQueries({ queryKey: ['ot-ordering-users'] });
      },
      // onPlantsUpdate
      () => {
        console.log('🔄 Invalidating ot-plants cache');
        queryClient.invalidateQueries({ queryKey: ['ot-plants'] });
      }
    );

    return () => {
      console.log('🔄 OTSyncProvider - Cleaning up real-time sync...');
      unsubscribe();
    };
  }, [queryClient]);

  return <>{children}</>;
}
