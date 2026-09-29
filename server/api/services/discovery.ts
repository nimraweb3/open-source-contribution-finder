import { findOrganization } from "./organizations.js";
import { Issue } from "../models/index.js";

const cache = new Map<string, { expires: number; data: SearchData }>();
const inFlight = new Map<string, Promise<SearchData>>();
const labels = new Set([
  "good first issue",
  "help wanted",
  "bug",
  "documentation",
  "enhancement",
]);

export function buildSearch(input: SearchInput) {
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
  for (const language of selectedLanguages(input.languages || input.language))
    terms.push(`language:"${language}"`);
  const org = findOrganization(input.organization);
  if (
    org &&
    /^[\w.-]+\/[\w.-]+$/.test(q) &&
    !org.repositories.some((repo) => repo.toLowerCase() === q.toLowerCase())
  )
    throw Object.assign(
      new Error(
        "This repository is not in the selected organization. Remove the organization filter to search it.",
      ),
      { status: 400 },
    );
  if (input.organization && !org)
    throw Object.assign(new Error("Organization not found."), { status: 400 });
  for (const repo of org?.repositories || []) terms.push(`repo:${repo}`);
  if (labels.has(String(input.label))) terms.push(`label:"${input.label}"`);
  if (input.unassigned === "true") terms.push("no:assignee");
  const page = Math.max(1, Math.min(50, Math.floor(Number(input.page) || 1)));
  const sort = ["updated", "created", "comments"].includes(String(input.sort))
    ? String(input.sort)
    : "updated";
  return new URLSearchParams({
    q: terms.join(" "),
    sort,
    order: "desc",
    per_page: "20",
    page: String(page),
  });
}

async function search(input: SearchInput, fetcher: typeof fetch) {
  const params = buildSearch(input);
  let scopeNote: string | undefined;
  const topic = categoryTopics[String(input.category)];
  const technology =
    typeof input.technology === "string"
      ? input.technology.trim().slice(0, 60)
      : "";
  if (input.category && !topic)
    throw Object.assign(new Error("Unknown development category."), {
      status: 400,
    });
  if (topic || technology) {
    const explicitRepo =
      typeof input.q === "string" && /^[\w.-]+\/[\w.-]+$/.test(input.q.trim())
        ? input.q.trim()
        : undefined;
    const restricted = explicitRepo
      ? [explicitRepo]
      : findOrganization(input.organization)?.repositories;
    const repos = await scopedRepositories(
      topic,
      technology,
      fetcher,
      selectedLanguages(input.languages || input.language),
      restricted,
    );
    // Build one intersection scope; repeated repo qualifiers otherwise form a union.
    const scopedInput = {
      ...input,
      organization: undefined,
      ...(explicitRepo ? { q: "" } : {}),
    };
    const scopedParams = buildSearch(scopedInput);
    params.set("q", scopedParams.get("q")!);
    scopeNote = `Searching ${repos.length} repositories matching ${[topic, technology].filter(Boolean).join(" and ")}. ${restricted ? "Limited to your selected repository or organization." : "Selected by repository popularity; refreshed every ten minutes."}`;
    if (!repos.length)
      return {
        issues: [],
        total: 0,
        page: 1,
        pages: 0,
        fetchedAt: new Date().toISOString(),
        scopeNote,
      };
    params.set(
      "q",
      params.get("q") + " " + repos.map((repo) => `repo:${repo}`).join(" "),
    );
  }
  const key = params.toString() + (scopeNote || "");
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) return cached.data;
  const headers: Record<string, string> = {
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
  const result: GithubSearch = await response.json();
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
            assigned: (item.assignees?.length || 0) > 0,
          },
        },
        { upsert: true, returnDocument: "after" },
      ).lean(),
    ),
  );
  const data = {
    scopeNote,
    issues,
    total: result.total_count,
    page: Number(params.get("page")),
    pages: Math.ceil(Math.min(result.total_count, 1000) / 20),
    incomplete: result.incomplete_results,
    fetchedAt: new Date().toISOString(),
  };
  if (cache.size >= 100) cache.delete(cache.keys().next().value!);
  cache.set(key, { expires: Date.now() + 60000, data });
  return data;
}

export function discover(input: SearchInput, fetcher: typeof fetch = fetch) {
  const key =
    buildSearch(input).toString() +
    JSON.stringify([input.category, input.technology]);
  if (!inFlight.has(key) && inFlight.size >= 20)
    throw Object.assign(
      new Error("Search is busy. Please try again shortly."),
      { status: 503 },
    );
  if (!inFlight.has(key))
    inFlight.set(
      key,
      search(input, fetcher).finally(() => inFlight.delete(key)),
    );
  return inFlight.get(key)!;
}

export type SearchInput = Record<string, unknown>;
type SearchData = {
  issues: unknown[];
  total: number;
  page: number;
  pages: number;
  fetchedAt: string;
  incomplete?: boolean;
  scopeNote?: string;
};
interface GithubSearch {
  total_count: number;
  incomplete_results: boolean;
  items: {
    id: number;
    pull_request?: unknown;
    title: string;
    repository_url: string;
    labels: (string | { name: string })[];
    body?: string;
    html_url: string;
    number: number;
    comments: number;
    state: string;
    updated_at: string;
    user?: { login: string };
    assignees?: unknown[];
  }[];
}
export function selectedLanguages(value: unknown): string[] {
  if (typeof value !== "string") return [];
  const values = [
    ...new Set(
      value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
    ),
  ];
  if (
    values.length > 8 ||
    values.some((v) => !/^[\p{L}\p{N}#+. -]{1,40}$/u.test(v))
  )
    throw Object.assign(
      new Error(
        "Choose up to eight languages, using letters, numbers, spaces, +, # or dots.",
      ),
      { status: 400 },
    );
  return values;
}
const categoryTopics: Record<string, string> = {
  web: "web-development",
  web3: "blockchain",
  mobile: "android",
  ai: "machine-learning",
};
const repoCache = new Map<string, { expires: number; repos: string[] }>();
async function scopedRepositories(
  topic: string | undefined,
  technology: string,
  fetcher: typeof fetch,
  languages: string[],
  restricted?: string[],
) {
  const q = [
    "is:public",
    "archived:false",
    "fork:false",
    "stars:>20",
    ...languages.map((l) => `language:"${l}"`),
    ...(topic ? ["topic:" + topic] : []),
    ...(technology ? [JSON.stringify(technology.replace(/["\\:]/g, " "))] : []),
  ].join(" ");
  const cacheKey = q + JSON.stringify(restricted);
  const cached = repoCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) return cached.repos;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "Contribution-Finder",
  };
  if (process.env.GITHUB_TOKEN)
    headers.Authorization = "Bearer " + process.env.GITHUB_TOKEN;
  if (restricted) {
    const results = await Promise.all(
      restricted.map(async (repo) => {
        const response = await fetcher("https://api.github.com/repos/" + repo, {
          headers,
          signal: AbortSignal.timeout(15000),
        });
        if (!response.ok)
          throw Object.assign(
            new Error(
              "GitHub repository details are unavailable. Try again shortly.",
            ),
            { status: 503 },
          );
        const info: {
          topics: string[];
          description: string;
          full_name: string;
          language: string;
          archived: boolean;
          has_issues: boolean;
        } = await response.json();
        const matchesTech =
          !technology ||
          [info.description, info.full_name, ...info.topics]
            .join(" ")
            .toLowerCase()
            .includes(technology.toLowerCase());
        return !info.archived &&
          info.has_issues &&
          (!topic || info.topics.includes(topic)) &&
          matchesTech &&
          (!languages.length ||
            languages.some(
              (l) => l.toLowerCase() === info.language?.toLowerCase(),
            ))
          ? repo
          : null;
      }),
    );
    const repos = results.filter((r): r is string => Boolean(r));
    if (repoCache.size >= 100) repoCache.delete(repoCache.keys().next().value!);
    repoCache.set(cacheKey, { repos, expires: Date.now() + 600000 });
    return repos;
  }
  const params = new URLSearchParams({
    q,
    sort: "stars",
    order: "desc",
    per_page: "20",
  });
  let response: Response;
  try {
    response = await fetcher(
      "https://api.github.com/search/repositories?" + params,
      { headers, signal: AbortSignal.timeout(15000) },
    );
  } catch {
    throw Object.assign(new Error("Repository search timed out. Try again."), {
      status: 503,
    });
  }
  if (!response.ok)
    throw Object.assign(
      new Error(
        "GitHub repository search is unavailable or rate limited. Try again shortly.",
      ),
      { status: 503 },
    );
  const result: {
    items: {
      full_name: string;
      has_issues: boolean;
      open_issues_count: number;
    }[];
  } = await response.json();
  const repos = result.items
    .filter((r) => r.has_issues && r.open_issues_count > 0)
    .slice(0, 6)
    .map((r) => r.full_name);
  if (repoCache.size >= 100) repoCache.delete(repoCache.keys().next().value!);
  repoCache.set(cacheKey, { repos, expires: Date.now() + 600000 });
  return repos;
}
