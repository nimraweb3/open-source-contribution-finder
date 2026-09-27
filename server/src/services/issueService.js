export const fetchIssues = async ({ query, language, label, state, sort, page = 1, }) => {
    const params = new URLSearchParams();
    if (query) {
        params.set("q", query);
    }
    if (language) {
        params.set("language", language);
    }
    if (label) {
        params.set("label", label);
    }
    if (state) {
        params.set("state", state);
    }
    if (sort) {
        params.set("sort", sort);
    }
    params.set("page", String(page));
    const response = await fetch(`http://localhost:5000/api/issues?${params.toString()}`);
    const result = (await response.json());
    if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error ?? "Failed to fetch issues.");
    }
    return result.data;
};
//# sourceMappingURL=issueService.js.map