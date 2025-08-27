import { useEffect } from "react";
import type { SaveSource } from "@/hooks/useServerOrderDraft"; // adjust if needed

type Params = {
  saveNow: (source?: SaveSource) => void | Promise<void>;   // precise return
  isSubmittingRef?: React.MutableRefObject<boolean>;        // boolean ref
  enabled?: boolean;
};

// Compile-time guard (keeps this file honest)
const _paramsTypecheck: Params = {
  saveNow: async (_src?: SaveSource): Promise<void> => {},
  isSubmittingRef: { current: false },
  enabled: true,
};
void _paramsTypecheck;

export function useRouteFlush({ saveNow, isSubmittingRef, enabled = true }: Params) {
  // Unmount-only cleanup with stricter guards
  useEffect(() => {
    let isCleaningUp = false;
    
    return () => {
      if (!enabled || isCleaningUp) {
        console.log("💾 FLUSH: Route flush skipped -", { enabled, isCleaningUp });
        return;
      }
      
      if (isSubmittingRef?.current) {
        console.log("💾 FLUSH: Route flush blocked - submission in progress");
        return;
      }

      isCleaningUp = true;
      const watchdog = window.setTimeout(() => {
        console.log("💾 FLUSH: Route flush watchdog timeout");
      }, 4000);
      
      try {
        console.log("💾 FLUSH: Executing route cleanup flush");
        saveNow("location_cleanup");
      } finally {
        window.clearTimeout(watchdog);
      }
    };
    // unmount-only - DO NOT add dependencies that could cause re-runs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
