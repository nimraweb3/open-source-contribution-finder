import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, Field, Arrow } from "../components/UI";
export default function Auth({ signup = false }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { authenticate } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  async function submit(e) {
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
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="container auth-page">
      <div className="auth-card">
        <h1>{signup ? "Create an account" : "Sign in"}</h1>
        <p>Save issues and keep track of what you’re working on.</p>
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
          <Button disabled={busy} type="submit">
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
