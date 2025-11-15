import { supabase } from "@/integrations/supabase/client";

/**
 * Sync wheel order data to OT Platform's sync-wheel-order endpoint
 * Called after successful wheel order submission to ensure data consistency
 */
export async function syncWheelOrderToOT(wheelOrderData: any): Promise<boolean> {
  try {
    console.log("🔄 SYNC - Syncing wheel order to OT Platform sync-wheel-order endpoint");
    
    // Call the Ordering Platform's edge function that will forward to OT Platform
    const { data, error } = await supabase.functions.invoke("sync-wheel-to-ot", {
      body: wheelOrderData,
    });

    if (error) {
      console.error("❌ SYNC - Failed to sync wheel order to OT:", error);
      return false;
    }

    console.log("✅ SYNC - Successfully synced wheel order to OT Platform:", data);
    return true;
  } catch (error: any) {
    console.error("❌ SYNC - Unexpected error syncing wheel order to OT:", error);
    return false;
  }
}
