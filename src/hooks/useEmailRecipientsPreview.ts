/**
 * Phase 2: Enhanced useEmailRecipientsPreview Hook
 * Full recipient management with add/remove capabilities
 * Integrates with EmailRecipientManagementService for complete CRUD operations
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { resolveEmailRecipients } from '@/services/emailRecipientResolver';
import { emailRecipientManagementService } from '@/services/EmailRecipientManagementService';
import type { EmailRecipient, EmailType, OrderDataInput } from '@/services/emailRecipientResolver';

interface UseEmailRecipientsPreviewOptions {
  enabled?: boolean;
  refetchInterval?: number;
  cacheTime?: number;
  templateId?: string;
  orderId?: string;
}

interface RecipientState {
  defaultRecipients: EmailRecipient[];
  customRecipients: EmailRecipient[];
  removedDefaults: string[];
  finalRecipients: EmailRecipient[];
}

interface UseEmailRecipientsPreviewReturn {
  // Core recipient data
  recipients: EmailRecipient[];
  defaultRecipients: EmailRecipient[];
  customRecipients: EmailRecipient[];
  removedDefaults: string[];
  
  // UI state
  loading: boolean;
  error: string | null;
  source: string;
  recipientCount: number;
  hasRecipients: boolean;
  
  // Management methods
  addRecipient: (email: string, name: string, role: string, addedByEmail: string, addedByName?: string) => Promise<{ success: boolean; error?: string }>;
  removeRecipient: (email: string, removedByEmail: string, removedByName?: string) => Promise<{ success: boolean; error?: string }>;
  resetToDefaults: (resetByEmail: string) => Promise<{ success: boolean; error?: string }>;
  refetch: () => Promise<void>;
  
  // Validation helpers
  canAddRecipient: (email: string) => { valid: boolean; error?: string };
  isDefaultRecipient: (email: string) => boolean;
  isCustomRecipient: (email: string) => boolean;
  isRemovedDefault: (email: string) => boolean;
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
    templateId,
    orderId
  } = options;
  
  // Core state
  const [recipientState, setRecipientState] = useState<RecipientState>({
    defaultRecipients: [],
    customRecipients: [],
    removedDefaults: [],
    finalRecipients: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string>('');
  const [lastFetch, setLastFetch] = useState<number>(0);
  
  // Optimistic update tracking
  const optimisticUpdateRef = useRef<string | null>(null);
  const previousStateRef = useRef<RecipientState | null>(null);

  const loadRecipientsWithOverrides = useCallback(async () => {
    if (!enabled || !orderData || !orderData.store || !emailType) {
      setRecipientState({
        defaultRecipients: [],
        customRecipients: [],
        removedDefaults: [],
        finalRecipients: []
      });
      setSource('');
      return;
    }

    // Check cache validity
    const now = Date.now();
    if (cacheTime > 0 && (now - lastFetch) < cacheTime && recipientState.finalRecipients.length > 0) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("📧 HOOK - Loading recipients with overrides", {
        store: orderData.store,
        emailType,
        templateId,
        orderId
      });

      const result = await emailRecipientManagementService.loadRecipientsWithOverrides(
        orderData,
        emailType,
        templateId,
        orderId
      );

      setRecipientState(result);
      setSource('management_service');
      setLastFetch(now);

    } catch (err) {
      console.error('❌ HOOK - Error loading recipients:', err);
      setError(err instanceof Error ? err.message : 'Failed to load recipients');
      setRecipientState({
        defaultRecipients: [],
        customRecipients: [],
        removedDefaults: [],
        finalRecipients: []
      });
      setSource('');
    } finally {
      setLoading(false);
    }
  }, [orderData, emailType, enabled, cacheTime, lastFetch, templateId, orderId, recipientState.finalRecipients.length]);

  // Initial fetch and dependency updates
  useEffect(() => {
    loadRecipientsWithOverrides();
  }, [loadRecipientsWithOverrides]);

  // Polling interval
  useEffect(() => {
    if (refetchInterval && refetchInterval > 0) {
      const interval = setInterval(loadRecipientsWithOverrides, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [loadRecipientsWithOverrides, refetchInterval]);

  /**
   * Add a custom recipient with optimistic UI updates
   */
  const addRecipient = useCallback(async (
    email: string, 
    name: string, 
    role: string, 
    addedByEmail: string, 
    addedByName?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!orderData?.store) {
      return { success: false, error: "No store specified" };
    }

    // Validate email domain
    const validation = emailRecipientManagementService['validateEmailDomain'](email);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Check for duplicates
    const isDuplicate = recipientState.finalRecipients.some(r => 
      r.email.toLowerCase() === email.toLowerCase()
    );
    
    if (isDuplicate) {
      return { success: false, error: "This email is already added as a recipient" };
    }

    console.log("📧 HOOK - Adding recipient", { email, name, role });

    // Store previous state for rollback
    previousStateRef.current = { ...recipientState };
    optimisticUpdateRef.current = `add-${email}-${Date.now()}`;

    // Optimistic update
    const newRecipient: EmailRecipient = {
      email,
      name,
      role,
      store: orderData.store,
      plant: orderData.plant || 'Unknown'
    };

    const optimisticState = {
      ...recipientState,
      customRecipients: [...recipientState.customRecipients, newRecipient],
      finalRecipients: [...recipientState.finalRecipients, newRecipient]
    };

    setRecipientState(optimisticState);

    try {
      const result = await emailRecipientManagementService.addRecipient(
        email,
        name,
        role,
        orderData.store,
        orderData.plant || 'Grand Prairie 097',
        emailType,
        addedByEmail,
        addedByName,
        templateId,
        orderId
      );

      if (result.success) {
        // Update with server response
        const serverResult = await emailRecipientManagementService.loadRecipientsWithOverrides(
          orderData,
          emailType,
          templateId,
          orderId
        );
        
        setRecipientState(serverResult);
        optimisticUpdateRef.current = null;
        
        console.log("✅ HOOK - Successfully added recipient");
        return { success: true };
      } else {
        // Rollback optimistic update
        if (previousStateRef.current) {
          setRecipientState(previousStateRef.current);
        }
        optimisticUpdateRef.current = null;
        
        console.error("❌ HOOK - Failed to add recipient:", result.error);
        return { success: false, error: result.error };
      }

    } catch (error) {
      // Rollback optimistic update
      if (previousStateRef.current) {
        setRecipientState(previousStateRef.current);
      }
      optimisticUpdateRef.current = null;
      
      console.error("❌ HOOK - Error adding recipient:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to add recipient" 
      };
    }
  }, [orderData, emailType, recipientState, templateId, orderId]);

  /**
   * Remove a recipient with optimistic UI updates
   */
  const removeRecipient = useCallback(async (
    email: string, 
    removedByEmail: string, 
    removedByName?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!orderData?.store) {
      return { success: false, error: "No store specified" };
    }

    console.log("📧 HOOK - Removing recipient", { email });

    // Store previous state for rollback
    previousStateRef.current = { ...recipientState };
    optimisticUpdateRef.current = `remove-${email}-${Date.now()}`;

    // Optimistic update
    const isCustom = recipientState.customRecipients.some(r => r.email === email);
    const isDefault = recipientState.defaultRecipients.some(r => r.email === email);

    let optimisticState: RecipientState;

    if (isCustom) {
      // Remove from custom recipients
      optimisticState = {
        ...recipientState,
        customRecipients: recipientState.customRecipients.filter(r => r.email !== email),
        finalRecipients: recipientState.finalRecipients.filter(r => r.email !== email)
      };
    } else if (isDefault) {
      // Add to removed defaults
      optimisticState = {
        ...recipientState,
        removedDefaults: [...recipientState.removedDefaults, email],
        finalRecipients: recipientState.finalRecipients.filter(r => r.email !== email)
      };
    } else {
      // Unknown recipient
      optimisticState = {
        ...recipientState,
        finalRecipients: recipientState.finalRecipients.filter(r => r.email !== email)
      };
    }

    setRecipientState(optimisticState);

    try {
      const result = await emailRecipientManagementService.removeRecipient(
        email,
        orderData.store,
        orderData.plant || 'Grand Prairie 097',
        emailType,
        removedByEmail,
        removedByName,
        templateId,
        orderId
      );

      if (result.success) {
        // Update with server response
        const serverResult = await emailRecipientManagementService.loadRecipientsWithOverrides(
          orderData,
          emailType,
          templateId,
          orderId
        );
        
        setRecipientState(serverResult);
        optimisticUpdateRef.current = null;
        
        console.log("✅ HOOK - Successfully removed recipient");
        return { success: true };
      } else {
        // Rollback optimistic update
        if (previousStateRef.current) {
          setRecipientState(previousStateRef.current);
        }
        optimisticUpdateRef.current = null;
        
        console.error("❌ HOOK - Failed to remove recipient:", result.error);
        return { success: false, error: result.error };
      }

    } catch (error) {
      // Rollback optimistic update
      if (previousStateRef.current) {
        setRecipientState(previousStateRef.current);
      }
      optimisticUpdateRef.current = null;
      
      console.error("❌ HOOK - Error removing recipient:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to remove recipient" 
      };
    }
  }, [orderData, emailType, recipientState, templateId, orderId]);

  /**
   * Reset to default recipients
   */
  const resetToDefaults = useCallback(async (
    resetByEmail: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!orderData?.store) {
      return { success: false, error: "No store specified" };
    }

    console.log("📧 HOOK - Resetting to defaults");

    // Store previous state for rollback
    previousStateRef.current = { ...recipientState };
    optimisticUpdateRef.current = `reset-${Date.now()}`;

    // Optimistic update - show only defaults
    const optimisticState = {
      ...recipientState,
      customRecipients: [],
      removedDefaults: [],
      finalRecipients: recipientState.defaultRecipients
    };

    setRecipientState(optimisticState);

    try {
      const result = await emailRecipientManagementService.resetToDefaults(
        orderData.store,
        emailType,
        resetByEmail,
        templateId,
        orderId
      );

      if (result.success) {
        // Reload from server
        await loadRecipientsWithOverrides();
        optimisticUpdateRef.current = null;
        
        console.log("✅ HOOK - Successfully reset to defaults");
        return { success: true };
      } else {
        // Rollback optimistic update
        if (previousStateRef.current) {
          setRecipientState(previousStateRef.current);
        }
        optimisticUpdateRef.current = null;
        
        console.error("❌ HOOK - Failed to reset:", result.error);
        return { success: false, error: result.error };
      }

    } catch (error) {
      // Rollback optimistic update
      if (previousStateRef.current) {
        setRecipientState(previousStateRef.current);
      }
      optimisticUpdateRef.current = null;
      
      console.error("❌ HOOK - Error resetting to defaults:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to reset to defaults" 
      };
    }
  }, [orderData, emailType, templateId, orderId, loadRecipientsWithOverrides, recipientState]);

  /**
   * Manual refetch (bypasses cache)
   */
  const refetch = useCallback(async () => {
    setLastFetch(0); // Force cache invalidation
    await loadRecipientsWithOverrides();
  }, [loadRecipientsWithOverrides]);

  /**
   * Validation helper - check if email can be added
   */
  const canAddRecipient = useCallback((email: string): { valid: boolean; error?: string } => {
    // Domain validation
    const allowedDomains = ['@conlantire.com', '@aol.com'];
    const normalizedEmail = email.toLowerCase().trim();

    if (!normalizedEmail.includes('@')) {
      return { valid: false, error: "Invalid email format" };
    }

    const isValidDomain = allowedDomains.some(domain => normalizedEmail.endsWith(domain));
    if (!isValidDomain) {
      return { 
        valid: false, 
        error: "Only @conlantire.com and @aol.com email addresses are allowed" 
      };
    }

    // Duplicate check
    const isDuplicate = recipientState.finalRecipients.some(r => 
      r.email.toLowerCase() === normalizedEmail
    );
    
    if (isDuplicate) {
      return { valid: false, error: "This email is already added as a recipient" };
    }

    return { valid: true };
  }, [recipientState.finalRecipients]);

  /**
   * Helper methods to check recipient status
   */
  const isDefaultRecipient = useCallback((email: string): boolean => {
    return recipientState.defaultRecipients.some(r => r.email === email);
  }, [recipientState.defaultRecipients]);

  const isCustomRecipient = useCallback((email: string): boolean => {
    return recipientState.customRecipients.some(r => r.email === email);
  }, [recipientState.customRecipients]);

  const isRemovedDefault = useCallback((email: string): boolean => {
    return recipientState.removedDefaults.includes(email);
  }, [recipientState.removedDefaults]);

  return {
    // Core recipient data
    recipients: recipientState.finalRecipients,
    defaultRecipients: recipientState.defaultRecipients,
    customRecipients: recipientState.customRecipients,
    removedDefaults: recipientState.removedDefaults,
    
    // UI state
    loading,
    error,
    source,
    recipientCount: recipientState.finalRecipients.length,
    hasRecipients: recipientState.finalRecipients.length > 0,
    
    // Management methods
    addRecipient,
    removeRecipient,
    resetToDefaults,
    refetch,
    
    // Validation helpers
    canAddRecipient,
    isDefaultRecipient,
    isCustomRecipient,
    isRemovedDefault
  };
};