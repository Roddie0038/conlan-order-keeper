// src/server/audit/crossplant.ts
import { supabase } from '@/integrations/supabase/client';

type AuditPayload = {
  order_type: 'order' | 'mto';
  order_id?: number | null;
  user_email?: string | null;
  user_role?: string | null;
  ordering_store?: string | null;
  ordering_plant?: string | null;
  destination_plant?: string | null;
  destination_store?: string | null;
  meta?: Record<string, any> | null;
};

export async function auditCrossPlant(payload: AuditPayload) {
  try {
    await supabase.from('order_crossplant_audit').insert([{
      order_type: payload.order_type,
      order_id: payload.order_id ?? null,
      user_email: payload.user_email ?? null,
      user_role: payload.user_role ?? null,
      ordering_store: payload.ordering_store ?? null,
      ordering_plant: payload.ordering_plant ?? null,
      destination_plant: payload.destination_plant ?? null,
      destination_store: payload.destination_store ?? null,
      meta: payload.meta ?? null,
    }]);
  } catch (err) {
    // never throw; observability must not break orders
    console.warn('auditCrossPlant insert failed', err);
  }
}