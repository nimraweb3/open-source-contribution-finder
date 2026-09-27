import type { Request, Response } from "express";

export const searchIssues = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const query = typeof req.query.q === "string" ? req.query.q : "";

  res.json({
    success: true,
    data: {
      query,
      issues: [],
    },
    error: null,
  });
};
