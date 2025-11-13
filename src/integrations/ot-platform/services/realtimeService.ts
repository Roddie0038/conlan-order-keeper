import { otClient } from '../client';
import type { RealtimeChannel } from '@supabase/supabase-js';

type SyncCallback = () => void;

let channel: RealtimeChannel | null = null;

/**
 * Subscribe to real-time updates from OT Platform
 * SINGLE SUBSCRIPTION CHANNEL - Called once from OTSyncProvider
 * Invalidates React Query cache when OT Platform data changes
 */
export function subscribeToOTPlatformChanges(
  onStoresUpdate: SyncCallback,
  onColorsUpdate: SyncCallback,
  onUsersUpdate: SyncCallback,
  onPlantsUpdate: SyncCallback
): () => void {
  // Prevent multiple subscriptions
  if (channel) {
    console.warn('🔄 OT SYNC - Subscription already exists, skipping...');
    return () => {};
  }

  console.log('🔄 OT SYNC - Starting real-time sync with OT Platform...');

  channel = otClient
    .channel('ordering-ot-sync')
    .on(
      'postgres_changes' as any,
      { event: '*', schema: 'public', table: 'stores' },
      (payload) => {
        console.log('🔄 OT STORES - Real-time update received:', payload.eventType);
        onStoresUpdate();
      }
    )
    .on(
      'postgres_changes' as any,
      { event: '*', schema: 'public', table: 'app_store_colors' },
      (payload) => {
        console.log('🔄 OT COLORS - Real-time update received:', payload.eventType);
        onColorsUpdate();
      }
    )
    .on(
      'postgres_changes' as any,
      { event: '*', schema: 'public', table: 'ot_platform_users' },
      (payload) => {
        console.log('🔄 OT USERS - Real-time update received:', payload.eventType);
        onUsersUpdate();
      }
    )
    .on(
      'postgres_changes' as any,
      { event: '*', schema: 'public', table: 'app_plants' },
      (payload) => {
        console.log('🔄 OT PLANTS - Real-time update received:', payload.eventType);
        onPlantsUpdate();
      }
    )
    .subscribe((status) => {
      console.log('🔄 OT SYNC - Subscription status:', status);
    });

  // Return cleanup function
  return () => {
    if (channel) {
      console.log('🔄 OT SYNC - Stopping real-time sync with OT Platform');
      otClient.removeChannel(channel);
      channel = null;
    }
  };
}
