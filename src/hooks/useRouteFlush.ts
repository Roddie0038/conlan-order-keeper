import { useEffect, useRef } from "react";
import type { SaveSource } from "@/hooks/useServerOrderDraft";

type Params = {
  saveNow: (source?: SaveSource) => void | Promise<void>;   // precise return
  isSubmittingRef?: React.MutableRefObject<boolean>;        // boolean ref
  enabled?: boolean;
};

// Compile-time guard (prevents regressions)
const _paramsTypecheck: Params = {
  saveNow: async (_src?: SaveSource): Promise<void> => {},
  isSubmittingRef: { current: false },
  enabled: true,
};
void _paramsTypecheck; // silence unused var

/**
 * Hook to flush draft saves on route changes and page unload
 * Fixed to prevent save loops during submission - unmount-only
 */
export function useRouteFlush({ saveNow, isSubmittingRef, enabled = true }: Params) {
  const preventFlushRef = useRef(false);

  const preventFlush = () => {
    preventFlushRef.current = true;
    window.setTimeout(() => (preventFlushRef.current = false), 5000);
  };

  // Unmount-only effect to prevent re-registration on every render
  useEffect(() => {
    return () => {
      if (!enabled) return;
      if (isSubmittingRef?.current) {
        console.log("🚀 Location cleanup skipped - submission in progress");
        return;
      }
      if (preventFlushRef.current) return;

      console.log("🚀 Location cleanup, flushing draft");
      const watchdog = window.setTimeout(() => {}, 4000);
      try {
        // tag the source for telemetry
        saveNow("location_cleanup");
      } finally {
        window.clearTimeout(watchdog);
      }
    };
    // unmount-only; no deps to prevent re-registration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Flush on page unload/beforeunload
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      console.log("🚀 Page unload detected, flushing draft");
      saveNow("page_unload");
    };

    const handlePageHide = () => {
      console.log("🚀 Page hide detected, flushing draft");
      saveNow("page_hide");
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        console.log("🚀 Page hidden, flushing draft");
        saveNow("page_hidden");
      }
    };

    // Add multiple event listeners for different scenarios
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [saveNow]);

  return { preventFlush };
}