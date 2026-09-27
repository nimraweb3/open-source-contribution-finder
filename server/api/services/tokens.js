import jwt from "jsonwebtoken";
import { createHash, randomUUID } from "node:crypto";
export const hash = (value) => createHash("sha256").update(value).digest("hex");
export const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  techStack: user.techStack,
  interests: user.interests,
});
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/api/auth",
  maxAge: 7 * 86400000,
};
export async function session(user, res) {
  const accessToken = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
  const refresh = jwt.sign(
    { sub: user.id, jti: randomUUID() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" },
  );
  user.refreshHash = hash(refresh);
  await user.save();
  res
    .cookie("refresh", refresh, cookieOptions)
    .json({ user: publicUser(user), accessToken });
}
