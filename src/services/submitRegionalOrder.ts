import { supabase } from "@/integrations/supabase/client";
import type { RegionalOrderPayload } from '@/types/regionalOrder';
import { mapRegionalOrderPayloadToPhase1 } from "./payloadAdapters";

export async function submitRegionalOrder(payload: RegionalOrderPayload) {
  // Get correlation ID from global context
  const corr = (window as any).__corrId || 'unknown';
  const tag = (stage: string, extra: any = {}) =>
    console.info(`[ORDER_SUBMIT][${corr}] ${stage}`, extra);
  
  tag('RPC_CALL', { 
    endpoint: 'handleOrdersPost', 
    items: (payload as any)?.items?.length ?? 0,
    payloadKeys: payload ? Object.keys(payload) : []
  });
  
  const safePayload = mapRegionalOrderPayloadToPhase1(payload);

  try {
    const result = await Promise.race([
      supabase.functions.invoke("handleOrdersPost", { 
        body: safePayload,
        headers: { 'x-corr-id': corr }
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('RPC timeout after 30s')), 30000)
      )
    ]);

    const { data, error } = result;

    if (error) {
      tag('RPC_FAIL', { error: error.message || 'Unknown error' });
      console.error('Edge function error:', error);
      throw new Error(error.message || 'Submit failed');
    }

    tag('RPC_OK', { dataKeys: data ? Object.keys(data) : [] });
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    tag('RPC_FAIL', { error: errorMessage });
    throw error;
  }
}