import { useEffect, useContext, useRef } from "react";
import { useLocation, UNSAFE_NavigationContext } from "react-router-dom";

/**
 * Hook to flush draft saves on route changes and page unload
 * Fixed to prevent save loops during submission
 */
export function useRouteFlush(saveNow: () => void, isSubmitting?: boolean) {
  const location = useLocation();
  const navigation = useContext(UNSAFE_NavigationContext);
  const preventFlushRef = useRef(false);

  // Method to temporarily prevent flushes during submission
  const preventFlush = () => {
    preventFlushRef.current = true;
    setTimeout(() => {
      preventFlushRef.current = false;
    }, 5000); // Reset after 5 seconds as safety
  };

  // Flush on route change (React Router navigation) - SINGLE EFFECT
  useEffect(() => {
    return () => {
      // Guard against flush during submission or when prevented
      if (isSubmitting || preventFlushRef.current) {
        console.log("🚀 Location cleanup skipped - submission in progress");
        return;
      }
      console.log("🚀 Location cleanup, flushing draft");
      saveNow();
    };
  }, [location.pathname, saveNow, isSubmitting]);

  // Flush on page unload/beforeunload
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      console.log("🚀 Page unload detected, flushing draft");
      saveNow();
    };

    const handlePageHide = () => {
      console.log("🚀 Page hide detected, flushing draft");
      saveNow();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        console.log("🚀 Page hidden, flushing draft");
        saveNow();
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