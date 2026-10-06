# Contribution Finder

Find an open source issue you can actually start working on.

**[Open the live app](https://open-source-contribution-finder.vercel.app/)**

Contribution Finder searches public GitHub issues by language, label, and area of interest. Read the context, follow the repository link, and start contributing. Sign in to keep a shortlist and track your work from **saved → in progress → submitted → merged**.

**[Local setup](#run-it-locally)** · **[Usage](#using-the-app)** · **[Demo walkthrough](docs/DEMO.md)** · **[Deployment](VERCEL_DEPLOYMENT.md)**

## What you can do

- Search keywords or `owner/repository` without creating an account.
- Select several programming languages, including custom names. Search frameworks and tools separately.
- Filter for good first issues, help wanted, bugs, documentation, or enhancements. Hide assigned issues and sort by activity, creation date, or discussion count.
- Explore web, Web3, mobile, and AI projects.
- Browse a curated GSoC 2026 directory with contributor guides, repositories, and issue links.
- Sign in with Google, GitHub, or email/password. Save issues, update their status, and keep your preferred technologies on your profile.
- Switch between light and dark mode. Share a filtered search through its URL.

## Demo

The [two-minute walkthrough](docs/DEMO.md) covers search, filters, issue details, saved work, and GSoC organizations. It includes recording instructions and a place to add the finished video.

## Run it locally

Use **Node.js 24** and npm. The development runner starts a real MongoDB process, so you do not need an Atlas account to try the project.

```sh
git clone https://github.com/nimraweb3/open-source-contribution-finder.git
cd open-source-contribution-finder
npm ci
npm ci --prefix server --ignore-scripts
```

Start the API in one terminal:

```sh
npm run demo --prefix server
```

Start the frontend in another:

```sh
npm run dev
```

Open **http://localhost:5173**. The API runs on port **5000**, and Vite forwards `/api` requests to it.

The first API startup downloads a MongoDB binary and can take a few minutes. Later runs reuse it. Local data lives in the ignored `server/.demo-db/` directory. The runner inserts nine sample listings without replacing existing data; the main search page still uses live GitHub results.

Email/password signup works locally without OAuth configuration. Google and GitHub buttons become available when their credentials are configured. There is no shared demo account or default password.

### Use an existing MongoDB database

Copy `server/.env.example` to `server/.env` and configure `MONGODB_URI`, `JWT_SECRET`, and `JWT_REFRESH_SECRET`. Use different random secrets. Preserve existing environment files if you have already configured the app.

```sh
npm run dev --prefix server
```

Use `npm run seed --prefix server` only if you want sample listings. The demo command always starts its own database; use the normal development command for Atlas. See the [API README](server/README.md) for details.

## Configuration

Server settings go in `server/.env`; frontend settings go in `client/.env`. Both files stay out of Git.

| Setting                                    | Used by      | Purpose                                                |
| ------------------------------------------ | ------------ | ------------------------------------------------------ |
| `MONGODB_URI`                              | Server       | Persistent database connection                         |
| `JWT_SECRET`, `JWT_REFRESH_SECRET`         | Server       | Separate access/refresh signing secrets                |
| `CLIENT_URL`                               | Server       | Frontend origin; locally `http://localhost:5173`       |
| `API_URL`                                  | Server       | OAuth callback origin; locally `http://localhost:5000` |
| `PORT`                                     | Server       | Local API port; defaults to `5000`                     |
| `GITHUB_TOKEN`                             | Server       | Optional token for higher GitHub search limits         |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Server       | Google sign-in credentials                             |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | Server       | GitHub sign-in credentials                             |
| `VITE_API_URL`                             | Client       | API base path; use `/api` on Vercel                    |
| `VITE_SITE_URL`                            | Client/build | Final HTTPS origin for canonicals and sitemap          |
| `VITE_NOINDEX`                             | Client/build | `true` for staging; `false` for production             |

Anything prefixed with `VITE_` is public. Never use it for a secret or database connection string.

Follow [Google and GitHub setup](server/OAUTH_SETUP.md) for provider registration and local callback URLs. Production callbacks must use the deployed domain.

## Using the app

1. **Find a starting point.** Search a topic such as `accessibility` or a repository such as `facebook/react`. Select languages you can read comfortably. Multiple languages match alternatives, rather than requiring every selected language.
2. **Narrow the work.** Try *Good first issue* and *Only unassigned issues*. Use the technology field for a framework such as React or a topic such as Ethereum.
3. **Read before claiming.** Open the issue details, then follow the GitHub link. Check the discussion, linked pull requests, and contribution guidelines.
4. **Keep a shortlist.** Sign in and save an issue. Open *My contributions* to change its status or remove it. Status updates are manual; marking an issue merged does not check GitHub or submit a pull request.
5. **Explore a community.** On the GSoC page, search by organization or technology, read the contributor guide, and explore repositories. Check the official program page for current requirements and dates.

Filters are stored in the URL, so you can bookmark a search or share it.

## How it works

The React client calls the Express API. The API searches GitHub, caches results briefly, and stores issue snapshots in MongoDB so saved issues have stable detail pages. Users and contribution status are stored separately from those snapshots.

OAuth uses authorization codes and PKCE. Access tokens stay in browser memory; refresh tokens use an HttpOnly cookie. The API stores a refresh-token hash and checks the active session on protected requests. Logout invalidates the session immediately. A new sign-in replaces the previous session for that account.

| Layer            | Tools                                                |
| ---------------- | ---------------------------------------------------- |
| Interface        | React, TypeScript, Vite, React Router, Tailwind CSS  |
| State and motion | React Context, Framer Motion                         |
| API              | Node.js, Express, TypeScript                         |
| Database         | MongoDB, Mongoose                                    |
| Authentication   | JWT, bcrypt, Google OpenID Connect, GitHub OAuth     |
| Hosting          | Vercel frontend and API function; persistent MongoDB |

## Project structure

```text
api/
  index.ts                  Vercel entry point for Express
client/
  src/
    components/             Shared controls, navigation, issue cards, SEO
    context/                Authentication, bookmarks, theme
    hooks/                  API request lifecycle
    pages/                  Search, details, dashboard, profile, GSoC
    services/               API client and session restoration
    entry-server.tsx        Public-page rendering for production
    styles.css              Theme tokens and application styles
  .env.example
  vite.config.js
server/
  api/
    controllers/            Auth, OAuth, issues, contributions
    middleware/             Session checks and shared rate limits
    models/                 Users, issues, contributions, OAuth transactions
    routes/                 REST endpoints
    services/               Discovery, tokens, database, GSoC catalog
    app.ts                  Express middleware and routing
    server.ts               Standalone API startup
    demo.ts                 Local MongoDB runner
    seed.ts                 Sample listings
    integration.test.ts     API and security regression coverage
  .env.example
scripts/
  prerender.ts              Public HTML, metadata, sitemap, robots
docs/
  DEMO.md                   Walkthrough and recording instructions
vercel.json                 Build, API routing, security headers
```

The active application is in `client/src` and `server/api`. The older root `src/` and `server/src/` directories are retained from the initial implementation and are not used by the current build.

## Commands

Run these from the repository root:

| Command                            | What it does                                    |
| ---------------------------------- | ----------------------------------------------- |
| `npm run dev`                      | Start the frontend                              |
| `npm run demo --prefix server`     | Start a local database and API                  |
| `npm run dev --prefix server`      | Start the API using `server/.env`               |
| `npm run typecheck`                | Check client and server TypeScript              |
| `npm run lint:app`                 | Lint active application code                    |
| `npm run test:api --prefix server` | Run tests with an isolated MongoDB              |
| `npm run build`                    | Build and pre-render the frontend               |
| `npm run build --prefix server`    | Compile the standalone API                      |
| `npm start --prefix server`        | Run the compiled API                            |
| `npm run preview`                  | Preview the frontend build; API runs separately |

## Deploy on Vercel

Import this GitHub repository with the **repository root** as the Vercel Root Directory. The checked-in configuration builds the frontend and exposes the API under `/api` on the same domain. Keep the GitHub connection enabled so pushes to the production branch create new deployments.

Use the live link above for the current production app. Vercel also creates a unique URL for each deployment; an old deployment URL continues to show that older version.

You need a persistent MongoDB database, production environment variables, and provider callbacks registered for the final domain. The local database is not uploaded to Vercel.

Follow the [deployment guide](VERCEL_DEPLOYMENT.md) for environment variables, callback addresses, and verification. Public pages are pre-rendered; account pages are noindex. Local and preview builds are excluded from search indexing.

## Limits worth knowing

- GitHub exposes the first 1,000 matches and applies rate limits. Narrow broad queries rather than paging indefinitely.
- Category and technology searches select up to six matching popular repositories. The results explain that scope; they are not an exhaustive topic index.
- Issue state reflects the most recent search. Check GitHub before starting work.
- Language names must be recognized by GitHub. Use the technology field for frameworks or concepts.
- The GSoC catalog contains eight selected 2026 organizations, not a live copy of the full directory.
- Different sign-in methods are not automatically linked by email. Use the original method if an address is already registered.
- Email verification, password reset, automatic merge tracking, maintainer publishing, and email alerts are not implemented.

## Troubleshooting

| Problem                                  | Check                                                                                                                |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| First API startup takes a while          | MongoDB may still be downloading. Keep the terminal open for its status.                                             |
| Search reports a GitHub limit            | Wait, narrow the query, or configure a server-side GitHub token.                                                     |
| Provider sign-in is unavailable          | Set both credentials and restart the API. Check `/api/auth/providers`.                                               |
| OAuth returns an error                   | Compare the callback with `API_URL`; check whether the email uses another sign-in method.                            |
| Saved issues will not load               | Check the API and database connection, then use Retry.                                                               |
| Production reports a configuration error | Check the database URI, distinct signing secrets, and exact HTTPS origins.                                           |
| The site is missing from search          | Set `VITE_SITE_URL`, redeploy, and check robots/sitemap and Search Console. Indexing is not immediate or guaranteed. |

## Contributing

Open an issue before a large refactor. For a small fix, keep the pull request focused, explain how to reproduce the problem, and list the checks you ran. Start with `npm run typecheck`, `npm run lint:app`, and the relevant tests.

Do not include environment files, tokens, database exports, or real user information in issues or pull requests. The [security review](SECURITY_REVIEW.md) describes the current protections and review scope. Report suspected security problems privately rather than posting working credentials or exploit details.
