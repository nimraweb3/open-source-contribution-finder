import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Bookmark,
  ArrowUpRight,
  Trash2,
  GitPullRequest,
  CheckCircle2,
  Code2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import { useBookmarks } from "../context/BookmarksContext";
import { api } from "../services/api";
import { Button, LoadState } from "../components/UI";
export default function Dashboard() {
  const { user } = useAuth();
  const { mark } = useBookmarks();
  const { data, loading, error, reload } = useApi("/contributions");
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState("");
  async function change(id, status) {
    setBusy(id);
    setActionError("");
    try {
      await api(`/contributions/${id}`, {
        method: status ? "PUT" : "DELETE",
        body: status ? { status } : undefined,
      });
      mark(id, Boolean(status));
      reload();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy("");
    }
  }
  return (
    <main className="container page">
      <div className="section-kicker">YOUR PERSONAL WORKSPACE</div>
      <div className="section-heading">
        <h1 className="page-title">
          Hey, {user.name.split(" ")[0]}.<br />
          <span>Make your next move.</span>
        </h1>
        <Button to="/browse">
          Find an opportunity <ArrowUpRight size={17} />
        </Button>
      </div>
      <div className="dashboard-stats">
        {[
          ["saved", Bookmark],
          ["in progress", Code2],
          ["submitted", GitPullRequest],
          ["merged", CheckCircle2],
        ].map(([status, Icon]) => (
          <div key={status}>
            <Icon size={20} />
            <strong>
              {data?.filter((item) => item.status === status).length || 0}
            </strong>
            <span>{status}</span>
          </div>
        ))}
      </div>
      <h2>Your contributions</h2>
      <LoadState loading={loading} error={error} retry={reload} />
      {actionError && (
        <p role="alert" className="error">
          {actionError}
        </p>
      )}
      {!loading &&
        !error &&
        (data?.length ? (
          <div className="saved-list">
            {data.map(
              (item) =>
                item.issue && (
                  <article key={item._id}>
                    <div>
                      <small>{item.issue.repository}</small>
                      <Link to={`/issues/${item.issue._id}`}>
                        {item.issue.title}
                        <ArrowUpRight size={16} />
                      </Link>
                      <span>
                        {item.issue.language} · {item.issue.difficulty}
                      </span>
                    </div>
                    <select
                      aria-label={`Status for ${item.issue.title}`}
                      disabled={busy === item.issue._id}
                      value={item.status}
                      onChange={(e) => change(item.issue._id, e.target.value)}
                    >
                      {["saved", "in progress", "submitted", "merged"].map(
                        (status) => (
                          <option key={status}>{status}</option>
                        ),
                      )}
                    </select>
                    <button
                      className="icon-button"
                      aria-label={`Remove ${item.issue.title}`}
                      disabled={busy === item.issue._id}
                      onClick={() => change(item.issue._id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </article>
                ),
            )}
          </div>
        ) : (
          <div className="state">
            <Bookmark size={34} />
            <h3>A fresh start. Endless possibilities.</h3>
            <p>Save an issue to begin your contribution journey.</p>
            <Button to="/browse">
              Explore opportunities <ArrowUpRight size={16} />
            </Button>
          </div>
        ))}
    </main>
  );
}
