import { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as api from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!api.tokenStore.get()) {
      setUser(null);
      return null;
    }
    try {
      const me = await api.getMe();
      setUser(me);
      return me;
    } catch {
      setUser(null);
      api.tokenStore.clear();
      return null;
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refreshUser();
      setLoading(false);
    })();
  }, [refreshUser]);

  const login = async (email, password) => {
    await api.login(email, password);
    await refreshUser();
  };

  const register = async (email, password) => {
    await api.register(email, password);
    await api.login(email, password);
    await refreshUser();
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
