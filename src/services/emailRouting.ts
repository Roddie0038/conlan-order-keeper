// @ts-nocheck
// EMAIL ROUTING NOTE: This file is deprecated.
// OT Platform now handles ALL email routing via its own edge functions.
// This file remains for backward compatibility only.
import { supabase } from "@/integrations/supabase/client";

export type EmailType = "transfer" | "mto" | "wheel" | "warranty" | "completion";

type RoutingResult = {
  recipients: string[];
  source: "database" | "fallback";
  fallbackReason?: string;
};

/**
 * Primary lookup: centralized store_email_recipients (platform_source='ordering_platform').
 * NO WRITES to notification_logs (logging is disabled).
 */
export async function getStoreEmailRecipients(storeNumber: string, emailType: EmailType): Promise<RoutingResult> {
  // Early exit if we weren't given a store number
  if (!storeNumber || storeNumber.trim() === "") {
    console.log("📧 EMAIL ROUTING - No store number provided; skipping DB lookup");
    return {
      recipients: [],
      source: "fallback",
      fallbackReason: "No store number provided",
    };
  }

  try {
    console.log(`📧 EMAIL ROUTING - Querying DB for store ${storeNumber}, type ${emailType}`);

    const { data, error } = await supabase
      .from("store_email_recipients")
      .select("recipient_email")
      .eq("store_number", storeNumber)
      .contains("order_types", [emailType])
      .eq("is_active", true)
      .eq("platform_source", "ordering_platform");

    if (error) {
      console.error("📧 EMAIL ROUTING - DB query error:", error);
      return getFallbackRecipients(storeNumber, emailType, "database_error");
    }

    const recipients = (data ?? []).map((r) => r.recipient_email).filter(Boolean);

    if (recipients.length > 0) {
      console.log(`📧 EMAIL ROUTING - Found ${recipients.length} recipient(s) from database`, recipients);
      // Logging to notification_logs is intentionally disabled.
      return { recipients, source: "database" };
    }

    console.log(`📧 EMAIL ROUTING - No DB recipients for store ${storeNumber}, type ${emailType}; using fallback`);
    return getFallbackRecipients(storeNumber, emailType, "no_recipients");
  } catch (err) {
    console.error("📧 EMAIL ROUTING - Unexpected error:", err);
    return getFallbackRecipients(storeNumber, emailType, "exception");
  }
}

/**
 * Deprecated fallback - OT Platform handles all email routing now.
 * Returns empty array since email routing is handled by OT Platform.
 */
async function getFallbackRecipients(
  storeNumber: string,
  emailType: EmailType,
  reason: string,
): Promise<RoutingResult> {
  console.log(`📧 EMAIL ROUTING - OT Platform handles routing for store ${storeNumber}, type ${emailType}`);
  console.log(`📧 EMAIL ROUTING - Fallback disabled: ${reason} - All email routing via OT Platform`);

  // OT Platform handles all email routing - no local fallback needed
  return { 
    recipients: [], 
    source: "fallback", 
    fallbackReason: "OT Platform handles all email routing" 
  };
}

/**
 * (Disabled) Historical logger. Left in place in case other modules import it.
 * If you decide to re-enable logging later, implement the insert here.
 */
async function logEmailRouting(
  _storeNumber: string,
  _emailType: EmailType,
  _recipients: string[],
  _source: "database" | "fallback",
  _fallbackReason?: string,
): Promise<void> {
  // 🚫 Disabled: no writes to notification_logs from the ordering app
  return;
}

/** Legacy wrappers for backward compatibility */
export async function getTransferRecipientsDatabase(storeNumber: string): Promise<string[]> {
  const result = await getStoreEmailRecipients(storeNumber, "transfer");
  return result.recipients;
}

export async function getMTORecipientsDatabase(storeNumber: string): Promise<string[]> {
  const result = await getStoreEmailRecipients(storeNumber, "mto");
  return result.recipients;
}

export async function getWheelRecipientsDatabase(storeNumber: string): Promise<string[]> {
  const result = await getStoreEmailRecipients(storeNumber, "wheel");
  return result.recipients;
}

export async function getWarrantyRecipientsDatabase(storeNumber: string): Promise<string[]> {
  const result = await getStoreEmailRecipients(storeNumber, "warranty");
  return result.recipients;
}
