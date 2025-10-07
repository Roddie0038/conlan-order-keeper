// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { waitForSessionReadiness, withRetry, logError } from '@/utils/sessionUtils';
import { mapPlatformUserRow, PlatformUserUI } from '@/lib/mappers';

export type PlatformType = 'ordering_platform' | 'ot_platform';
export type UserRole = 'super_admin' | 'plant_admin' | 'store_manager' | 'warehouse_manager' | 'operations_manager' | 'service_manager' | 'team_lead' | 'warehouse_staff';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export type PlatformUser = PlatformUserUI & {
  role: UserRole;
  platform: PlatformType;
  status: UserStatus;
  last_login?: string;
};

export function useUserManagement(platform?: PlatformType) {
  const { session, user } = useAuth();
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>(platform || 'ordering_platform');

  const fetchUsers = async (targetPlatform?: PlatformType, retryCount = 0) => {
    const operationName = `fetchUsers(${targetPlatform || selectedPlatform})`;
    
    try {
      setLoading(true);
      setError(null);

      // Enhanced session validation with retry logic
      const sessionReady = await waitForSessionReadiness(session, user, 10000);
      if (!sessionReady) {
        throw new Error('Session not ready or insufficient permissions for Super Admin access');
      }

      // Use enhanced retry logic for the database query
      const result = await withRetry(
        async () => {
          let query = supabase
            .from('platform_users')
            .select('*')
            .order('created_at', { ascending: false });
          
          const platformToQuery = targetPlatform || selectedPlatform;
          if (platformToQuery) {
            query = query.eq('platform', platformToQuery);
          }
          
          const { data, error } = await query;
          if (error) throw error;
          
          return data || [];
        },
        { maxRetries: 2, baseDelay: 1000 },
        operationName
      );
      
      console.log(`[useUserManagement] Successfully fetched ${result.length} users for ${targetPlatform || selectedPlatform}`);
      setUsers((result || []).map((r: any) => ({
        ...mapPlatformUserRow(r),
        platform: r.platform as PlatformType,
        role: r.role as UserRole,
        status: r.status as UserStatus,
        last_login: r.last_login
      })) as PlatformUser[]);
      if (targetPlatform) setSelectedPlatform(targetPlatform);
      
    } catch (err: any) {
      const errorInfo = logError('useUserManagement.fetchUsers', err, { 
        platform: targetPlatform || selectedPlatform,
        retryCount,
        sessionExists: !!session,
        userEmail: user?.email
      });
      
      setError(`Failed to load users: ${err.message}`);
      setUsers([]); // Clear users on error
    } finally {
      setLoading(false);
    }
  };

  const switchPlatform = (platform: PlatformType) => {
    setSelectedPlatform(platform);
    fetchUsers(platform);
  };

  useEffect(() => {
    if (session?.user && user) {
      // Delay initial fetch to ensure session is fully ready
      const timer = setTimeout(() => {
        fetchUsers(platform);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [session?.user, user, platform]);

  return {
    users,
    loading,
    error,
    selectedPlatform,
    switchPlatform,
    refetch: fetchUsers
  };
}