import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function AuthHealthMonitor() {
  const { user, session, logout } = useAuth();

  useEffect(() => {
    // Monitor session health every 30 seconds
    const interval = setInterval(async () => {
      if (session) {
        // Check if session is still valid
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        
        if (error || !currentUser) {
          console.warn('[AuthHealthMonitor] Session invalid, forcing logout:', error?.message);
          await logout();
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [session, logout]);

  // Monitor for session expiry events
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        console.log('[AuthHealthMonitor] Token refreshed successfully');
      } else if (event === 'SIGNED_OUT') {
        console.log('[AuthHealthMonitor] User signed out');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // This component doesn't render anything, it just monitors
  return null;
}