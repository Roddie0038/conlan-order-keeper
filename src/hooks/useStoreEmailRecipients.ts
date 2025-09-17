/**
 * Hook for displaying Recipients Management preview aligned with store_email_recipients
 * Shows exactly what the SQL resolve_email_recipients function will return
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import type { EmailType } from '@/services/emailRecipientResolver';

export interface StoreEmailRecipient {
  email: string;
  name?: string;
  role: string;
  store?: string;
  source: 'store_email_recipients' | 'ot_platform_users';
}

interface UseStoreEmailRecipientsReturn {
  recipients: StoreEmailRecipient[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  recipientCount: number;
  hasRecipients: boolean;
}

/**
 * Hook that mirrors the SQL resolve_email_recipients function
 * This ensures the frontend shows exactly what recipients will be used
 */
export const useStoreEmailRecipients = (
  storeNumber: string | null,
  emailType: EmailType,
  enabled: boolean = true
): UseStoreEmailRecipientsReturn => {
  const [recipients, setRecipients] = useState<StoreEmailRecipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecipients = useCallback(async () => {
    if (!enabled || !storeNumber || !emailType) {
      setRecipients([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 STORE RECIPIENTS - Calling SQL resolve_email_recipients', {
        store: storeNumber,
        emailType
      });

      // Extract just the numeric part for the SQL function
      const numericStore = storeNumber.replace(/\D/g, '');
      
      // Map emailType to the SQL function's expected format
      const sqlEmailType = emailType === 'customer_complaints' ? 'customer_complaints' : emailType;
      
      const { data: sqlRecipients, error: sqlError } = await supabase.rpc(
        'resolve_email_recipients', 
        { 
          p_store: numericStore, 
          p_type: sqlEmailType 
        }
      );

      if (sqlError) {
        console.error('❌ STORE RECIPIENTS - SQL error:', sqlError);
        setError(`Failed to load recipients: ${sqlError.message}`);
        setRecipients([]);
        return;
      }

      const mappedRecipients: StoreEmailRecipient[] = (sqlRecipients || []).map((r: any) => ({
        email: r.recipient_email || r.email,
        name: r.recipient_name || r.store_name || r.full_name,
        role: r.recipient_role || r.role,
        store: r.store_name || storeNumber,
        source: r.recipient_email ? 'store_email_recipients' : 'ot_platform_users'
      }));

      console.log('✅ STORE RECIPIENTS - Loaded', {
        count: mappedRecipients.length,
        recipients: mappedRecipients.map(r => ({ email: r.email, role: r.role, source: r.source }))
      });

      setRecipients(mappedRecipients);

    } catch (err) {
      console.error('❌ STORE RECIPIENTS - Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load recipients');
      setRecipients([]);
    } finally {
      setLoading(false);
    }
  }, [storeNumber, emailType, enabled]);

  useEffect(() => {
    loadRecipients();
  }, [loadRecipients]);

  const refetch = useCallback(async () => {
    await loadRecipients();
  }, [loadRecipients]);

  return {
    recipients,
    loading,
    error,
    refetch,
    recipientCount: recipients.length,
    hasRecipients: recipients.length > 0
  };
};