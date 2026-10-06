# Contribution-Finder API

Node.js 22.12+ (24 recommended), Express 5, MongoDB, Mongoose, bcrypt, and JWT.

## Local demo

```sh
npm install --ignore-scripts
npm run demo
```

The demo runner downloads an official MongoDB 7.0.14 binary on first use, starts it locally, seeds nine clearly labeled sample opportunities, and starts the API on port 5000. The first download is large on Windows. Application data persists in `.demo-db/`; development auth secrets are stored in the ignored `.demo-db/session-secrets.json`, so sessions survive API restarts. Explicit secrets in `.env` take precedence. This runner is development only.

## Normal database setup

Copy `.env.example` to `.env`, provide your MongoDB URI, and set **different random secrets** for access and refresh tokens. Generate each with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.

```sh
npm install
npm run seed
npm run dev
```

`npm run build` compiles strict TypeScript into `dist-api/`; `npm start` runs that build. `NODE_ENV=production` makes the refresh cookie secure; deploy behind HTTPS. `CLIENT_URL` must be the exact frontend origin. Use same-site frontend/API hosting, or a reverse proxy. The server fails fast if required environment variables are absent. Seed inserts only missing sample listings and preserves existing data.

## OAuth

Follow [OAUTH_SETUP.md](OAUTH_SETUP.md) to register Google and GitHub apps and configure callback URLs. Both providers use the same button for first-time signup and returning sign-in. Credentials are server-only.

## API

`GET /api/discover` searches real public open GitHub issues. Parameters: `q` (keywords or `owner/repository`), `languages` (comma-separated OR selection, up to eight), legacy `language`, `technology` (repository keyword), `category` (`web`, `web3`, `mobile`, `ai`), `organization` (GSoC catalog ID), `label`, `unassigned=true`, `sort` (`updated`, `created`, `comments`), and `page`. Responses contain `issues`, `total`, `pages`, `page`, `incomplete`, and `fetchedAt`. Pages contain up to 20 issues, with GitHub's 1,000-result cap. Results are cached for 60 seconds and persisted for bookmarks and details. Set an optional server-side `GITHUB_TOKEN` for higher rate limits. No demo fallback is used on network/rate-limit errors. The older `/api/issues` endpoint below serves the local development dataset.

| Method      | Path                                 | Purpose                                                  |
| ----------- | ------------------------------------ | -------------------------------------------------------- |
| GET         | `/api/auth/providers`                | Provider configuration availability                      |
| GET         | `/api/auth/oauth/:provider`          | Start Google/GitHub authorization                        |
| GET         | `/api/auth/oauth/:provider/callback` | Verify authorization and set session cookie              |
| GET         | `/api/gsoc`                          | Curated 2026 organizations; `q` and `technology` filters |
| GET         | `/api/gsoc/:id`                      | Organization, repository and contributor links           |
| POST        | `/api/auth/signup`                   | Register and start a session                             |
| POST        | `/api/auth/login`                    | Start a session                                          |
| POST        | `/api/auth/refresh`                  | Rotate the refresh cookie and issue an access token      |
| POST        | `/api/auth/logout`                   | Revoke the refresh session                               |
| GET / PATCH | `/api/profile`                       | Read/update the authenticated user's profile             |
| GET         | `/api/issues`                        | Search/filter/sort paginated listings                    |
| GET         | `/api/issues/:id`                    | Read a listing                                           |
| GET         | `/api/contributions`                 | Read the authenticated user's contributions              |
| POST        | `/api/contributions/:id`             | Bookmark without resetting existing progress             |
| PUT         | `/api/contributions/:id`             | Update contribution status                               |
| DELETE      | `/api/contributions/:id`             | Remove the user's bookmark                               |

Issue query parameters: `q`, `language`, `label`, `difficulty`, `sort` (`stars`, `difficulty`, or default recent updates), `page`. Results contain `issues`, `total`, and `page`; pages contain up to 12 listings. Status values: `saved`, `in progress`, `submitted`, `merged`.

Protected endpoints require `Authorization: Bearer <accessToken>`. Access tokens expire after 15 minutes; refresh tokens after seven days. One refresh session is stored per account; signing in elsewhere replaces it. Logout revokes both access and refresh authorization immediately.

Category and technology searches select up to six popular non-archived repositories with open issues, cached for ten minutes, then search their issues. Language filters apply to both stages; multiple languages are alternatives. The API returns a `scopeNote` explaining the limited repository selection. GSoC metadata is a curated catalog verified against the official 2026 program, not a live full-directory mirror.

## Tests

```sh
npm run test:api
```

Integration tests start an isolated MongoDB and verify registration validation, duplicate email handling, login, token rotation/replay rejection, logout, query escaping, filters, protected endpoints, per-user ownership, profile updates, and contribution status persistence.

The application lives in `api/`. Run `npm test` or `npm run test:api` for its integration suite.
