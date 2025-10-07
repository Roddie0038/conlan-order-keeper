import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { waitForSessionReadiness, withRetry, logError } from '@/utils/sessionUtils';
import { mapActivityLogRow, ActivityLogUI } from '@/lib/mappers';

export type ActivityLog = ActivityLogUI;

export function useUserActivityLogs(selectedPlatform?: 'ordering_platform' | 'ot_platform') {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, session } = useAuth();

  const fetchLogs = async (retryCount = 0) => {
    const operationName = `fetchActivityLogs(${selectedPlatform || 'all'})`;
    
    try {
      setLoading(true);
      setError(null);

      // Enhanced session validation with comprehensive checks
      const sessionReady = await waitForSessionReadiness(session, user, 10000);
      if (!sessionReady) {
        throw new Error('Session not ready or insufficient permissions for Super Admin access');
      }

      // Use enhanced retry logic for the database query
      const result = await withRetry(
        async () => {
          let query = supabase
            .from('user_activity_logs')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(100);

          if (selectedPlatform) {
            query = query.eq('platform', selectedPlatform);
          }

          const { data, error: fetchError } = await query;
          if (fetchError) throw fetchError;
          
          return data || [];
        },
        { maxRetries: 2, baseDelay: 1000 },
        operationName
      );

      console.log(`[useUserActivityLogs] Successfully fetched ${result.length} activity logs`);
      setLogs((result || []).map(mapActivityLogRow) as any);
      
    } catch (err: any) {
      const errorInfo = logError('useUserActivityLogs.fetchLogs', err, {
        platform: selectedPlatform,
        retryCount,
        sessionExists: !!session,
        userEmail: user?.email
      });
      
      setError(`Failed to load activity logs: ${err.message}`);
      setLogs([]); // Clear logs on error
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (activity: {
    action: string;
    affected_user: string;
    platform: 'ordering_platform' | 'ot_platform';
    description?: string;
    metadata?: any;
  }) => {
    try {
      const { error } = await supabase
        .from('user_activity_logs')
        .insert([{
          ...activity,
          performed_by: user?.email || 'system',
          timestamp: new Date().toISOString()
        }]);

      if (error) throw error;

      // Refresh logs after successful insert
      await fetchLogs();
      return { success: true };
    } catch (err: any) {
      console.error('[useUserActivityLogs] Log activity error:', err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    if (session && user) {
      // Delay initial fetch to ensure session is fully ready
      const timer = setTimeout(() => {
        fetchLogs();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [session, user, selectedPlatform]);

  return {
    logs,
    loading,
    error,
    fetchLogs,
    logActivity,
    refetch: fetchLogs
  };
}