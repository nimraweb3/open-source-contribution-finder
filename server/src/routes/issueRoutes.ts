import { Router } from "express";
import { searchIssues } from "../controllers/issueController";

const router = Router();

router.get("/", searchIssues);

export default router;
