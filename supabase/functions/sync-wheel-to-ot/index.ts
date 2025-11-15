import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// OT Platform configuration
const OT_EDGE_BASE = Deno.env.get('OT_EDGE_BASE') ?? '';
const SYNC_SECRET = Deno.env.get('SYNC_SHARED_SECRET') ?? Deno.env.get('ORDERING_SYNC_SECRET') ?? '';

serve(async (req) => {
  console.log("🔄 SYNC WHEEL TO OT - Edge function called");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("✅ SYNC WHEEL TO OT - Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    console.error("❌ SYNC WHEEL TO OT - Invalid method:", req.method);
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const wheelOrderData = await req.json();
    console.log("🔄 SYNC WHEEL TO OT - Received wheel order data:", JSON.stringify(wheelOrderData, null, 2));

    // Construct OT Platform sync-wheel-order endpoint URL
    const syncUrl = `${OT_EDGE_BASE}/sync-wheel-order`;
    console.log("🔄 SYNC WHEEL TO OT - Calling OT Platform endpoint:", syncUrl);

    // Forward the wheel order data to OT Platform's sync-wheel-order endpoint
    const response = await fetch(syncUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-sync-secret": SYNC_SECRET,
        "Authorization": `Bearer ${Deno.env.get('OT_SERVICE_ROLE_KEY') ?? ''}`,
      },
      body: JSON.stringify(wheelOrderData),
    });

    console.log("✅ SYNC WHEEL TO OT - OT Platform response status:", response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log("✅ SYNC WHEEL TO OT - Successfully synced to OT Platform:", result);
      return new Response(JSON.stringify({ success: true, data: result }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      const errorText = await response.text();
      console.error("❌ SYNC WHEEL TO OT - OT Platform sync failed:", response.status, errorText);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'OT Platform sync failed',
        status: response.status,
        message: errorText
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error("❌ SYNC WHEEL TO OT - Error syncing to OT Platform:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: (error as Error).message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
