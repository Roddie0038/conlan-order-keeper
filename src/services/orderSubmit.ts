// src/services/orderSubmit.ts
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { normalizeStore, getPlantForStore } from "@/utils/storeMapping";
import { dlog, derr } from "@/utils/logging";

// Schema for the minimal required shape we write to `orders`.
// Based on database schema: timestamp is required, others optional
const OrderInsertSchema = z.object({
  timestamp: z.string(),    // required
  store: z.string().min(5),  // "City 0XX"
  plant: z.string().min(5),  // "City 0YY"
  email: z.string().email().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  quantity: z.number().int().positive().optional(),
  order_type: z.string().optional(),
  status: z.string().optional(),
  is_cross_dock: z.boolean().default(false), // required, default false
  cross_dock_status: z.string().default("not_applicable"), // required
  // ... add other fields your form/DB requires
});

type OrderInsert = z.infer<typeof OrderInsertSchema>;

type SubmitArgs = {
  formValues: Record<string, any>;
  // From your auth/user context; include assignedPlant if you carry it there.
  user?: { email?: string; full_name?: string; assignedPlant?: string | null };
  // If UI sets a selected store/plant upstream, pass them here:
  selectedStore?: string | null;
  selectedPlant?: string | null;
};

/**
 * Main submit function. Always normalizes store & resolves plant before insert.
 * Fails fast with a clear error if required fields are missing.
 */
export async function submitOrder({ formValues, user, selectedStore, selectedPlant }: SubmitArgs) {
  try {
    // 1) Determine normalized store
    const candidateStore = selectedStore ?? formValues?.store ?? "";
    const storeNormalized = normalizeStore(candidateStore);

    // 2) Resolve plant deterministically
    const plantFromMap = getPlantForStore(storeNormalized);
    const plant =
      selectedPlant ??
      plantFromMap ??
      user?.assignedPlant ??
      formValues?.plant ??
      "";

    // 3) Build payload
    const payload: OrderInsert = {
      timestamp: new Date().toISOString(),
      store: storeNormalized,
      plant,
      email: formValues?.email ?? user?.email ?? undefined,
      name: formValues?.name ?? user?.full_name ?? undefined,
      description: formValues?.description ?? undefined,
      quantity: formValues?.quantity ? Number(formValues.quantity) : undefined,
      order_type: formValues?.order_type ?? "standard",
      status: formValues?.status ?? "pending",
      is_cross_dock: false,
      cross_dock_status: "not_applicable",
      // ... add all other fields your `orders` table expects
    };

    dlog("payload:pre-validate", payload);

    // 4) Validate hard. No more NULL / empty writes.
    const valid = OrderInsertSchema.safeParse(payload);
    if (!valid.success) {
      derr("validation failed", valid.error?.flatten());
      throw new Error("Order is missing required fields. Ensure Store and Plant are selected.");
    }

    // 5) Perform insert with one guarded retry on 5xx
    const doInsert = async () =>
      supabase.from("orders").insert(valid.data as any).select("id, store, plant").single();

    let { data, error } = await doInsert();

    if (error && isTransient(error)) {
      dlog("transient error, retrying...", { error });
      await wait(600);
      ({ data, error } = await doInsert());
    }

    if (error) {
      derr("insert failed", error);
      throw new Error(humanizeSupabaseError(error));
    }

    dlog("insert ok", data);
    return data;
  } catch (err: any) {
    derr("submitOrder exception", err);
    throw err;
  }
}

function isTransient(e: any): boolean {
  const msg = (e?.message || "").toLowerCase();
  return e?.status >= 500 || msg.includes("timeout") || msg.includes("temporarily");
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function humanizeSupabaseError(e: any): string {
  const raw = e?.message || "Unknown error";
  if (/violates row-level security/i.test(raw)) {
    return "Permission denied by RLS. Are you signed in, and is your payload allowed?";
  }
  return raw;
}