import { supabase } from "@/integrations/supabase/client";
import { getStoreNumberVariants } from "@/utils/storeSanitization";

export type EmailType = 'transfer' | 'cross_dock' | 'mto' | 'wheel' | 'warranty' | 'complaint' | 'completion' | 'out_of_stock' | 'message';

export interface EmailRecipient {
  email: string;
  name?: string;
  role: string;
  store?: string;
  plant?: string;
}

export interface EmailRoutingResult {
  recipients: EmailRecipient[];
  source: 'database' | 'fallback';
  fallbackReason?: string;
  routingRules: string[];
}

/**
 * Role-based email notification service implementing comprehensive routing rules
 * Based on the specific requirements for each role type
 */
export class RoleBasedEmailService {
  
  /**
   * Get email recipients based on role-based routing rules
   */
  async getEmailRecipients(
    storeNumber: string, 
    emailType: EmailType, 
    plant?: string
  ): Promise<EmailRoutingResult> {
    console.log(`🔔 ROLE-BASED EMAIL - Getting recipients for store: ${storeNumber}, type: ${emailType}, plant: ${plant}`);
    
    try {
      // First try to get recipients from ordering_email_recipients
      const databaseResult = await this.getDatabaseRecipients(storeNumber, emailType, plant);
      
      if (databaseResult.recipients.length > 0) {
        console.log(`✅ ROLE-BASED EMAIL - Found ${databaseResult.recipients.length} database recipients`);
        return databaseResult;
      }
      
      // Fallback to ot_platform_users
      console.log(`⚠️ ROLE-BASED EMAIL - No database recipients, trying ot_platform_users fallback`);
      const fallbackResult = await this.getFallbackRecipients(storeNumber, emailType, plant);
      
      return {
        ...fallbackResult,
        source: 'fallback',
        fallbackReason: 'no_database_recipients'
      };
      
    } catch (error) {
      console.error(`❌ ROLE-BASED EMAIL - Error getting recipients:`, error);
      return {
        recipients: [],
        source: 'fallback',
        fallbackReason: 'error',
        routingRules: []
      };
    }
  }
  
  /**
   * Get recipients from ordering_email_recipients table with role-based filtering
   */
  private async getDatabaseRecipients(
    storeNumber: string, 
    emailType: EmailType, 
    plant?: string
  ): Promise<EmailRoutingResult> {
    
    const storeVariants = getStoreNumberVariants(storeNumber);
    const recipients: EmailRecipient[] = [];
    const routingRules: string[] = [];
    
    console.log(`📋 ROLE-BASED EMAIL - Checking database for store variants: ${storeVariants.join(', ')}`);
    
    // Query for store-based recipients (store managers, service managers)
    const { data: storeRecipients, error: storeError } = await supabase
      .from('ordering_email_recipients')
      .select('*')
      .in('store_number', storeVariants)
      .eq('is_active', true)
      .not('notification_types', 'is', null);
      
    if (storeError) {
      console.error(`❌ ROLE-BASED EMAIL - Database error (store):`, storeError);
      throw storeError;
    }
    
    // Query for plant-based recipients (warehouse, retread, plant, ops managers)
    let plantRecipients: any[] = [];
    if (plant) {
      const { data, error: plantError } = await supabase
        .from('ordering_email_recipients')
        .select('*')
        .eq('plant', plant)
        .eq('is_active', true)
        .not('notification_types', 'is', null);
        
      if (plantError) {
        console.error(`❌ ROLE-BASED EMAIL - Database error (plant):`, plantError);
        throw plantError;
      }
      
      plantRecipients = data || [];
    }
    
    // Combine and filter recipients based on role and email type
    const allCandidates = [...(storeRecipients || []), ...plantRecipients];
    
    for (const candidate of allCandidates) {
      const shouldInclude = this.shouldIncludeRecipient(candidate, emailType);
      
      if (shouldInclude.include) {
        recipients.push({
          email: candidate.recipient_email,
          name: candidate.store_name || candidate.plant,
          role: candidate.role,
          store: candidate.store_name,
          plant: candidate.plant
        });
        
        routingRules.push(shouldInclude.rule);
      }
    }
    
    console.log(`📧 ROLE-BASED EMAIL - Database found ${recipients.length} recipients`);
    console.log(`📋 ROLE-BASED EMAIL - Applied rules: ${routingRules.join(', ')}`);
    
    return {
      recipients,
      source: 'database',
      routingRules
    };
  }
  
  /**
   * Fallback to ot_platform_users table
   */
  private async getFallbackRecipients(
    storeNumber: string, 
    emailType: EmailType, 
    plant?: string
  ): Promise<EmailRoutingResult> {
    
    const storeVariants = getStoreNumberVariants(storeNumber);
    const recipients: EmailRecipient[] = [];
    const routingRules: string[] = [];
    
    console.log(`📋 ROLE-BASED EMAIL - Checking ot_platform_users for store variants: ${storeVariants.join(', ')}`);
    
    // Build query conditions
    let query = supabase
      .from('ot_platform_users')
      .select('email, full_name, role, store, plant')
      .eq('status', 'active')
      .not('email', 'is', null);
    
    // Add store or plant conditions
    if (storeVariants.length > 0) {
      query = query.or(`store.in.(${storeVariants.join(',')}),plant.eq.${plant || 'Grand Prairie 097'}`);
    } else if (plant) {
      query = query.eq('plant', plant);
    }
    
    const { data: fallbackRecipients, error } = await query;
    
    if (error) {
      console.error(`❌ ROLE-BASED EMAIL - Fallback error:`, error);
      throw error;
    }
    
    // Filter recipients based on role and email type
    for (const candidate of fallbackRecipients || []) {
      const shouldInclude = this.shouldIncludeRecipientByRole(candidate.role, emailType);
      
      if (shouldInclude.include) {
        recipients.push({
          email: candidate.email,
          name: candidate.full_name,
          role: candidate.role,
          store: candidate.store,
          plant: candidate.plant
        });
        
        routingRules.push(shouldInclude.rule);
      }
    }
    
    console.log(`📧 ROLE-BASED EMAIL - Fallback found ${recipients.length} recipients`);
    console.log(`📋 ROLE-BASED EMAIL - Applied rules: ${routingRules.join(', ')}`);
    
    return {
      recipients,
      source: 'database',
      routingRules
    };
  }
  
  /**
   * Determine if a recipient should be included based on role-based rules
   */
  private shouldIncludeRecipient(
    recipient: any, 
    emailType: EmailType
  ): { include: boolean; rule: string } {
    
    // Check if the email type is in the recipient's notification_types array
    if (recipient.notification_types && Array.isArray(recipient.notification_types)) {
      const hasEmailType = recipient.notification_types.includes(emailType);
      
      if (hasEmailType) {
        return {
          include: true,
          rule: `${recipient.user_role}:${emailType}:array_match`
        };
      }
    }
    
    // Fallback to role-based logic
    return this.shouldIncludeRecipientByRole(recipient.user_role, emailType);
  }
  
  /**
   * Role-based inclusion logic based on the specified requirements
   */
  private shouldIncludeRecipientByRole(
    role: string, 
    emailType: EmailType
  ): { include: boolean; rule: string } {
    
    const roleRules = {
      // Store Managers & Service Managers: All notifications for their store
      'store_manager': ['transfer', 'cross_dock', 'mto', 'wheel', 'warranty', 'complaint', 'completion', 'out_of_stock', 'message'],
      'service_manager': ['transfer', 'cross_dock', 'wheel', 'warranty', 'completion', 'out_of_stock', 'message'],
      
      // Warehouse Managers: All except warranty
      'warehouse_manager': ['transfer', 'cross_dock', 'mto', 'wheel', 'complaint', 'completion', 'out_of_stock', 'message'],
      
      // Warehouse Coordinators: No warranty or complaint
      'warehouse_coordinator': ['transfer', 'cross_dock', 'mto', 'wheel', 'completion', 'out_of_stock', 'message'],
      
      // Retread Managers: Only mto, warranty, complaint
      'retread_manager': ['mto', 'warranty', 'complaint'],
      
      // Plant Managers & Operations Managers: Only warranty, complaint
      'plant_manager': ['warranty', 'complaint'],
      'operations_manager': ['warranty', 'complaint']
    };
    
    const allowedTypes = roleRules[role] || [];
    const include = allowedTypes.includes(emailType);
    
    return {
      include,
      rule: `${role}:${emailType}:${include ? 'allowed' : 'blocked'}`
    };
  }
  
  /**
   * Log email routing decision for audit trail
   */
  async logEmailRouting(
    storeNumber: string,
    emailType: EmailType,
    recipients: EmailRecipient[],
    source: 'database' | 'fallback',
    fallbackReason?: string,
    routingRules?: string[]
  ): Promise<void> {
    
    // Only log if we have recipients to avoid 400 errors
    if (recipients.length === 0) {
      console.log(`📧 ROLE-BASED EMAIL - Skipping notification log (no recipients)`);
      return;
    }
    
    try {
      // Create a proper log entry for each recipient
      for (const recipient of recipients) {
        const logData = {
          order_id: `routing-${Date.now()}`, // Required field
          notification_type: emailType,
          recipient_email: recipient.email, // Required field
          store: storeNumber,
          plant: recipient.plant || 'Unknown',
          status: 'routed',
          metadata: {
            timestamp: new Date().toISOString(),
            service: 'role_based_email_service',
            source: source,
            fallback_reason: fallbackReason,
            routing_rules: routingRules,
            recipient_role: recipient.role,
            total_recipients: recipients.length
          }
        };
        
        const { error } = await supabase
          .from('notification_logs')
          .insert(logData);
          
        if (error) {
          console.error(`❌ ROLE-BASED EMAIL - Failed to log routing for ${recipient.email}:`, error);
        }
      }
      
      console.log(`📝 ROLE-BASED EMAIL - Logged routing decision for ${recipients.length} recipients`);
      
    } catch (error) {
      console.error(`❌ ROLE-BASED EMAIL - Error logging routing:`, error);
    }
  }
}

// Export singleton instance
export const roleBasedEmailService = new RoleBasedEmailService();