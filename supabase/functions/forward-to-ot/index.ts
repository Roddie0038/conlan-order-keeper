import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createHmac } from "https://deno.land/std@0.224.0/crypto/crypto.ts";
import { encodeHex } from "https://deno.land/std@0.224.0/encoding/hex.ts";

const ALLOWED_ORIGINS = new Set<string>([
  "https://conlan-order-keeper.lovable.app",
  "https://preview--conlan-order-keeper.lovable.app",
  "http://localhost:5173",
  "http://localhost:3000",
]);

function isAllowedOrigin(origin: string): boolean {
  try {
    const { host } = new URL(origin);
    return (
      ALLOWED_ORIGINS.has(origin) ||
      host.endsWith('.lovableproject.com') ||
      host.endsWith('.lovable.app') ||
      host === 'localhost:5173' ||
      host === 'localhost:3000'
    );
  } catch {
    return false;
  }
}

function corsHeadersFor(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  const allow = isAllowedOrigin(origin) ? origin : "";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-idempotency-key, x-trace-id",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

/**
 * Compute HMAC-SHA256 signature for payload authentication
 */
async function computeHmacSignature(secret: string, payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );
  
  return encodeHex(new Uint8Array(signature));
}

serve(async (req) => {
  const cors = corsHeadersFor(req);
  const traceId = crypto.randomUUID();

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    const ok = cors["Access-Control-Allow-Origin"];
    return new Response("ok", { status: ok ? 200 : 403, headers: cors });
  }

  try {
    console.log(`🔍 [FORWARD-TO-OT] trace_id: ${traceId}, project: "Ordering", action: "forward_start"`);

    // Get OT configuration from environment
    const otIngestUrl = Deno.env.get('OT_INGEST_URL');
    const hmacSecret = Deno.env.get('OT_INGEST_HMAC_SECRET');

    if (!otIngestUrl || !hmacSecret) {
      console.error(`❌ [FORWARD-TO-OT] trace_id: ${traceId}, error: "Missing OT_INGEST_URL or OT_INGEST_HMAC_SECRET"`);
      return new Response(
        JSON.stringify({ 
          status: "error",
          project: "Ordering",
          trace_id: traceId,
          error: {
            code: "CONFIGURATION_ERROR",
            message: "Server configuration incomplete"
          }
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...cors } }
      );
    }

    // Parse incoming payload
    const rawBody = await req.text();
    let payload: any;
    
    try {
      payload = JSON.parse(rawBody);
    } catch {
      console.error(`❌ [FORWARD-TO-OT] trace_id: ${traceId}, error: "Invalid JSON"`);
      return new Response(
        JSON.stringify({ 
          status: "error",
          project: "Ordering",
          trace_id: traceId,
          error: {
            code: "INVALID_JSON",
            message: "Request body must be valid JSON"
          }
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...cors } }
      );
    }

    console.log(`📦 [FORWARD-TO-OT] trace_id: ${traceId}, payload:`, JSON.stringify(payload, null, 2));

    // Compute HMAC signature
    const signature = await computeHmacSignature(hmacSecret, rawBody);
    console.log(`🔐 [FORWARD-TO-OT] trace_id: ${traceId}, signature: "${signature.substring(0, 16)}..."`);

    // Forward to OT platform with HMAC authentication
    const otHeaders = {
      "Content-Type": "application/json",
      "X-Signature": signature,
      "X-Trace-ID": traceId,
      "X-Source": "ordering-platform"
    };

    console.log(`🚀 [FORWARD-TO-OT] trace_id: ${traceId}, forwarding to: ${otIngestUrl}`);

    const otResponse = await fetch(otIngestUrl, {
      method: "POST",
      headers: otHeaders,
      body: rawBody,
    });

    const otResponseText = await otResponse.text();
    console.log(`📨 [FORWARD-TO-OT] trace_id: ${traceId}, OT response status: ${otResponse.status}, body: ${otResponseText}`);

    let otData: any;
    try {
      otData = JSON.parse(otResponseText);
    } catch {
      // If OT returns non-JSON, wrap it
      otData = {
        status: otResponse.ok ? "ok" : "error",
        project: "OT",
        trace_id: traceId,
        raw_response: otResponseText
      };
    }

    // Return OT response to client
    if (!otResponse.ok) {
      console.error(`❌ [FORWARD-TO-OT] trace_id: ${traceId}, OT returned error:`, otData);
      return new Response(
        JSON.stringify({
          ...otData,
          trace_id: traceId,
          project: "OT"
        }),
        { 
          status: otResponse.status, 
          headers: { 'Content-Type': 'application/json', ...cors } 
        }
      );
    }

    console.log(`✅ [FORWARD-TO-OT] trace_id: ${traceId}, success, OT order:`, otData);

    return new Response(
      JSON.stringify({
        ...otData,
        trace_id: traceId,
        project: "OT",
        forward_to_ot: true
      }),
      { status: otResponse.status, headers: { 'Content-Type': 'application/json', ...cors } }
    );

  } catch (error: any) {
    console.error(`❌ [FORWARD-TO-OT] trace_id: ${traceId}, unexpected error:`, error);
    
    return new Response(
      JSON.stringify({ 
        status: "error",
        project: "Ordering",
        trace_id: traceId,
        error: {
          code: "INTERNAL_ERROR",
          message: error.message || String(error)
        }
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...cors } }
    );
  }
});
