import { useQuery } from '@tanstack/react-query';
import { fetchOTUserByEmail, fetchOTOrderingUsers } from '../services/userService';

/**
 * Fetch user by email from OT Platform
 * Roles come from OT Platform - NO local role definitions
 * Real-time sync managed by OTSyncProvider - DO NOT create subscriptions here
 */
export function useOTUserByEmail(email: string | null | undefined) {
  return useQuery({
    queryKey: ['ot-user', email],
    queryFn: () => (email ? fetchOTUserByEmail(email) : null),
    enabled: !!email,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Fetch all users with Ordering Platform access
 * Real-time sync managed by OTSyncProvider - DO NOT create subscriptions here
 */
export function useOTOrderingUsers() {
  return useQuery({
    queryKey: ['ot-ordering-users'],
    queryFn: fetchOTOrderingUsers,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
