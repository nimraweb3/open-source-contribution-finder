import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { router } from "./routes/index.js";
export const app = express();
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
app.use((error, req, res, _next) => {
  console.error(error.message);
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
});
