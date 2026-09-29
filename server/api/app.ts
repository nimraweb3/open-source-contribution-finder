import type { ErrorRequestHandler } from "express";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { router } from "./routes/index.js";
import { connectDatabase } from "./services/database.js";
export const app = express();
if (process.env.VERCEL) {
  app.set("trust proxy", 1);
  app.use(async (_req, res, next) => {
    try {
      const access = process.env.JWT_SECRET || "";
      const refresh = process.env.JWT_REFRESH_SECRET || "";
      if (access.length < 32 || refresh.length < 32 || access === refresh || access.startsWith("replace-") || refresh.startsWith("replace-")) throw new Error("Invalid production secrets");
      for (const key of ["CLIENT_URL", "API_URL"]) {
        const url = new URL(process.env[key] || "");
        if (url.protocol !== "https:" || url.origin !== process.env[key]) throw new Error("Invalid production origin");
      }
      await connectDatabase();
      next();
    } catch {
      res.status(503).json({message: "The service is not ready. Check the deployment configuration and database connection."});
    }
  });
}
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "32kb" }));
app.use((req, res, next) => {
  req.body ??= {};
  next();
});
app.use(cookieParser());
app.use((req, res, next) => {
  if (
    !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
    req.headers.origin &&
    req.headers.origin !== (process.env.CLIENT_URL || "http://localhost:5173")
  )
    return res.status(403).json({ message: "Origin not allowed." });
  next();
});
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api", router);
app.use((req, res) => res.status(404).json({ message: "Endpoint not found." }));
const handleError: ErrorRequestHandler = (error, req, res, _next) => {
  if ([400, 503].includes(error.status))
    return res.status(error.status).json({ message: error.message });
  if (!error.code && !["ValidationError", "CastError"].includes(error.name))
    console.error("API request failed:", error.name);
  const status =
    error.code === 11000
      ? 409
      : ["ValidationError", "CastError"].includes(error.name) ||
          error.type === "entity.parse.failed"
        ? 400
        : 500;
  res.status(status).json({
    message:
      status === 409
        ? "This email is already registered."
        : status === 400
          ? "Invalid request data."
          : "Something went wrong. Please try again.",
  });
};
app.use(handleError);
