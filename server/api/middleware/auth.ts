import type { Request, Response, NextFunction } from "express";
declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}
import { verifyToken } from "../services/tokens.js";
import { User } from "../models/index.js";
export async function auth(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = verifyToken(
      req.headers.authorization?.replace(/^Bearer /, "") || "",
      "access",
    );
    if (!(await User.exists({ _id: payload.sub, sessionId: payload.sid })))
      throw new Error("Session revoked");
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ message: "Please sign in to continue." });
  }
}
