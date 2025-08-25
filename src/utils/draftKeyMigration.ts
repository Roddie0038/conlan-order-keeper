import { supabase } from "@/integrations/supabase/client";

/**
 * Helper to detect placeholder values that should use temp keys
 */
export const isPlaceholder = (v?: string): boolean => {
  if (!v) return true;
  if (/^\s*$/.test(v)) return true;
  if (/^unknown/i.test(v)) return true;
  if (/^unassigned/i.test(v)) return true;
  return false;
};

/**
 * Migrates a draft from one key to another, handling both local storage and server persistence
 * Enhanced with better winner logic and telemetry
 */
export async function migrateDraftKey(
  oldKey: string,
  newKey: string
): Promise<void> {
  if (!oldKey || !newKey || oldKey === newKey) {
    return;
  }

  console.log(`🔄 Migrating draft: ${oldKey} → ${newKey}`);

  // Start telemetry
  const migrationStart = Date.now();
  const telemetry = {
    oldKey,
    newKey,
    success: false,
    winner: null as string | null,
    oldKeyClosed: false,
    error: null as string | null,
    timestamp: new Date().toISOString()
  };

  try {
    // Migrate local storage first
    const oldLocalKey = `draft:${oldKey}`;
    const newLocalKey = `draft:${newKey}`;
    
    const oldLocalData = localStorage.getItem(oldLocalKey);
    if (oldLocalData) {
      try {
        localStorage.setItem(newLocalKey, oldLocalData);
        localStorage.removeItem(oldLocalKey);
        console.log(`✅ Local storage migrated: ${oldLocalKey} → ${newLocalKey}`);
      } catch (error) {
        console.error("❌ Failed to migrate local storage:", error);
      }
    }

    // Get both drafts from server
    const { data: oldDraft, error: oldError } = await supabase
      .from("order_drafts")
      .select("*")
      .eq("draft_key", oldKey)
      .eq("submitted", false)
      .maybeSingle();

    if (oldError) {
      telemetry.error = `Error fetching old draft: ${oldError.message}`;
      console.error("Error fetching old draft:", oldError);
      return;
    }

    if (!oldDraft) {
      console.log("No old draft to migrate");
      telemetry.success = true;
      return;
    }

    const { data: existingNewDraft, error: newError } = await supabase
      .from("order_drafts")
      .select("*")
      .eq("draft_key", newKey)
      .eq("submitted", false)
      .maybeSingle();

    if (newError) {
      telemetry.error = `Error fetching new draft: ${newError.message}`;
      console.error("Error fetching existing new draft:", newError);
      return;
    }

    // Determine winner (newest wins by updated_at)
    let finalDraft = oldDraft;
    let shouldCloseOldKey = true;
    
    if (existingNewDraft) {
      const oldTime = new Date(oldDraft.updated_at).getTime();
      const newTime = new Date(existingNewDraft.updated_at).getTime();
      
      if (newTime > oldTime) {
        finalDraft = existingNewDraft;
        telemetry.winner = 'existing_new_draft';
        console.log(`Keeping existing new draft (newer: ${existingNewDraft.updated_at} > ${oldDraft.updated_at})`);
      } else {
        telemetry.winner = 'old_draft';
        console.log(`Using old draft (newer: ${oldDraft.updated_at} >= ${existingNewDraft.updated_at})`);
      }
    } else {
      telemetry.winner = 'old_draft';
      console.log("No existing new draft, migrating old draft");
    }

    // Upsert the winner under the new key
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
      telemetry.error = `Error upserting draft: ${upsertError.message}`;
      console.error("Error upserting migrated draft:", upsertError);
      return;
    }

    // Close the old draft key (only if we didn't just move the same row)
    if (shouldCloseOldKey) {
      const { error: markError } = await supabase
        .from("order_drafts")
        .update({ submitted: true })
        .eq("draft_key", oldKey)
        .eq("submitted", false);

      if (markError) {
        telemetry.error = `Error closing old key: ${markError.message}`;
        console.error("Error marking old draft as submitted:", markError);
      } else {
        telemetry.oldKeyClosed = true;
        console.log(`✅ Old draft marked as submitted: ${oldKey}`);
      }
    }

    telemetry.success = true;
    console.log(`✅ Draft migration completed: ${oldKey} → ${newKey}`);
    console.log('🔄 Migration telemetry:', {
      ...telemetry,
      durationMs: Date.now() - migrationStart
    });

  } catch (error) {
    telemetry.error = error instanceof Error ? error.message : String(error);
    console.error("❌ Error during draft migration:", error);
    console.log('🔄 Migration telemetry (failed):', telemetry);
  }
}

/**
 * Generates a temporary draft key for use before store/plant are resolved
 */
export function makeTempDraftKey(formType: string, subType: string, userId: string): string {
  return `${formType}:${subType}:__temp__:${userId}`;
}
