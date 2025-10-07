// src/lib/ingestOtOrder.ts
export type OtOrderPayload = {
  order_number: string;
  product_number: string;
  quantity: number;
  store: string;           // e.g., "Grand Prairie 027"
  plant: string;           // e.g., "Plant 097"
  submitted_by_email: string;
  submitted_by_name: string;
};

export type OtOrderResult =
  | { ok: true; id: string; created_at: string }
  | { ok: false; status: number; message: string };

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;
const INTERNAL_SECRET = import.meta.env.VITE_INTERNAL_SECRET ?? import.meta.env.VITE_INTERNAL_SECRET_FALLBACK ?? (import.meta as any).env?.INTERNAL_SECRET;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Submits an OT order to the Edge Function with retries.
 * Retries on 429/5xx with exponential backoff (200ms, 600ms, 1800ms).
 */
export async function submitOtOrder(
  payload: OtOrderPayload,
  { retries = 3 }: { retries?: number } = {}
): Promise<OtOrderResult> {
  if (!SUPABASE_URL || !ANON || !INTERNAL_SECRET) {
    return {
      ok: false,
      status: 0,
      message: "Missing env: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY / VITE_INTERNAL_SECRET",
    };
  }

  let attempt = 0;
  let delay = 200;

  while (true) {
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/ingest-ot-order`, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "apikey": ANON,
          "Authorization": `Bearer ${ANON}`,
          "x-internal-secret": INTERNAL_SECRET,
        },
        body: JSON.stringify({
          ...payload,
          product_number: payload.product_number, // Pass exactly as typed, no modification
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return { ok: true, id: data.id, created_at: data.created_at };
      }

      // Retry on typical transient statuses
      if ([429, 500, 502, 503, 504].includes(res.status) && attempt < retries) {
        attempt += 1;
        await sleep(delay);
        delay *= 3;
        continue;
      }

      const text = await res.text().catch(() => "");
      return { ok: false, status: res.status, message: text || res.statusText };
    } catch (err: any) {
      if (attempt < retries) {
        attempt += 1;
        await sleep(delay);
        delay *= 3;
        continue;
      }
      return { ok: false, status: 0, message: err?.message ?? "Network error" };
    }
  }
}
