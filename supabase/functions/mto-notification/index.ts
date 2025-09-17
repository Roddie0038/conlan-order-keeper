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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response('{"error":"Method not allowed"}', { status: 405, headers: corsHeaders });
  }

  try {
    const mtoEvent = (await req.json()) as MtoEvent;
    
    console.log("📧 MTO NOTIFICATION - Processing event:", mtoEvent);
    
    if (!mtoEvent.store_number) {
      return new Response('{"error":"store_number is required"}', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // Call notification-controller to resolve recipients and send emails
    const controllerUrl = Deno.env.get('SUPABASE_URL') + '/functions/v1/notification-controller';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    const notificationPayload = {
      order_type: 'mto',
      store_number: mtoEvent.store_number,
      plant: mtoEvent.plant_id,
      payload: {
        order_id: mtoEvent.order_id,
        event: mtoEvent.event,
        store_name: mtoEvent.store_number,
        timestamp: new Date().toISOString(),
        metadata: mtoEvent.metadata || {}
      },
      idempotency_key: `mto-${mtoEvent.order_id}-${mtoEvent.event}-${Date.now()}`,
      source: 'mto-notification'
    };

    console.log("📧 MTO NOTIFICATION - Calling notification-controller:", notificationPayload);

    const controllerResponse = await fetch(controllerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`
      },
      body: JSON.stringify(notificationPayload)
    });

    const controllerResult = await controllerResponse.json();

    if (controllerResponse.ok) {
      console.log("✅ MTO NOTIFICATION - Controller succeeded:", controllerResult);
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'MTO notification processed successfully',
        order_id: mtoEvent.order_id,
        event: mtoEvent.event,
        recipients_found: controllerResult.recipients_found || 0,
        results: controllerResult.results
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      console.error("❌ MTO NOTIFICATION - Controller failed:", controllerResult);
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Notification controller failed: ${controllerResult.error}`,
        order_id: mtoEvent.order_id
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (e) {
    console.error("❌ MTO NOTIFICATION - Error:", e);
    return new Response(JSON.stringify({
      error: "unhandled_exception",
      message: String(e)
    }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});
