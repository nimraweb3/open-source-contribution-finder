import { createContext, useContext, useEffect, useState } from "react";
import { api, restore, setToken } from "../services/api";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const expired = () => setUser(null);
    window.addEventListener("auth:expired", expired);
    restore()
      .then(setUser)
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => window.removeEventListener("auth:expired", expired);
  }, []);
  async function authenticate(mode, body) {
    const data = await api(`/auth/${mode}`, { method: "POST", body });
    setToken(data.accessToken);
    setUser(data.user);
  }
  async function logout() {
    await api("/auth/logout", { method: "POST" });
    setToken(null);
    setUser(null);
  }
  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, authenticate, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
