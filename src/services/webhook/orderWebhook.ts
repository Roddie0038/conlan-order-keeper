// src/services/webhook/orderWebhook.ts

/**
 * Transfer order → Google Sheets backup
 *
 * We keep posting transfer orders to the Google Apps Script endpoint as a
 * *backup ledger*, while the primary system ingests to OT via the edge
 * function elsewhere. This module ONLY talks to Google Sheets.
 *
 * Notes:
 * - Uses a tolerant mapper that accepts both camelCase and snake_case inputs.
 * - Normalizes booleans/strings and formats dates safely.
 * - Uses `no-cors` so the browser won’t block the call on CORS; response
 *   becomes opaque, so “success” is defined as “no exception thrown”.
 */

import { WEBHOOK_URLS } from "./config";

/** Weekday or special keywords passed by the UI for schedule arrival */
const WEEKDAY_OR_SPECIAL = /^(monday|tuesday|wednesday|thursday|friday|will call pick up)$/i;

/** Safely coerce to integer */
const toInt = (v: unknown, fallback = 0) => {
  const n = parseInt(String(v), 10);
  return Number.isFinite(n) ? n : fallback;
};

/** "yes"/"no" string from various truthy/falsey inputs */
const toYesNo = (v: unknown) => {
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return s === "yes" || s === "true" ? "yes" : "no";
  }
  return v ? "yes" : "no";
};

/** Format a date-like value as MM/DD/YYYY; fallback to empty string */
const toDateString = (v: unknown): string => {
  if (!v) return "";
  try {
    const d = new Date(String(v));
    if (Number.isNaN(d.getTime())) return "";
    // MM/DD/YYYY
    const mm = `${d.getMonth() + 1}`.padStart(2, "0");
    const dd = `${d.getDate()}`.padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  } catch {
    return "";
  }
};

/** If the user typed only a store number, make it friendlier (best-effort). */
const normalizeCrossDockDest = (v: unknown): string => {
  const s = String(v ?? "").trim();
  if (!s) return "";
  if (/^\d+$/.test(s)) {
    // Only digits — caller likely entered just the store number
    return `Store ${s}`;
  }
  return s;
};

/** Build the snake_case payload expected by the Google Script */
function buildSheetsPayload(input: any, correlationId: string) {
  // Accept both camelCase and snake_case from callers
  const scheduleArrival = input.scheduleArrival ?? input.schedule_arrival ?? "";
  const crossDock = input.crossDock ?? input.cross_dock ?? "no";
  const crossDockDestination = input.crossDockDestination ?? input.cross_dock_dest ?? "";

  // If scheduleArrival is a weekday/special token, pass through; else format date
  const schedule_arrival = WEEKDAY_OR_SPECIAL.test(String(scheduleArrival))
    ? String(scheduleArrival)
    : toDateString(scheduleArrival);

  const payload = {
    // Required/primary fields
    order_type: "transfer",
    name: input.yourName ?? input.name ?? "",
    store: input.store ?? "",
    product_number: input.productNumber ?? input.product_number ?? "",
    description: input.description ?? "",
    quantity: toInt(input.quantity, 0),

    // Dates/flags
    schedule_arrival,
    eta_date: toDateString(input.etaDate ?? input.eta_date),

    // Notes & routing
    notes: input.notes ?? "",
    cross_dock: toYesNo(crossDock),
    cross_dock_dest: normalizeCrossDockDest(crossDockDestination),

    // Contacts
    email: input.managersEmail ?? input.managerEmail ?? input.email ?? "",
    destination_manager_email: input.destinationManagerEmail ?? input.destination_manager_email ?? "",

    // Misc (optional but useful)
    receiver_no: input.receiverNo ?? input.receiver_no ?? "",
    plant: input.plant ?? "",
    status: input.status ?? "pending",
    order_number: input.order_number ?? "",

    // Observability
    timestamp: new Date().toISOString(),
    correlation_id: correlationId,
    source: "ordering_platform",
  };

  return payload;
}

/**
 * Submit a transfer order to the Google Sheets webhook.
 * Returns true if the request was issued without throwing (opaque success).
 */
export const submitToOrdersWebhook = async (data: any): Promise<boolean> => {
  try {
    // Only handle transfer orders here; other types should use their own paths
    const type = (data?.type ?? data?.order_type ?? "").toString().toUpperCase();
    if (type === "WHEEL_POWDER_COATING" || type === "MTO") {
      console.warn("❌ ORDER WEBHOOK - Non-transfer order type sent to transfer webhook:", type);
      return false;
    }

    const correlationId = data?.correlation_id ?? `transfer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    console.log("🔍 ORDER WEBHOOK - Processing transfer order (Sheets backup)");
    console.log("🔍 ORDER WEBHOOK - Using Transfer Orders webhook URL:", WEBHOOK_URLS.ORDERS);

    const payload = buildSheetsPayload(data, correlationId);
    console.log("🔍 ORDER WEBHOOK - Payload → Google Sheets:", payload);

    // Use AbortController for a safety timeout, but still prefer reliability.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    // We use `no-cors` to avoid blocking on CORS; result is opaque.
    await fetch(WEBHOOK_URLS.ORDERS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors",
      keepalive: true,
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
      .catch((err) => {
        // In `no-cors`, many failures won’t surface. If the network layer throws,
        // we still log and return false.
        console.error("❌ ORDER WEBHOOK - Network error calling Google Script:", err);
        throw err;
      })
      .finally(() => clearTimeout(timeout));

    console.log("✅ ORDER WEBHOOK - Triggered Google Sheets backup successfully");
    return true;
  } catch (error) {
    console.error("❌ ORDER WEBHOOK - Error triggering Google Sheets backup:", error);
    return false;
  }
};
