# Contribution-Finder API

Node.js 22.12+ (24 recommended), Express 5, MongoDB, Mongoose, bcrypt, and JWT.

## Local demo

```sh
npm install --ignore-scripts
npm run demo
```

The demo runner downloads an official MongoDB 7.0.14 binary on first use, starts it locally, seeds nine clearly labeled sample opportunities, and starts the API on port 5000. The first download is large on Windows. Application data persists in `.demo-db/`; auth secrets are regenerated on restart, so sign in again after restarting. This runner is development only.

## Normal database setup

Copy `.env.example` to `.env`, provide your MongoDB URI, and set **different random secrets** for access and refresh tokens. Generate each with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.

```sh
npm install
npm run seed
npm run dev
```

`npm start` runs the normal server. `NODE_ENV=production` makes the refresh cookie secure; deploy behind HTTPS. `CLIENT_URL` must be the exact frontend origin. Use same-site frontend/API hosting, or a reverse proxy. The server fails fast if required environment variables are absent. Seed inserts only missing sample listings and preserves existing data.

## API

| Method      | Path                     | Purpose                                             |
| ----------- | ------------------------ | --------------------------------------------------- |
| POST        | `/api/auth/signup`       | Register and start a session                        |
| POST        | `/api/auth/login`        | Start a session                                     |
| POST        | `/api/auth/refresh`      | Rotate the refresh cookie and issue an access token |
| POST        | `/api/auth/logout`       | Revoke the refresh session                          |
| GET / PATCH | `/api/profile`           | Read/update the authenticated user's profile        |
| GET         | `/api/issues`            | Search/filter/sort paginated listings               |
| GET         | `/api/issues/:id`        | Read a listing                                      |
| GET         | `/api/contributions`     | Read the authenticated user's contributions         |
| POST        | `/api/contributions/:id` | Bookmark without resetting existing progress        |
| PUT         | `/api/contributions/:id` | Update contribution status                          |
| DELETE      | `/api/contributions/:id` | Remove the user's bookmark                          |

Issue query parameters: `q`, `language`, `label`, `difficulty`, `sort` (`stars`, `difficulty`, or default recent updates), `page`. Results contain `issues`, `total`, and `page`; pages contain up to 12 listings. Status values: `saved`, `in progress`, `submitted`, `merged`.

Protected endpoints require `Authorization: Bearer <accessToken>`. Access tokens expire after 15 minutes; refresh tokens after seven days. One refresh session is stored per account; signing in elsewhere replaces it. Logout revokes refresh capability; an already-issued access token remains valid until its short expiry.

## Tests

```sh
npm run test:api
```

Integration tests start an isolated MongoDB and verify registration validation, duplicate email handling, login, token rotation/replay rejection, logout, query escaping, filters, protected endpoints, per-user ownership, profile updates, and contribution status persistence.

The pre-existing TypeScript API is preserved in `src/`; run `npm run dev:legacy` if needed. The new application uses `api/` and does not depend on the legacy code.
