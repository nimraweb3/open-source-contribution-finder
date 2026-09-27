import { searchGitHubIssues } from "../services/githubService.js";
export const searchIssues = async (req, res) => {
    try {
        const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
        const language = typeof req.query.language === "string" ? req.query.language : undefined;
        const label = typeof req.query.label === "string" ? req.query.label : undefined;
        const state = typeof req.query.state === "string" ? req.query.state : "Open";
        const sort = typeof req.query.sort === "string" ? req.query.sort : "Relevance";
        const page = typeof req.query.page === "string"
            ? Math.max(Number(req.query.page) || 1, 1)
            : 1;
        if (!query && !language && !label) {
            res.status(400).json({
                success: false,
                data: null,
                error: "Enter a search term or select a filter.",
            });
            return;
        }
        const result = await searchGitHubIssues({
            query,
            language,
            label,
            state,
            sort,
            page,
        });
        res.json({
            success: true,
            data: result,
            error: null,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            data: null,
            error: "Failed to fetch GitHub issues.",
        });
    }
};
//# sourceMappingURL=issueController.js.map