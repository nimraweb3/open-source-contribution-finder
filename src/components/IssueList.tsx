import type { Issue } from "../types/issue";
import IssueCard from "./IssueCard";

interface IssueListProps {
  issues: Issue[];
}

const IssueList = ({ issues }: IssueListProps) => {
  if (issues.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center">
        <h3 className="font-medium text-zinc-900">No issues found</h3>

        <p className="mt-2 text-sm text-zinc-500">
          Try changing your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {issues.map((issue) => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
    </div>
  );
};

export default IssueList;
