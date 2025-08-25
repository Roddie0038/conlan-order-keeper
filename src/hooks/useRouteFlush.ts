import { useEffect, useContext } from "react";
import { useLocation, UNSAFE_NavigationContext } from "react-router-dom";

/**
 * Hook to flush draft saves on route changes and page unload
 */
export function useRouteFlush(saveNow: () => void) {
  const location = useLocation();
  const navigation = useContext(UNSAFE_NavigationContext);

  // Flush on route change (React Router navigation)
  useEffect(() => {
    // Use location change effect instead of navigation listener to avoid conflicts
    return () => {
      console.log("🚀 Location cleanup, flushing draft");
      saveNow();
    };
  }, [location.pathname, saveNow]);

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

  // Also flush when location changes (React Router navigation)
  useEffect(() => {
    return () => {
      console.log("🚀 Location cleanup, flushing draft");
      saveNow();
    };
  }, [location.pathname, saveNow]);
}