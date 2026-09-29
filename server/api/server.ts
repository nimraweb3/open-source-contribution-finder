import "dotenv/config";
import mongoose from "mongoose";
import { app } from "./app.js";
for (const key of ["MONGODB_URI", "JWT_SECRET", "JWT_REFRESH_SECRET"])
  if (!process.env[key])
    throw new Error(
      `Missing ${key}. Copy .env.example to .env and configure it.`,
    );
if (
  process.env.NODE_ENV === "production" &&
  (process.env.JWT_SECRET!.length < 32 ||
    process.env.JWT_REFRESH_SECRET!.length < 32 ||
    process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET ||
    process.env.JWT_SECRET!.startsWith("replace-") ||
    process.env.JWT_REFRESH_SECRET!.startsWith("replace-"))
)
  throw new Error(
    "Production requires different, randomly generated JWT secrets of at least 32 characters.",
  );
if (process.env.NODE_ENV === "production") {
  for (const key of ["CLIENT_URL", "API_URL"]) {
    const url = new URL(process.env[key] || "");
    if (url.protocol !== "https:" || url.origin !== process.env[key])
      throw new Error(`${key} must be an HTTPS origin in production.`);
  }
}
await mongoose.connect(process.env.MONGODB_URI!);
app.listen(process.env.PORT || 5000, () =>
  console.log(
    "Contribution-Finder API listening on port " + (process.env.PORT || 5000),
  ),
);
