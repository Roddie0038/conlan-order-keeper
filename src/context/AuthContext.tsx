import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { supabase } from "@/integrations/supabase/client";

type AuthEvent =
  | "SIGNED_IN"
  | "SIGNED_OUT"
  | "TOKEN_REFRESHED"
  | "USER_UPDATED"
  | "INITIAL_SESSION"
  | "PASSWORD_RECOVERY"
  | "UNKNOWN";

type AuthState = {
  event: AuthEvent;
  userId: string | null;
  email: string | null;
};

export interface ExtendedUser {
  id: string;
  email: string;
  name: string;
  title: string;
  store: string;
  storeName: string;
  plant: string;
  isAdmin: boolean;
  hasFullStoreAccess: boolean;
  username: string;
  role?: string;
  storeManager?: any;
  user_metadata?: any;
  [key: string]: any;
}

type AuthContextValue = {
  auth: AuthState;
  isElevated: boolean;
  bootstrapOnce: () => Promise<void>;
  // Legacy compatibility for existing components
  user: ExtendedUser | null;
  session: any;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
  isEnriching: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({ event: "UNKNOWN", userId: null, email: null });
  const [isElevated, setIsElevated] = useState(false);
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEnriching, setIsEnriching] = useState(false);

  // single-flight bootstrap
  const bootInFlight = useRef<Promise<void> | null>(null);
  const bootDoneRef = useRef(false);

  const bootstrapOnce = useCallback(async () => {
    if (bootDoneRef.current) return;
    if (bootInFlight.current) return bootInFlight.current;
    bootInFlight.current = (async () => {
      try {
        console.log("[Auth] Bootstrap starting...");
        setIsEnriching(true);
        
        // Fetch user data and determine role
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser?.email) {
          const [managerResult, otUserResult] = await Promise.all([
            supabase.from('managers').select('*').eq('email', authUser.email).eq('is_active', true).single(),
            supabase.from('ot_platform_users').select('role, plant, store, status').eq('email', authUser.email).eq('status', 'active').single()
          ]);
          
          const managerData = managerResult.data;
          const otUserData = otUserResult.data;

          const isAdmin = authUser.email === 'bperry@conlantire.com' || 
                         ['Admin', 'Super Admin', 'Operations Manager'].includes(otUserData?.role || '');
          
          const enrichedUser: ExtendedUser = {
            ...authUser,
            id: authUser.id,
            email: authUser.email!,
            name: managerData?.name || authUser.email!,
            title: managerData?.role || 'User',
            store: managerData?.store_number || 'Unassigned',
            storeName: managerData?.store_number || 'Unassigned',
            plant: managerData?.plant_code || 'Grand Prairie 097',
            isAdmin,
            hasFullStoreAccess: authUser.email === 'bperry@conlantire.com',
            username: managerData?.name || authUser.email!,
            role: otUserData?.role,
            storeManager: managerData
          };

          setUser(enrichedUser);
          setIsElevated(isAdmin);
          console.log("[Auth] Bootstrap completed for:", enrichedUser.storeName);
        }
      } finally {
        bootDoneRef.current = true;
        bootInFlight.current = null;
        setIsEnriching(false);
        setLoading(false);
      }
    })();
    return bootInFlight.current;
  }, []);

  useEffect(() => {
    let prevEvent: AuthEvent | null = null;
    let prevUserId: string | null = null;

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      const userId = session?.user?.id ?? null;
      const email = session?.user?.email ?? null;

      // dedupe identical (event, userId) – prevents focus spam
      if (prevEvent === (event as AuthEvent) && prevUserId === userId) return;
      prevEvent = event as AuthEvent;
      prevUserId = userId;

      console.log("[Auth] Event:", event, userId ? `(${email})` : '(no user)');
      setAuth({ event: event as AuthEvent, userId, email });
      setSession(session);

      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        await bootstrapOnce();
      } else if (event === "SIGNED_OUT") {
        bootDoneRef.current = false;
        bootInFlight.current = null;
        setIsElevated(false);
        setUser(null);
        setLoading(false);
      }
      // Never reload or navigate on TOKEN_REFRESHED.
    });

    return () => sub?.subscription?.unsubscribe();
  }, [bootstrapOnce]);

  // visibility changes must be inert
  useEffect(() => {
    const onVis = () => {};
    window.addEventListener("visibilitychange", onVis);
    return () => window.removeEventListener("visibilitychange", onVis);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setUser(null);
      setSession(null);
      setIsElevated(false);
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberMe');
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ 
      auth, 
      isElevated, 
      bootstrapOnce,
      user,
      session,
      login,
      logout,
      resetPassword,
      updatePassword,
      loading,
      isEnriching
    }),
    [auth, isElevated, bootstrapOnce, user, session, login, logout, resetPassword, updatePassword, loading, isEnriching]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
