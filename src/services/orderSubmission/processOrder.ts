// src/services/orderSubmission/processOrder.ts
// Processes a single order and sends to OT ingest (primary) + Sheets backup (TRANSFER only).
// No writes to Ordering DB, no notification_logs, no email routing.

import { OrderSummary } from "@/hooks/useOrderSubmission";
import { getPlantForStore } from "@/utils/plantMapping";
import { storeData } from "@/config/storeData";
import { formatDateForSupabase } from "@/utils/dateTime";
import { submitOtOrder, type OtOrderPayload, isIngestFail } from "@/services/submitOtOrder";
import { submitToOrdersWebhook } from "@/services/webhook/orderWebhook";
import type { OrderType } from "@/services/webhook/config";
import { publishOrderPlaced } from "@/services/webhookOutbox";

// ---------- helpers ----------

const toInt = (v: unknown, fallback = 0) => {
  const n = parseInt(String(v), 10);
  return Number.isFinite(n) ? n : fallback;
};

const onlyDigits = (s: string) => (s.match(/\d+$/)?.[0] ?? "").trim();

/** Normalize cross-dock destination for display/scripts */
const normalizeCrossDockDestination = (value: string | undefined) => {
  const raw = (value ?? "").trim();
  if (!raw) return "";
  if (/^\d+$/.test(raw)) {
    const found = storeData.find((s) => s.storeNumber === raw);
    return found ? found.name : `Store ${raw}`;
  }
  return raw;
};

// Utility: if store entered as "... 27" pad to 027 for readability; we leave canonical formatting server-side if needed.
function padStoreNumberLabel(label: string): string {
  const m = label.match(/(\d+)\s*$/);
  if (!m) return label;
  const padded = m[1].padStart(3, "0");
  return label.replace(/(\d+)\s*$/, padded);
}

// ---------- main ----------

export const processOrder = async (order: OrderSummary, selectedPlant: string) => {
  console.log("🔍 SUBMIT - Processing order:", order.id);

  // Extract store number (e.g., "Grand Prairie 27" -> "27")
  const storeNumber = onlyDigits(order.store);

  // Resolve plant from store (authoritative) with fallback to user-selected plant
  const plant = getPlantForStore(order.store) || selectedPlant;
  console.log(`🔍 SUBMIT - Determined plant '${plant}' for store: ${order.store}`);

  // Determine order type
  let orderType: OrderType = "TRANSFER";
  if ("qtyWheels" in order && order.qtyWheels) {
    orderType = "WHEEL_POWDER_COATING";
  } else if (order.type === "MTO" || ("casingGrade" in order && order.casingGrade)) {
    orderType = "MTO";
  }
  console.log("🔍 SUBMIT - Determined order type:", orderType, "for order:", order.id);

  // Cross-dock formatting (transfer only)
  const formattedCrossDockDestination =
    orderType === "TRANSFER" ? normalizeCrossDockDestination(order.crossDockDestination) : "";

  // Timestamp for backup/UI parity
  const formattedTimestamp = formatDateForSupabase(new Date());

  // ---------- 1) OT ingest (PRIMARY) ----------
  const submittedByEmail = (order as any).email || "";
  const submittedByName = order.yourName || (order as any).name || "Unknown";

  // Preserve caller-provided order number when present (helps idempotency on server)
  const canonicalOrderNumber =
    (order as any).orderNumber || `ORD-${orderType}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  // Prefer padded store label for readability; server may normalize differently.
  const storeLabel = padStoreNumberLabel(String(order.store || ""));

  const otPayload: OtOrderPayload = {
    type: orderType,
    order_number: canonicalOrderNumber,
    product_number: String(order.productNumber || ""),
    quantity: toInt(order.quantity, 0),
    store: storeLabel,
    plant: String(plant),
    submitted_by_email: String(submittedByEmail),
    submitted_by_name: String(submittedByName),
  };

  console.log("📦 OT - Payload:", otPayload);
  const ingestResult = await submitOtOrder(otPayload);
  if (isIngestFail(ingestResult)) {
    console.error("❌ OT - Ingest failed:", ingestResult.status, ingestResult.message);
    throw new Error(`OT ingest failed: ${ingestResult.message}`);
  }
  console.log("✅ OT - Ingested:", ingestResult.id, ingestResult.order_number);

  // ---------- 3) Enqueue webhook event to outbox (non-blocking) ----------
  try {
    const traceId = `order-${ingestResult.id}-${Date.now()}`;
    console.log("📤 WEBHOOK OUTBOX - Enqueuing OrderPlaced event, trace_id:", traceId);
    
    const webhookResult = await publishOrderPlaced({
      order_id: ingestResult.id,
      order_number: ingestResult.order_number,
      store: storeLabel,
      plant: String(plant),
      product_number: String(order.productNumber || ""),
      description: String(order.description || ""),
      quantity: toInt(order.quantity, 0),
      schedule_arrival: order.scheduleArrival || "",
      status: "open",
      submitted_by_name: submittedByName,
      submitted_by_email: submittedByEmail,
      order_type: orderType,
      metadata: {
        cross_dock: order.crossDock === "Yes",
        cross_dock_destination: formattedCrossDockDestination || undefined,
        receiver_no: order.receiverNo || undefined,
        eta_date: order.etaDate || undefined,
        ot_created_at: ingestResult.created_at,
        idempotent: ingestResult.idempotent || false
      }
    }, traceId);

    if (webhookResult.success) {
      console.log("✅ WEBHOOK OUTBOX - Event enqueued:", webhookResult.event_id);
    } else {
      console.warn("⚠️ WEBHOOK OUTBOX - Failed to enqueue event:", webhookResult.error);
    }
  } catch (err) {
    // Non-fatal: order was successfully ingested, webhook is best-effort
    console.warn("⚠️ WEBHOOK OUTBOX - Non-fatal error enqueuing event:", err);
  }

  // ---------- 2) Google Sheets backup (TRANSFER only, non-blocking) ----------
  if (orderType === "TRANSFER") {
    try {
      const backupPayload = {
        // These keys mirror the previous camelCase payload used by scripts
        ...order,
        plant,
        type: orderType,
        name: submittedByName,
        email: submittedByEmail,
        // Legacy script expectations:
        crossDock: (order.crossDock === "Yes" ? "Yes" : "No") as "Yes" | "No",
        crossDockDestination: formattedCrossDockDestination,
        receiverNo: order.receiverNo || null,
        etaDate: order.etaDate || null,
        destinationManagerEmail: "",
        timestamp: formattedTimestamp,
        // helpful metadata (traceability)
        orderNumber: ingestResult.order_number,
        _correlationId: ingestResult.id,
      };

      console.log("🗂️ SHEETS BACKUP - Dispatching transfer backup");
      // fire & forget; non-fatal if it fails
      await submitToOrdersWebhook(backupPayload);
    } catch (err) {
      console.warn("⚠️ SHEETS BACKUP - Non-fatal error posting to Apps Script:", err);
    }
  }

  // ---------- Return shape for downstream processors ----------
  const processedForDownstream = {
    ...order,
    plant,
    type: orderType,
    name: submittedByName,
    email: submittedByEmail,
    crossDock: (order.crossDock === "Yes" ? "Yes" : "No") as "Yes" | "No",
    crossDockDestination: formattedCrossDockDestination,
    receiverNo: order.receiverNo || null,
    etaDate: order.etaDate || null,
    destinationManagerEmail: "",
    timestamp: formattedTimestamp,

    // OT ingest metadata (useful downstream)
    ot_id: ingestResult.id,
    ot_created_at: ingestResult.created_at,
    orderNumber: ingestResult.order_number,
  };

  return processedForDownstream;
};
