// src/server/auth/getUser.ts
import { supabase } from '@/integrations/supabase/client';

export type ServerUser = { email: string | null; role: string | null };

export async function getCurrentUser(): Promise<ServerUser> {
  try {
    // Get the current authenticated user
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user?.email) {
      return { email: null, role: null };
    }

    const email = user.email;

    // Simple role lookup from ot_platform_users table with type assertion
    const { data: otData } = await supabase
      .from('ot_platform_users')
      .select('role')
      .eq('email', email)
      .eq('status', 'active')
      .limit(1)
      .returns<Array<{ role: string }>>() as any;

    if (otData && otData.length > 0 && otData[0].role) {
      return { email, role: otData[0].role };
    }

    // If no role found, return email with null role (user exists but no role assigned)
    return { email, role: null };
  } catch (error) {
    console.error('Error getting current user:', error);
    return { email: null, role: null };
  }
}