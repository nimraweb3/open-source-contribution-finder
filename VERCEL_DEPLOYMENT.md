# Public Google and GitHub sign-in on Vercel

The authentication flow creates a separate application account for each new verified provider identity. Visitors use their own Google or GitHub accounts. They never need your client secret or developer account.

## Deploy the project

1. Import this repository into Vercel. Keep the **repository root** as Root Directory. `vercel.json` builds the Vite client and exposes Express at `/api/*` on the same domain. Use Node.js 24.
2. Create a persistent MongoDB database (for example MongoDB Atlas), a database user with access to this application's database, and network access appropriate for your Vercel deployment. The local `.demo-db` is not deployed.
3. Set the environment variables below in Vercel's **Production** environment. Do not upload `server/.env`; configure values through Vercel's environment settings.
4. Deploy, then register the exact production callbacks below with both providers. Redeploy after adding/changing environment values.

| Variable | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Your persistent database connection string |
| `JWT_SECRET` | A random secret, at least 32 characters |
| `JWT_REFRESH_SECRET` | A different random secret, at least 32 characters |
| `CLIENT_URL` | `https://YOUR-SITE.vercel.app` (no trailing slash) |
| `API_URL` | The same production origin as `CLIENT_URL` |
| `VITE_API_URL` | `/api` |
| `VITE_SITE_URL` | The public HTTPS origin, matching `CLIENT_URL`; used for canonicals and sitemap |
| `VITE_NOINDEX` | `false` for production; `true` for staging |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | Production GitHub OAuth app credentials |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Production Google web OAuth client credentials |
| `GITHUB_TOKEN` | Optional server-side token for higher search limits |

Generate each JWT secret independently with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. Never use `VITE_` prefixes for secrets.

## GitHub

Register a production OAuth app at <https://github.com/settings/developers>:

- Homepage: `https://YOUR-SITE.vercel.app`
- Callback: `https://YOUR-SITE.vercel.app/api/auth/oauth/github/callback`
- Keep wildcard matching and device flow disabled.

Keep the existing localhost registration for development. The public application is not restricted to the owner; each visitor authorizes access to their own read-only profile and email. See [GitHub OAuth documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps).

## Google

Create a production **Web application** OAuth client in Google Cloud / Google Auth Platform. Select an **External** audience for users outside your own organization. Configure branding, support contact, and required public application/domain information.

- Redirect URI: `https://YOUR-SITE.vercel.app/api/auth/oauth/google/callback`
- Scopes: `openid`, `email`, `profile` only.
- Prepare the consent configuration for production and complete any verification Google requires. Do not leave production clients configured with localhost-only redirect URLs.

Basic identity-only scopes have different testing restrictions from sensitive API scopes; follow the console's actual requirements. Google Workspace administrators can still restrict apps for their organization's users. See [Google app states](https://developers.google.com/identity/protocols/oauth2/production-readiness/overview) and [production policy](https://developers.google.com/identity/protocols/oauth2/production-readiness/policy-compliance).

## Verify before sharing

- `/api/health` responds successfully and `/api/auth/providers` reports both providers enabled.
- Sign up with an account that does not own either OAuth application.
- Check the profile/avatar, save an issue, reload, and confirm the session and saved item remain.
- Log out and sign back in. Confirm callbacks return to the production domain, not localhost.
- The current account policy does not automatically link Google/GitHub/email accounts that share an email. Existing users must use their original sign-in method.

Vercel preview deployments have different URLs: do not share production OAuth credentials with arbitrary previews. Test OAuth on the stable production domain, or configure a separate staging domain and separate provider apps.

Connection pools and search caches are reused within a warm function. Rate limits are stored in MongoDB and shared across instances: 240 API requests/minute, 20 discovery requests/minute, 30 sign-in/OAuth attempts/15 minutes, and 60 refreshes/minute per IP prefix. MongoDB TTL indexes expire counters. Keep automatic index creation enabled or create the declared indexes before deployment. Rate limiting fails closed if its database is unavailable. Use hosting firewall controls for volumetric attacks; application limits do not replace them.

The supplied Vercel CSP assumes same-origin `/api` hosting. If you host the API elsewhere, configure its exact HTTPS origin in `connect-src` and review cookie/origin settings. Do not broaden the policy to allow arbitrary origins. Standalone Express does not trust forwarded IP headers; only the Vercel adapter enables one trusted proxy hop.

## Search indexing after deployment

The root build pre-renders the browse pages, contribution guide, GSoC directory, and organization pages. Public HTML has titles, descriptions, social metadata, and canonical links before JavaScript runs. `/browse` canonicalizes to `/` because they show the same search tool. Issue details and account pages are excluded from indexing; unknown routes return HTTP 404 on Vercel.

Production builds require `VITE_SITE_URL`. Without it, local builds are deliberately noindex and their robots file disallows crawling. Vercel previews are noindex even when a production URL is configured. Do not put localhost or a preview hostname in the production setting.

After publishing, verify `/robots.txt`, `/sitemap.xml`, and the HTML source on the real domain. Register that domain in Google Search Console, submit `/sitemap.xml`, and inspect the homepage and guide. Check HTTPS redirects and the HTTP 404 status for an unknown route. Search-engine indexing and ranking are not guaranteed; maintain accurate, useful content and obtain relevant links naturally. See [Google's JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).

This setup is prepared in code. A successful local build does not prove the hosted deployment or provider configuration works; complete the production checks above after deployment.
