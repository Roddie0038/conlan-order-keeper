/**
 * Phase 7: Recipient Audit Hook
 * Hook for managing recipient action logs and audit trail
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RecipientActionLog {
  id: string;
  action_type: string;
  email_type: string;
  recipient_email: string;
  recipient_name: string | null;
  recipient_role: string | null;
  store_number: string;
  plant: string | null;
  template_id: string | null;
  order_id: string | null;
  performed_by_email: string;
  performed_by_name: string | null;
  metadata: any;
  created_at: string;
}

interface AuditFilters {
  action_type?: string;
  email_type?: string;
  store_number?: string;
  performed_by?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export const useRecipientAudit = () => {
  const [logs, setLogs] = useState<RecipientActionLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load audit logs with optional filters
   */
  const loadLogs = useCallback(async (filters: AuditFilters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('recipient_action_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      // Apply filters
      if (filters.action_type) {
        query = query.eq('action_type', filters.action_type);
      }
      if (filters.email_type) {
        query = query.eq('email_type', filters.email_type);
      }
      if (filters.store_number) {
        query = query.eq('store_number', filters.store_number);
      }
      if (filters.performed_by) {
        query = query.ilike('performed_by_email', `%${filters.performed_by}%`);
      }
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }
      if (filters.search) {
        query = query.or(`recipient_email.ilike.%${filters.search}%,recipient_name.ilike.%${filters.search}%`);
      }

      const { data, error: queryError } = await query;

      if (queryError) {
        throw queryError;
      }

      setLogs(data || []);
    } catch (err) {
      console.error('Error loading audit logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Log a recipient action for audit trail
   */
  const logAction = useCallback(async (actionData: {
    action_type: 'add' | 'remove' | 'reset';
    email_type: string;
    recipient_email: string;
    recipient_name?: string;
    recipient_role: string;
    store_number: string;
    plant?: string;
    template_id?: string;
    order_id?: string;
    performed_by_email: string;
    performed_by_name?: string;
    metadata?: any;
  }) => {
    try {
      const { data, error: insertError } = await supabase
        .from('recipient_action_logs')
        .insert({
          action_type: actionData.action_type,
          email_type: actionData.email_type,
          recipient_email: actionData.recipient_email,
          recipient_name: actionData.recipient_name || null,
          recipient_role: actionData.recipient_role,
          store_number: actionData.store_number,
          plant: actionData.plant || null,
          template_id: actionData.template_id || null,
          order_id: actionData.order_id || null,
          performed_by_email: actionData.performed_by_email,
          performed_by_name: actionData.performed_by_name || null,
          metadata: actionData.metadata || {}
        })
        .select('id')
        .single();

      if (insertError) {
        throw insertError;
      }

      return { success: true, logId: data.id };
    } catch (err) {
      console.error('Error logging action:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to log action' 
      };
    }
  }, []);

  /**
   * Export logs to CSV format
   */
  const exportToCSV = useCallback(() => {
    const headers = [
      'Timestamp',
      'Action',
      'Email Type',
      'Recipient Email',
      'Recipient Name',
      'Role',
      'Store',
      'Plant',
      'Performed By',
      'Template ID',
      'Order ID'
    ];

    const rows = logs.map(log => [
      new Date(log.created_at).toLocaleString(),
      log.action_type,
      log.email_type,
      log.recipient_email,
      log.recipient_name || '',
      log.recipient_role || '',
      log.store_number,
      log.plant || '',
      `${log.performed_by_name || 'Unknown'} (${log.performed_by_email})`,
      log.template_id || '',
      log.order_id || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recipient_audit_log_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [logs]);

  return {
    logs,
    loading,
    error,
    loadLogs,
    logAction,
    exportToCSV
  };
};