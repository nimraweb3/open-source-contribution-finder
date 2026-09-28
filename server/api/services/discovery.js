import { Issue } from "../models/index.js";

const cache = new Map();
const inFlight = new Map();
const languages = new Set([
  "JavaScript",
  "TypeScript",
  "Python",
  "Go",
  "Rust",
  "Java",
  "C++",
  "C#",
  "Ruby",
  "PHP",
  "CSS",
  "Swift",
  "Kotlin",
]);
const labels = new Set([
  "good first issue",
  "help wanted",
  "bug",
  "documentation",
  "enhancement",
]);

export function buildSearch(input) {
  const terms = ["is:issue", "is:open", "is:public", "archived:false"];
  const q = typeof input.q === "string" ? input.q.trim().slice(0, 150) : "";
  // A repository name is a useful shortcut; other input is literal search text.
  if (/^[\w.-]+\/[\w.-]+$/.test(q)) terms.push(`repo:${q}`);
  else if (q)
    terms.push(
      q
        .replace(/[:"\\]/g, " ")
        .replace(/\b(OR|AND|NOT)\b/g, "")
        .trim(),
    );
  if (languages.has(input.language)) terms.push(`language:"${input.language}"`);
  if (labels.has(input.label)) terms.push(`label:"${input.label}"`);
  if (input.unassigned === "true") terms.push("no:assignee");
  const page = Math.max(1, Math.min(50, Math.floor(Number(input.page) || 1)));
  const sort = ["updated", "created", "comments"].includes(input.sort)
    ? input.sort
    : "updated";
  return new URLSearchParams({
    q: terms.join(" "),
    sort,
    order: "desc",
    per_page: "20",
    page: String(page),
  });
}

async function search(input, fetcher) {
  const params = buildSearch(input);
  const key = params.toString();
  if (cache.get(key)?.expires > Date.now()) return cache.get(key).data;
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2026-03-10",
    "User-Agent": "Contribution-Finder",
  };
  if (process.env.GITHUB_TOKEN)
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  let response;
  try {
    response = await fetcher(`https://api.github.com/search/issues?${params}`, {
      headers,
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw Object.assign(
      new Error("GitHub is taking too long to respond. Please try again."),
      { status: 503 },
    );
  }
  if (!response.ok) {
    const message =
      response.status === 403 || response.status === 429
        ? "GitHub’s search limit was reached. Please try again in a minute."
        : response.status === 401
          ? "The server’s GitHub token needs updating."
          : response.status === 422
            ? "GitHub could not search this query. Try a keyword or a public owner/repository name."
            : "GitHub search is unavailable. Please try again shortly.";
    throw Object.assign(new Error(message), {
      status: response.status === 422 ? 400 : 503,
    });
  }
  const result = await response.json();
  const items = result.items.filter((item) => !item.pull_request);
  const issues = await Promise.all(
    items.map((item) =>
      Issue.findOneAndUpdate(
        { githubId: item.id },
        {
          $set: {
            githubId: item.id,
            source: "github",
            title: item.title,
            repository: item.repository_url.split("/repos/")[1],
            labels: item.labels.map((label) =>
              typeof label === "string" ? label : label.name,
            ),
            description: (
              item.body ||
              "No description provided. Open this issue on GitHub for more information."
            ).slice(0, 40000),
            url: item.html_url,
            number: item.number,
            comments: item.comments,
            state: item.state,
            externalUpdatedAt: item.updated_at,
            author: item.user?.login || "",
            assigned: item.assignees?.length > 0,
          },
        },
        { upsert: true, returnDocument: "after" },
      ).lean(),
    ),
  );
  const data = {
    issues,
    total: result.total_count,
    page: Number(params.get("page")),
    pages: Math.ceil(Math.min(result.total_count, 1000) / 20),
    incomplete: result.incomplete_results,
    fetchedAt: new Date().toISOString(),
  };
  if (cache.size >= 100) cache.delete(cache.keys().next().value);
  cache.set(key, { expires: Date.now() + 60000, data });
  return data;
}

export function discover(input, fetcher = fetch) {
  const key = buildSearch(input).toString();
  if (!inFlight.has(key))
    inFlight.set(
      key,
      search(input, fetcher).finally(() => inFlight.delete(key)),
    );
  return inFlight.get(key);
}
