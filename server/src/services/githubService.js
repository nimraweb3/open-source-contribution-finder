const getRepositoryName = (repositoryUrl) => {
    const parts = repositoryUrl.split("/repos/");
    return parts[1] ?? "Unknown repository";
};
const getRepositoryUrl = (repositoryUrl) => {
    const repository = getRepositoryName(repositoryUrl);
    return `https://github.com/${repository}`;
};
export const searchGitHubIssues = async ({ query, language, label, state = "Open", sort = "Relevance", page = 1, }) => {
    const searchParts = [];
    if (query) {
        searchParts.push(query);
    }
    searchParts.push("is:issue");
    if (state !== "All") {
        searchParts.push(`is:${state.toLowerCase()}`);
    }
    if (language) {
        searchParts.push(`language:${language}`);
    }
    if (label) {
        searchParts.push(`label:"${label}"`);
    }
    const params = new URLSearchParams({
        q: searchParts.join(" "),
        per_page: "20",
        page: String(page),
    });
    if (sort === "Recently updated") {
        params.set("sort", "updated");
        params.set("order", "desc");
    }
    if (sort === "Recently created") {
        params.set("sort", "created");
        params.set("order", "desc");
    }
    const headers = {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2026-03-10",
        "User-Agent": "open-source-contribution-finder",
    };
    if (process.env.GITHUB_TOKEN) {
        headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    const response = await fetch(`https://api.github.com/search/issues?${params.toString()}`, {
        headers,
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`GitHub API error ${response.status}: ${error}`);
    }
    const data = (await response.json());
    const issues = data.items
        .filter((issue) => !issue.pull_request)
        .map((issue) => ({
        id: issue.id,
        number: issue.number,
        title: issue.title,
        body: issue.body ?? "",
        url: issue.html_url,
        repository: getRepositoryName(issue.repository_url),
        repositoryUrl: getRepositoryUrl(issue.repository_url),
        labels: issue.labels
            .filter((label) => typeof label !== "string")
            .map((label) => ({
            name: label.name ?? "label",
            color: label.color ?? "e4e4e7",
        })),
        comments: issue.comments,
        updatedAt: issue.updated_at,
        createdAt: issue.created_at,
        state: issue.state,
        // We'll fetch repository metadata later.
        language: null,
        stars: 0,
        forks: 0,
        // Real skill matching comes later.
        matchScore: null,
    }));
    return {
        total: data.total_count,
        page,
        issues,
    };
};
//# sourceMappingURL=githubService.js.map