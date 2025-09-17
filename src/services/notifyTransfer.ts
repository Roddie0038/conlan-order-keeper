// Minimal payload transfer notification service
import { supabase } from "@/integrations/supabase/client";
import { extractStoreNumber, extractPlantId } from "@/utils/normalize";

type TransferNotifyRequest = {
  order_id: number | string;
  store_number: string;      // "027"
  plant_id?: string;         // "097"
  event?: "created" | "updated" | "status_changed";
  metadata?: Record<string, unknown>;
};

export async function notifyTransfer(
  orderId: number | string,
  storeLabel: string,        // e.g. "Grand Prairie 027"
  plantLabel?: string        // e.g. "Grand Prairie 097"
) {
  const store_number = extractStoreNumber(storeLabel);
  const plant_id = extractPlantId(plantLabel);

  if (!store_number) {
    throw new Error(`notifyTransfer: cannot extract store_number from "${storeLabel}"`);
  }

  const body: TransferNotifyRequest = {
    order_id: orderId,
    store_number,             // REQUIRED
    plant_id,                 // Optional but recommended
    event: "created",
    metadata: {}              // keep if you need to pass anything extra
  };

  // IMPORTANT: do NOT include recipients or transferData anymore.
  const { data, error } = await supabase.functions.invoke("transfer-notification", { body });
  if (error) throw error;
  return data;
}