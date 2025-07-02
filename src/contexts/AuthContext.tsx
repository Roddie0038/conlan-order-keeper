
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface StoreManager {
  id: string;
  name: string;
  email: string;
  title: string;
  store_number: string;
  plant: string;
}

interface ExtendedUser extends User {
  storeManager?: StoreManager;
}

interface AuthContextType {
  user: ExtendedUser | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to fetch store manager profile
  const fetchStoreManagerProfile = async (email: string): Promise<StoreManager | null> => {
    try {
      const { data, error } = await supabase.rpc('get_store_manager_by_email', {
        user_email: email
      });

      if (error) {
        console.error('Error fetching store manager profile:', error);
        return null;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error calling store manager function:', error);
      return null;
    }
  };

  // Enhanced user object with store manager data
  const enrichUserWithStoreData = async (authUser: User): Promise<ExtendedUser> => {
    const storeManager = await fetchStoreManagerProfile(authUser.email!);
    return {
      ...authUser,
      storeManager: storeManager || undefined
    };
  };

  useEffect(() => {
    console.log("AuthProvider: Initializing Supabase Auth...");
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("AuthProvider: Auth state changed:", event);
        
        setSession(session);
        
        if (session?.user) {
          const enrichedUser = await enrichUserWithStoreData(session.user);
          setUser(enrichedUser);
          console.log("AuthProvider: User authenticated:", enrichedUser.storeManager?.store_number);
        } else {
          setUser(null);
          console.log("AuthProvider: User signed out");
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        enrichUserWithStoreData(session.user).then(enrichedUser => {
          setSession(session);
          setUser(enrichedUser);
          console.log("AuthProvider: Found existing session:", enrichedUser.storeManager?.store_number);
        });
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log("AuthProvider: Attempting login for:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        console.log("AuthProvider: Login failed:", error.message);
        return { success: false, error: error.message };
      }

      if (data.user) {
        const enrichedUser = await enrichUserWithStoreData(data.user);
        setUser(enrichedUser);
        setSession(data.session);
        console.log("AuthProvider: Login successful for:", enrichedUser.storeManager?.store_number);
        return { success: true };
      }

      return { success: false, error: "Login failed - no user returned" };
    } catch (error) {
      console.error("AuthProvider: Login error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const logout = async () => {
    try {
      console.log("AuthProvider: Logging out user");
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error("AuthProvider: Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
