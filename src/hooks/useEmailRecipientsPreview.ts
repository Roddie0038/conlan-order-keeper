/**
 * Phase 2: Enhanced useEmailRecipientsPreview Hook
 * Full recipient management with add/remove capabilities
 * Integrates with EmailRecipientManagementService for complete CRUD operations
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { resolveEmailRecipients } from '@/services/emailRecipientResolver';
import { emailRecipientManagementService } from '@/services/EmailRecipientManagementService';
import { useRecipientAudit } from '@/hooks/useRecipientAudit';
import type { EmailRecipient, EmailType, OrderDataInput } from '@/services/emailRecipientResolver';

interface UseEmailRecipientsPreviewOptions {
  key?: { storeId: string; plant: string; emailType: EmailType; overridesHash?: string };
  enabled?: boolean;
  refetchInterval?: number;
  cacheTime?: number;
  templateId?: string;
  orderId?: string;
  onRecipientsChange?: (count: number, ready: boolean, isLoading?: boolean) => void;
  onRecipientsError?: (error: Error) => void;
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
  resolveError?: Error;
  source: string;
  recipientCount: number;
  hasRecipients: boolean;
  recipientsReady: boolean;
  
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
    key,
    enabled = true, 
    refetchInterval, 
    cacheTime = 5 * 60 * 1000,
    templateId,
    orderId,
    onRecipientsChange,
    onRecipientsError
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
  const [resolveError, setResolveError] = useState<Error | undefined>(undefined);
  const [source, setSource] = useState<string>('');
  const [recipientsReady, setRecipientsReady] = useState(false);
  
  // Track component lifecycle
  const aliveRef = useRef(true);
  const lastEmittedCountRef = useRef<number>(-1);
  const lastEmittedReadyRef = useRef<boolean>(false);
  
  // Cache tracking using ref to avoid triggering re-renders
  const lastFetchRef = useRef<number>(0);
  
  // Optimistic update tracking
  const optimisticUpdateRef = useRef<string | null>(null);
  const previousStateRef = useRef<RecipientState | null>(null);

  // Stable callback refs to prevent re-renders/infinite loops
  const onRecipientsChangeRef = useRef<typeof onRecipientsChange>();
  const onRecipientsErrorRef = useRef<typeof onRecipientsError>();

  useEffect(() => {
    onRecipientsChangeRef.current = onRecipientsChange;
  }, [onRecipientsChange]);

  useEffect(() => {
    onRecipientsErrorRef.current = onRecipientsError;
  }, [onRecipientsError]);
  const loadRecipientsWithOverrides = useCallback(async () => {
    if (!enabled || !orderData || !orderData.store || !emailType) {
      if (aliveRef.current) {
        setRecipientState({
          defaultRecipients: [],
          customRecipients: [],
          removedDefaults: [],
          finalRecipients: []
        });
        setSource('');
        setRecipientsReady(true);
        setResolveError(undefined);
        
        // Emit change even for empty state
        if (onRecipientsChangeRef.current) {
          onRecipientsChangeRef.current(0, true, false);
          lastEmittedCountRef.current = 0;
          lastEmittedReadyRef.current = true;
        }
      }
      return;
    }

    // Check cache validity
    const now = Date.now();
    if (cacheTime > 0 && (now - lastFetchRef.current) < cacheTime) {
      return;
    }

    if (aliveRef.current) {
      setLoading(true);
      setError(null);
      setResolveError(undefined);
      
      // Emit loading state immediately
      if (onRecipientsChangeRef.current) {
        onRecipientsChangeRef.current(lastEmittedCountRef.current, false, true);
        lastEmittedReadyRef.current = false;
      }
    }

    try {
      if (process.env.NODE_ENV !== 'production') {
        console.log("📧 HOOK - Loading recipients with overrides", {
          store: orderData.store,
          emailType,
          templateId,
          orderId
        });
      }

      const result = await emailRecipientManagementService.loadRecipientsWithOverrides(
        orderData,
        emailType,
        templateId,
        orderId
      );

      if (aliveRef.current) {
        setRecipientState(result);
        setSource('management_service');
        setRecipientsReady(true);
        lastFetchRef.current = now;
        
        // Emit successful resolution
        const count = result.finalRecipients.length;
        if (onRecipientsChangeRef.current && (count !== lastEmittedCountRef.current || !lastEmittedReadyRef.current)) {
          onRecipientsChangeRef.current(count, true, false);
          lastEmittedCountRef.current = count;
          lastEmittedReadyRef.current = true;
        }
      }

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load recipients');
      
      if (process.env.NODE_ENV !== 'production') {
        console.error('❌ HOOK - Error loading recipients:', error);
      }
      
      if (aliveRef.current) {
        setError(error.message);
        setResolveError(error);
        setRecipientsReady(true); // Ready but with error
        setRecipientState({
          defaultRecipients: [],
          customRecipients: [],
          removedDefaults: [],
          finalRecipients: []
        });
        setSource('');
        
        // Emit error state
        if (onRecipientsChangeRef.current) {
          onRecipientsChangeRef.current(0, true, false);
          lastEmittedCountRef.current = 0;
          lastEmittedReadyRef.current = true;
        }
        
        if (onRecipientsErrorRef.current) {
          onRecipientsErrorRef.current(error);
        }
      }
    } finally {
      if (aliveRef.current) {
        setLoading(false);
      }
    }
  }, [key?.storeId || orderData?.store, key?.plant || orderData?.plant, key?.emailType || emailType, key?.overridesHash, enabled, cacheTime, templateId, orderId]);

  // Initial fetch and dependency updates
  useEffect(() => {
    if (enabled && orderData?.store && emailType) {
      loadRecipientsWithOverrides();
    }
  }, [loadRecipientsWithOverrides]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      aliveRef.current = false;
    };
  }, []);

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
    lastFetchRef.current = 0; // Force cache invalidation
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
    resolveError,
    source,
    recipientCount: recipientState.finalRecipients.length,
    hasRecipients: recipientState.finalRecipients.length > 0,
    recipientsReady,
    
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