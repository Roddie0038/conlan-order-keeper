// REFACTORED: Thin client forwarder - NO local DB writes
// All orders submitted to OT platform via HMAC-authenticated edge function
import { supabase } from "@/integrations/supabase/client";

export type OtOrderPayload = {
  type: string; // REQUIRED top-level: "WHEEL_POWDER_COATING" | "MTO" | "TRANSFER" | "WARRANTY"
  order_number: string;
  product_number: string;
  quantity: number;
  store: string;
  plant: string;
  submitted_by_email: string;
  submitted_by_name: string;
  metadata?: Record<string, any>;
};

export type IngestOk = {
  ok: true;
  id: string;
  created_at: string;
  order_number: string;
  trace_id: string;
  project: string;
  idempotent?: boolean;
};

export type IngestFail = {
  ok: false;
  status: number;
  message: string;
  trace_id: string;
  project: string;
};

export type IngestResult = IngestOk | IngestFail;
export function isIngestFail(r: IngestResult): r is IngestFail { 
  return r.ok === false; 
}

/**
 * Submit an order to the OT platform via HMAC-authenticated forwarder.
 * This function NEVER writes to local database - it only forwards to OT.
 * 
 * @param payload - Order details including order_number for idempotency
 * @returns IngestResult - Success with order details from OT or failure with trace_id
 */
export async function submitOtOrder(payload: OtOrderPayload): Promise<IngestResult> {
  const traceId = `ordering-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  
  try {
    console.log(`🚀 [submitOtOrder] trace_id: ${traceId}, project: "Ordering", forward_to_ot: true`);
    console.log(`📦 [submitOtOrder] trace_id: ${traceId}, payload:`, payload);

    // Call the forwarder edge function (which handles HMAC signing)
    const { data, error } = await supabase.functions.invoke("forward-to-ot", {
      body: payload,
      headers: {
        "x-idempotency-key": payload.order_number,
        "x-trace-id": traceId,
      },
    });

    if (error) {
      console.error(`❌ [submitOtOrder] trace_id: ${traceId}, edge function error:`, error);
      return {
        ok: false,
        status: error.status || 500,
        message: error.message || "Unknown error",
        trace_id: traceId,
        project: "Ordering",
      };
    }

    // Check if OT returned an error
    if (data?.status === "error") {
      console.error(`❌ [submitOtOrder] trace_id: ${traceId}, OT returned error:`, data);
      return {
        ok: false,
        status: data.error?.code === "VALIDATION_ERROR" ? 400 : 500,
        message: data.error?.message || "OT platform error",
        trace_id: data.trace_id || traceId,
        project: data.project || "OT",
      };
    }

    // Success - return OT response
    console.log(`✅ [submitOtOrder] trace_id: ${traceId}, OT success:`, data);
    return {
      ok: true,
      id: data?.id ?? "",
      created_at: data?.created_at ?? "",
      order_number: data?.order_number ?? payload.order_number,
      trace_id: data?.trace_id || traceId,
      project: data?.project || "OT",
      idempotent: data?.idempotent ?? false,
    };
  } catch (err: any) {
    console.error(`❌ [submitOtOrder] trace_id: ${traceId}, unexpected error:`, err);
    return {
      ok: false,
      status: 0,
      message: err.message || String(err),
      trace_id: traceId,
      project: "Ordering",
    };
  }
}
