/**
 * Phase 1: Email Recipient Management Service
 * Handles add/remove recipient operations with comprehensive audit logging
 * Integrates with existing email resolution system and order_email_overrides table
 */

import { supabase } from "@/integrations/supabase/client";
import { resolveEmailRecipients } from "@/services/emailRecipientResolver";
import type { EmailRecipient, EmailType, OrderDataInput } from "@/services/emailRecipientResolver";
import { generateUUID } from "@/utils/uuid/UUIDUtils";

export interface RecipientOverride {
  id?: string;
  order_id?: string;
  template_id?: string;
  store_number: string;
  plant?: string;
  email_type: EmailType;
  recipient_email: string;
  recipient_name?: string;
  recipient_role: string;
  action_type: 'add' | 'remove';
  added_by_email: string;
  added_by_name?: string;
  is_active: boolean;
  is_default_recipient: boolean;
  created_at?: string;
}

export interface RecipientManagementResult {
  success: boolean;
  recipients: EmailRecipient[];
  error?: string;
  auditLogId?: string;
}

export class EmailRecipientManagementService {
  
  /**
   * Load current recipients with any applied overrides
   */
  async loadRecipientsWithOverrides(
    orderData: OrderDataInput,
    emailType: EmailType,
    templateId?: string,
    orderId?: string
  ): Promise<{ 
    defaultRecipients: EmailRecipient[]; 
    customRecipients: EmailRecipient[]; 
    removedDefaults: string[];
    finalRecipients: EmailRecipient[]; 
  }> {
    console.log("📧 RECIPIENT MGMT - Loading recipients with overrides", {
      store: orderData.store,
      emailType,
      templateId,
      orderId
    });

    try {
      // Get default recipients using SQL function (aligned with OT Platform)
      const storeNumber = this.extractStoreNumber(orderData.store);
      // Map emailType to the SQL function's expected format  
      const sqlEmailType = emailType === 'customer_complaints' ? 'customer_complaints' : emailType;
      
      const { data: sqlRecipients, error: sqlError } = await supabase.rpc(
        'resolve_email_recipients', 
        { 
          p_store: storeNumber, 
          p_type: sqlEmailType 
        }
      );

      if (sqlError) {
        console.error("❌ RECIPIENT MGMT - SQL function error:", sqlError);
        throw sqlError;
      }

      const defaultRecipients = (sqlRecipients || []).map((r: any) => ({
        email: r.recipient_email || r.email,
        name: r.recipient_name || r.store_name || r.full_name,
        role: r.recipient_role || r.role,
        store: r.store_name || orderData.store,
        plant: orderData.plant || 'Unknown'
      }));

      // Load overrides from database using SQL query
      const overrides = await this.queryOverrides(orderData.store, emailType, templateId, orderId);

      // Process overrides
      const addedRecipients: EmailRecipient[] = [];
      const removedEmails: string[] = [];

      for (const override of overrides) {
        if (override.action_type === 'add') {
          addedRecipients.push({
            email: override.recipient_email,
            name: override.recipient_name || 'Custom Recipient',
            role: override.recipient_role,
            store: override.store_number,
            plant: override.plant
          });
        } else if (override.action_type === 'remove') {
          removedEmails.push(override.recipient_email);
        }
      }

      // Calculate final recipients
      const finalRecipients = [
        ...defaultRecipients.filter(r => !removedEmails.includes(r.email)),
        ...addedRecipients
      ];

      console.log("✅ RECIPIENT MGMT - Loaded recipients", {
        defaults: defaultRecipients.length,
        added: addedRecipients.length,
        removed: removedEmails.length,
        final: finalRecipients.length
      });

      return {
        defaultRecipients,
        customRecipients: addedRecipients,
        removedDefaults: removedEmails,
        finalRecipients
      };

    } catch (error) {
      console.error("❌ RECIPIENT MGMT - Error loading recipients:", error);
      return {
        defaultRecipients: [],
        customRecipients: [],
        removedDefaults: [],
        finalRecipients: []
      };
    }
  }

  /**
   * Add a custom recipient with domain validation
   */
  async addRecipient(
    email: string,
    name: string,
    role: string,
    storeNumber: string,
    plant: string,
    emailType: EmailType,
    addedByEmail: string,
    addedByName?: string,
    templateId?: string,
    orderId?: string
  ): Promise<RecipientManagementResult> {
    console.log("📧 RECIPIENT MGMT - Adding recipient", { email, role, storeNumber });

    try {
      // Domain validation
      const validationResult = this.validateEmailDomain(email);
      if (!validationResult.valid) {
        return {
          success: false,
          recipients: [],
          error: validationResult.error
        };
      }

      // Check for duplicates
      const isDuplicate = await this.checkDuplicateRecipient(
        email, storeNumber, emailType, templateId, orderId
      );

      if (isDuplicate) {
        return {
          success: false,
          recipients: [],
          error: "This email is already added as a recipient"
        };
      }

      // Insert override record
      await this.insertOverride({
        order_id: orderId || null,
        template_id: templateId || null,
        store_number: storeNumber,
        plant,
        email_type: emailType,
        recipient_email: email,
        recipient_name: name,
        recipient_role: role,
        action_type: 'add',
        added_by_email: addedByEmail,
        added_by_name: addedByName,
        is_active: true,
        is_default_recipient: false
      });

      // Log audit trail
      const auditLogId = await this.logRecipientAction(
        'add',
        email,
        name,
        role,
        storeNumber,
        emailType,
        addedByEmail,
        { templateId, orderId, performedByName: addedByName, plant }
      );

      // Reload recipients to get updated list
      const updated = await this.loadRecipientsWithOverrides(
        { store: storeNumber, plant },
        emailType,
        templateId,
        orderId
      );

      console.log("✅ RECIPIENT MGMT - Successfully added recipient");

      return {
        success: true,
        recipients: updated.finalRecipients,
        auditLogId
      };

    } catch (error) {
      console.error("❌ RECIPIENT MGMT - Error in addRecipient:", error);
      return {
        success: false,
        recipients: [],
        error: "An unexpected error occurred"
      };
    }
  }

  /**
   * Remove a recipient (including defaults)
   */
  async removeRecipient(
    email: string,
    storeNumber: string,
    plant: string,
    emailType: EmailType,
    removedByEmail: string,
    removedByName?: string,
    templateId?: string,
    orderId?: string
  ): Promise<RecipientManagementResult> {
    console.log("📧 RECIPIENT MGMT - Removing recipient", { email, storeNumber });

    try {
      // Check if this is a custom recipient that can be deleted
      const existingOverride = await this.findExistingOverride(
        email, storeNumber, emailType, 'add', templateId, orderId
      );

      if (existingOverride) {
        // This is a custom recipient - deactivate the override
        await this.deactivateOverride(existingOverride.id!);
      } else {
        // This is a default recipient - create a removal override
        await this.insertOverride({
          order_id: orderId || null,
          template_id: templateId || null,
          store_number: storeNumber,
          plant,
          email_type: emailType,
          recipient_email: email,
          recipient_name: null,
          recipient_role: 'removed',
          action_type: 'remove',
          added_by_email: removedByEmail,
          added_by_name: removedByName,
          is_active: true,
          is_default_recipient: true
        });
      }

      // Log audit trail
      const auditLogId = await this.logRecipientAction(
        'remove',
        email,
        'Removed Recipient',
        'removed',
        storeNumber,
        emailType,
        removedByEmail,
        { templateId, orderId, performedByName: removedByName, plant }
      );

      // Reload recipients to get updated list
      const updated = await this.loadRecipientsWithOverrides(
        { store: storeNumber, plant },
        emailType,
        templateId,
        orderId
      );

      console.log("✅ RECIPIENT MGMT - Successfully removed recipient");

      return {
        success: true,
        recipients: updated.finalRecipients,
        auditLogId
      };

    } catch (error) {
      console.error("❌ RECIPIENT MGMT - Error in removeRecipient:", error);
      return {
        success: false,
        recipients: [],
        error: "An unexpected error occurred"
      };
    }
  }

  /**
   * Reset recipients to defaults by deactivating all overrides
   */
  async resetToDefaults(
    storeNumber: string,
    emailType: EmailType,
    resetByEmail: string,
    templateId?: string,
    orderId?: string
  ): Promise<RecipientManagementResult> {
    console.log("📧 RECIPIENT MGMT - Resetting to defaults", { storeNumber, emailType });

    try {
      await this.deactivateAllOverrides(storeNumber, emailType, templateId, orderId);

      // Log audit trail
      await this.logRecipientAction(
        'reset',
        'all',
        'Reset to Defaults',
        'system',
        storeNumber,
        emailType,
        resetByEmail,
        { templateId, orderId, performedByName: 'System Reset', plant: 'Unknown' }
      );

      console.log("✅ RECIPIENT MGMT - Successfully reset to defaults");

      return {
        success: true,
        recipients: [],
        auditLogId: 'reset-action'
      };

    } catch (error) {
      console.error("❌ RECIPIENT MGMT - Error in resetToDefaults:", error);
      return {
        success: false,
        recipients: [],
        error: "An unexpected error occurred"
      };
    }
  }

  /**
   * Private helper methods for database operations
   */
  private extractStoreNumber(store: string): string {
    const match = store.match(/(\d+)/);
    return match ? match[1] : '';
  }
  private async queryOverrides(
    storeNumber: string,
    emailType: EmailType,
    templateId?: string,
    orderId?: string
  ): Promise<RecipientOverride[]> {
    try {
      let query = supabase
        .from('order_email_overrides')
        .select('*')
        .eq('store_number', storeNumber)
        .eq('email_type', emailType)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // Apply additional filters if provided
      if (orderId && templateId) {
        query = query.or(`order_id.eq.${orderId},template_id.eq.${templateId},order_id.is.null`);
      } else if (orderId) {
        query = query.or(`order_id.eq.${orderId},order_id.is.null`);
      } else if (templateId) {
        query = query.or(`template_id.eq.${templateId},template_id.is.null`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("❌ RECIPIENT MGMT - Error querying overrides:", error);
        return [];
      }

      return (data || []).map(item => ({
        id: item.id,
        order_id: item.order_id,
        template_id: item.template_id,
        store_number: item.store_number,
        plant: item.plant,
        email_type: item.email_type as EmailType,
        recipient_email: item.recipient_email,
        recipient_name: item.recipient_name,
        recipient_role: item.recipient_role,
        action_type: item.action_type as 'add' | 'remove',
        added_by_email: item.added_by_email,
        added_by_name: item.added_by_name,
        is_active: item.is_active,
        is_default_recipient: item.is_default_recipient,
        created_at: item.created_at
      }));

    } catch (error) {
      console.error("❌ RECIPIENT MGMT - Error in queryOverrides:", error);
      return [];
    }
  }

  private async insertOverride(override: Omit<RecipientOverride, 'id' | 'created_at'>): Promise<void> {
    const insertData = {
      order_id: override.order_id,
      template_id: override.template_id,
      store_number: override.store_number,
      plant: override.plant,
      email_type: override.email_type,
      action_type: override.action_type,
      recipient_email: override.recipient_email,
      recipient_name: override.recipient_name,
      recipient_role: override.recipient_role,
      is_default_recipient: override.is_default_recipient,
      added_by_email: override.added_by_email,
      added_by_name: override.added_by_name,
      is_active: override.is_active
    };

    const { error } = await supabase
      .from('order_email_overrides')
      .insert(insertData);

    if (error) {
      console.error("❌ RECIPIENT MGMT - Failed to insert override:", error);
      throw new Error(`Failed to insert override: ${error.message}`);
    }

    console.log("✅ RECIPIENT MGMT - Successfully inserted override into order_email_overrides");
  }

  private async findExistingOverride(
    email: string,
    storeNumber: string,
    emailType: EmailType,
    actionType: 'add' | 'remove',
    templateId?: string,
    orderId?: string
  ): Promise<RecipientOverride | null> {
    try {
      let query = supabase
        .from('order_email_overrides')
        .select('*')
        .eq('recipient_email', email)
        .eq('store_number', storeNumber)
        .eq('email_type', emailType)
        .eq('action_type', actionType)
        .eq('is_active', true);

      // Apply additional filters if provided
      if (orderId && templateId) {
        query = query.or(`order_id.eq.${orderId},template_id.eq.${templateId},order_id.is.null`);
      } else if (orderId) {
        query = query.or(`order_id.eq.${orderId},order_id.is.null`);
      } else if (templateId) {
        query = query.or(`template_id.eq.${templateId},template_id.is.null`);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error("❌ RECIPIENT MGMT - Error finding existing override:", error);
        return null;
      }

      if (!data) {
        return null;
      }

      return {
        id: data.id,
        order_id: data.order_id,
        template_id: data.template_id,
        store_number: data.store_number,
        plant: data.plant,
        email_type: data.email_type as EmailType,
        recipient_email: data.recipient_email,
        recipient_name: data.recipient_name,
        recipient_role: data.recipient_role,
        action_type: data.action_type as 'add' | 'remove',
        added_by_email: data.added_by_email,
        added_by_name: data.added_by_name,
        is_active: data.is_active,
        is_default_recipient: data.is_default_recipient,
        created_at: data.created_at
      };

    } catch (error) {
      console.error("❌ RECIPIENT MGMT - Error in findExistingOverride:", error);
      return null;
    }
  }

  private async deactivateOverride(overrideId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('order_email_overrides')
        .update({ is_active: false })
        .eq('id', overrideId);

      if (error) {
        console.error("❌ RECIPIENT MGMT - Error deactivating override:", error);
        throw new Error(`Failed to deactivate override: ${error.message}`);
      }

      console.log(`✅ RECIPIENT MGMT - Successfully deactivated override ${overrideId}`);
    } catch (error) {
      console.error("❌ RECIPIENT MGMT - Error in deactivateOverride:", error);
      throw error;
    }
  }

  private async deactivateAllOverrides(
    storeNumber: string,
    emailType: EmailType,
    templateId?: string,
    orderId?: string
  ): Promise<void> {
    try {
      let query = supabase
        .from('order_email_overrides')
        .update({ is_active: false })
        .eq('store_number', storeNumber)
        .eq('email_type', emailType)
        .eq('is_active', true);

      // Apply additional filters if provided
      if (orderId && templateId) {
        query = query.or(`order_id.eq.${orderId},template_id.eq.${templateId},order_id.is.null`);
      } else if (orderId) {
        query = query.or(`order_id.eq.${orderId},order_id.is.null`);
      } else if (templateId) {
        query = query.or(`template_id.eq.${templateId},template_id.is.null`);
      }

      const { error } = await query;

      if (error) {
        console.error("❌ RECIPIENT MGMT - Error deactivating all overrides:", error);
        throw new Error(`Failed to deactivate overrides: ${error.message}`);
      }

      console.log(`✅ RECIPIENT MGMT - Successfully deactivated all overrides for ${storeNumber} ${emailType}`);
    } catch (error) {
      console.error("❌ RECIPIENT MGMT - Error in deactivateAllOverrides:", error);
      throw error;
    }
  }

  /**
   * Validate email domain against allowed domains
   */
  private validateEmailDomain(email: string): { valid: boolean; error?: string } {
    const allowedDomains = ['@conlantire.com', '@aol.com'];
    const normalizedEmail = email.toLowerCase().trim();

    if (!normalizedEmail.includes('@')) {
      return { valid: false, error: "Invalid email format" };
    }

    const isValid = allowedDomains.some(domain => normalizedEmail.endsWith(domain));
    
    if (!isValid) {
      return { 
        valid: false, 
        error: "Only @conlantire.com and @aol.com email addresses are allowed" 
      };
    }

    return { valid: true };
  }

  /**
   * Check for duplicate recipients
   */
  private async checkDuplicateRecipient(
    email: string,
    storeNumber: string,
    emailType: EmailType,
    templateId?: string,
    orderId?: string
  ): Promise<boolean> {
    try {
      // Check for existing active overrides for the same email
      const existingOverride = await this.findExistingOverride(
        email, storeNumber, emailType, 'add', templateId, orderId
      );

      if (existingOverride) {
        console.log("📧 RECIPIENT MGMT - Found existing override for email:", email);
        return true;
      }

      // Check if email exists in default recipients (using resolver)
      const defaultResult = await resolveEmailRecipients(
        { store: storeNumber }, 
        emailType, 
        orderId
      );
      
      const isDuplicateDefault = defaultResult.recipients.some(r => 
        r.email.toLowerCase() === email.toLowerCase()
      );

      if (isDuplicateDefault) {
        console.log("📧 RECIPIENT MGMT - Email already exists in default recipients:", email);
        return true;
      }

      return false;

    } catch (error) {
      console.error("❌ RECIPIENT MGMT - Error checking duplicates:", error);
      return false;
    }
  }

  /**
   * Log recipient management actions for audit trail using dedicated recipient_action_logs table
   */
  private async logRecipientAction(
    action: 'add' | 'remove' | 'reset',
    email: string,
    name: string,
    role: string,
    storeNumber: string,
    emailType: EmailType,
    performedBy: string,
    context: { templateId?: string; orderId?: string; performedByName?: string; plant?: string }
  ): Promise<string> {
    try {
      const logData = {
        action_type: action,
        email_type: emailType,
        recipient_email: email,
        recipient_name: name,
        recipient_role: role,
        store_number: storeNumber,
        plant: context.plant || 'Unknown',
        template_id: context.templateId || null,
        order_id: context.orderId || null,
        performed_by_email: performedBy,
        performed_by_name: context.performedByName || 'Unknown User',
        metadata: {
          service: 'email_recipient_management',
          action,
          timestamp: new Date().toISOString(),
          original_context: context
        }
      };

      const { data, error } = await supabase
        .from('recipient_action_logs')
        .insert(logData)
        .select('id')
        .single();

      if (error) {
        console.error("❌ RECIPIENT MGMT - Error logging action:", error);
        return 'log-error';
      }

      console.log(`📝 RECIPIENT MGMT - Logged ${action} action for ${email} in recipient_action_logs`);
      return data.id;

    } catch (error) {
      console.error("❌ RECIPIENT MGMT - Error in logRecipientAction:", error);
      return 'log-error';
    }
  }
}

// Export singleton instance
export const emailRecipientManagementService = new EmailRecipientManagementService();