
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
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
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
    
    // Get plant and store info from user metadata if available
    const userMetadata = authUser.user_metadata || {};
    const storeNameNumber = userMetadata.store_name_number || storeManager?.store_number || 'Unassigned';
    const defaultPlant = userMetadata.default_plant || storeManager?.plant_code || 'Grand Prairie 97';
    
    if (storeManager) {
      return {
        ...authUser,
        // Flattened fields for component compatibility
        name: storeManager.name,
        title: storeManager.role,
        store: storeManager.store_number,
        storeName: storeNameNumber, // Use metadata format: "Store Name Store Number"
        plant: defaultPlant, // Use metadata default plant
        isAdmin: isUserAdmin(authUser.email!, storeManager.role),
        username: storeManager.name, // Use name as username
        
        // Keep nested object for backwards compatibility
        storeManager: {
          ...storeManager,
          store_number: storeNameNumber, // Update with proper format
          plant_code: defaultPlant
        }
      };
    }

    // Fallback for users without store manager records
    return {
      ...authUser,
      name: userMetadata.role_title || authUser.email!,
      title: userMetadata.role_title || 'User',
      store: 'Unassigned',
      storeName: storeNameNumber,
      plant: defaultPlant,
      isAdmin: isUserAdmin(authUser.email!),
      username: userMetadata.role_title || authUser.email!,
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

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log("AuthProvider: Attempting password reset for:", email);
      
      // Check for rate limiting
      const lastResetAttempt = localStorage.getItem('lastPasswordResetAttempt');
      const resetAttempts = parseInt(localStorage.getItem('passwordResetAttempts') || '0');
      const now = Date.now();
      
      if (lastResetAttempt && now - parseInt(lastResetAttempt) < 60000 && resetAttempts >= 3) {
        return { success: false, error: "Too many reset attempts. Please wait before trying again." };
      }
      
      // Platform-aware redirect URL - use current domain for reset password
      const redirectUrl = `${window.location.origin}/reset-password`;
      console.log("AuthProvider: Using redirect URL:", redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      // Update rate limiting
      localStorage.setItem('lastPasswordResetAttempt', now.toString());
      localStorage.setItem('passwordResetAttempts', (resetAttempts + 1).toString());

      if (error) {
        console.log("AuthProvider: Password reset failed:", error.message);
        return { success: false, error: error.message };
      }

      console.log("AuthProvider: Password reset email sent");
      return { success: true };
    } catch (error) {
      console.error("AuthProvider: Password reset error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const updatePassword = async (password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log("AuthProvider: Attempting password update");
      
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.log("AuthProvider: Password update failed:", error.message);
        return { success: false, error: error.message };
      }

      console.log("AuthProvider: Password updated successfully");
      return { success: true };
    } catch (error) {
      console.error("AuthProvider: Password update error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, login, logout, resetPassword, updatePassword, loading }}>
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
