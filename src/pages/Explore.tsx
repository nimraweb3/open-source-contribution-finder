import { useSearchParams } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import IssueFilters from "../components/IssueFilters";
import IssueList from "../components/IssueList";
import type { Issue } from "../types/issue";

const mockIssues: Issue[] = [
  {
    id: 1,
    number: 142,
    title: "Improve keyboard navigation for dropdown components",
    body: "Add keyboard navigation and accessibility improvements to the existing dropdown components.",
    url: "https://github.com/example/repository/issues/142",
    repository: "example/repository",
    repositoryUrl: "https://github.com/example/repository",
    labels: [
      {
        name: "good first issue",
        color: "green",
      },
      {
        name: "accessibility",
        color: "blue",
      },
    ],
    comments: 8,
    updatedAt: "2026-09-20T10:00:00Z",
    createdAt: "2026-09-15T10:00:00Z",
    state: "open",
    language: "TypeScript",
    stars: 1240,
    forks: 180,
    matchScore: 92,
  },
  {
    id: 2,
    number: 87,
    title: "Add loading state to search results",
    body: "The search interface currently does not provide enough feedback while results are loading.",
    url: "https://github.com/example/project/issues/87",
    repository: "example/project",
    repositoryUrl: "https://github.com/example/project",
    labels: [
      {
        name: "help wanted",
        color: "yellow",
      },
      {
        name: "feature",
        color: "purple",
      },
    ],
    comments: 14,
    updatedAt: "2026-09-18T10:00:00Z",
    createdAt: "2026-09-10T10:00:00Z",
    state: "open",
    language: "React",
    stars: 890,
    forks: 92,
    matchScore: 84,
  },
];

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get("q") ?? "";

  const handleSearch = (newQuery: string) => {
    const params = new URLSearchParams(searchParams);

    if (!newQuery) {
      params.delete("q");
    } else {
      params.set("q", newQuery);
    }

    setSearchParams(params);
  };

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Page header */}
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-zinc-500">EXPLORE ISSUES</p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            Find your next contribution.
          </h1>

          <p className="mt-3 text-zinc-600">
            Search GitHub issues by technology, skill, or keyword.
          </p>
        </div>

        {/* Search */}
        <div className="mt-8 max-w-3xl">
          <SearchBar initialValue={query} onSearch={handleSearch} />
        </div>

        {/* Filters + Results */}
        <div className="mt-10 flex flex-col gap-6 lg:flex-row">
          {/* Filters */}
          <IssueFilters />

          {/* Results */}
          <section className="min-w-0 flex-1">
            {/* Results header */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-zinc-900">
                  {query ? `Results for "${query}"` : "Explore issues"}
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  {mockIssues.length} issues found
                </p>
              </div>
            </div>

            {/* Issue list */}
            <IssueList issues={mockIssues} />
          </section>
        </div>
      </div>
    </main>
  );
};

export default Explore;
