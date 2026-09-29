import "dotenv/config";
import { MongoMemoryServer } from "mongodb-memory-server";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
// Local development only: a real MongoDB process with data stored on disk.
if (process.env.NODE_ENV === "production")
  throw new Error(
    "Use npm start with a managed MongoDB database in production.",
  );
const dbPath = resolve(".demo-db");
await mkdir(dbPath, { recursive: true });
const mongo = await MongoMemoryServer.create({
  instance: {
    dbPath,
    dbName: "contribution-finder",
    storageEngine: "wiredTiger",
  },
  binary: { version: "7.0.14" },
});
process.env.MONGODB_URI = mongo.getUri("contribution-finder");
const secretPath = resolve(dbPath, "session-secrets.json");
let secrets: { access: string; refresh: string };
try {
  secrets = JSON.parse(await readFile(secretPath, "utf8"));
} catch {
  secrets = {
    access: randomBytes(48).toString("hex"),
    refresh: randomBytes(48).toString("hex"),
  };
  await writeFile(secretPath, JSON.stringify(secrets), { mode: 0o600 });
}
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.startsWith("replace-"))
  process.env.JWT_SECRET = secrets.access;
if (
  !process.env.JWT_REFRESH_SECRET ||
  process.env.JWT_REFRESH_SECRET.startsWith("replace-")
)
  process.env.JWT_REFRESH_SECRET = secrets.refresh;
process.env.PORT = process.env.PORT || "5000";
process.env.CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
await import("./seed.js");
await import("./server.js");
const stop = async () => {
  await mongo.stop({ doCleanup: false });
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
