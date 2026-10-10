# Security review — 2026-09-29

Scope: active `client/src` and `server/api`, dependency lockfiles, and the Vercel deployment configuration. This is a code review with regression tests, not an independent penetration test or a guarantee that every vulnerability has been found.

## Follow-up — 2026-10-10

- Malformed JSON now returns a fixed error message instead of potentially echoing submitted values from the parser's diagnostic text. Regression coverage checks this response.
- Database connection sharing now retains only an in-flight promise. A later disconnect can establish a new connection instead of reusing an already-resolved promise. Integration coverage disconnects and reconnects before exercising the API again.
- Updated the transitive `source-map-js` dependency to resolve GHSA-68fv-2mgg-jv7q. Root and server audits, including development dependencies, reported zero known vulnerabilities after the update.
- Fixed a syntax error in the public-page prerender script that blocked new production builds. Existing production health, language/category searches, GSoC, robots, and sitemap checks returned successful responses.

Provider availability checks are not a new end-to-end OAuth login test. The actual Google/GitHub consent round trips were verified in the earlier deployment pass; no provider configuration was changed in this follow-up.

## Fixed

- **Access tokens survived logout.** JWTs now contain a server-side session ID. Every authenticated request checks that session, and logout revokes both access and refresh authorization. Tokens require HS256, the application issuer/audience, a valid subject, and the correct access/refresh token type. Existing sessions must sign in again after this update. The existing single-session-per-account behavior is retained: a new sign-in replaces the previous session.
- **Refresh rotation had a race window.** A conditional atomic update consumes the current token hash. Only one concurrent refresh succeeds, and an old session cannot be recreated after logout. Logout can revoke its own session even when another tab has rotated its cookie.
- **Request limits were instance-local and expensive search was unprotected.** MongoDB-backed counters now share limits across instances. Discovery concurrency and both repository-cache branches are bounded. IPv6 clients are grouped by prefix and raw IPs are not retained. Provider-level GitHub quotas still apply.
- **Sensitive responses could be cached.** API responses are `no-store` and `noindex`; production account routes also receive these headers. Password hashes and session fields are excluded from ordinary Mongoose projections.
- **Input and browser defenses needed tightening.** Login passwords and email addresses are length-bounded, oversized JSON returns 413, unsafe cross-site requests are rejected, and OAuth return paths reject encoded slash/backslash/newline sequences. Production origins must use HTTPS.
- **Frontend deployment lacked security headers.** Vercel now adds a CSP, clickjacking protection, nosniff, no-referrer, HSTS, and camera/microphone/location restrictions. The CSP allows inline styles for existing components, but not inline scripts. These headers require the supplied hosting configuration; the Vite development server is not a production server.
- Environment variants and Vercel local configuration are ignored by Git. Only example environment files are tracked.

## Existing protections checked

Contribution mutations include the authenticated user's ID. MongoDB filters use explicit fields and escaped literal search text. Markdown disallows raw HTML and uses the renderer's safe URL handling. OAuth uses one-time browser-bound state, PKCE, verified provider email, and validated Google ID tokens. Accounts sharing an email are not silently linked. Provider tokens and secrets are not returned to the browser. Refresh cookies are HttpOnly, SameSite Strict, and Secure in production.

## Validation and deployment responsibilities

Regression coverage includes ownership, rejected legacy/malformed JWT claims, refresh replay, simultaneous rotation, post-logout access rejection, cookie-based logout after rotation, cross-origin writes, oversized bodies, and rate-limit enforcement. Existing OAuth callback/state replay tests remain in the suite.

Root and server `npm audit` reported zero known advisories on this date. The client uses the root lockfile and root build workflow; its optional standalone install has no separate lockfile and was not independently audited.

Before launch, verify the real HTTPS domain, OAuth callbacks, CSP, routing/status codes, database indexes/backups, and hosting firewall settings. Keep dependencies updated and production secrets server-side. This review does not configure email verification/password reset, multi-device sessions, infrastructure monitoring, or distributed denial-of-service protection. See `VERCEL_DEPLOYMENT.md` for the deployment checks.
