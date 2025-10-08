// src/services/submitOtOrder.ts
export type OtOrderPayload = {
  order_number: string;
  product_number: string;
  quantity: number;
  store: string;
  plant: string;
  submitted_by_email?: string;
  submitted_by_name?: string;
};

export type Ok = { ok: true; id: string; created_at: string; order_number: string };
export type Fail = { ok: false; status: number; message: string };

const OT_URL = import.meta.env.VITE_OT_SUPABASE_URL;
const OT_ANON = import.meta.env.VITE_OT_SUPABASE_ANON_KEY;
const INTERNAL = import.meta.env.VITE_INTERNAL_SECRET;

if (!OT_URL || !OT_ANON || !INTERNAL) {
  console.warn("⚠️ Missing one or more OT envs: VITE_OT_SUPABASE_URL / VITE_OT_SUPABASE_ANON_KEY / VITE_INTERNAL_SECRET");
}

export async function submitOtOrder(payload: OtOrderPayload): Promise<Ok | Fail> {
  const res = await fetch(`${OT_URL}/functions/v1/ingest-ot-order`, {
    method: 'POST',
    headers: {
      'apikey': OT_ANON,
      'Authorization': `Bearer ${OT_ANON}`,
      'x-internal-secret': INTERNAL,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = '';
    try { const j = await res.json(); message = j.error || JSON.stringify(j); }
    catch { message = await res.text(); }
    return { ok: false, status: res.status, message };
  }

  const j = await res.json();
  return { ok: true, id: j.id, created_at: j.created_at, order_number: j.order_number ?? payload.order_number };
}
