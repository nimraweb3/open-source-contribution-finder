import { useState } from "react";
import { useNavigate } from "react-router-dom";

const technologies = ["React", "TypeScript", "Solidity", "Good First Issue"];

const Hero = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    const query = search.trim();

    if (!query) {
      navigate("/explore");
      return;
    }

    navigate(`/explore?q=${encodeURIComponent(query)}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleTechnologyClick = (technology: string) => {
    navigate(`/explore?q=${encodeURIComponent(technology)}`);
  };

  return (
    <section className="relative overflow-hidden border-b border-zinc-200 bg-[#fafafa]">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left */}
          <div>
            <div className="mb-6 inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-600">
              Built for open-source contributors
            </div>

            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-zinc-950 sm:text-6xl">
              Find issues worth contributing to.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600">
              Discover GitHub issues that match your skills, experience, and
              interests.
            </p>

            {/* Search */}
            <div className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="React, TypeScript, Solidity..."
                className="h-12 flex-1 rounded-lg border border-zinc-300 bg-white px-4 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
              />

              <button
                type="button"
                onClick={handleSearch}
                className="h-12 rounded-lg bg-zinc-900 px-6 text-sm font-medium text-white transition hover:bg-zinc-700 active:scale-[0.98]"
              >
                Find Issues
              </button>
            </div>

            {/* Technology chips */}
            <div className="mt-5 flex flex-wrap gap-2">
              {technologies.map((technology) => (
                <button
                  key={technology}
                  type="button"
                  onClick={() => handleTechnologyClick(technology)}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-zinc-400 hover:text-zinc-900"
                >
                  {technology}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Issue preview */}
          <div className="lg:pl-8">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500">
                  GOOD FIRST ISSUE
                </span>

                <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                  92% match
                </span>
              </div>

              <h2 className="mt-5 text-xl font-semibold tracking-tight text-zinc-900">
                Improve keyboard navigation for dropdown components
              </h2>

              <p className="mt-3 text-sm leading-6 text-zinc-600">
                Add keyboard navigation and accessibility improvements to the
                existing dropdown components.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-700">
                  react
                </span>

                <span className="rounded-md bg-purple-50 px-2 py-1 text-xs text-purple-700">
                  typescript
                </span>

                <span className="rounded-md bg-green-50 px-2 py-1 text-xs text-green-700">
                  good first issue
                </span>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-5 text-xs text-zinc-500">
                <span>example/repository</span>
                <span>Updated 2 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
