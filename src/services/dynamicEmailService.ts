import { supabase } from "@/integrations/supabase/client";

/**
 * Dynamic email service to replace hardcoded email lookups
 * This service queries platform_users table for current email recipients
 */

export interface EmailRecipient {
  email: string;
  role: string;
  store: string;
}

/**
 * Normalize store number from various formats
 * Examples: "22" → "22", "Fort Worth 22" → "22", "022" → "22"
 */
export function normalizeStoreNumber(store: string): string {
  if (!store) return '';
  
  // If it's already just a number
  if (/^\d+$/.test(store.trim())) {
    return store.trim().replace(/^0+/, '') || '0'; // Remove leading zeros
  }
  
  // Extract number from store name like "Fort Worth 22"
  const match = store.match(/\d+/);
  return match ? match[0] : '';
}

/**
 * Get email recipients for a store from platform_users
 * This replaces the old hardcoded getManagerEmail function
 */
export async function getStoreEmailRecipients(store: string): Promise<EmailRecipient[]> {
  const storeNumber = normalizeStoreNumber(store);
  
  if (!storeNumber) {
    console.warn('⚠️ DYNAMIC EMAIL - Unable to extract store number from:', store);
    return [];
  }

  try {
    // Query platform_users for active users assigned to this store
    const { data: platformUsers, error } = await supabase
      .from('platform_users')
      .select('email, role, store')
      .eq('platform', 'ordering_platform')
      .eq('status', 'active')
      .eq('store', storeNumber)
      .in('role', ['store_manager', 'service_manager', 'warehouse_staff']);

    if (error) {
      console.error('❌ DYNAMIC EMAIL - Error querying platform_users:', error);
      return [];
    }

    if (platformUsers && platformUsers.length > 0) {
      console.log(`✅ DYNAMIC EMAIL - Found ${platformUsers.length} recipients for store ${storeNumber}:`, 
        platformUsers.map(u => ({ email: u.email, role: u.role })));
      
      return platformUsers.map(user => ({
        email: user.email,
        role: user.role,
        store: user.store
      }));
    }

    console.log(`⚠️ DYNAMIC EMAIL - No recipients found in platform_users for store ${storeNumber}`);
    return [];

  } catch (error) {
    console.error('❌ DYNAMIC EMAIL - Error in getStoreEmailRecipients:', error);
    return [];
  }
}

/**
 * Get manager email string for backward compatibility
 * Returns comma-separated email addresses
 * @deprecated Use getStoreEmailRecipients instead for better structure
 */
export async function getManagerEmail(store: string): Promise<string> {
  const recipients = await getStoreEmailRecipients(store);
  return recipients.map(r => r.email).join(', ');
}

/**
 * Legacy function for backward compatibility
 * Returns first manager email found
 */
export async function getFirstManagerEmail(store: string): Promise<string> {
  const recipients = await getStoreEmailRecipients(store);
  const manager = recipients.find(r => r.role === 'store_manager') || recipients[0];
  return manager?.email || '';
}