import { Router } from "express";
import { searchIssues } from "../controllers/issueController.js";
const router = Router();
router.get("/", searchIssues);
export default router;
//# sourceMappingURL=issueRoutes.js.map