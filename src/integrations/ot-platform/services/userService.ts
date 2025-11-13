import { otClient } from '../client';
import type { OTPlatformUser } from '../types';

/**
 * Fetch user by email from OT Platform
 * ONLY returns users with can_access_ordering = true
 * Roles come from OT Platform - NO local role definitions
 */
export async function fetchOTUserByEmail(email: string): Promise<OTPlatformUser | null> {
  const startTime = performance.now();
  
  try {
    const normalizedEmail = email.toLowerCase().trim();
    
    const { data, error } = await otClient
      .from('ot_platform_users')
      .select('*')
      .eq('email', normalizedEmail)
      .eq('can_access_ordering', true)
      .eq('status', 'active')
      .single();

    const duration = Math.round(performance.now() - startTime);

    if (error) {
      console.error(`❌ OT USER - Failed to fetch user ${email} (${duration}ms):`, error);
      return null;
    }

    console.log(`✅ OT USER - Found user ${email} with role: ${data.role} (${duration}ms)`);
    return data as OTPlatformUser;
  } catch (error) {
    console.error(`❌ OT USER - Exception fetching user ${email}:`, error);
    return null;
  }
}

/**
 * Fetch all users with Ordering Platform access
 * Roles are defined in OT Platform, not here
 */
export async function fetchOTOrderingUsers(): Promise<OTPlatformUser[]> {
  const startTime = performance.now();
  
  try {
    const { data, error } = await otClient
      .from('ot_platform_users')
      .select('*')
      .eq('can_access_ordering', true)
      .eq('status', 'active')
      .order('full_name');

    const duration = Math.round(performance.now() - startTime);

    if (error) {
      console.error(`❌ OT USERS - Failed to fetch ordering users (${duration}ms):`, error);
      throw error;
    }

    console.log(`✅ OT USERS - Loaded ${data.length} ordering users from OT Platform (${duration}ms)`);
    return data as OTPlatformUser[];
  } catch (error) {
    console.error('❌ OT USERS - Exception during fetch:', error);
    return [];
  }
}
