// supabase/functions/get-stores/index.ts
// Purpose: Server-to-server proxy for fetching store data from OT
// Security: Uses OT service role, never exposes keys to frontend

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

type StoreRow = { label: string; store_ref: string; plant: string };

const OT_URL = Deno.env.get("OT_SUPABASE_URL");
const OT_SERVICE_ROLE_KEY = Deno.env.get("OT_SERVICE_ROLE_KEY");

if (!OT_URL || !OT_SERVICE_ROLE_KEY) {
  console.error("[get-stores] Missing OT_SUPABASE_URL or OT_SERVICE_ROLE_KEY");
}

serve(async (req) => {
  const origin = req.headers.get("origin") ?? "*";

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    if (!OT_URL || !OT_SERVICE_ROLE_KEY) {
      return json({ error: "Missing OT environment variables" }, 500, origin);
    }

    const res = await fetch(`${OT_URL}/rest/v1/ordering_store_list?select=label,store_ref,plant&order=label.asc`, {
      headers: {
        apikey: OT_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${OT_SERVICE_ROLE_KEY}`,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[get-stores] OT query failed:", res.status, errText);
      return json({ error: "OT request failed", status: res.status }, 502, origin);
    }

    const rows = (await res.json()) as StoreRow[];
    return json({ data: rows }, 200, origin);
  } catch (err) {
    console.error("[get-stores] Unexpected error", err);
    return json({ error: "Internal server error" }, 500, origin);
  }
});

function json(body: unknown, status = 200, origin = "*") {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin,
    },
  });
}
