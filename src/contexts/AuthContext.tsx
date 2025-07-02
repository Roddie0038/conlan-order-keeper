
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface StoreManager {
  id: string;
  name: string;
  email: string;
  role: string;
  store_number: string;
  plant_code: string;
  is_active: boolean;
}

interface ExtendedUser extends User {
  // Flattened fields that components expect
  name: string;
  title: string;
  store: string;
  storeName: string;
  plant: string;
  isAdmin: boolean;
  username: string;
  
  // Keep nested object for backwards compatibility
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

  // Helper function to fetch store manager profile using direct table query
  const fetchStoreManagerProfile = async (email: string): Promise<StoreManager | null> => {
    try {
      const { data, error } = await supabase
        .from('managers')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching store manager profile:', error);
        return null;
      }

      return data ? {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role || 'Store Manager',
        store_number: data.store_number || 'Unassigned',
        plant_code: data.plant_code || 'Grand Prairie 97',
        is_active: data.is_active
      } : null;
    } catch (error) {
      console.error('Error calling store manager query:', error);
      return null;
    }
  };

  // Helper function to determine admin status
  const isUserAdmin = (email: string, role?: string): boolean => {
    // Check for specific admin emails
    const adminEmails = [
      'conlan97@conlantire.com',
      'bperry@conlantire.com',
      'admin@conlantire.com'
    ];
    
    if (adminEmails.includes(email.toLowerCase())) {
      return true;
    }

    // Check for admin roles/titles
    const adminRoles = [
      'plant_manager',
      'warehouse_manager', 
      'operations_manager',
      'corporate_director',
      'admin',
      'super_admin'
    ];
    
    if (role && adminRoles.some(adminRole => 
      role.toLowerCase().includes(adminRole.toLowerCase())
    )) {
      return true;
    }

    return false;
  };

  // Helper function to format store name
  const formatStoreName = (storeNumber: string): string => {
    // Convert store number to readable store name
    return storeNumber || 'Unassigned';
  };

  // Enhanced user object with flattened store manager data
  const enrichUserWithStoreData = async (authUser: User): Promise<ExtendedUser> => {
    const storeManager = await fetchStoreManagerProfile(authUser.email!);
    
    if (storeManager) {
      return {
        ...authUser,
        // Flattened fields for component compatibility
        name: storeManager.name,
        title: storeManager.role,
        store: storeManager.store_number,
        storeName: formatStoreName(storeManager.store_number),
        plant: storeManager.plant_code,
        isAdmin: isUserAdmin(authUser.email!, storeManager.role),
        username: storeManager.name, // Use name as username
        
        // Keep nested object for backwards compatibility
        storeManager: storeManager
      };
    }

    // Fallback for users without store manager records
    return {
      ...authUser,
      name: authUser.email!,
      title: 'User',
      store: 'Unassigned',
      storeName: 'Unassigned',
      plant: 'Grand Prairie 97',
      isAdmin: isUserAdmin(authUser.email!),
      username: authUser.email!,
      storeManager: undefined
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
          console.log("AuthProvider: User authenticated:", enrichedUser.storeName);
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
          console.log("AuthProvider: Found existing session:", enrichedUser.storeName);
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
        console.log("AuthProvider: Login successful for:", enrichedUser.storeName);
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
