export interface SearchIssueParams {
    query: string;
    language?: string | undefined;
    label?: string | undefined;
    state?: string | undefined;
    sort?: string | undefined;
    page?: number | undefined;
}
export declare const searchGitHubIssues: ({ query, language, label, state, sort, page, }: SearchIssueParams) => Promise<{
    total: number;
    page: number;
    issues: {
        id: number;
        number: number;
        title: string;
        body: string;
        url: string;
        repository: string;
        repositoryUrl: string;
        labels: {
            name: string;
            color: string;
        }[];
        comments: number;
        updatedAt: string;
        createdAt: string;
        state: "closed" | "open";
        language: null;
        stars: number;
        forks: number;
        matchScore: null;
    }[];
}>;
//# sourceMappingURL=githubService.d.ts.map