import type { Request, Response, NextFunction } from "express";
declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}
import jwt from "jsonwebtoken";
export function auth(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = jwt.verify(
      req.headers.authorization?.replace(/^Bearer /, "") || "",
      process.env.JWT_SECRET!,
    ) as jwt.JwtPayload;
    if (typeof payload.sub !== "string") throw new Error("Invalid subject");
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ message: "Please sign in to continue." });
  }
}
