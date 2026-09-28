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
  const { mark } = useBookmarks();
  const { data: issue, loading, error, reload } = useApi(`/issues/${id}`);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function save() {
    if (!user) return navigate("/login");
    setBusy(true);
    try {
      await api(`/contributions/${id}`, { method: "POST" });
      mark(id, true);
      setMessage("Saved to your dashboard.");
    } catch (err) {
      setMessage(err.message);
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
                    <a href={src} target="_blank" rel="noreferrer">
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
            <Button variant="secondary" disabled={busy} onClick={save}>
              <Bookmark size={17} />
              {busy ? "Saving…" : "Save for later"}
            </Button>
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
