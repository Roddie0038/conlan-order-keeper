import { supabase } from "@/integrations/supabase/client";

/**
 * Migrates a draft from one key to another, handling both local storage and server persistence
 */
export async function migrateDraftKey(
  oldKey: string,
  newKey: string
): Promise<void> {
  if (!oldKey || !newKey || oldKey === newKey) {
    return;
  }

  console.log(`🔄 Migrating draft: ${oldKey} → ${newKey}`);

  // Migrate local storage
  const oldLocalKey = `draft:${oldKey}`;
  const newLocalKey = `draft:${newKey}`;
  
  const oldLocalData = localStorage.getItem(oldLocalKey);
  if (oldLocalData) {
    try {
      // Move the data to the new key
      localStorage.setItem(newLocalKey, oldLocalData);
      localStorage.removeItem(oldLocalKey);
      console.log(`✅ Local storage migrated: ${oldLocalKey} → ${newLocalKey}`);
    } catch (error) {
      console.error("❌ Failed to migrate local storage:", error);
    }
  }

  try {
    // Get the old draft from server
    const { data: oldDraft, error: oldError } = await supabase
      .from("order_drafts")
      .select("*")
      .eq("draft_key", oldKey)
      .eq("submitted", false)
      .maybeSingle();

    if (oldError) {
      console.error("Error fetching old draft:", oldError);
      return;
    }

    if (!oldDraft) {
      console.log("No old draft to migrate");
      return;
    }

    // Check if new key already has a draft
    const { data: existingNewDraft, error: newError } = await supabase
      .from("order_drafts")
      .select("*")
      .eq("draft_key", newKey)
      .eq("submitted", false)
      .maybeSingle();

    if (newError) {
      console.error("Error fetching existing new draft:", newError);
      return;
    }

    // Determine which draft to keep (newest wins)
    let finalDraft = oldDraft;
    
    if (existingNewDraft) {
      const oldTime = new Date(oldDraft.updated_at).getTime();
      const newTime = new Date(existingNewDraft.updated_at).getTime();
      
      if (newTime > oldTime) {
        finalDraft = existingNewDraft;
        console.log("Keeping existing new draft (newer)");
      } else {
        console.log("Using old draft (newer)");
      }
    }

    // Upsert the final draft with the new key
    const { error: upsertError } = await supabase
      .from("order_drafts")
      .upsert({
        ...finalDraft,
        draft_key: newKey,
        updated_at: new Date().toISOString()
      }, {
        onConflict: "draft_key"
      });

    if (upsertError) {
      console.error("Error upserting migrated draft:", upsertError);
      return;
    }

    // Mark the old draft as submitted (soft delete)
    const { error: markError } = await supabase
      .from("order_drafts")
      .update({ submitted: true })
      .eq("draft_key", oldKey)
      .eq("submitted", false);

    if (markError) {
      console.error("Error marking old draft as submitted:", markError);
    } else {
      console.log(`✅ Old draft marked as submitted: ${oldKey}`);
    }

    console.log(`✅ Draft migration completed: ${oldKey} → ${newKey}`);
  } catch (error) {
    console.error("❌ Error during draft migration:", error);
  }
}

/**
 * Generates a temporary draft key for use before store/plant are resolved
 */
export function makeTempDraftKey(formType: string, subType: string, userId: string): string {
  return `${formType}:${subType}:__temp__:${userId}`;
}
