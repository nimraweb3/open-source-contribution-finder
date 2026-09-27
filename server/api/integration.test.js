import test from "node:test";
import assert from "node:assert/strict";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
process.env.JWT_SECRET = "test-only-access-secret-with-sufficient-length";
process.env.JWT_REFRESH_SECRET =
  "test-only-refresh-secret-with-sufficient-length";
process.env.CLIENT_URL = "http://localhost:5173";
const { app } = await import("./app.js");
const { Issue, User, Contribution } = await import("./models/index.js");
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
    await request("/auth/logout", "POST", null, null, renewed.cookie);
    assert.equal(
      (await request("/auth/refresh", "POST", null, null, renewed.cookie))
        .status,
      401,
    );
    await request(`/contributions/${issue.id}`, "DELETE", null, token);
    assert.equal(
      (await request("/contributions", "GET", null, token)).body.length,
      0,
    );
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
    await mongo.stop();
  }
});
