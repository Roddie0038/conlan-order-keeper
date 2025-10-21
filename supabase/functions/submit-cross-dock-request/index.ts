import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: userData, error: userError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = await req.json();
    const { requestData, items } = payload;

    // Insert cross-dock request
    const { data: requestRecord, error: requestError } = await supabase
      .from("cross_dock_requests")
      .insert({
        requesting_store: requestData.requesting_store,
        sending_store: requestData.sending_store,
        desired_delivery_date: requestData.desired_delivery_date,
        notes: requestData.notes,
        plant: requestData.plant,
        submitted_by_email: userData.user.email,
        submitted_by_name: requestData.submitted_by_name,
        status: "pending",
      })
      .select()
      .single();

    if (requestError) {
      console.error("Error creating request:", requestError);
      return new Response(
        JSON.stringify({ error: "Failed to create request", details: requestError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Insert request items
    const itemsToInsert = items.map((item: any) => ({
      request_id: requestRecord.id,
      product_number: item.product_number,
      description: item.description,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("cross_dock_request_items")
      .insert(itemsToInsert);

    if (itemsError) {
      console.error("Error creating items:", itemsError);
      return new Response(
        JSON.stringify({ error: "Failed to create items", details: itemsError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create audit log entry
    await supabase.from("cross_dock_request_audit").insert({
      request_id: requestRecord.id,
      user_id: userData.user.id,
      user_email: userData.user.email,
      action: "created",
      new_status: "pending",
      notes: `Request created with ${items.length} item(s)`,
    });

    // Send to OT Platform
    const otUrl = "https://hpgjbpvugasktphwntee.supabase.co/functions/v1/ingest-ot-order";
    const internalToken = Deno.env.get("INTERNAL_TOKEN");

    const otPayload = {
      type: "cross_dock_request",
      request: {
        id: requestRecord.id,
        request_number: requestRecord.request_number,
        requesting_store: requestRecord.requesting_store,
        sending_store: requestRecord.sending_store,
        desired_delivery_date: requestRecord.desired_delivery_date,
        notes: requestRecord.notes,
        plant: requestRecord.plant,
        submitted_by_email: requestRecord.submitted_by_email,
        submitted_by_name: requestRecord.submitted_by_name,
        status: requestRecord.status,
        created_at: requestRecord.created_at,
        items: items,
      },
    };

    const otResponse = await fetch(otUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${internalToken}`,
      },
      body: JSON.stringify(otPayload),
    });

    if (!otResponse.ok) {
      console.error("OT platform error:", await otResponse.text());
      // Still return success to user since the request was saved locally
    }

    return new Response(
      JSON.stringify({
        success: true,
        request: requestRecord,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in submit-cross-dock-request:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});