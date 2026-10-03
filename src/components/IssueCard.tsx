import type { Issue } from "../types/issue";
import MatchScore from "./MatchScore";

interface IssueCardProps {
  issue: Issue;
}

const IssueCard = ({ issue }: IssueCardProps) => {
  const formatDate = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Unknown";
    }

    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(parsedDate);
  };

  return (
    <article className="group rounded-xl border border-zinc-200 bg-white p-6 transition duration-200 hover:border-zinc-300 hover:shadow-sm">
      {/* ==========================================
          TOP
      ========================================== */}

      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Repository */}

        <a
          href={issue.repositoryUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
        >
          {issue.repository}
        </a>

        {/* Match score */}

        {issue.matchScore !== null && <MatchScore score={issue.matchScore} />}
      </div>

      {/* ==========================================
          ISSUE TITLE
      ========================================== */}

      <a
        href={issue.url}
        target="_blank"
        rel="noreferrer"
        className="mt-4 block text-lg font-semibold leading-7 tracking-tight text-zinc-900 transition-colors hover:text-zinc-600"
      >
        {issue.title}
      </a>

      {/* ==========================================
          DESCRIPTION
      ========================================== */}

      <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-600">
        {issue.body?.trim()
          ? issue.body
          : "No description provided for this issue."}
      </p>

      {/* ==========================================
          LABELS
      ========================================== */}

      {issue.labels.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {issue.labels.slice(0, 5).map((label, index) => (
            <span
              key={`${issue.id}-${label.name}-${index}`}
              className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-600"
            >
              {label.name}
            </span>
          ))}

          {issue.labels.length > 5 && (
            <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-500">
              +{issue.labels.length - 5}
            </span>
          )}
        </div>
      )}

      {/* ==========================================
          META INFORMATION
      ========================================== */}

      <div className="mt-6 flex flex-col gap-4 border-t border-zinc-100 pt-5 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {/* Issue number */}

          <span>#{issue.number}</span>

          {/* State */}

          <span className="flex items-center gap-1.5">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                issue.state === "open" ? "bg-green-500" : "bg-zinc-400"
              }`}
            />

            <span className="capitalize">{issue.state}</span>
          </span>

          {/* Comments */}

          <span>
            {issue.comments} {issue.comments === 1 ? "comment" : "comments"}
          </span>

          {/* Language */}

          {issue.language && <span>{issue.language}</span>}
        </div>

        {/* Updated */}

        <span className="shrink-0">Updated {formatDate(issue.updatedAt)}</span>
      </div>

      {/* ==========================================
          ACTION
      ========================================== */}

      <div className="mt-5">
        <a
          href={issue.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-950"
        >
          View issue
          <span
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          >
            →
          </span>
        </a>
      </div>
    </article>
  );
};

export default IssueCard;
