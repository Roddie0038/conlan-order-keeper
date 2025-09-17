/**
 * Unified Email Recipient Resolution System
 * ALIGNED WITH SUPABASE SQL resolve_email_recipients FUNCTION
 * 
 * This service now primarily calls the SQL function that enforces:
 * 1. store_email_recipients table (PRIMARY SOURCE)
 * 2. ot_platform_users table (FALLBACK)
 * 
 * Local resolution is only used for order-specific fields.
 */

import { supabase } from "@/integrations/supabase/client";
import { normalizeStoreFormatSync, normalizePlantNameSync } from "@/utils/supabaseNormalization";
import type { OrderFormData, MTOFormData, WheelFormData } from "@/types/orders";
import { IS_E2E } from '@/config/e2e';

export interface EmailRecipient {
  email: string;
  name?: string;
  role: string;
  store?: string;
  plant?: string;
}

export interface EmailResolutionResult {
  recipients: EmailRecipient[];
  source: 'order_fields' | 'sql_function' | 'fallback_legacy';
  fallbackReason?: string;
  orderId?: string;
  plant?: string;
  store?: string;
  emailType: string;
  resolutionLog: string[];
}

export type EmailType = 'transfer' | 'cross_dock' | 'mto' | 'wheel' | 'warranty' | 'customer_complaints' | 'completion' | 'out_of_stock' | 'message';

// Flexible order data interface that accommodates all order types
export interface OrderDataInput {
  store: string;
  plant?: string | null;
  email?: string | null;
  destination_manager_email?: string | null;
  manager_email?: string | null;
  [key: string]: any;
}

/**
 * Resolve email recipients using SQL function as primary source
 */
export async function resolveEmailRecipients(
  orderData: OrderDataInput,
  emailType: EmailType,
  orderId?: string
): Promise<EmailResolutionResult> {
  
  console.log(`📧 EMAIL RESOLVER - Resolving recipients for ${emailType} order:`, {
    orderId,
    store: orderData.store,
    plant: orderData.plant || 'No plant specified',
    email: orderData.email || 'No email specified'
  });

  const resolutionLog: string[] = [];
  const normalizedStore = normalizeStoreFormatSync(orderData.store);
  const normalizedPlant = normalizePlantNameSync(orderData.plant || 'Grand Prairie 097');
  const storeNumber = extractStoreNumber(normalizedStore);
  
  resolutionLog.push(`Starting resolution: store=${normalizedStore}, plant=${normalizedPlant}, type=${emailType}`);

  const baseResult: Omit<EmailResolutionResult, 'recipients' | 'source'> = {
    orderId,
    plant: normalizedPlant,
    store: normalizedStore,
    emailType,
    resolutionLog
  };

  try {
    // Check order fields for specific recipient emails first
    const orderFieldRecipients = await checkOrderFields(orderData, resolutionLog);
    if (orderFieldRecipients.length > 0) {
      resolutionLog.push(`Found ${orderFieldRecipients.length} recipients in order fields`);
      return {
        ...baseResult,
        recipients: orderFieldRecipients,
        source: 'order_fields'
      };
    }

    // Use SQL function for primary resolution (store_email_recipients -> ot_platform_users)
    resolutionLog.push('Calling SQL resolve_email_recipients function');
    
    // Map emailType to the SQL function's expected format
    const sqlEmailType = emailType === 'customer_complaints' ? 'customer_complaints' : emailType;
    
    const { data: sqlRecipients, error } = await supabase.rpc(
      'resolve_email_recipients', 
      { 
        p_store: storeNumber, 
        p_type: sqlEmailType 
      }
    );

    if (error) {
      resolutionLog.push(`SQL function error: ${error.message}`);
      throw error;
    }

    if (sqlRecipients && sqlRecipients.length > 0) {
      const recipients = sqlRecipients.map((r: any) => ({
        email: r.recipient_email || r.email,
        name: r.recipient_name || r.store_name || r.full_name,
        role: r.recipient_role || r.role,
        store: r.store_name || normalizedStore,
        plant: normalizedPlant
      }));

      resolutionLog.push(`SQL function returned ${recipients.length} recipients`);
      return {
        ...baseResult,
        recipients,
        source: 'sql_function'
      };
    }

    // No recipients found
    resolutionLog.push('No recipients found in SQL function');
    return {
      ...baseResult,
      recipients: [],
      source: 'fallback_legacy',
      fallbackReason: 'no_recipients_found'
    };

  } catch (error) {
    console.error('❌ EMAIL RESOLVER - Error during resolution:', error);
    resolutionLog.push(`Error: ${error.message}`);
    
    return {
      ...baseResult,
      recipients: [],
      source: 'fallback_legacy',
      fallbackReason: 'resolution_error'
    };
  }
}

/**
 * Tier 1: Check order fields for explicit recipient emails
 */
async function checkOrderFields(orderData: OrderDataInput, log: string[]): Promise<EmailRecipient[]> {
  log.push('Tier 1: Checking order fields for explicit recipients');
  
  const recipients: EmailRecipient[] = [];
  
  // Check for destination_manager_email field (cross-dock orders)
  if (orderData.destination_manager_email) {
    recipients.push({
      email: orderData.destination_manager_email,
      name: 'Destination Manager',
      role: 'destination_manager',
      store: orderData.store,
      plant: orderData.plant || 'Unknown'
    });
    log.push(`Found destination_manager_email: ${orderData.destination_manager_email}`);
  }
  
  // Check for specific manager email in order data
  if (orderData.manager_email) {
    recipients.push({
      email: orderData.manager_email,
      name: 'Order Manager',
      role: 'order_manager',
      store: orderData.store,
      plant: orderData.plant || 'Unknown'
    });
    log.push(`Found manager_email: ${orderData.manager_email}`);
  }

  log.push(`Tier 1 result: ${recipients.length} recipients found`);
  return recipients;
}

// These functions are kept for backward compatibility and order field checks only
// The main resolution now uses the SQL function

/**
 * Determine if a store_email_recipients record should be included for this email type
 */
function shouldIncludeRecipientForEmailType(recipient: any, emailType: EmailType, log: string[]): boolean {
  // Check notification_types array if present
  if (recipient.notification_types && Array.isArray(recipient.notification_types)) {
    const hasEmailType = recipient.notification_types.includes(emailType);
    log.push(`Recipient ${recipient.recipient_email}: notification_types check = ${hasEmailType}`);
    if (hasEmailType) return true;
  }

  // Fallback to role-based logic
  const roleAllowed = shouldIncludeUserForEmailType(recipient.recipient_role, emailType, log);
  log.push(`Recipient ${recipient.recipient_email}: role-based check = ${roleAllowed}`);
  return roleAllowed;
}

/**
 * Role-based inclusion logic matching OT Platform structure
 */
function shouldIncludeUserForEmailType(role: string, emailType: EmailType, log: string[]): boolean {
  const roleRules = {
    // Store Managers & Service Managers: All notifications for their store
    'store_manager': ['transfer', 'cross_dock', 'mto', 'wheel', 'warranty', 'complaint', 'completion', 'out_of_stock', 'message'],
    'service_manager': ['transfer', 'cross_dock', 'mto', 'wheel', 'warranty', 'complaint', 'completion', 'out_of_stock', 'message'],
    
    // Warehouse Managers: All except warranty
    'warehouse_manager': ['transfer', 'cross_dock', 'mto', 'wheel', 'complaint', 'completion', 'out_of_stock', 'message'],
    
    // Warehouse Coordinators: No warranty or complaint
    'warehouse_coordinator': ['transfer', 'cross_dock', 'mto', 'wheel', 'completion', 'out_of_stock', 'message'],
    
    // Retread Managers: Only mto, warranty, complaint
    'retread_manager': ['mto', 'warranty', 'complaint'],
    
    // Plant Managers & Operations Managers: Only warranty, complaint
    'plant_manager': ['warranty', 'complaint'],
    'operations_manager': ['warranty', 'complaint'],
    
    // Super Admin: Only for critical notifications (warranty, complaint) - exclude from routine operational orders
    'super_admin': ['warranty', 'complaint']
  };

  const allowedTypes = roleRules[role] || [];
  const isAllowed = allowedTypes.includes(emailType);
  log.push(`Role ${role} for ${emailType}: ${isAllowed ? 'ALLOWED' : 'BLOCKED'}`);
  
  return isAllowed;
}

/**
 * Generate store number variants for database lookups
 */
function generateStoreVariants(storeNumber: string): string[] {
  const variants = [storeNumber];
  
  if (storeNumber.length === 1) {
    variants.push(`0${storeNumber}`, `00${storeNumber}`);
  } else if (storeNumber.length === 2) {
    variants.push(`0${storeNumber}`);
  }
  
  // Add common store name formats
  const num = storeNumber.replace(/^0+/, '');
  variants.push(`Store ${num}`, `Store ${storeNumber}`);
  
  // Add full store name formats for all stores
  const storeMap: Record<string, string[]> = {
    '22': ['Fort Worth 022', 'Fort Worth 22'],
    '27': ['Grand Prairie 027', 'Grand Prairie 27'],
    '28': ['Houston 028', 'Houston 28'],
    '29': ['San Antonio 029', 'San Antonio 29'],
    '30': ['Oklahoma City 030', 'Oklahoma City 30'],
    '32': ['Little Rock 032', 'Little Rock 32'],
    '33': ['Kansas City 033', 'Kansas City 33'],
    '35': ['Laredo 035', 'Laredo 35'],
    '36': ['Tulsa 036', 'Tulsa 36'],
    '39': ['Austin 039', 'Austin 39']
  };
  
  if (storeMap[num]) {
    variants.push(...storeMap[num]);
  }
  
  console.log(`🔍 STORE VARIANTS DEBUG - Generated variants for ${storeNumber}:`, variants);
  
  return [...new Set(variants)]; // Remove duplicates
}

/**
 * Extract store number from normalized store name
 */
function extractStoreNumber(normalizedStore: string): string {
  const match = normalizedStore.match(/(\d+)/);
  return match ? match[1] : '';
}

/**
 * Log email resolution result to notification_logs table
 */
export async function logEmailResolution(result: EmailResolutionResult): Promise<void> {
  try {
    // Only log if we have recipients or it's an important failure
    if (result.recipients.length === 0 && !result.fallbackReason) {
      return;
    }

    for (const recipient of result.recipients) {
      const logData = {
        order_id: result.orderId || `resolution-${Date.now()}`,
        notification_type: `${result.emailType}_resolution`,
        recipient_email: recipient.email,
        recipient_role: recipient.role,
        store: result.store,
        plant: result.plant,
        status: 'resolved',
        email_provider: 'resolution_service',
        metadata: {
          service: 'email_recipient_resolver',
          source: result.source,
          fallback_reason: result.fallbackReason,
          resolution_log: result.resolutionLog,
          total_recipients: result.recipients.length,
          timestamp: new Date().toISOString()
        }
      };

      const { error } = await supabase
        .from('notification_logs')
        .insert(logData);

      if (error) {
        console.error(`❌ EMAIL RESOLVER - Failed to log resolution for ${recipient.email}:`, error);
      }
    }

    // Log failures separately
    if (result.recipients.length === 0 && result.fallbackReason) {
      const failureLogData = {
        order_id: result.orderId || `resolution-failure-${Date.now()}`,
        notification_type: `${result.emailType}_resolution_failure`,
        recipient_email: 'system',
        recipient_role: 'system',
        store: result.store,
        plant: result.plant,
        status: 'failed',
        error_message: result.fallbackReason,
        email_provider: 'resolution_service',
        metadata: {
          service: 'email_recipient_resolver',
          source: result.source,
          fallback_reason: result.fallbackReason,
          resolution_log: result.resolutionLog,
          timestamp: new Date().toISOString()
        }
      };

      await supabase
        .from('notification_logs')
        .insert(failureLogData);
    }

    console.log(`📝 EMAIL RESOLVER - Logged resolution: ${result.recipients.length} recipients, source: ${result.source}`);

  } catch (error) {
    console.error('❌ EMAIL RESOLVER - Error logging resolution:', error);
  }
}