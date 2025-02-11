import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  username: string;
  store: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const users = [
  { username: 'Fort Worth22', password: 'Welcome22', store: 'Fort Worth', isAdmin: false },
  { username: 'Grand Prairie27', password: 'Welcome27', store: 'Grand Prairie', isAdmin: false },
  { username: 'Houston28', password: 'Welcome28', store: 'Houston', isAdmin: false },
  { username: 'San Antonio29', password: 'Welcome29', store: 'San Antonio', isAdmin: false },
  { username: 'Oklahoma30', password: 'Welcome30', store: 'Oklahoma City', isAdmin: false },
  { username: 'Little Rock32', password: 'Welcome32', store: 'Little Rock', isAdmin: false },
  { username: 'Kansas33', password: 'Welcome33', store: 'Kansas City', isAdmin: false },
  { username: 'Laredo35', password: 'Welcome35', store: 'Laredo', isAdmin: false },
  { username: 'Tulsa36', password: 'Welcome36', store: 'Tulsa', isAdmin: false },
  { username: 'Austin39', password: 'Welcome39', store: 'Austin', isAdmin: false },
  { username: 'Conlan97', password: '97orders', store: 'Admin', isAdmin: true }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = (username: string, password: string) => {
    const userMatch = users.find(u => u.username === username && u.password === password);
    if (userMatch) {
      setUser({ 
        username: userMatch.username, 
        store: userMatch.store, 
        isAdmin: userMatch.isAdmin 
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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