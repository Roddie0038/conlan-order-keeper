import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

type MtoEvent = {
  order_id: number | string;
  event: "created" | "updated" | "status_changed" | "approved" | "completed";
  store_number?: string;
  plant_id?: string;
  region_id?: string;
  metadata?: Record<string, unknown>;
  dry_run?: boolean;
};

const CONTROLLER = Deno.env.get("NOTIFICATION_CONTROLLER_URL");
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const MAP: Record<string,string> = {
  "022":"Fort Worth 022","027":"Grand Prairie 027","028":"Houston 028","029":"San Antonio 029",
  "030":"Oklahoma City 030","032":"Little Rock 032","033":"Kansas City 033","036":"Tulsa 036",
  "039":"Austin 039","041":"Detroit 041","042":"Toledo 042","097":"Grand Prairie 097",
  "098":"Romulus 098","099":"Mulberry 099",
};
const norm = (s?:string)=> s ? (MAP[s.padStart(3,"0")] ?? s) : undefined;

serve(async (req)=>{
  if (req.method!=="POST") return new Response('{"error":"Method not allowed"}',{status:405});
  try {
    const p = (await req.json()) as MtoEvent;
    if (!CONTROLLER) return new Response('{"error":"NOTIFICATION_CONTROLLER_URL missing"}',{status:500});
    const body = {
      type: "mto_notification",
      event: p.event, order_id: p.order_id,
      store_number: p.store_number, store_name_norm: norm(p.store_number),
      plant_id: p.plant_id, region_id: p.region_id, metadata: p.metadata ?? {},
      options: { dry_run: !!p.dry_run, enforce_scopes: true, admin_override: false, source: "mto-notification" }
    };
    const r = await fetch(CONTROLLER, {
      method:"POST",
      headers:{ "Content-Type":"application/json", Authorization: SERVICE_ROLE?`Bearer ${SERVICE_ROLE}`:"" },
      body: JSON.stringify(body)
    });
    const text = await r.text();
    return r.ok ? new Response(text,{status:200})
                : new Response(JSON.stringify({error:"controller_failed",status:r.status,body:text}),{status:502});
  } catch(e){ return new Response(JSON.stringify({error:"unhandled_exception",message:String(e)}),{status:500}); }
});
