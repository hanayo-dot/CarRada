import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStoredToken, storeToken, removeStoredToken, setAuthToken, fetchCurrentUser } from '../api/api';

interface AuthContextType {
  token: string | null;
  user: any | null;
  loading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const stored = await getStoredToken();
        if (stored) {
          setAuthToken(stored);
          try {
            const currentUser = await fetchCurrentUser();
            setTokenState(stored);
            setUser(currentUser);
          } catch {
            await removeStoredToken();
            setAuthToken(null);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const signIn = async (newToken: string) => {
    setTokenState(newToken);
    setAuthToken(newToken);
    await storeToken(newToken);
    try {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
    } catch {
      // Ignore
    }
  };

  const signOut = async () => {
    setTokenState(null);
    setUser(null);
    setAuthToken(null);
    await removeStoredToken();
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
