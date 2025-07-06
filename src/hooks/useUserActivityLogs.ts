import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ActivityLog {
  id: string;
  action: string;
  affected_user: string;
  performed_by: string;
  platform: 'ordering_platform' | 'ot_platform';
  description: string | null;
  metadata: any;
  timestamp: string;
}

export function useUserActivityLogs(selectedPlatform?: 'ordering_platform' | 'ot_platform') {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, session } = useAuth();

  const fetchLogs = async (retryCount = 0) => {
    if (!session || !user) {
      console.log('[useUserActivityLogs] No session or user, skipping fetch');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Add session validation delay to prevent race conditions
      await new Promise(resolve => setTimeout(resolve, 500));

      let query = supabase
        .from('user_activity_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (selectedPlatform) {
        query = query.eq('platform', selectedPlatform);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('[useUserActivityLogs] Error fetching activity logs:', fetchError);
        throw fetchError;
      }

      console.log(`[useUserActivityLogs] Fetched ${data?.length || 0} activity logs`);
      setLogs(data || []);
    } catch (err: any) {
      console.error('[useUserActivityLogs] Fetch error:', err);
      
      // Retry logic for failed queries
      if (retryCount < 2 && err.code !== 'PGRST301') {
        console.log(`[useUserActivityLogs] Retrying fetch (attempt ${retryCount + 1})`);
        setTimeout(() => fetchLogs(retryCount + 1), 1000);
        return;
      }
      
      setError(err.message || 'Failed to fetch activity logs');
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
      fetchLogs();
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