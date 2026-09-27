import type { Issue } from "../types/issue.js";
export interface IssueSearchParams {
    query?: string | undefined;
    language?: string | undefined;
    label?: string | undefined;
    state?: string | undefined;
    sort?: string | undefined;
    page?: number | undefined;
}
export declare const fetchIssues: ({ query, language, label, state, sort, page, }: IssueSearchParams) => Promise<{
    total: number;
    page: number;
    issues: Issue[];
}>;
//# sourceMappingURL=issueService.d.ts.map