/**
 * Email Recipient Management Service
 * Handles add/remove operations for email recipients with full audit logging
 */

import { supabase } from '@/integrations/supabase/client';
import type { EmailRecipient, EmailType, OrderDataInput } from './emailRecipientResolver';

export interface EmailOverride {
  id: string;
  order_id?: string;
  template_id?: string;
  store_number: string;
  plant?: string;
  email_type: string;
  action_type: 'add' | 'remove';
  recipient_email: string;
  recipient_name?: string;
  recipient_role?: string;
  is_default_recipient: boolean;
  added_by_email: string;
  added_by_name?: string;
  created_at: string;
  is_active: boolean;
}

export interface RecipientValidationResult {
  isValid: boolean;
  error?: string;
}

export interface RecipientManagementResult {
  success: boolean;
  error?: string;
  override_id?: string;
}

class EmailRecipientManagementService {
  /**
   * Validate email recipient
   */
  validateRecipient(email: string, name?: string): RecipientValidationResult {
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Invalid email format' };
    }

    // Domain validation - only @conlantire.com and @aol.com allowed
    const allowedDomains = ['conlantire.com', 'aol.com'];
    const emailDomain = email.split('@')[1]?.toLowerCase();
    
    if (!allowedDomains.includes(emailDomain)) {
      return { 
        isValid: false, 
        error: 'Only @conlantire.com and @aol.com email addresses are allowed' 
      };
    }

    return { isValid: true };
  }

  /**
   * Add recipient override
   */
  async addRecipient(params: {
    storeNumber: string;
    plant?: string;
    emailType: EmailType;
    recipientEmail: string;
    recipientName?: string;
    recipientRole?: string;
    orderId?: string;
    templateId?: string;
    addedByEmail: string;
    addedByName?: string;
  }): Promise<RecipientManagementResult> {
    try {
      // Validate recipient
      const validation = this.validateRecipient(params.recipientEmail, params.recipientName);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      // Check if recipient already exists in overrides
      const { data: existingOverride } = await supabase
        .from('order_email_overrides')
        .select('*')
        .eq('store_number', params.storeNumber)
        .eq('email_type', params.emailType)
        .eq('recipient_email', params.recipientEmail)
        .eq('is_active', true)
        .maybeSingle();

      // If removing override exists, deactivate it; if adding override exists, don't duplicate
      if (existingOverride) {
        if (existingOverride.action_type === 'remove') {
          // Deactivate the remove override
          await supabase
            .from('order_email_overrides')
            .update({ is_active: false })
            .eq('id', existingOverride.id);
        } else {
          return { success: false, error: 'Recipient already added' };
        }
      }

      // Create add override
      const { data, error } = await supabase
        .from('order_email_overrides')
        .insert({
          order_id: params.orderId || null,
          template_id: params.templateId || null,
          store_number: params.storeNumber,
          plant: params.plant || null,
          email_type: params.emailType,
          action_type: 'add',
          recipient_email: params.recipientEmail,
          recipient_name: params.recipientName || null,
          recipient_role: params.recipientRole || 'custom',
          is_default_recipient: false,
          added_by_email: params.addedByEmail,
          added_by_name: params.addedByName || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding recipient:', error);
        return { success: false, error: 'Failed to add recipient' };
      }

      // Log to notification system
      await this.logRecipientAction({
        action: 'recipient_added',
        storeNumber: params.storeNumber,
        plant: params.plant,
        emailType: params.emailType,
        recipientEmail: params.recipientEmail,
        addedByEmail: params.addedByEmail,
        orderId: params.orderId,
        templateId: params.templateId
      });

      return { success: true, override_id: data.id };
    } catch (error) {
      console.error('Error in addRecipient:', error);
      return { success: false, error: 'Failed to add recipient' };
    }
  }

  /**
   * Remove recipient (works for both defaults and custom recipients)
   */
  async removeRecipient(params: {
    storeNumber: string;
    plant?: string;
    emailType: EmailType;
    recipientEmail: string;
    isDefaultRecipient: boolean;
    orderId?: string;
    templateId?: string;
    removedByEmail: string;
    removedByName?: string;
  }): Promise<RecipientManagementResult> {
    try {
      // Check if an add override exists and deactivate it
      const { data: addOverride } = await supabase
        .from('order_email_overrides')
        .select('*')
        .eq('store_number', params.storeNumber)
        .eq('email_type', params.emailType)
        .eq('recipient_email', params.recipientEmail)
        .eq('action_type', 'add')
        .eq('is_active', true)
        .maybeSingle();

      if (addOverride) {
        // Just deactivate the add override
        await supabase
          .from('order_email_overrides')
          .update({ is_active: false })
          .eq('id', addOverride.id);
      } else {
        // Create remove override
        const { data, error } = await supabase
          .from('order_email_overrides')
          .insert({
            order_id: params.orderId || null,
            template_id: params.templateId || null,
            store_number: params.storeNumber,
            plant: params.plant || null,
            email_type: params.emailType,
            action_type: 'remove',
            recipient_email: params.recipientEmail,
            recipient_name: null,
            recipient_role: null,
            is_default_recipient: params.isDefaultRecipient,
            added_by_email: params.removedByEmail,
            added_by_name: params.removedByName || null
          })
          .select()
          .single();

        if (error) {
          console.error('Error removing recipient:', error);
          return { success: false, error: 'Failed to remove recipient' };
        }
      }

      // Log to notification system
      await this.logRecipientAction({
        action: 'recipient_removed',
        storeNumber: params.storeNumber,
        plant: params.plant,
        emailType: params.emailType,
        recipientEmail: params.recipientEmail,
        addedByEmail: params.removedByEmail,
        orderId: params.orderId,
        templateId: params.templateId,
        isDefaultRecipient: params.isDefaultRecipient
      });

      return { success: true };
    } catch (error) {
      console.error('Error in removeRecipient:', error);
      return { success: false, error: 'Failed to remove recipient' };
    }
  }

  /**
   * Get overrides for specific context
   */
  async getOverrides(params: {
    storeNumber: string;
    plant?: string;
    emailType: EmailType;
    orderId?: string;
    templateId?: string;
  }): Promise<EmailOverride[]> {
    try {
      let query = supabase
        .from('order_email_overrides')
        .select('*')
        .eq('store_number', params.storeNumber)
        .eq('email_type', params.emailType)
        .eq('is_active', true);

      if (params.orderId) {
        query = query.eq('order_id', params.orderId);
      } else if (params.templateId) {
        query = query.eq('template_id', params.templateId);
      } else {
        // For general overrides (no specific order or template)
        query = query.is('order_id', null).is('template_id', null);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching overrides:', error);
        return [];
      }

      return (data || []) as EmailOverride[];
    } catch (error) {
      console.error('Error in getOverrides:', error);
      return [];
    }
  }

  /**
   * Reset to defaults by deactivating all overrides
   */
  async resetToDefaults(params: {
    storeNumber: string;
    plant?: string;
    emailType: EmailType;
    orderId?: string;
    templateId?: string;
    resetByEmail: string;
  }): Promise<RecipientManagementResult> {
    try {
      let query = supabase
        .from('order_email_overrides')
        .update({ is_active: false })
        .eq('store_number', params.storeNumber)
        .eq('email_type', params.emailType)
        .eq('is_active', true);

      if (params.orderId) {
        query = query.eq('order_id', params.orderId);
      } else if (params.templateId) {
        query = query.eq('template_id', params.templateId);
      }

      const { error } = await query;

      if (error) {
        console.error('Error resetting to defaults:', error);
        return { success: false, error: 'Failed to reset to defaults' };
      }

      // Log the reset action
      await this.logRecipientAction({
        action: 'recipients_reset_to_defaults',
        storeNumber: params.storeNumber,
        plant: params.plant,
        emailType: params.emailType,
        addedByEmail: params.resetByEmail,
        orderId: params.orderId,
        templateId: params.templateId
      });

      return { success: true };
    } catch (error) {
      console.error('Error in resetToDefaults:', error);
      return { success: false, error: 'Failed to reset to defaults' };
    }
  }

  /**
   * Log recipient management actions to notification_logs
   */
  private async logRecipientAction(params: {
    action: string;
    storeNumber: string;
    plant?: string;
    emailType: EmailType;
    recipientEmail?: string;
    addedByEmail: string;
    orderId?: string;
    templateId?: string;
    isDefaultRecipient?: boolean;
  }): Promise<void> {
    try {
      await supabase
        .from('notification_logs')
        .insert({
          order_id: params.orderId || null,
          order_type: 'recipient_management',
          notification_type: params.action,
          recipient_email: params.recipientEmail || params.addedByEmail,
          recipient_role: 'system',
          status: 'completed',
          plant: params.plant || null,
          store: params.storeNumber,
          platform: 'ot_platform',
          metadata: {
            action: params.action,
            email_type: params.emailType,
            modified_by: params.addedByEmail,
            template_id: params.templateId,
            is_default_recipient: params.isDefaultRecipient
          }
        });
    } catch (error) {
      console.error('Error logging recipient action:', error);
      // Don't fail the main operation if logging fails
    }
  }
}

export const emailRecipientManagementService = new EmailRecipientManagementService();