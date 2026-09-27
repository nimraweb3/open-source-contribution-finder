import jwt from "jsonwebtoken";
export function auth(req, res, next) {
  try {
    req.userId = jwt.verify(
      req.headers.authorization?.replace(/^Bearer /, ""),
      process.env.JWT_SECRET,
    ).sub;
    next();
  } catch {
    res.status(401).json({ message: "Please sign in to continue." });
  }
}
