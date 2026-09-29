import test from "node:test";
import assert from "node:assert/strict";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
process.env.JWT_SECRET = "test-only-access-secret-with-sufficient-length";
process.env.JWT_REFRESH_SECRET =
  "test-only-refresh-secret-with-sufficient-length";
process.env.CLIENT_URL = "http://localhost:5173";
const { app } = await import("./app.js");
const { Issue, User, Contribution } = await import("./models/index.js");
const { discover, buildSearch } = await import("./services/discovery.js");
const { safeReturn } = await import("./controllers/oauth.js");
test("authentication, refresh rotation, filtering, ownership, and contribution lifecycle", async () => {
  const mongo = await MongoMemoryServer.create({
    binary: { version: "7.0.14" },
  });
  await mongoose.connect(mongo.getUri());
  await Promise.all([User.init(), Issue.init(), Contribution.init()]);
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}/api`;
  async function request(path, method = "GET", body, token, cookie) {
    const response = await fetch(base + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return {
      status: response.status,
      body: await response.json(),
      cookie: response.headers.get("set-cookie")?.split(";")[0],
    };
  }
  try {
    for (const path of ["//evil.test", "/%2fevil.test", "/%5cevil.test", "/auth/complete", "/%0d%0aevil"])
      assert.equal(safeReturn(path), "/dashboard");
    assert.equal(safeReturn("/browse?languages=C%2B%2B"), "/browse?languages=C%2B%2B");
    assert.match(
      buildSearch({ languages: "C++,C#,Solidity,Move" }).get("q"),
      /language:"C\+\+" language:"C#" language:"Solidity" language:"Move"/,
    );
    assert.throws(() => buildSearch({ languages: 'Python" repo:evil' }));
    assert.match(
      buildSearch({ organization: "django" }).get("q"),
      /repo:django\/django/,
    );
    const gsoc = await request("/gsoc?technology=Python");
    assert.ok(gsoc.body.organizations.length > 0);
    assert.ok(
      gsoc.body.organizations.every((org) =>
        org.technologies.includes("Python"),
      ),
    );
    assert.equal((await request("/gsoc/no-such-org")).status, 404);
    assert.equal(
      (await request("/gsoc?q=no-such-name")).body.organizations.length,
      0,
    );
    assert.equal((await request("/auth/providers")).body.google, false);

    const searchParams = buildSearch({
      q: "facebook/react",
      label: "good first issue",
      language: "TypeScript",
      unassigned: "true",
      page: "900",
    });
    assert.match(searchParams.get("q"), /is:open.*is:public/);
    assert.match(searchParams.get("q"), /repo:facebook\/react/);
    assert.match(searchParams.get("q"), /no:assignee/);
    assert.equal(searchParams.get("page"), "50");
    let calls = 0;
    const fakeGithub = async () => {
      calls++;
      return {
        ok: true,
        json: async () => ({
          total_count: 1,
          incomplete_results: false,
          items: [
            {
              id: 1234,
              number: 7,
              title: "Real-shaped GitHub fixture",
              repository_url: "https://api.github.com/repos/test/repository",
              labels: [{ name: "good first issue" }],
              body: "An issue description",
              html_url: "https://github.com/test/repository/issues/7",
              comments: 2,
              state: "open",
              updated_at: "2026-09-27T12:00:00Z",
              user: { login: "maintainer" },
              assignees: [],
            },
          ],
        }),
      };
    };
    const [live, duplicate] = await Promise.all([
      discover({ q: "integration-fixture" }, fakeGithub),
      discover({ q: "integration-fixture" }, fakeGithub),
    ]);
    assert.equal(calls, 1);
    assert.equal(live.issues[0].source, "github");
    assert.equal(String(live.issues[0]._id), String(duplicate.issues[0]._id));
    assert.equal(
      live.issues[0].url,
      "https://github.com/test/repository/issues/7",
    );
    await assert.rejects(
      discover({ q: "rate-limit-fixture" }, async () => ({
        ok: false,
        status: 429,
      })),
      (error) => error.status === 503 && error.message.includes("search limit"),
    );

    const categoryUrls: string[] = [];
    await discover(
      { category: "web3", languages: "Solidity", label: "help wanted" },
      async (url) => {
        categoryUrls.push(String(url));
        if (String(url).includes("/search/repositories?"))
          return Response.json({
            items: [
              {
                full_name: "fixture/contracts",
                has_issues: true,
                open_issues_count: 2,
              },
            ],
          });
        return Response.json({
          total_count: 0,
          items: [],
          incomplete_results: false,
        });
      },
    );
    assert.match(
      new URL(categoryUrls[0]).searchParams.get("q"),
      /topic:blockchain/,
    );
    assert.match(
      new URL(categoryUrls[0]).searchParams.get("q"),
      /language:"Solidity"/,
    );
    assert.match(
      new URL(categoryUrls[1]).searchParams.get("q"),
      /repo:fixture\/contracts/,
    );
    assert.match(
      new URL(categoryUrls[1]).searchParams.get("q"),
      /label:"help wanted"/,
    );
    assert.throws(() =>
      buildSearch({ organization: "sympy", q: "someone/else" }),
    );
    await assert.rejects(
      discover({ category: "not-a-category" }),
      /Unknown development category/,
    );
    const emptyScope = await discover(
      { technology: "unique-nonexistent-fixture" },
      async () => Response.json({ items: [] }),
    );
    assert.equal(emptyScope.total, 0);
    assert.match(emptyScope.scopeNote, /0 repositories/);

    const issue = await Issue.create({
      title: "Improve docs",
      repository: "test/react",
      language: "TypeScript",
      stars: 120,
      labels: ["good first issue"],
      difficulty: "Beginner",
      description: "Test",
      url: "https://github.com/test/react",
    });
    assert.equal((await request("/contributions")).status, 401);
    assert.equal(
      (
        await request("/auth/signup", "POST", {
          name: "Test",
          email: "bad",
          password: "short",
        })
      ).status,
      400,
    );
    const signup = await request("/auth/signup", "POST", {
      name: "Tester",
      email: "tester@example.test",
      password: "testing-password-123",
    });
    assert.equal(signup.status, 200);
    assert.ok(signup.cookie);
    assert.equal(signup.body.user.password, undefined);
    const token = signup.body.accessToken;
    const profileHeaders = await fetch(base + "/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(profileHeaders.headers.get("cache-control"), "no-store");
    assert.equal(
      profileHeaders.headers.get("x-robots-tag"),
      "noindex, nofollow",
    );
    const forged = jwt.sign(
      { sub: signup.body.user.id },
      process.env.JWT_SECRET!,
    );
    assert.equal((await request("/profile", "GET", null, forged)).status, 401);
    const crossSite = await fetch(base + "/auth/logout", {
      method: "POST",
      headers: { Origin: "https://evil.example" },
    });
    assert.equal(crossSite.status, 403);
    const fetchMetadata = await fetch(base + "/auth/logout", { method: "POST", headers: { "Sec-Fetch-Site": "cross-site" } });
    assert.equal(fetchMetadata.status, 403);
    const oversized = await fetch(base + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "a".repeat(40000) }),
    });
    assert.equal(oversized.status, 413);
    assert.equal(
      (
        await request("/auth/login", "POST", {
          email: "tester@example.test",
          password: "wrong",
        })
      ).status,
      401,
    );
    assert.equal(
      (
        await request("/auth/signup", "POST", {
          name: "Test",
          email: "tester@example.test",
          password: "testing-password-123",
        })
      ).status,
      409,
    );
    const filtered = await request(
      "/issues?language=TypeScript&difficulty=Beginner&q=docs",
    );
    assert.equal(filtered.body.total, 1);
    assert.equal((await request("/issues?language=Python")).body.total, 0);
    assert.equal((await request("/issues?page=1.5")).status, 200);
    assert.equal((await request("/issues?q=%5B")).status, 200);
    assert.equal((await request("/issues/not-an-id")).status, 400);
    assert.equal(
      (
        await request(
          `/contributions/${issue.id}`,
          "PUT",
          { status: "in progress" },
          token,
        )
      ).status,
      200,
    );
    assert.equal(
      (
        await request(
          `/contributions/${issue.id}`,
          "PUT",
          { status: "invalid" },
          token,
        )
      ).status,
      400,
    );
    assert.equal(
      (await request("/contributions", "GET", null, token)).body[0].status,
      "in progress",
    );
    await request(`/contributions/${issue.id}`, "POST", {}, token);
    assert.equal(
      (await request("/contributions", "GET", null, token)).body[0].status,
      "in progress",
    );
    const other = await request("/auth/signup", "POST", {
      name: "Other",
      email: "other@example.test",
      password: "testing-password-123",
    });
    assert.equal(
      (await request("/contributions", "GET", null, other.body.accessToken))
        .body.length,
      0,
    );
    assert.equal(
      (
        await request(
          "/profile",
          "PATCH",
          {
            name: "Updated",
            techStack: ["React"],
            interests: ["Accessibility"],
          },
          token,
        )
      ).body.name,
      "Updated",
    );
    const renewed = await request(
      "/auth/refresh",
      "POST",
      null,
      null,
      signup.cookie,
    );
    assert.equal(renewed.status, 200);
    assert.equal(
      (await request("/auth/refresh", "POST", null, null, signup.cookie))
        .status,
      401,
    );
    await request(`/contributions/${issue.id}`, "DELETE", null, token);
    assert.equal(
      (await request("/contributions", "GET", null, token)).body.length,
      0,
    );
    // Exactly one concurrent rotation may consume a refresh token.
    const rotations = await Promise.all([
      request("/auth/refresh", "POST", null, null, renewed.cookie),
      request("/auth/refresh", "POST", null, null, renewed.cookie),
    ]);
    assert.deepEqual(rotations.map((r) => r.status).sort(), [200, 401]);
    // Even a previously rotated cookie can revoke its own session.
    await request("/auth/logout", "POST", null, null, renewed.cookie);
    assert.equal(
      (await request("/auth/refresh", "POST", null, null, renewed.cookie))
        .status,
      401,
    );
    assert.equal((await request("/profile", "GET", null, token)).status, 401);
    const signedInAgain = await request("/auth/login", "POST", {
      email: "tester@example.test", password: "testing-password-123",
    });
    assert.equal(signedInAgain.status, 200);
    assert.equal((await request("/profile", "GET", null, signedInAgain.body.accessToken)).status, 200);
    assert.equal(
      (
        await request(
          "/profile",
          "GET",
          null,
          rotations.find((r) => r.status === 200).body.accessToken,
        )
      ).status,
      401,
    );

    // Exercise the real OAuth handlers with an isolated provider fixture.
    process.env.GITHUB_CLIENT_ID = "test-client";
    process.env.GITHUB_CLIENT_SECRET = "test-secret";
    const begin = await fetch(
      base + "/auth/oauth/github?returnTo=%2Fdashboard",
      { redirect: "manual" },
    );
    assert.equal(begin.status, 302);
    const authorize = new URL(begin.headers.get("location"));
    assert.equal(authorize.hostname, "github.com");
    assert.equal(authorize.searchParams.get("code_challenge_method"), "S256");
    const state = authorize.searchParams.get("state");
    const bindingCookie = begin.headers.get("set-cookie").split(";")[0];
    const missingBinding = await fetch(
      base + "/auth/oauth/github/callback?state=" + state + "&code=test-code",
      { redirect: "manual" },
    );
    assert.match(missingBinding.headers.get("location"), /oauthError=expired/);
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url, options) => {
      const address = String(url);
      if (address === "https://github.com/login/oauth/access_token")
        return Response.json({ access_token: "fixture-token" });
      if (address === "https://api.github.com/user")
        return Response.json({
          id: 987654,
          login: "oauth-contributor",
          avatar_url: "https://avatars.githubusercontent.com/u/987654",
        });
      if (address === "https://api.github.com/user/emails")
        return Response.json([
          { email: "oauth@example.test", primary: true, verified: true },
        ]);
      return originalFetch(url, options);
    };
    try {
      const callbackPath =
        base + "/auth/oauth/github/callback?state=" + state + "&code=test-code";
      const completed = await fetch(callbackPath, {
        headers: { Cookie: bindingCookie },
        redirect: "manual",
      });
      assert.equal(completed.status, 302);
      assert.match(completed.headers.get("location"), /auth\/complete/);
      assert.ok(!completed.headers.get("location").includes("token"));
      const refreshCookie = completed.headers
        .getSetCookie()
        .find((c) => c.startsWith("refresh="))
        .split(";")[0];
      const oauthSession = await request(
        "/auth/refresh",
        "POST",
        null,
        null,
        refreshCookie,
      );
      assert.equal(oauthSession.status, 200);
      assert.equal(oauthSession.body.user.name, "oauth-contributor");
      assert.ok(oauthSession.body.user.avatar);
      assert.equal(oauthSession.body.user.githubId, undefined);
      const replay = await fetch(callbackPath, {
        headers: { Cookie: bindingCookie },
        redirect: "manual",
      });
      assert.match(replay.headers.get("location"), /oauthError=expired/);
      assert.equal(
        (
          await request("/auth/login", "POST", {
            email: "oauth@example.test",
            password: "anything",
          })
        ).status,
        401,
      );
    } finally {
      globalThis.fetch = originalFetch;
      delete process.env.GITHUB_CLIENT_ID;
      delete process.env.GITHUB_CLIENT_SECRET;
    }
    let limited;
    for (let i = 0; i < 31; i++)
      limited = await request("/auth/login", "POST", {
        email: "none@example.test",
        password: "wrong",
      });
    assert.equal(limited.status, 429);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
    await mongo.stop();
  }
});
