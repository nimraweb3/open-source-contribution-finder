import { useState, useEffect } from "react";
import { Link, useSearchParams, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, BookOpen, CircleDot } from "lucide-react";
import { useApi } from "../hooks/useApi";
import { Button, Badge, LoadState } from "../components/UI";
import type { Organization, OrganizationResult } from "../types";

export default function Gsoc() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [technology, setTechnology] = useState(params.get("technology") || "");
  useEffect(() => {
    setQuery(params.get("q") || "");
    setTechnology(params.get("technology") || "");
  }, [params]);
  const { data, loading, error, reload } = useApi<OrganizationResult>(
    `/gsoc?${params}`,
  );
  return (
    <main className="container page gsoc-page">
      <div className="intro-note">
        <BookOpen size={16} /> Google Summer of Code · 2026
      </div>
      <h1 className="page-title">Find a community to contribute to.</h1>
      <p className="page-description">
        Explore a curated selection of 2026 organizations. Read their guides,
        find an issue, and get involved before you apply.
      </p>
      <form
        className="gsoc-search"
        onSubmit={(e) => {
          e.preventDefault();
          setParams({ q: query, technology });
        }}
      >
        <label className="field">
          <span>Organization or interest</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. scientific computing"
            maxLength={100}
          />
        </label>
        <label className="field">
          <span>Language or technology</span>
          <input
            value={technology}
            onChange={(e) => setTechnology(e.target.value)}
            placeholder="e.g. Python"
            maxLength={60}
          />
        </label>
        <Button type="submit">Search organizations</Button>
      </form>
      <LoadState loading={loading} error={error} retry={reload} />
      {!loading && !error && data && (
        <>
          <p className="results-footnote">
            {data.organizations.length} organizations · Curated list verified{" "}
            {data.verifiedAt}.{" "}
            <a href={data.directory} target="_blank" rel="noreferrer">
              View the full official directory <ExternalLink size={12} />
            </a>
          </p>
          <div className="organization-list">
            {data.organizations.map((org) => (
              <article key={org.id} className="organization-row">
                <div>
                  <Link to={`/gsoc/${org.id}`} className="issue-title">
                    {org.name}
                  </Link>
                  <p>{org.description}</p>
                  <div className="issue-labels">
                    {org.technologies.map((t) => (
                      <Badge key={t}>{t}</Badge>
                    ))}
                  </div>
                </div>
                <Button to={`/gsoc/${org.id}`} variant="secondary">
                  View organization
                </Button>
              </article>
            ))}
          </div>
          {!data.organizations.length && (
            <div className="state">
              <h2>No organizations match</h2>
              <p>Try a broader term or explore the full official directory.</p>
              <Button variant="secondary" onClick={() => setParams({})}>
                Clear filters
              </Button>
            </div>
          )}
          <p className="filter-help">
            Participation is specific to 2026. Check official program dates and
            organization guidance for future applications.
          </p>
        </>
      )}
    </main>
  );
}
export function GsocDetail() {
  const { id } = useParams();
  const {
    data: org,
    loading,
    error,
    reload,
  } = useApi<Organization>(`/gsoc/${id}`);
  return (
    <main className="container page gsoc-page">
      <Link to="/gsoc" className="text-link">
        <ArrowLeft size={16} /> All organizations
      </Link>
      <LoadState loading={loading} error={error} retry={reload} />
      {org && !loading && !error && (
        <>
          <div className="organization-heading">
            <span className="intro-note">
              GSoC {org.year} · Selected organization
            </span>
            <h1 className="page-title">{org.name}</h1>
            <p className="page-description">{org.description}</p>
            <div className="issue-labels">
              {org.technologies.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
          </div>
          <div className="organization-links">
            <a
              className="button secondary"
              href={org.website}
              target="_blank"
              rel="noreferrer"
            >
              Official website <ExternalLink size={14} />
            </a>
            <a
              className="button secondary"
              href={org.guide}
              target="_blank"
              rel="noreferrer"
            >
              Contribution guide <ExternalLink size={14} />
            </a>
            <a
              href={org.official}
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              GSoC directory <ExternalLink size={14} />
            </a>
          </div>
          {org.issueTracker && (
            <p className="scope-note">
              {org.trackerNote}{" "}
              <a
                className="text-link"
                href={org.issueTracker}
                target="_blank"
                rel="noreferrer"
              >
                Open official issue tracker <ExternalLink size={14} />
              </a>
            </p>
          )}
          <h2>Repositories to start with</h2>
          <p className="page-description">
            A focused selection of projects from this organization. Issue
            results are fetched live from GitHub.
          </p>
          <div className="organization-list">
            {org.repositories.map((repo) => (
              <article key={repo} className="organization-row">
                <a
                  className="text-link"
                  href={`https://github.com/${repo}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {repo}
                  <ExternalLink size={14} />
                </a>
                <Button
                  to={`/browse?q=${encodeURIComponent(repo)}`}
                  variant="secondary"
                >
                  Browse open issues
                </Button>
              </article>
            ))}
          </div>
          <div className="organization-links">
            <Button to={`/browse?organization=${org.id}`}>
              <CircleDot size={16} /> All contribution opportunities
            </Button>
            <Button
              to={`/browse?organization=${org.id}&label=good+first+issue`}
              variant="secondary"
            >
              Good first issues
            </Button>
          </div>
          <h2>Get involved before applying</h2>
          <ul className="checklist">
            <li>Read the contribution guide and set up the project locally.</li>
            <li>
              Check issue ownership and discuss your approach with maintainers.
            </li>
            <li>
              Start with a small, well-scoped fix or documentation improvement.
            </li>
            <li>
              Check the official GSoC site for application dates and
              eligibility.
            </li>
          </ul>
        </>
      )}
    </main>
  );
}
