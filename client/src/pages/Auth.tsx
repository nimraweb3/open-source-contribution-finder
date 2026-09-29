import { useApi } from "../hooks/useApi";
import { base } from "../services/api";
import { GitFork } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, Field, Arrow } from "../components/UI";
export default function Auth({ signup = false }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { authenticate, loading: sessionLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const providers = useApi<{ google: boolean; github: boolean }>(
    "/auth/providers",
  );
  const oauthError = new URLSearchParams(location.search).get("oauthError");
  const messages: Record<string, string> = {
    expired: "The sign-in session expired. Please try again.",
    cancelled: "Sign-in was cancelled. You can try again.",
    existing:
      "An account already uses this email. Sign in using its original method.",
    unavailable: "This provider is not configured yet.",
    failed: "Provider sign-in could not be completed. Please try again.",
  };
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await authenticate(
        signup ? "signup" : "login",
        Object.fromEntries(new FormData(e.currentTarget)),
      );
      navigate(location.state?.from || "/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="container auth-page">
      <div className="auth-card">
        <h1>{signup ? "Create an account" : "Sign in"}</h1>
        <p>Save issues and keep track of what you’re working on.</p>
        <div className="oauth-buttons">
          {(["google", "github"] as const).map((provider) => (
            <button
              type="button"
              className="button secondary"
              key={provider}
              disabled={
                sessionLoading ||
                providers.loading ||
                !providers.data?.[provider]
              }
              onClick={() => {
                window.location.assign(
                  `${base}/auth/oauth/${provider}?returnTo=${encodeURIComponent(location.state?.from || "/dashboard")}`,
                );
              }}
            >
              {provider === "github" ? (
                <GitFork size={18} />
              ) : (
                <span className="google-mark" aria-hidden="true">
                  G
                </span>
              )}{" "}
              Continue with {provider === "google" ? "Google" : "GitHub"}
            </button>
          ))}
        </div>
        {providers.loading && <p role="status">Loading sign-in options…</p>}
        {providers.error && (
          <p className="error" role="alert">
            {providers.error}{" "}
            <button
              type="button"
              className="text-link"
              onClick={providers.reload}
            >
              Retry
            </button>
          </p>
        )}
        {providers.data &&
          (!providers.data.google || !providers.data.github) && (
            <p className="filter-help">
              {!providers.data.google && !providers.data.github
                ? "Google and GitHub"
                : !providers.data.google
                  ? "Google"
                  : "GitHub"}{" "}
              sign-in needs server configuration. You can use email below.
            </p>
          )}
        {oauthError && (
          <p className="error" role="alert">
            {messages[oauthError] || messages.failed}
          </p>
        )}
        <div className="auth-divider">or use email</div>
        <form onSubmit={submit}>
          {signup && (
            <Field
              label="Your name"
              name="name"
              required
              autoComplete="name"
              maxLength={80}
              placeholder="Alex Morgan"
            />
          )}
          <Field
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
          />
          <Field
            label="Password"
            name="password"
            type="password"
            minLength={signup ? 10 : undefined}
            maxLength={72}
            autoComplete={signup ? "new-password" : "current-password"}
            required
            placeholder={signup ? "At least 10 characters" : "Your password"}
          />
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <Button disabled={busy || sessionLoading} type="submit">
            {busy ? "Please wait…" : signup ? "Create your account" : "Log in"}
            <Arrow />
          </Button>
        </form>
        <p className="auth-switch">
          {signup ? "Already have an account?" : "Don’t have an account?"}{" "}
          <Link to={signup ? "/login" : "/signup"}>
            {signup ? "Log in" : "Create an account"} <span>↗</span>
          </Link>
        </p>
      </div>
    </main>
  );
}
