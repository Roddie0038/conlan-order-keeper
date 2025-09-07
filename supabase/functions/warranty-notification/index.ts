import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const CONTROLLER = Deno.env.get("NOTIFICATION_CONTROLLER_URL");
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const MAP: Record<string,string> = {
  "022":"Fort Worth 022","027":"Grand Prairie 027","028":"Houston 028","029":"San Antonio 029",
  "030":"Oklahoma City 030","032":"Little Rock 032","033":"Kansas City 033","036":"Tulsa 036",
  "039":"Austin 039","041":"Detroit 041","042":"Toledo 042","097":"Grand Prairie 097",
  "098":"Romulus 098","099":"Mulberry 099",
};
const norm = (s?:string)=> s ? (MAP[s.padStart(3,"0")] ?? s) : undefined;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type WarrantyPayload = Record<string, unknown> & {
  order_id?: string | number;
  store_number?: string;
  plant_id?: string;
  dry_run?: boolean;
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const payload = (await req.json()) as WarrantyPayload;

    if (!CONTROLLER) {
      return new Response(JSON.stringify({ error: "NOTIFICATION_CONTROLLER_URL missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const storeNumber = payload.store_number ?? (payload as any).store;
    const plantId = payload.plant_id ?? (payload as any).plant;
    
    const body = {
      type: "warranty_notification",
      order_id: payload.order_id ?? (payload as any).orderId,
      store_number: storeNumber,
      store_name_norm: norm(storeNumber),
      plant_id: plantId,
      metadata: payload,
      options: { dry_run: !!payload.dry_run, enforce_scopes: true, admin_override: false, source: "warranty-notification" },
    };

    const r = await fetch(CONTROLLER, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: SERVICE_ROLE ? `Bearer ${SERVICE_ROLE}` : "",
      },
      body: JSON.stringify(body),
    });

    const text = await r.text();

    return new Response(text, {
      status: r.ok ? 200 : 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "unhandled_exception", message: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
