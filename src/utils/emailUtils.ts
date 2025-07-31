/**
 * Phase 3: Email Utility with Real Data Resolution
 * Resolves actual manager emails from database instead of placeholders
 */

import { logger } from '@/utils/logger';
import { supabase } from '@/integrations/supabase/client';

/**
 * Get first manager email - resolves from actual data
 * Queries ot_platform_users to find real store managers
 */
export async function getFirstManagerEmail(store: string): Promise<string> {
  logger.debug('🔍 Getting first manager email for store', { store, service: 'email_utility' });
  
  try {
    // Normalize the store format for comparison
    const normalizedStore = store.trim();
    
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

    // Only use fallback if absolutely no managers found
    logger.warn('⚠️ No manager found for store, using fallback', { store, normalizedStore });
    return 'system@conlantire.com';
    
  } catch (error) {
    logger.error('❌ Error in getFirstManagerEmail:', { error, store });
    return 'system@conlantire.com';
  }
}

/**
 * Get manager email string for backward compatibility
 * Now resolves to actual manager data instead of placeholder
 */
export async function getManagerEmail(store: string): Promise<string> {
  logger.debug('Getting manager email for backward compatibility', { store, service: 'email_utility' });
  
  // Use the same real data resolution
  return getFirstManagerEmail(store);
}