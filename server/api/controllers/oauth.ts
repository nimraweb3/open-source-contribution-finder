import type { Request, Response, CookieOptions } from "express";
import { randomBytes } from "node:crypto";
import { OAuthTransaction } from "../models/oauth.js";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { User } from "../models/index.js";
import { hash, session } from "../services/tokens.js";

const keys = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs"),
);
const client = () => process.env.CLIENT_URL || "http://localhost:5173";
const config = (provider: string) => ({
  id: process.env[`${provider.toUpperCase()}_CLIENT_ID`],
  secret: process.env[`${provider.toUpperCase()}_CLIENT_SECRET`],
  callback: `${process.env.API_URL || "http://localhost:5000"}/api/auth/oauth/${provider}/callback`,
});
const cookie: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/api/auth/oauth",
  maxAge: 600000,
};
export function safeReturn(value: unknown): string {
  return typeof value === "string" &&
    /^\/(?!\/)[\w/?=&%+.,#-]*$/.test(value) &&
    value.length <= 1000 &&
    !/%(?:2f|5c|0[ad])/i.test(value) &&
    !value.startsWith("/auth")
    ? value
    : "/dashboard";
}
export function providers(_req: Request, res: Response) {
  res.json(
    Object.fromEntries(
      ["google", "github"].map((p) => [
        p,
        Boolean(config(p).id && config(p).secret),
      ]),
    ),
  );
}
export async function start(req: Request, res: Response) {
  const provider = String(req.params.provider);
  if (!["google", "github"].includes(provider))
    return res.status(404).json({ message: "Unknown provider." });
  const settings = config(provider);
  if (!settings.id || !settings.secret)
    return res
      .status(503)
      .json({ message: "This sign-in provider has not been configured yet." });
  const state = randomBytes(32).toString("base64url");
  const binding = randomBytes(32).toString("base64url");
  const verifier = randomBytes(48).toString("base64url");
  const nonce = randomBytes(32).toString("base64url");
  await OAuthTransaction.create({
    state: hash(state),
    binding: hash(binding),
    provider,
    verifier,
    nonce,
    returnTo: safeReturn(req.query.returnTo),
    expiresAt: new Date(Date.now() + 600000),
  });
  const url = new URL(
    provider === "google"
      ? "https://accounts.google.com/o/oauth2/v2/auth"
      : "https://github.com/login/oauth/authorize",
  );
  const challenge = Buffer.from(hash(verifier), "hex").toString("base64url");
  url.search = new URLSearchParams({
    client_id: settings.id,
    redirect_uri: settings.callback,
    response_type: "code",
    scope:
      provider === "google" ? "openid email profile" : "read:user user:email",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    ...(provider === "google" ? { nonce } : {}),
  }).toString();
  res.cookie(`oauth_${provider}`, binding, cookie).redirect(url.toString());
}
async function providerJson(url: string, options: RequestInit) {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("Provider request failed");
  return response.json();
}
export async function callback(req: Request, res: Response) {
  const provider = String(req.params.provider);
  if (!["google", "github"].includes(provider))
    return res.status(404).json({ message: "Unknown provider." });
  const fail = (reason: string) =>
    res.redirect(`${client()}/login?oauthError=${reason}`);
  const binding = req.cookies[`oauth_${provider}`];
  res.clearCookie(`oauth_${provider}`, cookie);
  if (typeof req.query.state !== "string" || typeof binding !== "string")
    return fail("expired");
  const flow = await OAuthTransaction.findOneAndDelete({
    state: hash(req.query.state),
    binding: hash(binding),
    provider,
    expiresAt: { $gt: new Date() },
  });
  if (!flow) return fail("expired");
  if (req.query.error) return fail("cancelled");
  if (typeof req.query.code !== "string") return fail("failed");
  try {
    const settings = config(provider);
    if (!settings.id || !settings.secret) return fail("unavailable");
    const tokens = await providerJson(
      provider === "google"
        ? "https://oauth2.googleapis.com/token"
        : "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: settings.id,
          client_secret: settings.secret,
          code: req.query.code,
          redirect_uri: settings.callback,
          grant_type: "authorization_code",
          code_verifier: flow.verifier!,
        }),
      },
    );
    let identity: {
      subject: string;
      email: string;
      name: string;
      avatar?: string;
    };
    if (provider === "google") {
      const { payload } = await jwtVerify(tokens.id_token, keys, {
        audience: settings.id,
        issuer: ["https://accounts.google.com", "accounts.google.com"],
        algorithms: ["RS256"],
      });
      if (
        payload.nonce !== flow.nonce ||
        !payload.sub ||
        payload.email_verified !== true ||
        typeof payload.email !== "string"
      )
        throw new Error("Invalid identity");
      identity = {
        subject: payload.sub,
        email: payload.email,
        name:
          typeof payload.name === "string"
            ? payload.name
            : payload.email.split("@")[0],
        avatar:
          typeof payload.picture === "string" ? payload.picture : undefined,
      };
    } else {
      if (typeof tokens.access_token !== "string")
        throw new Error("No provider token");
      const headers = {
        Authorization: `Bearer ${tokens.access_token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "Contribution-Finder",
      };
      const account = await providerJson("https://api.github.com/user", {
        headers,
      });
      const emails: { email: string; primary: boolean; verified: boolean }[] =
        await providerJson("https://api.github.com/user/emails", { headers });
      const email =
        emails.find((e) => e.primary && e.verified) ||
        emails.find((e) => e.verified);
      if (!email || !account.id) throw new Error("No verified email");
      identity = {
        subject: String(account.id),
        email: email.email,
        name: account.name || account.login,
        avatar: account.avatar_url,
      };
    }
    const field = provider === "google" ? "googleId" : "githubId";
    let user = await User.findOne({ [field]: identity.subject });
    if (!user) {
      // Never silently link an existing account just because emails match.
      if (await User.exists({ email: identity.email.toLowerCase() }))
        return fail("existing");
      user = await User.create({
        [field]: identity.subject,
        email: identity.email.toLowerCase(),
        name: identity.name.slice(0, 80),
        avatar: identity.avatar?.startsWith("https://")
          ? identity.avatar
          : undefined,
      });
    }
    await session(
      user,
      res,
      `${client()}/auth/complete?next=${encodeURIComponent(safeReturn(flow.returnTo))}`,
    );
  } catch {
    // Provider tokens, authorization codes and secrets must never enter logs or URLs.
    return fail("failed");
  }
}
