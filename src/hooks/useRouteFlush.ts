import { useEffect } from "react";
import type { SaveSource } from "@/hooks/useServerOrderDraft";

type Params = {
  saveNow: (source?: SaveSource) => void | Promise<void>;
  isSubmittingRef?: React.MutableRefObject<boolean>;
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
        // Note: page visibility/unload handlers elsewhere should use their own sources.
        // This path is purely the route unmount.
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
