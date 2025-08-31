/**
 * Phase 3: Email Utility with Real Data Resolution
 * Resolves actual manager emails from database instead of placeholders
 */

import { logger } from '@/utils/logger';
import { supabase } from '@/integrations/supabase/client';
import { stores } from '@/components/order-form/formConfig';

/**
 * Normalize store input to full store name format
 */
function toFullStoreName(input: string): string {
  // If already a full name like "Fort Worth 022", keep it
  if (/\D+\s0?\d{2,3}$/.test(input)) return input.trim();

  // If it's an id like "22" or "022", map via stores array
  const digits = (input.match(/\d{2,3}/)?.[0] ?? '').padStart(3, '0');
  const matchedStore = stores.find(s => s.id.padStart(3, '0') === digits);
  return matchedStore?.name ?? input;
}

/**
 * Get first manager email - resolves from actual data
 * Queries ot_platform_users to find real store managers
 */
export async function getFirstManagerEmail(store: string): Promise<string | null> {
  logger.debug('🔍 Getting first manager email for store', { store, service: 'email_utility' });
  
  try {
    // Normalize the store format for comparison
    const normalizedStore = toFullStoreName(store.trim());
    
    // Query for store managers
    const { data: managers, error } = await supabase
      .from('ot_platform_users')
      .select('email, full_name, role, store')
      .eq('status', 'active')
      .eq('store', normalizedStore)
      .eq('role', 'store_manager')
      .limit(1);

    if (error) {
      logger.error('❌ Error querying store managers:', { error, store });
    }

    if (managers && managers.length > 0) {
      const managerEmail = managers[0].email;
      logger.debug('✅ Found real manager email:', { store, managerEmail, manager: managers[0] });
      return managerEmail;
    }

    // If no store manager found, try other management roles
    const { data: altManagers, error: altError } = await supabase
      .from('ot_platform_users')
      .select('email, full_name, role, store')
      .eq('status', 'active')
      .eq('store', normalizedStore)
      .in('role', ['warehouse_manager', 'office_manager', 'plant_manager'])
      .limit(1);

    if (!altError && altManagers && altManagers.length > 0) {
      const altManagerEmail = altManagers[0].email;
      logger.debug('✅ Found alternative manager email:', { store, altManagerEmail, manager: altManagers[0] });
      return altManagerEmail;
    }

    // Return null if no manager found
    logger.warn('⚠️ No manager found for store', { store, normalizedStore });
    return null;
    
  } catch (error) {
    logger.error('❌ Error in getFirstManagerEmail:', { error, store });
    return null;
  }
}

/**
 * Get manager email string for backward compatibility
 * Now resolves to actual manager data instead of placeholder
 */
export async function getManagerEmail(store: string): Promise<string | null> {
  logger.debug('Getting manager email for backward compatibility', { store, service: 'email_utility' });
  
  // Use the same real data resolution
  return getFirstManagerEmail(store);
}