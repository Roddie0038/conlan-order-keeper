// JWT-based order submission to OT edge function
// Uses supabase.functions.invoke with automatic JWT auth
import { supabase } from "@/integrations/supabase/client";

export type OtOrderPayload = {
  order_number: string;
  product_number: string;
  quantity: number;
  store: string;
  plant: string;
  submitted_by_email: string;
  submitted_by_name: string;
};

export type IngestOk = {
  ok: true;
  id: string;
  created_at: string;
  order_number: string;
  idempotent?: boolean;
};

export type IngestFail = {
  ok: false;
  status: number;
  message: string;
};

export type IngestResult = IngestOk | IngestFail;
export function isIngestFail(r: IngestResult): r is IngestFail { 
  return r.ok === false; 
}

/**
 * Submit an order to the OT edge function using JWT authentication.
 * Requires an active Supabase session.
 * 
 * @param payload - Order details including order_number for idempotency
 * @returns IngestResult - Success with order details or failure with error message
 */
export async function submitOtOrder(payload: OtOrderPayload): Promise<IngestResult> {
  try {
    // Verify we have an active session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return {
        ok: false,
        status: 401,
        message: "Please sign in to submit orders.",
      };
    }

    // Call edge function with JWT (automatically included by SDK)
    const { data, error } = await supabase.functions.invoke("ingest-ot-order", {
      body: payload,
      headers: {
        "x-idempotency-key": payload.order_number,
      },
    });

    if (error) {
      console.error("[submitOtOrder] Edge function error:", error);
      return {
        ok: false,
        status: error.status || 500,
        message: error.message || "Unknown error",
      };
    }

    // Return success with idempotency flag if present
    return {
      ok: true,
      id: data?.id ?? "",
      created_at: data?.created_at ?? "",
      order_number: data?.order_number ?? payload.order_number,
      idempotent: data?.idempotent ?? false,
    };
  } catch (err: any) {
    console.error("[submitOtOrder] Unexpected error:", err);
    return {
      ok: false,
      status: 0,
      message: err.message || String(err),
    };
  }
}
