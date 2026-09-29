import type { PropsWithChildren, Dispatch, SetStateAction } from "react";
import type { User } from "../types";
interface AuthState {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  loading: boolean;
  authenticate: (mode: string, body: unknown) => Promise<void>;
  logout: () => Promise<void>;
  sessionError: string;
  retrySession: () => void;
}
import { createContext, useContext, useEffect, useState } from "react";
import { api, restore, setToken } from "../services/api";
const AuthContext = createContext<AuthState | null>(null);
export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    setLoading(true);
    setSessionError("");
    const expired = () => setUser(null);
    window.addEventListener("auth:expired", expired);
    restore()
      .then(setUser)
      .catch(() =>
        setSessionError(
          "Could not restore your session. Check your connection and retry.",
        ),
      )
      .finally(() => setLoading(false));
    return () => window.removeEventListener("auth:expired", expired);
  }, [revision]);
  async function authenticate(mode: string, body: unknown) {
    const data = await api<{ user: User; accessToken: string }>(
      `/auth/${mode}`,
      { method: "POST", body },
    );
    setToken(data.accessToken);
    setUser(data.user);
    setSessionError("");
  }
  async function logout() {
    await api("/auth/logout", { method: "POST" });
    setToken(null);
    setUser(null);
  }
  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        authenticate,
        logout,
        sessionError,
        retrySession: () => setRevision((n) => n + 1),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("Missing AuthProvider");
  return context;
};
