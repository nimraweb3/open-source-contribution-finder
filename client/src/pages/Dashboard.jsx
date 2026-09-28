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
import { useApi } from "../hooks/useApi";
import { useBookmarks } from "../context/BookmarksContext";
import { api } from "../services/api";
import { Button, LoadState } from "../components/UI";
export default function Dashboard() {
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
      <div className="section-heading">
        <h1 className="page-title">My contributions</h1>
        <Button to="/browse">
          Find issues <ArrowUpRight size={17} />
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
                        {item.issue.source === "github"
                          ? `#${item.issue.number}`
                          : "Sample listing"}
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
            <h3>No saved issues yet</h3>
            <p>Browse open issues and save the ones you want to work on.</p>
            <Button to="/browse">
              Browse issues <ArrowUpRight size={16} />
            </Button>
          </div>
        ))}
    </main>
  );
}
