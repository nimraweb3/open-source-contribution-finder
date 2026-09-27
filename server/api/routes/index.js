import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as users from "../controllers/auth.js";
import * as issues from "../controllers/issues.js";
import { auth } from "../middleware/auth.js";
export const router = Router();
const limiter = rateLimit({
  windowMs: 15 * 60000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many attempts. Try again later." },
});
router.post("/auth/signup", limiter, users.signup);
router.post("/auth/login", limiter, users.login);
router.post("/auth/refresh", users.refresh);
router.post("/auth/logout", users.logout);
router.get("/profile", auth, users.profile);
router.patch("/profile", auth, users.profile);
router.get("/issues", issues.list);
router.get("/issues/:id", issues.detail);
router.get("/contributions", auth, issues.saved);
router.put("/contributions/:id", auth, issues.save);
router.delete("/contributions/:id", auth, issues.remove);
router.post("/contributions/:id", auth, issues.bookmark);
