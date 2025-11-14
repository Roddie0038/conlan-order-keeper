import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Updates an unassigned user's store in the managers table
 * This allows unassigned users to have their store auto-saved after first order
 * 
 * @param userEmail - The user's email address
 * @param selectedStore - The store they selected for the order
 * @returns true if update was successful, false otherwise
 */
export async function updateUnassignedUserStore(
  userEmail: string,
  selectedStore: string
): Promise<boolean> {
  try {
    logger.info("🔄 Checking if user store needs update", {
      userEmail,
      selectedStore,
      service: "userStoreUpdate"
    });

    // First, check if the user is unassigned
    const { data: currentManager, error: fetchError } = await supabase
      .from('managers')
      .select('store_number, email')
      .eq('email', userEmail)
      .eq('is_active', true)
      .single();

    if (fetchError) {
      logger.error("❌ Error fetching manager record", {
        error: fetchError,
        userEmail,
        service: "userStoreUpdate"
      });
      return false;
    }

    // Only update if currently unassigned
    if (currentManager && currentManager.store_number === 'Unassigned') {
      logger.info("✅ User is unassigned, updating store", {
        userEmail,
        currentStore: currentManager.store_number,
        newStore: selectedStore,
        service: "userStoreUpdate"
      });

      const { error: updateError } = await supabase
        .from('managers')
        .update({ store_number: selectedStore })
        .eq('email', userEmail)
        .eq('is_active', true);

      if (updateError) {
        logger.error("❌ Error updating manager store", {
          error: updateError,
          userEmail,
          selectedStore,
          service: "userStoreUpdate"
        });
        return false;
      }

      logger.info("✅ Successfully updated user store", {
        userEmail,
        newStore: selectedStore,
        service: "userStoreUpdate"
      });

      return true;
    } else {
      logger.debug("ℹ️ User already has assigned store, skipping update", {
        userEmail,
        currentStore: currentManager?.store_number,
        service: "userStoreUpdate"
      });
      return false;
    }
  } catch (error) {
    logger.error("❌ Unexpected error in updateUnassignedUserStore", {
      error,
      userEmail,
      selectedStore,
      service: "userStoreUpdate"
    });
    return false;
  }
}
