// @ts-nocheck
import { supabase } from "@/integrations/supabase/client";

export interface OrderingEmailRecipient {
  id: number;
  store_number: string;
  store_name: string | null;
  recipient_email: string;
  role: string;
  email_type: string;
  is_active: boolean;
  created_at: string;
  created_by: string | null;
}

export interface OrderingEmailLog {
  id: number;
  store_number: string | null;
  recipient_email: string | null;
  email_type: string | null;
  order_type: string | null;
  order_id: string | null;
  status: string | null;
  response: string | null;
  error_details: string | null;
  created_at: string;
}

export interface CreateOrderingEmailRecipient {
  store_number: string;
  store_name?: string;
  recipient_email: string;
  role?: string;
  email_type?: string;
  is_active?: boolean;
  created_by?: string;
}

// Get all email recipients for order confirmations
export async function getOrderingEmailRecipients(): Promise<OrderingEmailRecipient[]> {
  const { data, error } = await supabase
    .from('ordering_email_recipients')
    .select('*')
    .order('store_number', { ascending: true })
    .order('recipient_email', { ascending: true });

  if (error) {
    console.error('Error fetching ordering email recipients:', error);
    throw error;
  }

  return data || [];
}

// Get email recipients for a specific store
export async function getStoreOrderingRecipients(storeNumber: string): Promise<OrderingEmailRecipient[]> {
  const { data, error } = await supabase
    .from('ordering_email_recipients')
    .select('*')
    .eq('store_number', storeNumber)
    .eq('is_active', true)
    .eq('email_type', 'order_confirmation')
    .order('recipient_email', { ascending: true });

  if (error) {
    console.error('Error fetching store ordering recipients:', error);
    throw error;
  }

  return data || [];
}

// Create new email recipient
export async function createOrderingEmailRecipient(recipient: CreateOrderingEmailRecipient): Promise<OrderingEmailRecipient> {
  const { data, error } = await supabase
    .from('ordering_email_recipients')
    .insert(recipient)
    .select()
    .single();

  if (error) {
    console.error('Error creating ordering email recipient:', error);
    throw error;
  }

  return data;
}

// Update email recipient
export async function updateOrderingEmailRecipient(id: number, updates: Partial<CreateOrderingEmailRecipient>): Promise<OrderingEmailRecipient> {
  const { data, error } = await supabase
    .from('ordering_email_recipients')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating ordering email recipient:', error);
    throw error;
  }

  return data;
}

// Delete email recipient
export async function deleteOrderingEmailRecipient(id: number): Promise<void> {
  const { error } = await supabase
    .from('ordering_email_recipients')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting ordering email recipient:', error);
    throw error;
  }
}

// Get email logs
export async function getOrderingEmailLogs(limit: number = 100): Promise<OrderingEmailLog[]> {
  const { data, error } = await supabase
    .from('ordering_email_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching ordering email logs:', error);
    throw error;
  }

  return data || [];
}

// Send order confirmation email
export async function sendOrderConfirmationEmail(orderData: {
  store_number: string;
  store_name: string;
  order_type: string;
  order_id: string;
  timestamp: string;
  name: string;
  email: string;
  quantity?: number;
  product_number?: string;
  description?: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('ordering-confirmation-email', {
      body: orderData
    });

    if (error) {
      console.error('Error sending order confirmation email:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error invoking ordering confirmation email function:', error);
    throw error;
  }
}