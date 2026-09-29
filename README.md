# Contribution-Finder

A MERN application for finding real open GitHub issues and tracking contributions from saved to merged. The homepage is the search tool: a GitHub-inspired light and dark interface with language and label filters, compact issue rows, and direct links to work on GitHub. No testimonials, marketing sections, or invented activity statistics.

## Quick demo

Requires Node.js 22.12+ (24 recommended).

```sh
# Repository root: install frontend tools
npm install
# Install API dependencies without the redundant default MongoDB download
npm install --prefix server --ignore-scripts
# Terminal 1: starts real MongoDB locally, seeds it, and serves the API
npm run demo --prefix server
# Terminal 2: starts the React client
npm run dev
```

Open http://localhost:5173. Create an account to bookmark issues, edit your profile, and track contributions. No demo password is hard-coded. The MongoDB runner downloads its binary on first use; subsequent runs use the cached binary and persisted `.demo-db` data.

For an existing MongoDB installation or Atlas, follow [server setup](server/README.md), set `server/.env`, run `npm run seed --prefix server`, then `npm run dev --prefix server`. See [client setup](client/README.md) for separate frontend hosting.

## Structure

```text
client/src/
  components/    reusable controls, layout, issue cards, error boundary
  pages/         home, browse, auth, details, dashboard, profile
  context/       authentication and bookmark state
  hooks/         API loading/error lifecycle
  services/      fetch wrapper and token refresh
server/api/
  models/        User, Issue, Contribution
  controllers/   authentication, profile, discovery, bookmarks
  middleware/    JWT verification
  routes/        REST endpoints and auth rate limiting
  services/      token issuance and serialization
  seed.ts        idempotent sample data
  demo.ts        local MongoDB development runner
```

The original root `src/` and `server/src/` are retained to preserve pre-existing work. Root development/build scripts now target `client/`; server start scripts target `server/api/`.

## Validation

```sh
npm run build
npm run typecheck
npm run lint:app
npm run test:api --prefix server
```

## New discovery features

- Google and GitHub authorization-code sign-in. Register your provider apps using [OAuth setup](server/OAUTH_SETUP.md); provider buttons remain disabled until credentials are configured. Email/password accounts work immediately.
- Select up to eight languages together, including custom language names. Matches use GitHub language qualifiers; languages must be recognized by GitHub Linguist. Use the separate technology/framework field for tools such as React or Ethereum.
- Web, Web3, Android/mobile, and AI categories search repository topics and then their live issues. To keep GitHub queries bounded, each category/technology search selects up to six popular, non-archived repositories with open issues; this scope is displayed above results. It is not an exhaustive category index. Selected languages also filter repository selection.
- GSoC search, technology filtering, organization details, official links, selected repositories, and issue discovery for eight curated 2026 organizations. The official directory link provides the complete program list. Django’s separate issue tracker is linked directly.
- A persisted theme toggle and profile avatars. Active frontend and backend application code is now strict TypeScript/TSX.

## Included

- JWT access tokens in memory, rotating hashed refresh tokens in HttpOnly cookies, bcrypt password hashing, validation, rate limiting, origin checks, and private contribution ownership.
- Live GitHub search by topic or owner/repository, language and issue label filters, optional unassigned-only results, sorting by updated/created/comments, and pagination.
- Bookmarks, contribution status tracking, and profile tech stack/interests.
- Loading, error, retry, and empty states; accessible form labels and focus states; mobile navigation and reduced motion support.
- All requested core pages and seed/configuration files.

The main page calls `/api/discover` for real GitHub issues; it never substitutes sample results when GitHub fails. Results are cached for one minute and stored in MongoDB so details and bookmarks remain available. Status reflects the last search, not a continuous sync. GitHub exposes at most the first 1,000 matches; use filters for broad searches. An optional `GITHUB_TOKEN` in `server/.env` increases GitHub's search limit. Keep it server-side.

The seed script and `/api/issues` retain the earlier demo data for development, separate from the live discovery feed. Maintainer publishing and email alerts are not included. Profile interests are stored; automated matching is not implemented.

For deployment, configure strong secrets and a managed MongoDB database, serve the frontend and API under the same site using HTTPS, and configure SPA fallback routing. Do not use the development database runner in production.
