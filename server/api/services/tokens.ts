import type { Response, CookieOptions } from "express";
import type { UserDocument } from "../models/index.js";
import jwt from "jsonwebtoken";
import { createHash, randomUUID } from "node:crypto";
export const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export const publicUser = (user: UserDocument) => ({
  id: user.id,
  avatar: user.avatar,
  name: user.name,
  email: user.email,
  techStack: user.techStack,
  interests: user.interests,
});
export const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/api/auth",
  maxAge: 7 * 86400000,
};
export async function session(
  user: UserDocument,
  res: Response,
  redirect?: string,
) {
  const accessToken = jwt.sign({ sub: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "15m",
  });
  const refresh = jwt.sign(
    { sub: user.id, jti: randomUUID() },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" },
  );
  user.refreshHash = hash(refresh);
  await user.save();
  res.cookie("refresh", refresh, cookieOptions);
  if (redirect) res.redirect(redirect);
  else res.json({ user: publicUser(user), accessToken });
}
