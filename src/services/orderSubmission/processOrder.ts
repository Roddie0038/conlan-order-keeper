// src/services/orderSubmission/processOrder.ts

/**
 * Processes a single order:
 * - Determines order type (TRANSFER | MTO | WHEEL_POWDER_COATING)
 * - Builds & submits an OT ingest payload (primary system of record)
 * - (TRANSFER only) Fire-and-forget backup to Google Sheets via Apps Script
 * - Returns a camelCase object compatible with downstream webhook processors
 *
 * IMPORTANT:
 * - No writes to the Ordering DB tables
 * - No calls to /notification_logs
 * - No email routing or notification functions here
 */

import { OrderSummary } from "@/hooks/useOrderSubmission";
import { getPlantForStore } from "@/utils/plantMapping";
import { storeData } from "@/config/storeData";
import { formatDateForSupabase } from "@/utils/dateTime";
import { submitOtOrder, type OtOrderPayload, isIngestFail } from "@/services/submitOtOrder";
import { submitToOrdersWebhook } from "@/services/webhook/orderWebhook";
import type { OrderType } from "@/services/webhook/config";

// ---------- helpers ----------

const toInt = (v: unknown, fallback = 0) => {
  const n = parseInt(String(v), 10);
  return Number.isFinite(n) ? n : fallback;
};

const onlyDigits = (s: string) => (s.match(/\d+$/)?.[0] ?? "").trim();

/** Best-effort normalization when user enters only a store number */
const normalizeCrossDockDestination = (value: string | undefined) => {
  const raw = (value ?? "").trim();
  if (!raw) return "";
  // If it's just digits, expand to a friendlier label using storeData when possible
  if (/^\d+$/.test(raw)) {
    const found = storeData.find((s) => s.storeNumber === raw);
    return found ? found.name : `Store ${raw}`;
  }
  return raw;
};

// ---------- main ----------

export const processOrder = async (order: OrderSummary, selectedPlant: string) => {
  console.log("🔍 SUBMIT - Processing order:", order.id);

  // Store number (e.g., "Grand Prairie 27" -> "27")
  const storeNumber = onlyDigits(order.store);

  // Resolve plant from store (authoritative)
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

  // Timestamp (kept for UI/debug parity)
  const formattedTimestamp = formatDateForSupabase(new Date());

  // ---------- 1) OT ingest (PRIMARY) ----------
  // We do not require email routing at this stage; pass what we have.
  const submittedByEmail = (order as any).email || "";
  const submittedByName = order.yourName || order.name || "Unknown";

  const otPayload: OtOrderPayload = {
    order_number:
      (order as any).orderNumber || `ORD-${orderType}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    product_number: String(order.productNumber || ""),
    quantity: toInt(order.quantity, 0),
    store: String(order.store),
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
        // For legacy scripts:
        crossDock: (order.crossDock === "Yes" ? "Yes" : "No") as "Yes" | "No",
        crossDockDestination: formattedCrossDockDestination,
        receiverNo: order.receiverNo || null,
        etaDate: order.etaDate || null,
        destinationManagerEmail: "",
        timestamp: formattedTimestamp,
        // helpful metadata
        orderNumber: ingestResult.order_number,
        _correlationId: ingestResult.id,
      };

      // fire & forget; do not block the main flow on backup
      console.log("🗂️ SHEETS BACKUP - Dispatching transfer backup");
      await submitToOrdersWebhook(backupPayload);
    } catch (err) {
      // Non-fatal: the OT ingest already succeeded
      console.warn("⚠️ SHEETS BACKUP - Non-fatal error posting to Apps Script:", err);
    }
  }

  // ---------- Return shape for downstream processors ----------
  // Keep camelCase for compatibility with existing webhook/render code.
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
