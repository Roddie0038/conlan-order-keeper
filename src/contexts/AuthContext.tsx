
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  username: string;
  store: string;
  isAdmin: boolean;
  plant?: string;
  // New properties needed by the warranty form
  id: string;
  email: string;
  name: string;
  storeName: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, plant: string) => boolean;
  logout: () => void;
  loading: boolean;
}

const users = [
  { username: 'Fort Worth22', password: 'Welcome22', store: 'Fort Worth 22', isAdmin: false },
  { username: 'Grand Prairie27', password: 'Welcome27', store: 'Grand Prairie 27', isAdmin: false },
  { username: 'Houston28', password: 'Welcome28', store: 'Houston 28', isAdmin: false },
  { username: 'San Antonio29', password: 'Welcome29', store: 'San Antonio 29', isAdmin: false },
  { username: 'Oklahoma30', password: 'Welcome30', store: 'Oklahoma City 30', isAdmin: false },
  { username: 'Little Rock32', password: 'Welcome32', store: 'Little Rock 32', isAdmin: false },
  { username: 'Kansas33', password: 'Welcome33', store: 'Kansas 33', isAdmin: false },
  { username: 'Laredo35', password: 'Welcome35', store: 'Laredo 35', isAdmin: false },
  { username: 'Tulsa36', password: 'Welcome36', store: 'Tulsa 36', isAdmin: false },
  { username: 'Austin39', password: 'Welcome39', store: 'Austin 39', isAdmin: false },
  { username: 'Conlan97', password: '97orders', store: 'Admin', isAdmin: true },
  
  // New stores added
  { username: 'Miami 3', password: 'Welcome3', store: 'Miami 3', isAdmin: false },
  { username: 'Pompano Beach7', password: 'Welcome7', store: 'Pompano Beach 7', isAdmin: false },
  { username: 'Fort Myers9', password: 'Welcome9', store: 'Fort Myers 9', isAdmin: false },
  { username: 'Jacksonville2', password: 'Welcome2', store: 'Jacksonville 2', isAdmin: false },
  { username: 'Ocala5', password: 'Welcome5', store: 'Ocala 5', isAdmin: false },
  { username: 'Tallahassee15', password: 'Welcome15', store: 'Tallahassee 15', isAdmin: false },
  { username: 'Mulberry99', password: 'Welcome99', store: 'Mulberry 99', isAdmin: false },
  { username: 'Orlando4', password: 'Welcome4', store: 'Orlando 4', isAdmin: false },
  { username: 'Tampa6', password: 'Welcome3', store: 'Tampa 6', isAdmin: false },
  { username: 'Vero Beach21', password: 'Welcome21', store: 'Vero Beach 21', isAdmin: false },
  { username: 'Sarasota23', password: 'Welcome23', store: 'Sarasota 23', isAdmin: false },
  { username: 'Romulus098', password: 'Welcome98', store: 'Romulus 098', isAdmin: false },
  { username: 'Toledo8', password: 'Welcome8', store: 'Toledo 8', isAdmin: false },
  { username: 'Detroit11', password: 'Welcome11', store: 'Detroit 11', isAdmin: false },
  { username: 'Grand Rapids13', password: 'Welcome13', store: 'Grand Rapids 13', isAdmin: false },
  { username: 'Cleveland18', password: 'Welcome18', store: 'Cleveland 18', isAdmin: false },
  { username: 'Chicago41', password: 'Welcome41', store: 'Chicago 41', isAdmin: false },
  
  // Plant admin accounts
  { username: 'Grand Prairie 97', password: 'Conlan97', store: 'Admin', isAdmin: true },
  { username: 'Romulus 98', password: 'Conlan98', store: 'Admin', isAdmin: true },
  { username: 'Mulberry 99', password: 'Conlan99', store: 'Admin', isAdmin: true },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to generate a user ID from username
const generateUserId = (username: string): string => {
  return `user_${username.replace(/\s+/g, '_').toLowerCase()}`;
};

// Helper function to generate email from store name
const generateEmail = (storeName: string, username: string): string => {
  const cleanStoreName = storeName.replace(/\s+/g, '').toLowerCase();
  return `${cleanStoreName}@conlantire.com`;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthProvider: Checking for saved user...");
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log("AuthProvider: Found saved user:", parsedUser.store);
        setUser(parsedUser);
      } catch (error) {
        console.error("AuthProvider: Error parsing saved user:", error);
        localStorage.removeItem('user');
      }
    } else {
      console.log("AuthProvider: No saved user found");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      console.log("AuthProvider: Saving user to localStorage:", user.store);
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      console.log("AuthProvider: Removing user from localStorage");
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = (username: string, password: string, plant: string) => {
    console.log("AuthProvider: Attempting login for:", username);
    const userMatch = users.find(u => u.username === username && u.password === password);
    if (userMatch) {
      const extendedUser: User = {
        username: userMatch.username,
        store: userMatch.store,
        isAdmin: userMatch.isAdmin,
        plant: plant,
        // New required properties
        id: generateUserId(userMatch.username),
        email: generateEmail(userMatch.store, userMatch.username),
        name: userMatch.username,
        storeName: userMatch.store
      };
      console.log("AuthProvider: Login successful for:", extendedUser.store);
      setUser(extendedUser);
      return true;
    }
    console.log("AuthProvider: Login failed for:", username);
    return false;
  };

  const logout = () => {
    console.log("AuthProvider: Logging out user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
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
