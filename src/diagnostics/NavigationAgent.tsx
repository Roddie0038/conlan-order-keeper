/**
 * Navigation Agent - Monitors browser and router navigation events
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { DIAG_ENABLED, logEvent } from './config';

export function NavigationAgent() {
  const location = useLocation();
  const previousLocation = useRef<string>('');

  useEffect(() => {
    if (!DIAG_ENABLED) return;

    // Log route changes
    if (previousLocation.current && previousLocation.current !== location.pathname) {
      logEvent({
        kind: 'ROUTE_CHANGE',
        from: previousLocation.current,
        to: location.pathname,
        ts: Date.now()
      });
    }
    
    previousLocation.current = location.pathname;

    // Log navigation type on mount/route change
    try {
      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navEntries.length > 0) {
        const navEntry = navEntries[0];
        logEvent({
          kind: 'NAVIGATION_TYPE',
          navType: navEntry.type,
          ts: Date.now()
        });
      }
    } catch (error) {
      console.warn('[DIAG] Performance Navigation API not available:', error);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!DIAG_ENABLED) return;

    // Browser lifecycle event listeners
    const handleVisibilityChange = () => {
      logEvent({
        kind: 'VISIBILITY_CHANGE',
        hidden: document.hidden,
        ts: Date.now()
      });
    };

    const handlePageHide = (event: PageTransitionEvent) => {
      logEvent({
        kind: 'PAGEHIDE',
        persisted: event.persisted,
        ts: Date.now()
      });
    };

    const handleBeforeUnload = () => {
      logEvent({
        kind: 'BEFORE_UNLOAD',
        ts: Date.now()
      });
    };

    const handlePopState = (event: PopStateEvent) => {
      logEvent({
        kind: 'POPSTATE',
        state: event.state,
        ts: Date.now()
      });
    };

    // Attach listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Return null - this is a monitoring-only component
  return null;
}