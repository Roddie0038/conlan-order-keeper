import { supabase } from "@/integrations/supabase/client";

/**
 * Dynamic email service to replace ALL hardcoded email lookups for Ordering Platform
 * This service queries store_email_recipients and platform_users tables for current email recipients
 * All edge functions should use this service exclusively - NO hardcoded emails
 */

export interface EmailRecipient {
  email: string;
  role: string;
  store: string;
  source: 'store_email_recipients' | 'platform_users';
}

export type EmailType = 'transfer' | 'mto' | 'warranty' | 'wheel' | 'out_of_stock' | 'completion' | 'cross_dock' | 'message';

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
 * Get email recipients for a store and email type from store_email_recipients table
 * This is the PRIMARY method for all email routing in the Ordering Platform
 */
export async function getOrderingEmailRecipients(store: string, emailType: EmailType): Promise<EmailRecipient[]> {
  const storeNumber = normalizeStoreNumber(store);
  
  if (!storeNumber) {
    console.warn('⚠️ DYNAMIC EMAIL - Unable to extract store number from:', store);
    return [];
  }

  console.log(`🔍 DYNAMIC EMAIL - Looking up recipients for store ${storeNumber}, email type: ${emailType}`);

  try {
    // Primary: Query store_email_recipients table
    const { data: storeRecipients, error: storeError } = await supabase
      .from('store_email_recipients')
      .select('recipient_email, recipient_role, store_number, store_name')
      .eq('store_number', storeNumber)
      .eq('email_type', emailType)
      .eq('is_active', true);

    if (storeError) {
      console.error('❌ DYNAMIC EMAIL - Error querying store_email_recipients:', storeError);
    } else if (storeRecipients && storeRecipients.length > 0) {
      console.log(`✅ DYNAMIC EMAIL - Found ${storeRecipients.length} recipients from store_email_recipients for store ${storeNumber}:`, 
        storeRecipients.map(r => ({ email: r.recipient_email, role: r.recipient_role })));
      
      return storeRecipients.map(recipient => ({
        email: recipient.recipient_email,
        role: recipient.recipient_role,
        store: recipient.store_number,
        source: 'store_email_recipients'
      }));
    }

    // Fallback: Query platform_users for active users assigned to this store
    console.log(`⚠️ DYNAMIC EMAIL - No recipients in store_email_recipients for store ${storeNumber}, checking platform_users...`);
    
    const { data: platformUsers, error: platformError } = await supabase
      .from('platform_users')
      .select('email, role, store')
      .eq('platform', 'ordering_platform')
      .eq('status', 'active')
      .eq('store', storeNumber)
      .in('role', ['store_manager', 'service_manager', 'warehouse_staff', 'team_lead']);

    if (platformError) {
      console.error('❌ DYNAMIC EMAIL - Error querying platform_users:', platformError);
      return [];
    }

    if (platformUsers && platformUsers.length > 0) {
      console.log(`✅ DYNAMIC EMAIL - Found ${platformUsers.length} recipients from platform_users for store ${storeNumber}:`, 
        platformUsers.map(u => ({ email: u.email, role: u.role })));
      
      return platformUsers.map(user => ({
        email: user.email,
        role: user.role,
        store: user.store,
        source: 'platform_users'
      }));
    }

    console.log(`❌ DYNAMIC EMAIL - No recipients found in either table for store ${storeNumber}, email type: ${emailType}`);
    return [];

  } catch (error) {
    console.error('❌ DYNAMIC EMAIL - Error in getOrderingEmailRecipients:', error);
    return [];
  }
}

/**
 * Get email recipients for a store from platform_users (legacy support)
 * @deprecated Use getOrderingEmailRecipients(store, emailType) instead
 */
export async function getStoreEmailRecipients(store: string): Promise<EmailRecipient[]> {
  console.warn('⚠️ DEPRECATED: getStoreEmailRecipients() is deprecated. Use getOrderingEmailRecipients(store, emailType) instead');
  return getOrderingEmailRecipients(store, 'transfer');
}

/**
 * Get manager email string for backward compatibility
 * Returns comma-separated email addresses
 * @deprecated Use getOrderingEmailRecipients(store, emailType) instead for better structure
 */
export async function getManagerEmail(store: string): Promise<string> {
  const recipients = await getOrderingEmailRecipients(store, 'transfer');
  return recipients.map(r => r.email).join(', ');
}

/**
 * Legacy function for backward compatibility
 * Returns first manager email found
 */
export async function getFirstManagerEmail(store: string, emailType: EmailType = 'transfer'): Promise<string> {
  const recipients = await getOrderingEmailRecipients(store, emailType);
  const manager = recipients.find(r => r.role === 'store_manager') || recipients[0];
  return manager?.email || '';
}