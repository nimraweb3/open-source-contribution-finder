import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, Field, Arrow } from "../components/UI";
import { GitPullRequest } from "lucide-react";
export default function Auth({ signup = false }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { authenticate } = useAuth();
  const navigate = useNavigate();
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await authenticate(
        signup ? "signup" : "login",
        Object.fromEntries(new FormData(e.currentTarget)),
      );
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="container auth-page">
      <div className="auth-story">
        <div className="eyebrow">
          <span className="live-dot" /> YOUR NEXT CHAPTER
        </div>
        <h1>
          Big things.
          <br />
          Small commits.
          <br />
          <span>You.</span>
        </h1>
        <p>
          A little curiosity is all it takes to get started.
          <br />
          Let’s build something that matters.
        </p>
        <GitPullRequest className="auth-art" size={130} strokeWidth={1} />
      </div>
      <div className="auth-card">
        <span className="section-kicker">
          {signup ? "LET’S GET YOU STARTED" : "GOOD TO SEE YOU AGAIN"}
        </span>
        <h2>{signup ? "Make your mark." : "Welcome back."}</h2>
        <p>
          {signup
            ? "Your first contribution is waiting."
            : "Pick up where you left off."}
        </p>
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
          {signup ? "Already part of the community?" : "New around here?"}{" "}
          <Link to={signup ? "/login" : "/signup"}>
            {signup ? "Log in" : "Create an account"} <span>↗</span>
          </Link>
        </p>
      </div>
    </main>
  );
}
