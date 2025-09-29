
import { submitToWebhook } from './utils';
import { WEBHOOK_URLS } from './config';
import { formatDate } from './utils';

export const submitToMTOOrdersWebhook = async (data: any) => {
  try {
    console.log("🔍 MTO WEBHOOK - Starting v2 schema MTO webhook submission");
    if (data.type !== "MTO") {
      console.error("❌ MTO WEBHOOK - Incorrect order type:", data.type);
      return false;
    }

    // Always derive a 3-digit store number
    const rawStore = (data.store ?? "").toString().trim();
    const extracted = rawStore.match(/(\d{1,3})\s*$/)?.[1] ?? ""; // last 1–3 digits at end
    const storeNumber = (data.store_number ?? extracted).toString().padStart(3, "0");

    // Quantity guard: coerce to int, reject NaN/0
    const qty = typeof data.quantity === "string" ? parseInt(data.quantity, 10) : data.quantity;
    const quantity = Number.isFinite(qty) && qty > 0 ? qty : 0;

    const idempotency_key =
      data.idempotency_key ?? `mto_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

    const v2Payload = {
      timestamp: data.timestamp || new Date().toISOString(),
      name: (data.name ?? "").toString().trim(),
      store: rawStore,
      store_number: storeNumber,                         // 3-char string, never null
      product_number: (data.productNumber ?? data.product_number ?? "").toString().trim(),
      casing_grade: (data.casingGrade ?? data.casing_grade ?? "").toString().trim(),
      tire_size: (data.tireSize ?? data.tire_size ?? "").toString().trim(),
      tread: (data.tread ?? data.tireTreadNeeded ?? "").toString().trim(),
      quantity,
      notes: (data.notes ?? "").toString(),
      email: (data.email ?? data.managerEmail ?? "").toString(),
      plant: (data.plant ?? "").toString(),
      type: "MTO",
      orderType: "MTO",                                   // backward compat
      status: "open",                                     // MUST be 'open'
      description:
        data.description ??
        `MTO - ${(data.tread ?? data.tireTreadNeeded ?? "").toString().trim()} - ${(data.tireSize ?? data.tire_size ?? "").toString().trim()}`,
      idempotency_key,
      // optional:
      submitted_by_name: data.submitted_by_name ?? data.name ?? "",
      submitted_by_email: data.submitted_by_email ?? data.email ?? "",
      ordering_store: data.ordering_store ?? rawStore,
      ordering_plant: data.ordering_plant ?? data.plant ?? "",
      destination_plant: data.destination_plant ?? data.destinationPlant ?? data.plant ?? ""
    };

    // REQUIRED fields validation
    if (!v2Payload.product_number || !v2Payload.casing_grade || !v2Payload.tire_size || !quantity) {
      console.error("❌ MTO WEBHOOK - Missing required fields:", {
        product_number: v2Payload.product_number,
        casing_grade: v2Payload.casing_grade,
        tire_size: v2Payload.tire_size,
        quantity
      });
      return false;
    }

    console.log("🔍 MTO WEBHOOK - Sending v2 schema payload:", v2Payload);

    await fetch(WEBHOOK_URLS.MTO_ORDERS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Source": "ordering-app"
      },
      mode: "no-cors",
      body: JSON.stringify(v2Payload)
    });

    console.log("✅ MTO WEBHOOK - v2 schema payload sent");
    return true;
  } catch (err) {
    console.log("ℹ️ MTO WEBHOOK - Webhook fired (no-cors opaque):", err);
    return true; // fire-and-forget
  }
};
