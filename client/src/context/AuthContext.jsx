import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client.js";

const AuthContext = createContext(null);
const TOKEN_KEY = "sos_token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  const persistSession = useCallback((session) => {
    localStorage.setItem(TOKEN_KEY, session.token);
    setToken(session.token);
    setUser(session.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      if (!token) {
        setBooting(false);
        return;
      }

      try {
        const data = await apiRequest("/auth/me", { token });

        if (isMounted) {
          setUser(data.user);
        }
      } catch (error) {
        logout();
      } finally {
        if (isMounted) {
          setBooting(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [logout, token]);

  const login = useCallback(
    async (payload) => {
      const session = await apiRequest("/auth/login", {
        method: "POST",
        body: payload
      });
      persistSession(session);
      return session;
    },
    [persistSession]
  );

  const register = useCallback(
    async (payload) => {
      const session = await apiRequest("/auth/register", {
        method: "POST",
        body: payload
      });
      persistSession(session);
      return session;
    },
    [persistSession]
  );

  const value = useMemo(
    () => ({
      booting,
      login,
      logout,
      register,
      token,
      user
    }),
    [booting, login, logout, register, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
