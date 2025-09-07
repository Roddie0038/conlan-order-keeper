import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CONTROLLER = Deno.env.get("NOTIFICATION_CONTROLLER_URL");
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");

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

type CompletionPayload = {
  order_id?: string | number;
  invoice_number?: string | null;
  store_number?: string;
  plant_id?: string;
  dry_run?: boolean;
  metadata?: Record<string, unknown>;
};

serve(async (req) => {
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
    if (!CONTROLLER) {
      return new Response(JSON.stringify({ error: "NOTIFICATION_CONTROLLER_URL missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = (await req.json()) as CompletionPayload;

    // Enforce invoice gate
    let invoice = payload.invoice_number ?? null;

    if (!invoice) {
      const orderId = payload.order_id ?? null;
      if (!orderId) {
        return new Response(JSON.stringify({ error: "order_id or invoice_number required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!SUPABASE_URL || !SERVICE_ROLE) {
        return new Response(JSON.stringify({ error: "Supabase env missing for invoice lookup" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
      const { data, error } = await supabase
        .from("orders")
        .select("invoice_number")
        .eq("id", orderId)
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: "order_lookup_failed", details: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      invoice = (data as any)?.invoice_number ?? null;
    }

    if (!invoice) {
      return new Response(JSON.stringify({ error: "invoice_number_required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const storeNumber = payload.store_number;
    const plantId = payload.plant_id ?? (payload as any).plant;
    
    const body = {
      type: "order_completion_notification",
      order_id: payload.order_id,
      invoice_number: invoice,
      store_number: storeNumber,
      store_name_norm: norm(storeNumber),
      plant_id: plantId,
      metadata: payload.metadata ?? payload,
      options: { dry_run: !!payload.dry_run, enforce_scopes: true, admin_override: false, source: "send-order-completion-email" },
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
