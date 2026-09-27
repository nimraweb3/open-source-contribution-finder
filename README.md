# Contribution-Finder

A MERN application for finding open-source opportunities and tracking contributions from saved to merged. A near-black and lime interface with oversized typography, an illustrated contribution flow, animated marquees, scroll reveals, a progress counter, and responsive navigation.

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
  seed.js        idempotent sample data
  demo.js        local MongoDB development runner
```

The original root `src/` and `server/src/` are retained to preserve pre-existing work. Root development/build scripts now target `client/`; server start scripts target `server/api/`.

## Validation

```sh
npm run build
npm run lint:app
npm run test:api --prefix server
```

## Included

- JWT access tokens in memory, rotating hashed refresh tokens in HttpOnly cookies, bcrypt password hashing, validation, rate limiting, origin checks, and private contribution ownership.
- Search by topic/repository, filter by language/label/difficulty, sort by stars/recent updates/difficulty, and paginate results.
- Bookmarks, contribution status tracking, and profile tech stack/interests.
- Loading, error, retry, and empty states; accessible form labels and focus states; mobile navigation and reduced motion support.
- All requested core pages and seed/configuration files.

Seed listings are **illustrative, not live GitHub issues**. Repository links take you to current GitHub issues. Contributor stories are labeled illustrative. Live GitHub synchronization, maintainer publishing, and email alerts are not included. Profile interests are stored for user preferences; automated matching is not implemented.

For deployment, configure strong secrets and a managed MongoDB database, serve the frontend and API under the same site using HTTPS, and configure SPA fallback routing. Do not use the development database runner in production.
