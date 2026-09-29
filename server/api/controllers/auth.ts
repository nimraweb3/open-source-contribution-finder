import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import {
  session,
  hash,
  publicUser,
  cookieOptions,
} from "../services/tokens.js";
export async function signup(req: Request, res: Response) {
  const { name, email, password } = req.body;
  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof password !== "string" ||
    password.length < 10 ||
    Buffer.byteLength(password, "utf8") > 72
  )
    return res.status(400).json({
      message:
        "Use a valid email, name, and a password of at least 10 characters (maximum 72 UTF-8 bytes).",
    });
  const user = await User.create({
    name: name.trim().slice(0, 80),
    email: email.toLowerCase().trim(),
    password: await bcrypt.hash(password, 12),
  });
  await session(user, res);
}
export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const user =
    typeof email === "string"
      ? await User.findOne({ email: email.toLowerCase().trim() })
      : null;
  if (
    !user ||
    !user.password ||
    typeof password !== "string" ||
    !(await bcrypt.compare(password, user.password))
  )
    return res.status(401).json({ message: "Email or password is incorrect." });
  await session(user, res);
}
export async function refresh(req: Request, res: Response) {
  try {
    const token = req.cookies.refresh;
    const payload = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET!,
    ) as jwt.JwtPayload;
    const user = await User.findOneAndUpdate(
      { _id: payload.sub, refreshHash: hash(token) },
      { $unset: { refreshHash: 1 } },
      { returnDocument: "after" },
    );
    if (!user) throw new Error();
    await session(user, res);
  } catch {
    res
      .status(401)
      .json({ message: "Your session has expired. Please sign in." });
  }
}
export async function logout(req: Request, res: Response) {
  if (req.cookies.refresh)
    await User.updateOne(
      { refreshHash: hash(req.cookies.refresh) },
      { $unset: { refreshHash: 1 } },
    );
  res.clearCookie("refresh", cookieOptions).json({ message: "Signed out." });
}
export async function profile(req: Request, res: Response) {
  const updates: Record<string, string | string[]> = {};
  if (req.method === "PATCH") {
    if (typeof req.body.name !== "string" || !req.body.name.trim())
      return res.status(400).json({ message: "Name is required." });
    updates.name = req.body.name.trim().slice(0, 80);
    for (const key of ["techStack", "interests"]) {
      if (
        !Array.isArray(req.body[key]) ||
        req.body[key].some((x: string) => typeof x !== "string")
      )
        return res
          .status(400)
          .json({ message: "Preferences must be text lists." });
      updates[key] = req.body[key]
        .slice(0, 20)
        .map((x: string) => x.slice(0, 80));
    }
  }
  const user = await User.findByIdAndUpdate(req.userId, updates, {
    returnDocument: "after",
  });
  if (!user) return res.status(401).json({ message: "Account not found." });
  res.json(publicUser(user));
}
