/**
 * useEmailRecipientsPreview Hook
 * Custom hook for real-time email recipient preview functionality
 * Provides centralized recipient lookup with caching and error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { resolveEmailRecipients } from '@/services/emailRecipientResolver';
import type { EmailRecipient, EmailType, OrderDataInput } from '@/services/emailRecipientResolver';

interface UseEmailRecipientsPreviewOptions {
  enabled?: boolean;
  refetchInterval?: number;
  cacheTime?: number;
}

interface UseEmailRecipientsPreviewReturn {
  recipients: EmailRecipient[];
  loading: boolean;
  error: string | null;
  source: string;
  refetch: () => Promise<void>;
  recipientCount: number;
  hasRecipients: boolean;
}

export const useEmailRecipientsPreview = (
  orderData: OrderDataInput | null,
  emailType: EmailType,
  options: UseEmailRecipientsPreviewOptions = {}
): UseEmailRecipientsPreviewReturn => {
  const { enabled = true, refetchInterval, cacheTime = 5 * 60 * 1000 } = options;
  
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string>('');
  const [lastFetch, setLastFetch] = useState<number>(0);

  const fetchRecipients = useCallback(async () => {
    if (!enabled || !orderData || !orderData.store_number || !emailType) {
      setRecipients([]);
      setSource('');
      return;
    }

    // Check cache validity
    const now = Date.now();
    if (cacheTime > 0 && (now - lastFetch) < cacheTime && recipients.length > 0) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await resolveEmailRecipients(orderData, emailType);
      setRecipients(result.recipients);
      setSource(result.source);
      setLastFetch(now);
    } catch (err) {
      console.error('Error fetching email recipients:', err);
      setError(err instanceof Error ? err.message : 'Failed to load recipients');
      setRecipients([]);
      setSource('');
    } finally {
      setLoading(false);
    }
  }, [orderData, emailType, enabled, cacheTime, lastFetch, recipients.length]);

  // Initial fetch and dependency updates
  useEffect(() => {
    fetchRecipients();
  }, [fetchRecipients]);

  // Polling interval
  useEffect(() => {
    if (refetchInterval && refetchInterval > 0) {
      const interval = setInterval(fetchRecipients, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchRecipients, refetchInterval]);

  const refetch = useCallback(async () => {
    setLastFetch(0); // Force cache invalidation
    await fetchRecipients();
  }, [fetchRecipients]);

  return {
    recipients,
    loading,
    error,
    source,
    refetch,
    recipientCount: recipients.length,
    hasRecipients: recipients.length > 0
  };
};