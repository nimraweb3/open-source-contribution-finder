import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import SearchBar from "../components/SearchBar";
import IssueFilters from "../components/IssueFilters";
import IssueList from "../components/IssueList";

import { fetchIssues } from "../services/issueService";
import type { Issue } from "../types/issue";

const Explore = () => {
  const [searchParams] = useSearchParams();
 
  return <ExploreResults key={searchParams.toString()} />;
};

const ExploreResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Data
  const [issues, setIssues] = useState<Issue[]>([]);
  const [total, setTotal] = useState(0);

  // Pagination
  const [page, setPage] = useState(1);

  // Loading
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Error
  const [error, setError] = useState<string | null>(null);

  // URL params
  const query = searchParams.get("q") ?? "";
  const language = searchParams.get("language") ?? "";
  const difficulty = searchParams.get("difficulty") ?? "";
  const label = searchParams.get("label") ?? "";
  const state = searchParams.get("state") ?? "Open";
  const sort = searchParams.get("sort") ?? "Relevance";

  // User needs at least one searchable value
  const hasSearch = Boolean(query) || Boolean(language) || Boolean(difficulty) || Boolean(label);

  // --------------------------------------------------
  // Load issues whenever search / filters change
  // --------------------------------------------------

  useEffect(() => {
    if (!hasSearch) return;
    let active = true;

    const loadIssues = async () => {
      try {
        const data = await fetchIssues({
          query,
          language,
          difficulty,
          label,
          state,
          sort,
          page: 1,
        });

        if (!active) return;
        setIssues(data.issues);
        setTotal(data.total);
      } catch (error) {
        if (!active) return;
        setIssues([]);
        setTotal(0);

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Something went wrong.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadIssues();
    return () => { active = false; };
  }, [query, language, difficulty, label, state, sort, hasSearch]);

  // --------------------------------------------------
  // Search
  // --------------------------------------------------

  const handleSearch = (newQuery: string) => {
    const params = new URLSearchParams(searchParams);

    if (!newQuery) {
      params.delete("q");
    } else {
      params.set("q", newQuery);
    }

    setSearchParams(params);
  };

  // --------------------------------------------------
  // Load more
  // --------------------------------------------------

  const handleLoadMore = async () => {
    if (loadingMore) return;
    const nextPage = page + 1;

    try {
      setLoadingMore(true);
      setError(null);

      const data = await fetchIssues({
        query,
        language,
        difficulty,
        label,
        state,
        sort,
        page: nextPage,
      });

      setIssues((currentIssues: Issue[]) => {
        // Prevent duplicate issues
        const existingIds = new Set(
          currentIssues.map((issue: Issue) => issue.id),
        );

        const newIssues = data.issues.filter(
          (issue: Issue) => !existingIds.has(issue.id),
        );

        return [...currentIssues, ...newIssues];
      });

      setPage(nextPage);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to load more issues.");
      }
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* ============================================
            PAGE HEADER
        ============================================ */}

        <div className="max-w-2xl">
          <p className="text-sm font-medium text-zinc-500">EXPLORE ISSUES</p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            Find your next contribution.
          </h1>

          <p className="mt-3 text-zinc-600">
            Search real GitHub issues by technology, skill, or keyword.
          </p>
        </div>

        {/* ============================================
            SEARCH
        ============================================ */}

        <div className="mt-8 max-w-3xl">
          <SearchBar initialValue={query} onSearch={handleSearch} />
        </div>

        {/* ============================================
            FILTERS + RESULTS
        ============================================ */}

        <div className="mt-10 flex flex-col gap-6 lg:flex-row">
          {/* Filters */}

          <IssueFilters />

          {/* ============================================
              RESULTS
          ============================================ */}

          <section className="min-w-0 flex-1">
            {/* Results heading */}

            <div className="mb-5">
              <h2 className="font-semibold text-zinc-900">
                {query ? `Results for "${query}"` : "Explore issues"}
              </h2>

              {hasSearch && !loading && !error && (
                <p className="mt-1 text-sm text-zinc-500">
                  {total.toLocaleString()} issues found
                </p>
              )}
            </div>

            {/* ============================================
                INITIAL STATE
            ============================================ */}

            {!hasSearch && (
              <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-xl">
                  ⌕
                </div>

                <h3 className="mt-4 font-medium text-zinc-900">
                  Find something to contribute to
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
                  Search for React, TypeScript, Solidity, Python, or another
                  technology to discover open-source issues.
                </p>
              </div>
            )}

            {/* ============================================
                LOADING
            ============================================ */}

            {hasSearch && loading && (
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse rounded-xl border border-zinc-200 bg-white p-6"
                  >
                    {/* Repository */}

                    <div className="h-3 w-32 rounded bg-zinc-200" />

                    {/* Title */}

                    <div className="mt-5 h-5 w-3/4 rounded bg-zinc-200" />

                    {/* Description */}

                    <div className="mt-4 h-3 w-full rounded bg-zinc-100" />

                    <div className="mt-2 h-3 w-2/3 rounded bg-zinc-100" />

                    {/* Labels */}

                    <div className="mt-6 flex gap-2">
                      <div className="h-6 w-24 rounded bg-zinc-100" />

                      <div className="h-6 w-20 rounded bg-zinc-100" />
                    </div>

                    {/* Bottom */}

                    <div className="mt-6 border-t border-zinc-100 pt-5">
                      <div className="h-3 w-1/2 rounded bg-zinc-100" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ============================================
                ERROR
            ============================================ */}

            {hasSearch && !loading && error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
                <h3 className="font-medium text-red-900">
                  Couldn't load issues
                </h3>

                <p className="mt-2 text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* ============================================
                RESULTS
            ============================================ */}

            {hasSearch && !loading && (!error || issues.length > 0) && (
              <>
                <IssueList issues={issues} />

                {/* ========================================
                    LOAD MORE
                ======================================== */}

                {issues.length > 0 && issues.length < total && (
                  <div className="mt-8 flex justify-center">
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loadingMore ? "Loading..." : "Load more"}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default Explore;
