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
  // Unmount-only cleanup
  useEffect(() => {
    return () => {
      if (!enabled) return;
      if (isSubmittingRef?.current) {
        // Skip flush while a submit is in progress
        return;
      }

      const watchdog = window.setTimeout(() => {}, 4000);
      try {
        // Tag the source for consistent telemetry
        // eslint-disable-next-line no-console
        console.log("🚀 Location cleanup, flushing draft");
        saveNow("location_cleanup");
      } finally {
        window.clearTimeout(watchdog);
      }
    };
    // unmount-only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
