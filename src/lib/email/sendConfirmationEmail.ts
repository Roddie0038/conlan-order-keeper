import { supabase } from '@/integrations/supabase/client';

export type ConfirmationPayload = {
  order_id: string | number;
  store_number: string;
  store_name: string;
  plant: string; // code like 097
  submitted_by_name: string;
  submitted_by_email: string;
  timestamp: string; // MM/DD/YYYY hh:mm AM/PM
  product_number: string | undefined;
  quantity: number | undefined;
  description: string | undefined;
  notes: string | undefined;
};

/**
 * Sends a single-recipient confirmation email via the existing ordering-confirmation-email edge function.
 * - No recipient lookups. Passes recipients: [submitted_by_email] to avoid fallbacks.
 * - Swallows errors to avoid blocking UX.
 */
export async function sendConfirmationEmail(p: ConfirmationPayload): Promise<void> {
  try {
    const to = [p.submitted_by_email].filter(Boolean) as string[];
    if (to.length !== 1) return; // safety

    // Build body expected by the edge function. It accepts extra fields safely.
    const body = {
      order_type: 'confirmation',
      order_id: String(p.order_id),
      store_number: p.store_number,
      store_name: p.store_name,
      plant: p.plant,
      // Edge function expects these names; include both to satisfy spec and function
      name: p.submitted_by_name,
      email: p.submitted_by_email,
      submitted_by_name: p.submitted_by_name,
      submitted_by_email: p.submitted_by_email,
      timestamp: p.timestamp,
      product_number: p.product_number,
      quantity: p.quantity,
      description: p.description ?? '',
      notes: p.notes ?? '',
      recipients: to,
    };

    const { error } = await supabase.functions.invoke('ordering-confirmation-email', {
      body,
    });

    if (error) {
      // Non-blocking: log and continue
      console.warn('Confirmation email invoke error:', error);
    }
  } catch (err) {
    console.warn('Confirmation email failed:', err);
  }
}
