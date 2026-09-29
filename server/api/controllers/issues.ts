import type { Request, Response } from "express";
import { Issue, Contribution } from "../models/index.js";
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export async function list(req: Request, res: Response) {
  const filter: Record<string, unknown> = {};
  for (const field of ["language", "difficulty"])
    if (typeof req.query[field] === "string" && req.query[field])
      filter[field] = req.query[field];
  if (typeof req.query.label === "string" && req.query.label)
    filter.labels = req.query.label;
  if (typeof req.query.q === "string" && req.query.q)
    filter.$or = ["title", "repository", "description"].map((key) => ({
      [key]: {
        $regex: escape(String(req.query.q).slice(0, 120)),
        $options: "i",
      },
    }));
  const page = Math.max(
    1,
    Math.min(1000, Math.floor(Number(req.query.page) || 1)),
  );
  const sort: Record<string, 1 | -1> =
    req.query.sort === "stars"
      ? { stars: -1, _id: 1 }
      : req.query.sort === "difficulty"
        ? { difficultyOrder: 1, _id: 1 }
        : { updatedAt: -1, _id: 1 };
  const query = Issue.aggregate([
    { $match: filter },
    {
      $addFields: {
        difficultyOrder: {
          $indexOfArray: [
            ["Beginner", "Intermediate", "Advanced"],
            "$difficulty",
          ],
        },
      },
    },
    { $sort: sort },
    { $skip: (page - 1) * 12 },
    { $limit: 12 },
    { $project: { difficultyOrder: 0 } },
  ]);
  const [issues, total] = await Promise.all([
    query,
    Issue.countDocuments(filter),
  ]);
  res.json({ issues, total, page });
}
export async function detail(req: Request, res: Response) {
  const issue = await Issue.findById(req.params.id);
  if (!issue) return res.status(404).json({ message: "Issue not found." });
  res.json(issue);
}
export async function saved(req: Request, res: Response) {
  res.json(
    await Contribution.find({ user: req.userId })
      .populate("issue")
      .sort({ updatedAt: -1 }),
  );
}
export async function save(req: Request, res: Response) {
  if (!(await Issue.exists({ _id: req.params.id })))
    return res.status(404).json({ message: "Issue not found." });
  const status = req.body.status || "saved";
  if (!["saved", "in progress", "submitted", "merged"].includes(status))
    return res.status(400).json({ message: "Invalid contribution status." });
  res.json(
    await Contribution.findOneAndUpdate(
      { user: req.userId, issue: req.params.id },
      { status },
      { upsert: true, returnDocument: "after", runValidators: true },
    ),
  );
}
export async function remove(req: Request, res: Response) {
  await Contribution.deleteOne({ user: req.userId, issue: req.params.id });
  res.json({ message: "Removed." });
}
export async function bookmark(req: Request, res: Response) {
  if (!(await Issue.exists({ _id: req.params.id })))
    return res.status(404).json({ message: "Issue not found." });
  res.json(
    await Contribution.findOneAndUpdate(
      { user: req.userId, issue: req.params.id },
      { $setOnInsert: { status: "saved" } },
      { upsert: true, returnDocument: "after" },
    ),
  );
}
