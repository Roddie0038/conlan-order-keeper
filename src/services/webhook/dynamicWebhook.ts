import { supabase } from "@/integrations/supabase/client";
import type { AppWebhook } from "@/types/webhook-admin";

interface WebhookDeliveryLog {
  webhook_id?: string;
  event_type: string;
  request_url: string;
  request_method: string;
  request_headers: Record<string, string>;
  request_body: any;
  request_timestamp: string;
  response_status?: number;
  response_headers?: Record<string, string>;
  response_body?: string;
  duration_ms: number;
  success: boolean;
  error_message?: string;
  idempotency_key?: string;
  hmac_signature?: string;
  retry_count: number;
}

async function generateHmacSignature(
  payload: string,
  secret: string,
  timestamp: string
): Promise<string> {
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
    encoder.encode(payload + timestamp)
  );
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function submitToDynamicWebhook(
  eventType: string,
  data: any,
  idempotencyKey?: string
): Promise<{ success: boolean; error?: string }> {
  console.log(`🔍 DYNAMIC WEBHOOK - Submitting ${eventType} webhook`);

  try {
    // Get webhook configuration from database
    const { data: webhooks, error: configError } = await supabase
      .from("app_webhooks" as any)
      .select("*, webhook_event_subscriptions!inner(*)")
      .eq("is_active", true)
      .eq("webhook_event_subscriptions.event_type", eventType)
      .eq("webhook_event_subscriptions.is_enabled", true);

    if (configError || !webhooks || webhooks.length === 0) {
      console.error(`❌ DYNAMIC WEBHOOK - No active webhook config found for ${eventType}`);
      return { success: false, error: "No webhook configuration found" };
    }

    const results = await Promise.all(
      (webhooks as unknown as AppWebhook[]).map(async (webhook) => {
        console.log(`✅ DYNAMIC WEBHOOK - Found config for ${eventType}:`, webhook.endpoint_url);

        const startTime = Date.now();
        const timestamp = new Date().toISOString();
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "X-CTO-Timestamp": timestamp,
        };

        if (idempotencyKey) {
          headers["X-CTO-Idempotency-Key"] = idempotencyKey;
        }

        let hmacSignature: string | undefined;
        if (webhook.hmac_enabled && webhook.webhook_secret) {
          hmacSignature = await generateHmacSignature(
            JSON.stringify(data),
            webhook.webhook_secret,
            timestamp
          );
          headers["X-CTO-Signature"] = hmacSignature;
          console.log("🔐 DYNAMIC WEBHOOK - HMAC signature generated");
        }

        const deliveryLog: WebhookDeliveryLog = {
          webhook_id: webhook.id,
          event_type: eventType,
          request_url: webhook.endpoint_url,
          request_method: "POST",
          request_headers: headers,
          request_body: data,
          request_timestamp: timestamp,
          duration_ms: 0,
          success: false,
          retry_count: 0,
          idempotency_key: idempotencyKey,
          hmac_signature: hmacSignature,
        };

        try {
          const response = await fetch(webhook.endpoint_url, {
            method: "POST",
            headers,
            body: JSON.stringify(data),
            signal: AbortSignal.timeout(webhook.timeout_seconds * 1000),
          });

          const duration = Date.now() - startTime;
          const responseBody = await response.text();
          const responseHeaders: Record<string, string> = {};
          response.headers.forEach((value, key) => {
            responseHeaders[key] = value;
          });

          deliveryLog.duration_ms = duration;
          deliveryLog.response_status = response.status;
          deliveryLog.response_headers = responseHeaders;
          deliveryLog.response_body = responseBody;
          deliveryLog.success = response.ok;

          if (!response.ok) {
            deliveryLog.error_message = `HTTP ${response.status}: ${responseBody}`;
          }

          console.log(`✅ DYNAMIC WEBHOOK - Delivery completed in ${duration}ms with status ${response.status}`);

          // Log delivery to database
          await supabase.from("app_webhook_deliveries" as any).insert(deliveryLog);

          return { success: response.ok, error: response.ok ? undefined : deliveryLog.error_message };
        } catch (fetchError: any) {
          const duration = Date.now() - startTime;
          deliveryLog.duration_ms = duration;
          deliveryLog.error_message = fetchError.message;
          deliveryLog.success = false;

          console.error(`❌ DYNAMIC WEBHOOK - Fetch error:`, fetchError);

          // Log failed delivery
          await supabase.from("app_webhook_deliveries" as any).insert(deliveryLog);

          return { success: false, error: fetchError.message };
        }
      })
    );

    const allSuccessful = results.every(r => r.success);
    return { 
      success: allSuccessful, 
      error: allSuccessful ? undefined : "Some webhooks failed" 
    };
  } catch (error: any) {
    console.error(`❌ DYNAMIC WEBHOOK - Unexpected error:`, error);
    return { success: false, error: error.message };
  }
}

export async function getWebhookUrl(eventType: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("app_webhooks" as any)
    .select("endpoint_url, webhook_event_subscriptions!inner(*)")
    .eq("is_active", true)
    .eq("webhook_event_subscriptions.event_type", eventType)
    .eq("webhook_event_subscriptions.is_enabled", true)
    .single();

  if (error || !data) {
    console.error(`❌ No webhook URL found for ${eventType}`);
    return null;
  }

  return (data as any).endpoint_url;
}
