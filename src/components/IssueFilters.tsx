import { useSearchParams } from "react-router-dom";

const languages = [
  "Any language",
  "TypeScript",
  "JavaScript",
  "Python",
  "Solidity",
  "Go",
  "Rust",
];

const difficulties = ["Any difficulty", "Beginner", "Intermediate", "Advanced"];

const labels = [
  "Any label",
  "good first issue",
  "help wanted",
  "bug",
  "feature",
  "documentation",
];

const states = ["Open", "Closed", "All"];

const sortOptions = ["Relevance", "Recently updated", "Recently created"];

const IssueFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);

    if (!value || value.startsWith("Any ")) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    setSearchParams(params);
  };

  return (
    <aside className="w-full rounded-xl border border-zinc-200 bg-white p-5 lg:w-64 lg:shrink-0">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-zinc-900">Filters</h2>

        <button
          type="button"
          onClick={() => setSearchParams({})}
          className="text-xs text-zinc-500 transition hover:text-zinc-900"
        >
          Clear all
        </button>
      </div>

      <div className="mt-6 space-y-6">
        {/* Language */}
        <div>
          <label
            htmlFor="language"
            className="text-sm font-medium text-zinc-800"
          >
            Language
          </label>

          <select
            id="language"
            value={searchParams.get("language") ?? "Any language"}
            onChange={(event) => updateFilter("language", event.target.value)}
            className="mt-2 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-zinc-400"
          >
            {languages.map((language) => (
              <option key={language}>{language}</option>
            ))}
          </select>
        </div>

        {/* Difficulty */}
        <div>
          <label
            htmlFor="difficulty"
            className="text-sm font-medium text-zinc-800"
          >
            Difficulty
          </label>

          <select
            id="difficulty"
            aria-describedby="difficulty-help"
            value={searchParams.get("difficulty") ?? "Any difficulty"}
            onChange={(event) => updateFilter("difficulty", event.target.value)}
            className="mt-2 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-zinc-400"
          >
            {difficulties.map((difficulty) => (
              <option key={difficulty}>{difficulty}</option>
            ))}
          </select>
          <p id="difficulty-help" className="mt-2 text-xs leading-5 text-zinc-500">
            Beginner uses “good first issue”; Intermediate uses “help wanted”.
            Advanced adds no label restriction. Labels are not a difficulty guarantee.
          </p>
        </div>

        {/* Label */}
        <div>
          <label htmlFor="label" className="text-sm font-medium text-zinc-800">
            Label
          </label>

          <select
            id="label"
            value={searchParams.get("label") ?? "Any label"}
            onChange={(event) => updateFilter("label", event.target.value)}
            className="mt-2 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-zinc-400"
          >
            {labels.map((label) => (
              <option key={label}>{label}</option>
            ))}
          </select>
        </div>

        {/* State */}
        <div>
          <label htmlFor="state" className="text-sm font-medium text-zinc-800">
            State
          </label>

          <select
            id="state"
            value={searchParams.get("state") ?? "Open"}
            onChange={(event) => updateFilter("state", event.target.value)}
            className="mt-2 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-zinc-400"
          >
            {states.map((state) => (
              <option key={state}>{state}</option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div>
          <label htmlFor="sort" className="text-sm font-medium text-zinc-800">
            Sort by
          </label>

          <select
            id="sort"
            value={searchParams.get("sort") ?? "Relevance"}
            onChange={(event) => updateFilter("sort", event.target.value)}
            className="mt-2 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-zinc-400"
          >
            {sortOptions.map((sort) => (
              <option key={sort}>{sort}</option>
            ))}
          </select>
        </div>
      </div>
    </aside>
  );
};

export default IssueFilters;
