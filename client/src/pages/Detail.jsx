import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, GitFork, Bookmark, Star, ExternalLink } from "lucide-react";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { useBookmarks } from "../context/BookmarksContext";
import { api } from "../services/api";
import { Button, Badge, LoadState } from "../components/UI";
export default function Detail() {
  const { id } = useParams();
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
      <Link className="text-link" to="/browse">
        <ArrowLeft size={16} /> Back to opportunities
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
              {issue.description.split("\n\n").map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
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
            <span className="section-kicker">YOUR NEXT CONTRIBUTION</span>
            <dl>
              <div>
                <dt>Language</dt>
                <dd>{issue.language}</dd>
              </div>
              <div>
                <dt>Difficulty</dt>
                <dd>{issue.difficulty}</dd>
              </div>
              <div>
                <dt>Repository stars</dt>
                <dd>
                  <Star size={14} /> {issue.stars.toLocaleString()}
                </dd>
              </div>
            </dl>
            <Button disabled={busy} onClick={save}>
              <Bookmark size={17} />
              {busy ? "Saving…" : "Save opportunity"}
            </Button>
            <a
              className="button secondary"
              href={issue.url}
              target="_blank"
              rel="noreferrer"
            >
              View repository issues <ExternalLink size={15} />
            </a>
            {message && <p role="status">{message}</p>}
            <small>Sample listing. Confirm availability on GitHub.</small>
          </aside>
        </div>
      )}
    </main>
  );
}
