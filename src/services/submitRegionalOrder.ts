import { supabase } from "@/integrations/supabase/client";
import type { RegionalOrderPayload } from '@/types/regionalOrder';

export async function submitRegionalOrder(payload: RegionalOrderPayload) {
  console.log('Submitting regional order:', payload);
  
  const { data, error } = await supabase.functions.invoke('create-regional-order', {
    body: payload,
  });

  if (error) {
    console.error('Edge function error:', error);
    throw new Error(error.message || 'Submit failed');
  }

  if (data?.conflict) {
    return { ok: true, conflict: true, ...data };
  }

  return data;
}