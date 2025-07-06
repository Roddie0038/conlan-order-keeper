import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type PlatformType = 'ordering_platform' | 'ot_platform';
export type UserRole = 'super_admin' | 'plant_admin' | 'store_manager' | 'warehouse_manager' | 'office_manager';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface PlatformUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  platform: PlatformType;
  store?: string;
  plant?: string;
  status: UserStatus;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export function useUserManagement() {
  const { session } = useAuth();
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>('ordering_platform');

  const fetchUsers = async (platform?: PlatformType) => {
    if (!session?.user) return;
    
    await new Promise(resolve => setTimeout(resolve, 500)); // Session-aware delay
    
    setLoading(true);
    try {
      let query = supabase.from('platform_users').select('*').order('created_at', { ascending: false });
      if (platform || selectedPlatform) {
        query = query.eq('platform', platform || selectedPlatform);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      setUsers(data || []);
      if (platform) setSelectedPlatform(platform);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchPlatform = (platform: PlatformType) => {
    setSelectedPlatform(platform);
    fetchUsers(platform);
  };

  useEffect(() => {
    if (session?.user) fetchUsers();
  }, [session?.user]);

  return {
    users,
    loading,
    error,
    selectedPlatform,
    switchPlatform,
    refetch: fetchUsers
  };
}