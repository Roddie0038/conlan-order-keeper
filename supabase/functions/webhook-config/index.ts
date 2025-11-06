import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: adminCheck } = await supabase
      .from("admin_emails")
      .select("email")
      .eq("email", user.email)
      .single();

    if (!adminCheck) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (req.method === "GET") {
      if (action === "get-url") {
        const webhookType = url.searchParams.get("webhook_type");
        if (!webhookType) {
          return new Response(JSON.stringify({ error: "Missing webhook_type" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data, error } = await supabase
          .from("app_platform_links")
          .select("*, app_platforms(*)")
          .eq("webhook_type", webhookType)
          .eq("is_active", true)
          .single();

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } else {
        // Get all platforms and links
        const { data: platforms, error: platformsError } = await supabase
          .from("app_platforms")
          .select("*, app_platform_links(*)")
          .order("platform_name");

        if (platformsError) {
          return new Response(JSON.stringify({ error: platformsError.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify(platforms), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (req.method === "POST") {
      const body = await req.json();

      if (action === "test-webhook") {
        const { webhook_url, webhook_secret, hmac_enabled, test_payload } = body;
        
        const startTime = Date.now();
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (hmac_enabled && webhook_secret) {
          const timestamp = new Date().toISOString();
          headers["X-Webhook-Timestamp"] = timestamp;
          
          const encoder = new TextEncoder();
          const key = await crypto.subtle.importKey(
            "raw",
            encoder.encode(webhook_secret),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
          );
          const signature = await crypto.subtle.sign(
            "HMAC",
            key,
            encoder.encode(JSON.stringify(test_payload) + timestamp)
          );
          const signatureHex = Array.from(new Uint8Array(signature))
            .map(b => b.toString(16).padStart(2, "0"))
            .join("");
          headers["X-Webhook-Signature"] = signatureHex;
        }

        try {
          const response = await fetch(webhook_url, {
            method: "POST",
            headers,
            body: JSON.stringify(test_payload),
          });

          const duration = Date.now() - startTime;
          const responseBody = await response.text();

          return new Response(JSON.stringify({
            success: response.ok,
            status: response.status,
            duration_ms: duration,
            response_body: responseBody,
          }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } catch (error) {
          return new Response(JSON.stringify({
            success: false,
            error: error.message,
          }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      if (action === "replay-delivery") {
        const { delivery_id } = body;
        
        const { data: delivery, error: deliveryError } = await supabase
          .from("webhook_deliveries")
          .select("*, app_platform_links(*)")
          .eq("id", delivery_id)
          .single();

        if (deliveryError || !delivery) {
          return new Response(JSON.stringify({ error: "Delivery not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const startTime = Date.now();
        try {
          const response = await fetch(delivery.webhook_url, {
            method: delivery.request_method || "POST",
            headers: delivery.request_headers as Record<string, string> || {},
            body: JSON.stringify(delivery.request_body),
          });

          const duration = Date.now() - startTime;
          const responseBody = await response.text();

          await supabase.from("webhook_deliveries").insert({
            platform_link_id: delivery.platform_link_id,
            webhook_type: delivery.webhook_type,
            webhook_url: delivery.webhook_url,
            request_method: delivery.request_method,
            request_headers: delivery.request_headers,
            request_body: delivery.request_body,
            response_status: response.status,
            response_body: responseBody,
            duration_ms: duration,
            success: response.ok,
            retry_count: delivery.retry_count + 1,
          });

          return new Response(JSON.stringify({
            success: response.ok,
            status: response.status,
            duration_ms: duration,
          }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } catch (error) {
          return new Response(JSON.stringify({
            success: false,
            error: error.message,
          }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      // Update platform or link
      if (body.platform_id) {
        const { data, error } = await supabase
          .from("app_platform_links")
          .upsert(body)
          .select()
          .single();

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
