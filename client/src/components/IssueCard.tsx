import type { Issue } from "../types";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Bookmark, CircleDot, MessageSquare, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useBookmarks } from "../context/BookmarksContext";
import { api } from "../services/api";
import { Badge } from "./UI";

export default function IssueCard({ issue }: { issue: Issue }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { ids, mark, error: bookmarkError } = useBookmarks();
  const saved = ids.includes(issue._id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save() {
    if (!user)
      return navigate("/login", { state: { from: `/issues/${issue._id}` } });
    setBusy(true);
    setError("");
    try {
      await api(`/contributions/${issue._id}`, {
        method: saved ? "DELETE" : "POST",
      });
      mark(issue._id, !saved);
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
  const updated = issue.externalUpdatedAt
    ? new Date(issue.externalUpdatedAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : null;
  return (
    <article className="issue-row">
      <CircleDot className="open-issue-icon" size={19} />
      <div className="issue-content">
        <div className="repo-line">
          <span>{issue.repository}</span>
          {issue.number && (
            <span className="issue-number">#{issue.number}</span>
          )}
        </div>
        <Link
          to={`/issues/${issue._id}`}
          state={{ from: location.pathname + location.search }}
          className="issue-title"
        >
          {issue.title}
        </Link>
        <div className="issue-labels">
          {issue.labels.slice(0, 4).map((label) => (
            <Badge key={label}>{label}</Badge>
          ))}
          {issue.labels.length > 4 && (
            <span className="extra-labels">+{issue.labels.length - 4}</span>
          )}
        </div>
        <div className="issue-meta">
          {updated && <span>Updated {updated}</span>}
          {issue.author && <span>by {issue.author}</span>}
          <span className="comment-count">
            <MessageSquare size={13} />
            {issue.comments || 0}
          </span>
          {issue.assigned && <span>Assigned</span>}
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </div>
      <div className="issue-actions">
        <button
          className={`icon-button ${saved ? "is-saved" : ""}`}
          aria-label={saved ? `Unsave ${issue.title}` : `Save ${issue.title}`}
          title={saved ? "Unsave issue" : "Save for later"}
          disabled={busy || Boolean(bookmarkError)}
          onClick={save}
        >
          <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
        </button>
        <a
          href={issue.url}
          target="_blank"
          rel="noreferrer"
          className="github-issue-link"
          aria-label={`Open ${issue.title} on GitHub`}
        >
          GitHub <ArrowUpRight size={14} />
        </a>
      </div>
    </article>
  );
}
