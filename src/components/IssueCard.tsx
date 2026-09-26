import type { Issue } from "../types/issue";
import MatchScore from "./MatchScore";

interface IssueCardProps {
  issue: Issue;
}

const IssueCard = ({ issue }: IssueCardProps) => {
  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-6 transition duration-200 hover:border-zinc-300 hover:shadow-sm">
      {/* Top row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <a
          href={issue.repositoryUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
        >
          {issue.repository}
        </a>

        {issue.matchScore !== null && <MatchScore score={issue.matchScore} />}
      </div>

      {/* Title */}
      <a
        href={issue.url}
        target="_blank"
        rel="noreferrer"
        className="mt-4 block text-lg font-semibold tracking-tight text-zinc-900 transition hover:text-zinc-600"
      >
        {issue.title}
      </a>

      {/* Description */}
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-600">
        {issue.body || "No description provided."}
      </p>

      {/* Labels */}
      {issue.labels.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {issue.labels.map((label) => (
            <span
              key={`${issue.id}-${label.name}`}
              className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-600"
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Bottom information */}
      <div className="mt-6 flex flex-col gap-4 border-t border-zinc-100 pt-5 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <span>#{issue.number}</span>

          <span>{issue.comments} comments</span>

          {issue.language && <span>{issue.language}</span>}

          <span>★ {issue.stars}</span>
        </div>

        <span>Updated {formatDate(issue.updatedAt)}</span>
      </div>
    </article>
  );
};

export default IssueCard;
