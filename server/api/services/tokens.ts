import type { Response, CookieOptions } from "express";
import { User, type UserDocument } from "../models/index.js";
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
const issuer = "contribution-finder";
const audience = "contribution-finder-web";
export function verifyToken(token: string, kind: "access" | "refresh") {
  const payload = jwt.verify(
    token,
    kind === "access"
      ? process.env.JWT_SECRET!
      : process.env.JWT_REFRESH_SECRET!,
    {
      algorithms: ["HS256"],
      issuer,
      audience,
    },
  );
  if (
    typeof payload === "string" ||
    payload.kind !== kind ||
    typeof payload.sub !== "string" ||
    !/^[a-f0-9]{24}$/i.test(payload.sub) ||
    typeof payload.sid !== "string" ||
    !/^[a-f0-9-]{36}$/i.test(payload.sid)
  ) {
    throw new Error("Invalid session token");
  }
  return payload as jwt.JwtPayload & { sub: string; sid: string };
}
export async function session(
  user: UserDocument,
  res: Response,
  redirect?: string,
  previous?: { hash: string; sid: string },
) {
  const sid = previous?.sid || randomUUID();
  const accessToken = jwt.sign(
    { sub: user.id, sid, kind: "access" },
    process.env.JWT_SECRET!,
    {
      expiresIn: "15m",
      algorithm: "HS256",
      issuer,
      audience,
    },
  );
  const refresh = jwt.sign(
    { sub: user.id, sid, kind: "refresh", jti: randomUUID() },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d", algorithm: "HS256", issuer, audience },
  );
  // Compare-and-swap prevents concurrent refreshes or logout from resurrecting a session.
  const updated = await User.updateOne(
    {
      _id: user._id,
      ...(previous
        ? { refreshHash: previous.hash, sessionId: previous.sid }
        : {}),
    },
    { $set: { refreshHash: hash(refresh), sessionId: sid } },
  );
  if (!updated.matchedCount) throw new Error("Session revoked");
  res.cookie("refresh", refresh, cookieOptions);
  if (redirect) res.redirect(redirect);
  else res.json({ user: publicUser(user), accessToken });
}
