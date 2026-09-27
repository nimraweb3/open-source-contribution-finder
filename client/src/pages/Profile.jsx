import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { Button, Field } from "../components/UI";
export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const values = Object.fromEntries(new FormData(e.currentTarget));
    try {
      setUser(
        await api("/profile", {
          method: "PATCH",
          body: {
            name: values.name,
            techStack: values.techStack
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean),
            interests: values.interests
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean),
          },
        }),
      );
      setMessage("Your profile has been updated.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }
  async function signout() {
    setBusy(true);
    try {
      await logout();
      navigate("/");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="container page profile-page">
      <div className="section-kicker">MAKE YOURSELF AT HOME</div>
      <h1 className="page-title">
        Your profile<span>.</span>
      </h1>
      <p className="page-description">
        A little about you. A better place to start.
      </p>
      <form className="profile-form" onSubmit={submit}>
        <Field
          label="Your name"
          name="name"
          defaultValue={user.name}
          maxLength={80}
          required
        />
        <Field label="Email address" value={user.email} disabled />
        <Field
          label="Tech stack (comma separated)"
          name="techStack"
          defaultValue={user.techStack?.join(", ")}
          placeholder="React, TypeScript, Python"
        />
        <Field
          label="Interests (comma separated)"
          name="interests"
          defaultValue={user.interests?.join(", ")}
          placeholder="Accessibility, developer tools, climate"
        />
        {message && <p role="status">{message}</p>}
        <div className="form-actions">
          <Button disabled={busy}>Save changes</Button>
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={signout}
          >
            Log out
          </Button>
        </div>
      </form>
    </main>
  );
}
