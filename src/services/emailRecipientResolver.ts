/**
 * Phase 3: Unified Email Recipient Resolution System
 * Mirrors OT Platform's three-tier fallback logic for email routing
 * 
 * Three-tier fallback system:
 * 1. Order fields (email, destination_manager_email)
 * 2. store_email_recipients table
 * 3. ot_platform_users table
 */

import { supabase } from "@/integrations/supabase/client";
import { normalizeStoreFormatSync, normalizePlantNameSync } from "@/utils/supabaseNormalization";
import type { OrderFormData, MTOFormData, WheelFormData } from "@/types/orders";

export interface EmailRecipient {
  email: string;
  name?: string;
  role: string;
  store?: string;
  plant?: string;
}

export interface EmailResolutionResult {
  recipients: EmailRecipient[];
  source: 'order_fields' | 'store_email_recipients' | 'ot_platform_users' | 'fallback_legacy';
  fallbackReason?: string;
  orderId?: string;
  plant?: string;
  store?: string;
  emailType: string;
  resolutionLog: string[];
}

export type EmailType = 'transfer' | 'cross_dock' | 'mto' | 'wheel' | 'warranty' | 'complaint' | 'completion' | 'out_of_stock' | 'message';

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
 * Resolve email recipients using OT Platform's three-tier fallback system
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

  // Store 22 (Fort Worth 022) special handling
  if (storeNumber === '22' || storeNumber === '022') {
    resolutionLog.push('Store 22 (Fort Worth 022) detected - applying special handling');
  }

  const baseResult: Omit<EmailResolutionResult, 'recipients' | 'source'> = {
    orderId,
    plant: normalizedPlant,
    store: normalizedStore,
    emailType,
    resolutionLog
  };

  try {
    // Tier 1: Check order fields for specific recipient emails
    const orderFieldRecipients = await checkOrderFields(orderData, resolutionLog);
    if (orderFieldRecipients.length > 0) {
      return {
        ...baseResult,
        recipients: orderFieldRecipients,
        source: 'order_fields'
      };
    }

    // Tier 2: Check store_email_recipients table
    const storeRecipients = await checkStoreEmailRecipients(storeNumber, normalizedPlant, emailType, resolutionLog);
    if (storeRecipients.length > 0) {
      return {
        ...baseResult,
        recipients: storeRecipients,
        source: 'store_email_recipients'
      };
    }

    // Tier 3: Check ot_platform_users table
    const platformRecipients = await checkOTPlatformUsers(storeNumber, normalizedPlant, emailType, resolutionLog);
    if (platformRecipients.length > 0) {
      return {
        ...baseResult,
        recipients: platformRecipients,
        source: 'ot_platform_users'
      };
    }

    // No recipients found
    resolutionLog.push('No recipients found in any tier');
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

/**
 * Tier 2: Check store_email_recipients table
 */
async function checkStoreEmailRecipients(
  storeNumber: string, 
  plant: string, 
  emailType: EmailType,
  log: string[]
): Promise<EmailRecipient[]> {
  
  log.push(`Tier 2: Querying store_email_recipients for store=${storeNumber}, plant=${plant}`);
  
  // Generate store variants for lookup
  const storeVariants = generateStoreVariants(storeNumber);
  log.push(`Store variants: ${storeVariants.join(', ')}`);

  try {
    const { data: storeRecipients, error } = await supabase
      .from('store_email_recipients')
      .select('*')
      .in('store_number', storeVariants)
      .eq('is_active', true)
      .not('recipient_email', 'is', null);

    if (error) {
      log.push(`Tier 2 error: ${error.message}`);
      throw error;
    }

    const filteredRecipients = (storeRecipients || [])
      .filter(recipient => shouldIncludeRecipientForEmailType(recipient, emailType, log))
      .map(r => ({
        email: r.recipient_email,
        name: r.recipient_name || r.store_name,
        role: r.recipient_role,
        store: r.store_name,
        plant: plant // Use the plant parameter passed to the function
      }));

    log.push(`Tier 2 result: ${filteredRecipients.length} filtered recipients found`);
    return filteredRecipients;

  } catch (error) {
    log.push(`Tier 2 failed: ${error.message}`);
    return [];
  }
}

/**
 * Tier 3: Check ot_platform_users table
 */
async function checkOTPlatformUsers(
  storeNumber: string, 
  plant: string, 
  emailType: EmailType,
  log: string[]
): Promise<EmailRecipient[]> {
  
  log.push(`Tier 3: Querying ot_platform_users for store=${storeNumber}, plant=${plant}`);
  
  const storeVariants = generateStoreVariants(storeNumber);
  log.push(`Store variants: ${storeVariants.join(', ')}`);
  console.log(`🔍 TIER 3 DEBUGGING - Store variants for ${storeNumber}:`, storeVariants);

  try {
    // Split into two targeted queries to get exactly what we need:
    // 1. Store-specific managers (store_manager, service_manager)
    // 2. Warehouse management team (warehouse_manager, warehouse_coordinator, etc.)
    
    // Query 1: Store-specific managers
    console.log(`🔍 TIER 3 DEBUGGING - Querying store managers with variants:`, storeVariants);
    const { data: storeManagers, error: storeError } = await supabase
      .from('ot_platform_users')
      .select('email, full_name, role, store, plant')
      .in('store', storeVariants)
      .in('role', ['store_manager', 'service_manager'])
      .eq('status', 'active')
      .not('email', 'is', null);

    console.log(`🔍 TIER 3 DEBUGGING - Store managers query result:`, {
      error: storeError,
      count: storeManagers?.length || 0,
      managers: storeManagers?.map(m => ({ email: m.email, role: m.role, store: m.store }))
    });

    if (storeError) {
      log.push(`Tier 3 store managers error: ${storeError.message}`);
    }

    // Query 2: Warehouse management team (specific plant only - no global expansion)
    console.log(`🔍 TIER 3 DEBUGGING - Querying warehouse managers for plant: ${plant}`);
    const { data: warehouseManagers, error: warehouseError } = await supabase
      .from('ot_platform_users')
      .select('email, full_name, role, store, plant')
      .eq('plant', plant)
      .in('role', ['warehouse_manager', 'warehouse_coordinator', 'retread_manager', 'plant_manager', 'operations_manager', 'super_admin'])
      .eq('status', 'active')
      .not('email', 'is', null);

    console.log(`🔍 TIER 3 DEBUGGING - Warehouse managers query result:`, {
      error: warehouseError,
      count: warehouseManagers?.length || 0,
      managers: warehouseManagers?.map(m => ({ email: m.email, role: m.role, plant: m.plant }))
    });

    if (warehouseError) {
      log.push(`Tier 3 warehouse managers error: ${warehouseError.message}`);
    }

    // Combine results and remove duplicates
    const allUsers = [...(storeManagers || []), ...(warehouseManagers || [])];
    const uniqueUsers = allUsers.filter((user, index, self) => 
      index === self.findIndex(u => u.email === user.email)
    );

    console.log(`🔍 TIER 3 DEBUGGING - Combined users before filtering:`, 
      uniqueUsers.map(u => ({ email: u.email, role: u.role, store: u.store, plant: u.plant }))
    );

    log.push(`Tier 3 found: ${storeManagers?.length || 0} store managers, ${warehouseManagers?.length || 0} warehouse managers`);

    const filteredRecipients = uniqueUsers
      .filter(user => {
        const included = shouldIncludeUserForEmailType(user.role, emailType, log);
        console.log(`🔍 TIER 3 DEBUGGING - Filtering ${user.email} (${user.role}): ${included ? 'INCLUDED' : 'EXCLUDED'}`);
        return included;
      })
      .map(u => ({
        email: u.email,
        name: u.full_name,
        role: u.role,
        store: u.store,
        plant: u.plant
      }));

    console.log(`🔍 TIER 3 DEBUGGING - Final filtered recipients:`, 
      filteredRecipients.map(r => ({ email: r.email, role: r.role }))
    );

    log.push(`Tier 3 result: ${filteredRecipients.length} filtered recipients found`);
    return filteredRecipients;

  } catch (error) {
    console.error(`❌ TIER 3 DEBUGGING - Error:`, error);
    log.push(`Tier 3 failed: ${error.message}`);
    return [];
  }
}

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