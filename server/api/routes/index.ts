import * as oauth from "../controllers/oauth.js";
import {
  organizations,
  directory,
  verifiedAt,
  findOrganization,
} from "../services/organizations.js";
import { Router } from "express";
import { rateLimit } from "../middleware/rateLimit.js";
import * as users from "../controllers/auth.js";
import * as issues from "../controllers/issues.js";
import { auth } from "../middleware/auth.js";
import { discover } from "../services/discovery.js";
export const router = Router();
router.use(rateLimit("api", 240, 60000));
router.get("/discover", rateLimit("discovery", 20, 60000), async (req, res) => {
  res.json(await discover(req.query));
});
const limiter = rateLimit("authentication", 30, 15 * 60000);
router.post("/auth/signup", limiter, users.signup);
router.post("/auth/login", limiter, users.login);
router.post("/auth/refresh", rateLimit("refresh", 60, 60000), users.refresh);
router.post("/auth/logout", users.logout);
router.get("/profile", auth, users.profile);
router.patch("/profile", auth, users.profile);
router.get("/issues", issues.list);
router.get("/issues/:id", issues.detail);
router.get("/contributions", auth, issues.saved);
router.put("/contributions/:id", auth, issues.save);
router.delete("/contributions/:id", auth, issues.remove);
router.post("/contributions/:id", auth, issues.bookmark);

router.get("/auth/providers", oauth.providers);
router.get("/auth/oauth/:provider", limiter, oauth.start);
router.get("/auth/oauth/:provider/callback", limiter, oauth.callback);
router.get("/gsoc", (req, res) => {
  const q = String(req.query.q || "")
    .toLowerCase()
    .slice(0, 100);
  const tech = String(req.query.technology || "")
    .toLowerCase()
    .slice(0, 60);
  res.json({
    year: 2026,
    verifiedAt,
    directory,
    organizations: organizations.filter(
      (org) =>
        (org.name + " " + org.description + " " + org.technologies.join(" "))
          .toLowerCase()
          .includes(q) &&
        org.technologies.some((t) => t.toLowerCase().includes(tech)),
    ),
  });
});
router.get("/gsoc/:id", (req, res) => {
  const org = findOrganization(req.params.id);
  if (!org) return res.status(404).json({ message: "Organization not found." });
  res.json(org);
});
