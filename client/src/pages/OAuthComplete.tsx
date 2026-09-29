import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function OAuthComplete() {
  const { user, loading, sessionError } = useAuth();
  const [params] = useSearchParams();
  const next = params.get("next") || "/dashboard";
  if (loading)
    return (
      <main className="state" role="status">
        Completing sign in…
      </main>
    );
  if (sessionError)
    return (
      <main className="state">
        Sign-in is waiting for your session to reconnect. Use Retry session
        above.
      </main>
    );
  return (
    <Navigate
      replace
      to={
        user
          ? /^\/(?!\/)/.test(next) &&
            !next.includes("\\") &&
            !next.startsWith("/auth")
            ? next
            : "/dashboard"
          : "/login?oauthError=expired"
      }
    />
  );
}
