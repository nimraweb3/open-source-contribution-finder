import { useState } from "react";

interface SearchBarProps {
  initialValue?: string;
  onSearch: (query: string) => void;
}

const SearchBar = ({ initialValue = "", onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full gap-3">
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search React, TypeScript, Solidity..."
        className="h-12 min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
      />

      <button
        type="submit"
        className="h-12 shrink-0 rounded-lg bg-zinc-900 px-6 text-sm font-medium text-white transition hover:bg-zinc-700 active:scale-[0.98]"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
