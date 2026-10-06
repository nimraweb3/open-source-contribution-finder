import type { Issue } from "../types";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, GitFork, Bookmark, ExternalLink } from "lucide-react";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { useBookmarks } from "../context/BookmarksContext";
import { api } from "../services/api";
import { Button, Badge, LoadState } from "../components/UI";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
export default function Detail() {
  const { id } = useParams();
  const location = useLocation();
  const { ids, mark, error: bookmarkError } = useBookmarks();
  const saved = Boolean(id && ids.includes(id));
  const {
    data: issue,
    loading,
    error,
    reload,
  } = useApi<Issue>(`/issues/${id}`);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function save() {
    if (!user) return navigate("/login", { state: { from: `/issues/${id}` } });
    if (saved) return;
    setBusy(true);
    try {
      await api(`/contributions/${id}`, { method: "POST" });
      mark(id!, true);
      setMessage("Saved to your dashboard.");
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="container page">
      <Link className="text-link" to={location.state?.from || "/"}>
        <ArrowLeft size={16} /> Back to issues
      </Link>
      <LoadState loading={loading} error={error} retry={reload} />
      {issue && !loading && !error && (
        <div className="detail-layout">
          <article>
            <div className="eyebrow">
              <GitFork size={17} />
              {issue.repository}
            </div>
            <h1 className="detail-title">{issue.title}</h1>
            <div className="issue-labels">
              {issue.labels.map((label) => (
                <Badge key={label}>{label}</Badge>
              ))}
            </div>
            <div className="detail-description">
              <ReactMarkdown
                skipHtml
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noreferrer">
                      {children}
                    </a>
                  ),
                  img: ({ src, alt }) => (
                    <a
                      href={typeof src === "string" ? src : undefined}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {alt || "View attached image"}
                    </a>
                  ),
                }}
              >
                {issue.description}
              </ReactMarkdown>
            </div>
            <h2>Before you start</h2>
            <ul className="checklist">
              <li>Read the project’s contribution guidelines.</li>
              <li>Check that the issue is open and unassigned.</li>
              <li>Discuss your approach with a maintainer.</li>
              <li>Keep your pull request focused and include tests.</li>
            </ul>
          </article>
          <aside className="detail-aside">
            <span className="section-kicker">Issue details</span>
            <dl>
              {issue.language && (
                <div>
                  <dt>Language</dt>
                  <dd>{issue.language}</dd>
                </div>
              )}
              {issue.externalCreatedAt && (
                <div>
                  <dt>Created</dt>
                  <dd>
                    {new Date(issue.externalCreatedAt).toLocaleDateString()}
                  </dd>
                </div>
              )}
              <div>
                <dt>Source</dt>
                <dd>
                  {issue.source === "github" ? "GitHub" : "Sample listing"}
                </dd>
              </div>
              <div>
                <dt>Assignment</dt>
                <dd>{issue.assigned ? "Assigned" : "Unassigned"}</dd>
              </div>
              <div>
                <dt>Comments</dt>
                <dd>{issue.comments || 0}</dd>
              </div>
            </dl>
            <Button
              variant="secondary"
              disabled={busy || saved || Boolean(bookmarkError)}
              onClick={save}
            >
              <Bookmark size={17} />
              {busy
                ? "Saving…"
                : saved
                  ? "Saved to dashboard"
                  : "Save for later"}
            </Button>
            {saved && (
              <Link className="text-link" to="/dashboard">
                Manage contribution
              </Link>
            )}
            {bookmarkError && (
              <p className="error" role="alert">
                {bookmarkError}
              </p>
            )}
            <a
              className="button primary"
              href={issue.url}
              target="_blank"
              rel="noreferrer"
            >
              Open on GitHub <ExternalLink size={15} />
            </a>
            {message && <p role="status">{message}</p>}
            <small>
              {issue.source === "github"
                ? "Details reflect the last search. Check GitHub for the latest status and discussion."
                : "This is an old demo listing, not a live issue."}
            </small>
          </aside>
        </div>
      )}
    </main>
  );
}
