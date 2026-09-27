import { Link, useNavigate } from "react-router-dom";
import { Bookmark, Star, ArrowUpRight, CircleDot } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useBookmarks } from "../context/BookmarksContext";
import { api } from "../services/api";
import { Badge } from "./UI";
export default function IssueCard({ issue }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { ids, mark } = useBookmarks();
  const saved = ids.includes(issue._id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save() {
    if (!user) return navigate("/login");
    setBusy(true);
    setError("");
    try {
      await api(`/contributions/${issue._id}`, {
        method: saved ? "DELETE" : "POST",
        body: saved ? undefined : { status: "saved" },
      });
      mark(issue._id, !saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <article className="issue-card">
      <div className="issue-top">
        <span className="repo-icon">
          <CodeSymbol language={issue.language} />
        </span>
        <span className="repo-name">{issue.repository}</span>
        <button
          className={`icon-button save-button ${saved ? "is-saved" : ""}`}
          aria-label={saved ? "Remove bookmark" : "Bookmark issue"}
          disabled={busy}
          onClick={save}
        >
          <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <Link to={`/issues/${issue._id}`} className="issue-title">
        {issue.title}
        <ArrowUpRight size={18} />
      </Link>
      <div className="issue-labels">
        {issue.labels.slice(0, 2).map((label) => (
          <Badge key={label}>{label}</Badge>
        ))}
      </div>
      <div className="issue-meta">
        <span>
          <i className={`language-dot ${issue.language?.toLowerCase()}`} />
          {issue.language}
        </span>
        <span>
          <Star size={13} />
          {(issue.stars / 1000).toFixed(1)}k
        </span>
        <span className="difficulty">
          <CircleDot size={12} />
          {issue.difficulty}
        </span>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </article>
  );
}
function CodeSymbol({ language }) {
  return (
    <span>
      {language === "TypeScript"
        ? "TS"
        : language === "Python"
          ? "Py"
          : language === "CSS"
            ? "#"
            : "{ }"}
    </span>
  );
}
