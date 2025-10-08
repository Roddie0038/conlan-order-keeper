// src/services/submitOtOrder.ts
// Ordering → OT edge function caller with env validation, timeout, and single retry.

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
};

export type IngestFail = {
  ok: false;
  status: number;
  message: string;
};

export type IngestResult = IngestOk | IngestFail;

// Type guard for cleaner narrowing
export function isIngestFail(r: IngestResult): r is IngestFail {
  return r.ok === false;
}

// ---- Env helpers ----
function getEnv(name: string): string {
  const v = import.meta.env[name as never] as string | undefined;
  if (!v || !String(v).trim()) {
    throw new Error(`Missing or empty env: ${name}`);
  }
  return v;
}

const OT_URL = getEnv("VITE_OT_SUPABASE_URL");
const OT_ANON = getEnv("VITE_OT_SUPABASE_ANON_KEY");
const INTERNAL = getEnv("VITE_INTERNAL_SECRET");

// ---- Fetch helper with timeout ----
async function fetchWithTimeout(url: string, init: RequestInit, ms = 20000): Promise<Response> {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(to);
  }
}

// ---- Main submitter with single retry on 429/5xx ----
export async function submitOtOrder(payload: OtOrderPayload): Promise<IngestResult> {
  const endpoint = `${OT_URL}/functions/v1/ingest-ot-order`;

  const headers: Record<string, string> = {
    apikey: OT_ANON,
    Authorization: `Bearer ${OT_ANON}`,
    "x-internal-secret": INTERNAL,
    "Content-Type": "application/json",
    // helps dedupe on the server if implemented
    "x-idempotency-key": payload.order_number,
  };

  const body = JSON.stringify(payload);

  // inner function to try once
  const attempt = async (): Promise<Response> => fetchWithTimeout(endpoint, { method: "POST", headers, body }, 20000);

  let res = await attempt();

  // retry once on 429 or 5xx
  if (res.status === 429 || (res.status >= 500 && res.status <= 599)) {
    const backoffMs = 400 + Math.floor(Math.random() * 400);
    console.warn(`[submitOtOrder] transient status ${res.status}; retrying after ${backoffMs}ms`);
    await new Promise((r) => setTimeout(r, backoffMs));
    res = await attempt();
  }

  if (!res.ok) {
    let message = "";
    try {
      const j = await res.json();
      message = (j && (j.error || j.message)) || JSON.stringify(j);
    } catch {
      try {
        message = await res.text();
      } catch {
        message = "Unknown error";
      }
    }
    return { ok: false, status: res.status, message };
  }

  // success
  let j: any = {};
  try {
    j = await res.json();
  } catch {
    // some functions may return empty body on 201; fall back to payload data
    j = {};
  }

  return {
    ok: true,
    id: j.id ?? "",
    created_at: j.created_at ?? "",
    order_number: j.order_number ?? payload.order_number,
  };
}
