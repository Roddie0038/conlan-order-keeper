import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PlatformUser {
  id: string;
  full_name: string;
  email: string;
  role: 'super_admin' | 'operations_manager' | 'plant_admin' | 'warehouse_manager' | 'store_manager' | 'warehouse_staff';
  platform: 'ordering_platform' | 'ot_platform';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  store: string | null;
  plant: string | null;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export function useUserManagement(selectedPlatform?: 'ordering_platform' | 'ot_platform') {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, session } = useAuth();

  const fetchUsers = async (retryCount = 0) => {
    if (!session || !user) {
      console.log('[useUserManagement] No session or user, skipping fetch');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Add session-aware delay
      await new Promise(resolve => setTimeout(resolve, 500));

      let query = supabase
        .from('platform_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedPlatform) {
        query = query.eq('platform', selectedPlatform);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('[useUserManagement] Error fetching users:', fetchError);
        throw fetchError;
      }

      console.log(`[useUserManagement] Fetched ${data?.length || 0} users`);
      setUsers(data || []);
    } catch (err: any) {
      console.error('[useUserManagement] Fetch error:', err);
      
      // Retry logic for failed queries
      if (retryCount < 2 && err.code !== 'PGRST301') {
        console.log(`[useUserManagement] Retrying fetch (attempt ${retryCount + 1})`);
        setTimeout(() => fetchUsers(retryCount + 1), 1000);
        return;
      }
      
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: Omit<PlatformUser, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('platform_users')
        .insert([{
          ...userData,
          created_by: user?.email
        }])
        .select()
        .single();

      if (error) throw error;

      setUsers(prev => [data, ...prev]);
      return { success: true, data };
    } catch (err: any) {
      console.error('[useUserManagement] Create user error:', err);
      return { success: false, error: err.message };
    }
  };

  const updateUser = async (userId: string, updates: Partial<PlatformUser>) => {
    try {
      const { data, error } = await supabase
        .from('platform_users')
        .update({
          ...updates,
          updated_by: user?.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      setUsers(prev => prev.map(u => u.id === userId ? data : u));
      return { success: true, data };
    } catch (err: any) {
      console.error('[useUserManagement] Update user error:', err);
      return { success: false, error: err.message };
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('platform_users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.filter(u => u.id !== userId));
      return { success: true };
    } catch (err: any) {
      console.error('[useUserManagement] Delete user error:', err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    if (session && user) {
      fetchUsers();
    }
  }, [session, user, selectedPlatform]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    refetch: fetchUsers
  };
}