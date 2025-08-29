import { supabase } from "@/integrations/supabase/client";
import type { RegionalOrderPayload } from '@/types/regionalOrder';
import { mapRegionalOrderPayloadToPhase1 } from "./payloadAdapters";

export async function submitRegionalOrder(payload: RegionalOrderPayload) {
  console.log('Submitting regional order:', payload);
  
  const safePayload = mapRegionalOrderPayloadToPhase1(payload);

  const { data, error } = await supabase.functions.invoke("handleOrdersPost", {
    body: safePayload,
  });

  if (error) {
    console.error('Edge function error:', error);
    throw new Error(error.message || 'Submit failed');
  }

  return data;
}