import type { Issue } from "../types/issue.js";

interface IssueResponse {
  success: boolean;

  data: {
    total: number;
    page: number;
    issues: Issue[];
  } | null;

  error: string | null;
}

export interface IssueSearchParams {
  query?: string | undefined;
  language?: string | undefined;
  label?: string | undefined;
  state?: string | undefined;
  sort?: string | undefined;
  page?: number | undefined;
}

export const fetchIssues = async ({
  query,
  language,
  label,
  state,
  sort,
  page = 1,
}: IssueSearchParams) => {
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

  const response = await fetch(
    `http://localhost:5000/api/issues?${params.toString()}`,
  );

  const result = (await response.json()) as IssueResponse;

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.error ?? "Failed to fetch issues.");
  }

  return result.data;
};
