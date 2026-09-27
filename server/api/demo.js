import { MongoMemoryServer } from "mongodb-memory-server";
import { randomBytes } from "node:crypto";
import { mkdir } from "node:fs/promises";
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
process.env.JWT_SECRET = randomBytes(48).toString("hex");
process.env.JWT_REFRESH_SECRET = randomBytes(48).toString("hex");
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
