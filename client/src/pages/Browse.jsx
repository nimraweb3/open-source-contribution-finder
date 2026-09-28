import { useSearchParams } from "react-router-dom";
import {
  Search,
  CircleDot,
  BookOpen,
  ArrowUpRight,
  X,
  Filter,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi";
import IssueCard from "../components/IssueCard";
import { Button, LoadState } from "../components/UI";

const languages = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Go",
  "Rust",
  "Java",
  "C++",
  "C#",
  "Ruby",
  "PHP",
  "CSS",
  "Swift",
  "Kotlin",
];
export default function Browse() {
  const [params, setParams] = useSearchParams({ label: "good first issue" });
  const [search, setSearch] = useState(params.get("q") || "");
  const [showFilters, setShowFilters] = useState(false);
  const { data, loading, error, reload } = useApi(`/discover?${params}`);
  const query = params.get("q") || "";
  useEffect(() => {
    setSearch(query);
  }, [query]);
  function update(key, value) {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
  }
  function reset() {
    setParams({});
    setSearch("");
  }
  const label = params.get("label") || "";
  const activeFilters = ["language", "label", "unassigned"].filter((key) =>
    params.get(key),
  );
  return (
    <main className="container browse-page">
      <section className="search-intro">
        <div className="intro-note">
          <CircleDot size={16} /> Open source, one issue at a time.
        </div>
        <h1>Find an issue. Start contributing.</h1>
        <p>
          Search open GitHub issues by language, project, or topic.
          <br className="desktop-break" /> Find something you can help with,
          then take it from there.
        </p>
        <form
          className="search-form"
          onSubmit={(event) => {
            event.preventDefault();
            update("q", search);
          }}
        >
          <Search size={20} />
          <input
            aria-label="Search issues"
            placeholder="Search a topic or repository, e.g. accessibility or facebook/react"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            maxLength={150}
          />
          {search && (
            <button
              type="button"
              className="icon-button"
              aria-label="Clear search"
              onClick={() => {
                setSearch("");
                update("q", "");
              }}
            >
              <X size={16} />
            </button>
          )}
          <Button type="submit">Search issues</Button>
        </form>
        <div className="quick-search">
          <span>Try:</span>
          {["accessibility", "documentation", "react", "python"].map((term) => (
            <button key={term} onClick={() => update("q", term)}>
              {term}
            </button>
          ))}
          <span className="no-account">No account needed to browse.</span>
        </div>
      </section>
      <div className="browse-workspace">
        <aside
          className={`filter-sidebar ${showFilters ? "filters-open" : ""}`}
        >
          <div className="sidebar-title">
            <Filter size={15} />
            <h2>Filters</h2>
            {activeFilters.length > 0 && <button onClick={reset}>Reset</button>}
          </div>
          <label className="field">
            <span>Language</span>
            <select
              aria-label="Language"
              value={params.get("language") || ""}
              onChange={(event) => update("language", event.target.value)}
            >
              <option value="">Any language</option>
              {languages.map((language) => (
                <option key={language}>{language}</option>
              ))}
            </select>
          </label>
          <div className="filter-group">
            <h3>Issue label</h3>
            {[
              ["", "All open issues"],
              ["good first issue", "Good first issue"],
              ["help wanted", "Help wanted"],
              ["bug", "Bug"],
              ["documentation", "Documentation"],
              ["enhancement", "Enhancement"],
            ].map(([value, title]) => (
              <label className="radio-label" key={value}>
                <input
                  type="radio"
                  name="label"
                  value={value}
                  checked={label === value}
                  onChange={() => update("label", value)}
                />
                <span>{title}</span>
                {value === "good first issue" && (
                  <span className="tiny-tag">new here?</span>
                )}
              </label>
            ))}
          </div>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={params.get("unassigned") === "true"}
              onChange={(event) =>
                update("unassigned", event.target.checked ? "true" : "")
              }
            />{" "}
            Only unassigned issues
          </label>
          <div className="first-time-note">
            <BookOpen size={19} />
            <h3>First time contributing?</h3>
            <p>
              Start with a <strong>good first issue</strong>. Read the project’s
              guidelines and leave a comment before you start working.
            </p>
            <a
              href="https://docs.github.com/en/get-started/exploring-projects-on-github/contributing-to-a-project"
              target="_blank"
              rel="noreferrer"
            >
              Read the guide <ArrowUpRight size={14} />
            </a>
          </div>
        </aside>
        <section className="results-section" aria-label="Issue results">
          <div className="results-toolbar">
            <div className="results-count">
              <CircleDot size={17} />
              <h2>
                {loading
                  ? "Searching…"
                  : error
                    ? "Open issues"
                    : `${(data?.total || 0).toLocaleString()} open issues`}
              </h2>
            </div>
            <div className="results-controls">
              <button
                className="mobile-filter button secondary"
                onClick={() => setShowFilters(!showFilters)}
                aria-expanded={showFilters}
              >
                <Filter size={14} /> Filters
              </button>
              <select
                aria-label="Sort issues"
                value={params.get("sort") || "updated"}
                onChange={(event) => update("sort", event.target.value)}
              >
                <option value="updated">Recently updated</option>
                <option value="created">Newest issues</option>
                <option value="comments">Most discussed</option>
              </select>
              <button
                className="icon-button"
                onClick={reload}
                aria-label="Refresh results"
                disabled={loading}
              >
                <RefreshCw size={15} />
              </button>
            </div>
          </div>
          {activeFilters.length > 0 && (
            <div className="active-filters">
              {activeFilters.map((key) => (
                <button key={key} onClick={() => update(key, "")}>
                  {key === "unassigned" ? "Unassigned" : params.get(key)}
                  <X size={12} />
                </button>
              ))}
            </div>
          )}
          <div className="issue-list">
            <LoadState loading={loading} error={error} retry={reload} />
            {!loading &&
              !error &&
              (data?.issues.length ? (
                data.issues.map((issue) => (
                  <IssueCard key={issue._id} issue={issue} />
                ))
              ) : (
                <div className="state">
                  <Search size={25} />
                  <h3>No issues found</h3>
                  <p>Try another keyword, or remove a filter.</p>
                  <Button variant="secondary" onClick={reset}>
                    Clear filters
                  </Button>
                </div>
              ))}
          </div>
          <div className="results-footnote">
            <span>
              {error
                ? "Search could not be completed."
                : loading
                  ? "Searching GitHub…"
                  : "Fetched from GitHub · Open when last checked"}
            </span>
            {!loading && !error && data?.total > 1000 && (
              <span>
                First 1,000 matches available. Add filters to narrow your
                search.
              </span>
            )}
            {data?.incomplete && (
              <span>GitHub returned partial results. Narrow your search.</span>
            )}
          </div>
          {!loading && !error && data?.pages > 1 && (
            <div className="pagination">
              <Button
                variant="secondary"
                disabled={data.page <= 1}
                onClick={() => update("page", String(data.page - 1))}
              >
                Previous
              </Button>
              <span>
                Page {data.page} of {data.pages}
              </span>
              <Button
                variant="secondary"
                disabled={data.page >= data.pages}
                onClick={() => update("page", String(data.page + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
