// supabase/functions/wheel-notification/index.ts
// Deno edge function – self-contained, std-only, no npm dependencies.
// Purpose: accept a wheel order notification payload, log it, and return 200.
// Later we can re-enable emailing via notification-controller/mailer when stable.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const ALLOWED_ORIGINS = ["*"]; // tighten later if needed

function corsHeaders(origin: string | null) {
  const allowOrigin = origin && origin !== "null" ? origin : "*";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes("*")
      ? "*"
      : allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

type WheelNotificationPayload = {
  id?: string;
  name?: string;
  email?: string;
  store?: string;
  plant?: string;
  quantity?: number;
  desiredcolor?: string;
  wheelsize?: string;
  wheelmaterial?: string;
  wheeltype?: string;
  handholes?: number;
  status?: string;
  ordertype?: string;      // expect "WHEEL_POWDER_COATING"
  submitted_at?: string;   // server timestamp coming from insert/edge
  notes?: string;
  description?: string;
  store_color?: string;    // Store color for pallet painting
};

function ok(body: unknown, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "content-type": "application/json",
      ...corsHeaders(origin),
    },
  });
}

function bad(msg: string, origin: string | null, code = 400) {
  return new Response(JSON.stringify({ error: msg }), {
    status: code,
    headers: {
      "content-type": "application/json",
      ...corsHeaders(origin),
    },
  });
}

serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return bad("Method not allowed", origin, 405);
  }

  let payload: WheelNotificationPayload;
  try {
    payload = (await req.json()) as WheelNotificationPayload;
  } catch (_err) {
    return bad("Invalid JSON body", origin, 400);
  }

  // Minimal required fields for a meaningful wheel notification
  const required: (keyof WheelNotificationPayload)[] = [
    "plant",
    "store",
    "quantity",
    "desiredcolor",
    "wheelsize",
    "wheelmaterial",
    "wheeltype",
    "ordertype",
  ];

  const missing = required.filter((k) => payload[k] === undefined || payload[k] === null || payload[k] === "");
  if (missing.length) {
    return bad(`Missing required fields: ${missing.join(", ")}`, origin, 422);
  }

  // Normalize + log (email sending intentionally disabled for stability)
  const normalized = {
    id: payload.id ?? crypto.randomUUID(),
    plant: payload.plant,
    store: payload.store,
    orderType: payload.ordertype, // <— DO NOT rename; OT expects ordertype in DB, orderType for email templates
    quantity: Number(payload.quantity ?? 0),
    wheel: {
      material: payload.wheelmaterial,
      type: payload.wheeltype,
      size: payload.wheelsize,
      handHoles: Number(payload.handholes ?? 0),
      color: payload.desiredcolor,
    },
    storeColor: payload.store_color, // Forward store color for pallet painting
    submittedAt: payload.submitted_at ?? new Date().toISOString(),
    status: payload.status ?? "open",
    description: payload.description ?? "",
    notes: payload.notes ?? "",
    submitter: {
      name: payload.name ?? "",
      email: payload.email ?? "",
    },
  };

  // For now: just log and return success so builds stay stable.
  console.log("🛞 WHEEL-NOTIFICATION received:", JSON.stringify(normalized));

  // When ready to re-enable emails, call notification-controller here (with timeout & try/catch).

  return ok({ success: true, id: normalized.id }, origin);
});