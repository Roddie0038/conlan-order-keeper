/**
 * DEPRECATED - Phase 2: Use otNotificationService instead
 * This service routes through legacy controller but will be removed
 */

import { supabase } from '@/integrations/supabase/client';
import { otNotificationService } from '@/services/otNotification';

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
 * DEPRECATED: Use otNotificationService.sendTransferOrderNotification() instead
 * Sends confirmation via ot-notify → OT controller pipeline
 * Swallows errors to avoid blocking UX.
 */
export async function sendConfirmationEmail(p: ConfirmationPayload): Promise<void> {
  
  console.warn('⚠️ DEPRECATED - sendConfirmationEmail lib. Use otNotificationService instead.');
  
  try {
    const to = [p.submitted_by_email].filter(Boolean) as string[];
    if (to.length !== 1) return; // safety

    // Route through new otNotificationService  
    await otNotificationService.sendNotification({
      email_type: 'transfer_confirmation',
      store_number: p.store_number,
      plant_code: p.plant,
      idempotency_key: `legacy_lib_${p.order_id}_${Date.now()}`,
      admin_override: false,
      payload: {
        order_id: String(p.order_id),
        store_name: p.store_name,
        name: p.submitted_by_name,
        email: p.submitted_by_email,
        timestamp: p.timestamp,
        product_number: p.product_number,
        quantity: p.quantity,
        description: p.description ?? '',
        notes: p.notes ?? '',
        recipients: to
      }
    });

  } catch (error) {
    console.warn('❌ DEPRECATED CONFIRMATION EMAIL - Error:', error);
  }
}
