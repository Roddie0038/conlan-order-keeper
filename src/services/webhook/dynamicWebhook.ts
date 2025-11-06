import { supabase } from "@/integrations/supabase/client";
import type { AppPlatformLink } from "@/types/webhook-admin";

interface WebhookDeliveryLog {
  platform_link_id?: string;
  webhook_type: string;
  webhook_url: string;
  request_method: string;
  request_headers: Record<string, string>;
  request_body: any;
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

interface PlatformWithConfig extends AppPlatformLink {
  app_platforms: any;
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
  webhookType: string,
  data: any,
  idempotencyKey?: string
): Promise<{ success: boolean; error?: string }> {
  console.log(`🔍 DYNAMIC WEBHOOK - Submitting ${webhookType} webhook`);

  try {
    // Get webhook configuration from database
    const { data: config, error: configError } = await supabase
      .from("app_platform_links" as any)
      .select("*, app_platforms(*)")
      .eq("webhook_type", webhookType)
      .eq("is_active", true)
      .single();

    if (configError || !config) {
      console.error(`❌ DYNAMIC WEBHOOK - No active webhook config found for ${webhookType}`);
      // Fallback to hardcoded URLs if no config found (for backward compatibility)
      return { success: false, error: "No webhook configuration found" };
    }

    const typedConfig = config as unknown as PlatformWithConfig;
    console.log(`✅ DYNAMIC WEBHOOK - Found config for ${webhookType}:`, typedConfig.webhook_url);

    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Webhook-Timestamp": timestamp,
    };

    if (idempotencyKey) {
      headers["X-Idempotency-Key"] = idempotencyKey;
    }

    let hmacSignature: string | undefined;
    if (typedConfig.hmac_enabled && typedConfig.webhook_secret) {
      hmacSignature = await generateHmacSignature(
        JSON.stringify(data),
        typedConfig.webhook_secret,
        timestamp
      );
      headers["X-Webhook-Signature"] = hmacSignature;
      console.log("🔐 DYNAMIC WEBHOOK - HMAC signature generated");
    }

    const deliveryLog: WebhookDeliveryLog = {
      platform_link_id: typedConfig.id,
      webhook_type: webhookType,
      webhook_url: typedConfig.webhook_url,
      request_method: "POST",
      request_headers: headers,
      request_body: data,
      duration_ms: 0,
      success: false,
      retry_count: 0,
      idempotency_key: idempotencyKey,
      hmac_signature: hmacSignature,
    };

    try {
      const response = await fetch(typedConfig.webhook_url, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
        signal: AbortSignal.timeout((typedConfig.timeout_seconds || 30) * 1000),
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
      await supabase.from("webhook_deliveries" as any).insert(deliveryLog);

      // Analytics update skipped for now (RPC function not implemented yet)

      return { success: response.ok, error: response.ok ? undefined : deliveryLog.error_message };
    } catch (fetchError: any) {
      const duration = Date.now() - startTime;
      deliveryLog.duration_ms = duration;
      deliveryLog.error_message = fetchError.message;
      deliveryLog.success = false;

      console.error(`❌ DYNAMIC WEBHOOK - Fetch error:`, fetchError);

      // Log failed delivery
      await supabase.from("webhook_deliveries" as any).insert(deliveryLog);

      return { success: false, error: fetchError.message };
    }
  } catch (error: any) {
    console.error(`❌ DYNAMIC WEBHOOK - Unexpected error:`, error);
    return { success: false, error: error.message };
  }
}

export async function getWebhookUrl(webhookType: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("app_platform_links" as any)
    .select("webhook_url")
    .eq("webhook_type", webhookType)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    console.error(`❌ No webhook URL found for ${webhookType}`);
    return null;
  }

  return (data as any).webhook_url;
}
