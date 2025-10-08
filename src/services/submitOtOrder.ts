// SAFE: no import-time env reads — submitOtOrder.ts
// Ordering → OT edge-function caller (lazy env), timeout, single retry, idempotency header.

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
export function isIngestFail(r: IngestResult): r is IngestFail { return r.ok === false; }

/** Read a Vite env without throwing at module load (works in preview). */
function readViteEnv(name: string): string | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v = (import.meta as any)?.env?.[name];
    return typeof v === "string" ? v : undefined;
  } catch { return undefined; }
}

/** Optional browser global escape hatch: window.__ENV__ or window.ENV */
function readWindowEnv(name: string): string | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = (globalThis as any) ?? (window as any);
    const val = (w?.__ENV__?.[name]) ?? (w?.ENV?.[name]) ?? undefined;
    return typeof val === "string" ? val : undefined;
  } catch { return undefined; }
}

/** Resolve OT config at call-time. Never throws; returns missing list if incomplete. */
function resolveOtConfig():
  | { ok: true; url: string; anon: string; secret: string }
  | { ok: false; missing: string[] } {
  const url   = readViteEnv("VITE_OT_SUPABASE_URL")      || readWindowEnv("VITE_OT_SUPABASE_URL");
  const anon  = readViteEnv("VITE_OT_SUPABASE_ANON_KEY") || readWindowEnv("VITE_OT_SUPABASE_ANON_KEY");
  const secret= readViteEnv("VITE_INTERNAL_SECRET")      || readWindowEnv("VITE_INTERNAL_SECRET");
  if (!url || !anon || !secret) {
    const missing: string[] = [];
    if (!url)    missing.push("VITE_OT_SUPABASE_URL");
    if (!anon)   missing.push("VITE_OT_SUPABASE_ANON_KEY");
    if (!secret) missing.push("VITE_INTERNAL_SECRET");
    return { ok: false, missing };
  }
  return { ok: true, url, anon, secret };
}

/** fetch with timeout helper */
async function fetchWithTimeout(url: string, init: RequestInit, ms = 20000): Promise<Response> {
  const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), ms);
  try { return await fetch(url, { ...init, signal: ctrl.signal }); }
  finally { clearTimeout(t); }
}

/**
 * Main submitter: never crashes the app on missing env.
 * - If config missing → returns { ok:false, status:0, message: "Missing config: …" }.
 * - On 429/5xx → retry once.
 * - Accepts 200/201 as success; safe JSON parse.
 */
export async function submitOtOrder(payload: OtOrderPayload): Promise<IngestResult> {
  const cfg = resolveOtConfig();
  if (!('ok' in cfg) || !cfg.ok) {
    const msg = `Missing config: ${(cfg as any).missing?.join(", ") || "unknown"}. Check .env.local locally and host env in preview.`;
    console.error("[submitOtOrder] " + msg);
    return { ok: false, status: 0, message: msg };
  }

  const endpoint = `${cfg.url}/functions/v1/ingest-ot-order`;
  const headers: Record<string, string> = {
    apikey: cfg.anon,
    Authorization: `Bearer ${cfg.anon}`,
    "x-internal-secret": cfg.secret,
    "Content-Type": "application/json",
    "x-idempotency-key": payload.order_number,
  };
  const body = JSON.stringify(payload);

  const attempt = () => fetchWithTimeout(endpoint, { method: "POST", headers, body }, 20000);

  let res: Response;
  try { res = await attempt(); }
  catch (e: any) { return { ok: false, status: 0, message: `Network error: ${e?.message || String(e)}` }; }

  if (res.status === 429 || (res.status >= 500 && res.status <= 599)) {
    const backoff = 400 + Math.floor(Math.random() * 400);
    console.warn(`[submitOtOrder] transient ${res.status}; retrying after ${backoff}ms`);
    await new Promise(r => setTimeout(r, backoff));
    try { res = await attempt(); }
    catch (e: any) { return { ok: false, status: 0, message: `Network error after retry: ${e?.message || String(e)}` }; }
  }

  if (!res.ok) {
    let message = "";
    try { const j = await res.json(); message = (j?.error || j?.message) ?? JSON.stringify(j); }
    catch { try { message = await res.text(); } catch { message = "Unknown error"; } }
    return { ok: false, status: res.status, message };
  }

  let data: any = {};
  try { data = await res.json(); } catch { data = {}; }

  return {
    ok: true,
    id: data.id ?? "",
    created_at: data.created_at ?? "",
    order_number: data.order_number ?? payload.order_number,
  };
}
