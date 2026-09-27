import assert from "node:assert/strict";
import { test } from "node:test";
import type { AddressInfo } from "node:net";
import app from "../dist/app.js";
import { fetchIssues } from "../../src/services/issueService.ts";

test("frontend -> Express -> GitHub difficulty and pagination", async () => {
  const nativeFetch = globalThis.fetch;
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const port = (server.address() as AddressInfo).port;
  const requests: URL[] = [];
  globalThis.fetch = async (input, init) => {
    const url = new URL(String(input));
    if (url.hostname === "api.github.com") {
      requests.push(url);
      return Response.json({ total_count: 0, items: [] });
    }
    url.port = String(port);
    return nativeFetch(url, init);
  };
  try {
    for (const [difficulty, label] of [["Beginner", "good first issue"], ["Intermediate", "help wanted"], ["Advanced", ""]]) {
      const result = await fetchIssues({ difficulty, page: 2 });
      assert.deepEqual(result, { total: 0, page: 2, issues: [] });
      const request = requests.at(-1)!;
      assert.equal(request.searchParams.get("q"), `is:issue is:open${label ? ` label:"${label}"` : ""}`);
      assert.equal(request.searchParams.get("page"), "2");
      assert.equal(request.searchParams.get("per_page"), "20");
    }
    await fetchIssues({ query: "react", difficulty: "Beginner", label: "bug", language: "TypeScript", state: "All", sort: "Recently updated" });
    const request = requests.at(-1)!;
    assert.equal(request.searchParams.get("q"), 'react is:issue language:TypeScript label:"bug" label:"good first issue"');
    assert.equal(request.searchParams.get("sort"), "updated");
    await fetchIssues({ difficulty: "Beginner", label: "good first issue" });
    assert.equal(requests.at(-1)!.searchParams.get("q"), 'is:issue is:open label:"good first issue"');
    await assert.rejects(fetchIssues({ difficulty: "Impossible" }), /Invalid difficulty/);
    await assert.rejects(fetchIssues({}), /Enter a search term/);
    globalThis.fetch = async (input, init) => {
      if (new URL(String(input)).hostname === "api.github.com") return new Response("Unavailable", { status: 503 });
      const url = new URL(String(input));
      url.port = String(port);
      return nativeFetch(url, init);
    };
    await assert.rejects(fetchIssues({ difficulty: "Beginner" }), /Failed to fetch GitHub issues/);
  } finally {
    globalThis.fetch = nativeFetch;
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
