import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { useApi } from "../hooks/useApi";
import IssueCard from "../components/IssueCard";
import { Button, LoadState } from "../components/UI";
export default function Browse() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") || "");
  const { data, loading, error, reload } = useApi(`/issues?${params}`);
  function update(key, value) {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
  }
  return (
    <main className="container page">
      <div className="eyebrow">
        <span className="live-dot" /> FIND YOUR NEXT CHAPTER
      </div>
      <h1 className="page-title">
        Good code starts
        <br />
        with <span>one contribution.</span>
      </h1>
      <p className="page-description">
        Explore projects, find your fit, and make something better.
      </p>
      <form
        className="home-search"
        onSubmit={(e) => {
          e.preventDefault();
          update("q", search);
        }}
      >
        <Search size={20} />
        <input
          placeholder="Search by project, topic, or issue…"
          aria-label="Search issues"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button>
          Search <Search size={17} />
        </Button>
      </form>
      <div className="filter-row">
        <span>
          <SlidersHorizontal size={16} /> Filters
        </span>
        {[
          [
            "language",
            "All languages",
            ["JavaScript", "TypeScript", "Python", "CSS", "Go", "Rust"],
          ],
          [
            "difficulty",
            "All difficulties",
            ["Beginner", "Intermediate", "Advanced"],
          ],
          [
            "label",
            "All labels",
            ["good first issue", "help wanted", "documentation", "enhancement"],
          ],
        ].map(([key, label, values]) => (
          <select
            key={key}
            aria-label={label}
            value={params.get(key) || ""}
            onChange={(e) => update(key, e.target.value)}
          >
            <option value="">{label}</option>
            {values.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        ))}
        <select
          aria-label="Sort issues"
          value={params.get("sort") || ""}
          onChange={(e) => update("sort", e.target.value)}
        >
          <option value="">Recently updated</option>
          <option value="stars">Most stars</option>
          <option value="difficulty">Difficulty</option>
        </select>
        {params.size > 0 && (
          <button
            className="text-link"
            onClick={() => {
              setParams({});
              setSearch("");
            }}
          >
            Reset <X size={14} />
          </button>
        )}
      </div>
      <div className="results-heading">
        <span>
          {loading
            ? "Finding opportunities…"
            : `${data?.total || 0} opportunities`}
        </span>
        <span>Curated sample listings · check GitHub for live issues</span>
      </div>
      <LoadState loading={loading} error={error} retry={reload} />
      {!loading && !error && (
        <>
          {data?.issues.length ? (
            <div className="issue-grid">
              {data.issues.map((issue) => (
                <IssueCard key={issue._id} issue={issue} />
              ))}
            </div>
          ) : (
            <div className="state">
              <Search size={30} />
              <h3>No matches just yet.</h3>
              <p>Try a broader search or remove a filter.</p>
              <Button
                variant="secondary"
                onClick={() => {
                  setParams({});
                  setSearch("");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
          <div className="pagination">
            <Button
              variant="secondary"
              disabled={(data?.page || 1) <= 1}
              onClick={() => update("page", String(data.page - 1))}
            >
              Previous
            </Button>
            <span>Page {data?.page || 1}</span>
            <Button
              variant="secondary"
              disabled={data?.page * 12 >= data?.total}
              onClick={() => update("page", String(data.page + 1))}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </main>
  );
}
