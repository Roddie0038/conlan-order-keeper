/**
 * useEmailRecipientsPreview Hook
 * Custom hook for real-time email recipient preview functionality
 * Provides centralized recipient lookup with caching and error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { resolveEmailRecipients } from '@/services/emailRecipientResolver';
import { emailRecipientManagementService } from '@/services/emailRecipientManagementService';
import type { EmailRecipient, EmailType, OrderDataInput } from '@/services/emailRecipientResolver';
import type { EmailOverride } from '@/services/emailRecipientManagementService';
import { supabase } from '@/integrations/supabase/client';

interface UseEmailRecipientsPreviewOptions {
  enabled?: boolean;
  refetchInterval?: number;
  cacheTime?: number;
  allowManagement?: boolean;
  orderId?: string;
  templateId?: string;
}

interface UseEmailRecipientsPreviewReturn {
  recipients: EmailRecipient[];
  loading: boolean;
  error: string | null;
  source: string;
  refetch: () => Promise<void>;
  recipientCount: number;
  hasRecipients: boolean;
  
  // Management capabilities
  defaultRecipients: EmailRecipient[];
  customRecipients: EmailRecipient[];
  removedDefaults: EmailRecipient[];
  hasCustomizations: boolean;
  addRecipient: (recipient: Partial<EmailRecipient>) => Promise<boolean>;
  removeRecipient: (email: string) => Promise<boolean>;
  resetToDefaults: () => Promise<void>;
  managementLoading: boolean;
}

export const useEmailRecipientsPreview = (
  orderData: OrderDataInput | null,
  emailType: EmailType,
  options: UseEmailRecipientsPreviewOptions = {}
): UseEmailRecipientsPreviewReturn => {
  const { 
    enabled = true, 
    refetchInterval, 
    cacheTime = 5 * 60 * 1000,
    allowManagement = false,
    orderId,
    templateId
  } = options;
  
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [defaultRecipients, setDefaultRecipients] = useState<EmailRecipient[]>([]);
  const [overrides, setOverrides] = useState<EmailOverride[]>([]);
  const [loading, setLoading] = useState(false);
  const [managementLoading, setManagementLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string>('');
  const [lastFetch, setLastFetch] = useState<number>(0);

  /**
   * Fetch default recipients from the standard resolution system
   */
  const fetchDefaultRecipients = useCallback(async () => {
    if (!enabled || !orderData || !orderData.store_number || !emailType) {
      setDefaultRecipients([]);
      setSource('');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await resolveEmailRecipients(orderData, emailType);
      setDefaultRecipients(result.recipients);
      setSource(result.source);
      setLastFetch(Date.now());
    } catch (err) {
      console.error('Error fetching default recipients:', err);
      setError(err instanceof Error ? err.message : 'Failed to load recipients');
      setDefaultRecipients([]);
      setSource('');
    } finally {
      setLoading(false);
    }
  }, [orderData, emailType, enabled]);

  /**
   * Fetch overrides from database
   */
  const fetchOverrides = useCallback(async () => {
    if (!allowManagement || !orderData?.store_number || !emailType) {
      setOverrides([]);
      return;
    }

    try {
      const overrideData = await emailRecipientManagementService.getOverrides({
        storeNumber: orderData.store_number,
        plant: orderData.plant,
        emailType,
        orderId,
        templateId
      });
      setOverrides(overrideData);
    } catch (err) {
      console.error('Error fetching overrides:', err);
    }
  }, [allowManagement, orderData, emailType, orderId, templateId]);

  /**
   * Apply overrides to default recipients to create final list
   */
  const applyOverrides = useCallback(() => {
    if (!allowManagement) {
      setRecipients(defaultRecipients);
      return;
    }

    let finalRecipients = [...defaultRecipients];
    
    // Group overrides by email
    const overridesByEmail = overrides.reduce((acc, override) => {
      if (!acc[override.recipient_email]) {
        acc[override.recipient_email] = [];
      }
      acc[override.recipient_email].push(override);
      return acc;
    }, {} as Record<string, EmailOverride[]>);

    // Process each email's overrides (most recent action wins)
    Object.entries(overridesByEmail).forEach(([email, emailOverrides]) => {
      const mostRecent = emailOverrides.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

      if (mostRecent.action_type === 'add') {
        // Add if not already present
        if (!finalRecipients.find(r => r.email === email)) {
          finalRecipients.push({
            email: mostRecent.recipient_email,
            name: mostRecent.recipient_name || '',
            role: mostRecent.recipient_role || 'custom',
            store: orderData?.store_number || '',
            plant: orderData?.plant || ''
          });
        }
      } else if (mostRecent.action_type === 'remove') {
        // Remove from list
        finalRecipients = finalRecipients.filter(r => r.email !== email);
      }
    });

    setRecipients(finalRecipients);
  }, [defaultRecipients, overrides, allowManagement, orderData]);

  /**
   * Initial fetch and dependency updates
   */
  useEffect(() => {
    fetchDefaultRecipients();
  }, [fetchDefaultRecipients]);

  useEffect(() => {
    if (allowManagement) {
      fetchOverrides();
    }
  }, [fetchOverrides, allowManagement]);

  useEffect(() => {
    applyOverrides();
  }, [applyOverrides]);

  /**
   * Polling interval
   */
  useEffect(() => {
    if (refetchInterval && refetchInterval > 0) {
      const interval = setInterval(() => {
        fetchDefaultRecipients();
        if (allowManagement) {
          fetchOverrides();
        }
      }, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchDefaultRecipients, fetchOverrides, refetchInterval, allowManagement]);

  /**
   * Add recipient
   */
  const addRecipient = useCallback(async (recipient: Partial<EmailRecipient>): Promise<boolean> => {
    if (!allowManagement || !orderData?.store_number || !recipient.email) {
      return false;
    }

    setManagementLoading(true);
    try {
      // Get current user email from Supabase auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        setError('Must be logged in to add recipients');
        return false;
      }

      const result = await emailRecipientManagementService.addRecipient({
        storeNumber: orderData.store_number,
        plant: orderData.plant,
        emailType,
        recipientEmail: recipient.email,
        recipientName: recipient.name,
        recipientRole: recipient.role || 'custom',
        orderId,
        templateId,
        addedByEmail: user.email,
        addedByName: user.user_metadata?.full_name
      });

      if (result.success) {
        await fetchOverrides(); // Refresh overrides
        return true;
      } else {
        setError(result.error || 'Failed to add recipient');
        return false;
      }
    } catch (err) {
      console.error('Error adding recipient:', err);
      setError('Failed to add recipient');
      return false;
    } finally {
      setManagementLoading(false);
    }
  }, [allowManagement, orderData, emailType, orderId, templateId, fetchOverrides]);

  /**
   * Remove recipient
   */
  const removeRecipient = useCallback(async (email: string): Promise<boolean> => {
    if (!allowManagement || !orderData?.store_number) {
      return false;
    }

    setManagementLoading(true);
    try {
      // Get current user email from Supabase auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        setError('Must be logged in to remove recipients');
        return false;
      }

      // Check if this is a default recipient
      const isDefault = defaultRecipients.some(r => r.email === email);

      const result = await emailRecipientManagementService.removeRecipient({
        storeNumber: orderData.store_number,
        plant: orderData.plant,
        emailType,
        recipientEmail: email,
        isDefaultRecipient: isDefault,
        orderId,
        templateId,
        removedByEmail: user.email,
        removedByName: user.user_metadata?.full_name
      });

      if (result.success) {
        await fetchOverrides(); // Refresh overrides
        return true;
      } else {
        setError(result.error || 'Failed to remove recipient');
        return false;
      }
    } catch (err) {
      console.error('Error removing recipient:', err);
      setError('Failed to remove recipient');
      return false;
    } finally {
      setManagementLoading(false);
    }
  }, [allowManagement, orderData, emailType, orderId, templateId, defaultRecipients, fetchOverrides]);

  /**
   * Reset to defaults
   */
  const resetToDefaults = useCallback(async (): Promise<void> => {
    if (!allowManagement || !orderData?.store_number) {
      return;
    }

    setManagementLoading(true);
    try {
      // Get current user email from Supabase auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        setError('Must be logged in to reset recipients');
        return;
      }

      const result = await emailRecipientManagementService.resetToDefaults({
        storeNumber: orderData.store_number,
        plant: orderData.plant,
        emailType,
        orderId,
        templateId,
        resetByEmail: user.email
      });

      if (result.success) {
        await fetchOverrides(); // Refresh overrides
      } else {
        setError(result.error || 'Failed to reset to defaults');
      }
    } catch (err) {
      console.error('Error resetting to defaults:', err);
      setError('Failed to reset to defaults');
    } finally {
      setManagementLoading(false);
    }
  }, [allowManagement, orderData, emailType, orderId, templateId, fetchOverrides]);

  /**
   * Refetch all data
   */
  const refetch = useCallback(async () => {
    setLastFetch(0); // Force cache invalidation
    await fetchDefaultRecipients();
    if (allowManagement) {
      await fetchOverrides();
    }
  }, [fetchDefaultRecipients, fetchOverrides, allowManagement]);

  // Derived state
  const customRecipients = recipients.filter(r => {
    // Custom recipients are those not in the default list
    return !defaultRecipients.some(defaultRec => defaultRec.email === r.email);
  });
  const removedDefaults = defaultRecipients.filter(defaultRec => 
    !recipients.some(rec => rec.email === defaultRec.email)
  );
  const hasCustomizations = overrides.length > 0;

  return {
    recipients,
    loading,
    error,
    source,
    refetch,
    recipientCount: recipients.length,
    hasRecipients: recipients.length > 0,
    
    // Management state
    defaultRecipients,
    customRecipients,
    removedDefaults,
    hasCustomizations,
    addRecipient,
    removeRecipient,
    resetToDefaults,
    managementLoading
  };
};