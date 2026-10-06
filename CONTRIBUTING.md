# Contributing

Small fixes, clearer documentation, and reproducible bug reports are welcome. Open an issue before a larger change so we can agree on its scope.

## Local setup

Use Node.js 24. Fork and clone the repository, then run from its root:

```sh
npm ci
npm ci --prefix server --ignore-scripts
git switch -c fix/describe-your-change
```

Start `npm run demo --prefix server` in one terminal and `npm run dev` in another. Open http://localhost:5173. The demo runner downloads MongoDB on first use. Explore uses real GitHub data; sample listings are separate.

Google/GitHub login requires your own OAuth applications. Local email/password signup is available for ordinary development. See [OAuth setup](server/OAUTH_SETUP.md) and [configuration](README.md#configuration). Do not use production credentials or commit environment files.

## Code style

- Frontend: `client/src`. Backend: `server/api`. Vercel entry: `api/index.ts`.
- Use TypeScript/TSX and reuse shared components, services, and request hooks.
- Include loading, error, and empty states for API interactions.
- Check both themes, keyboard navigation, and narrow screens.
- Follow nearby formatting and format only files you change.
- Add meaningful regression coverage when fixing behavior. Avoid unrelated refactors in a bug fix.

## Checks and pull requests

Run from the repository root:

```sh
npm run typecheck
npm run lint:app
npm run test:api --prefix server
npm run build
npm run build --prefix server
```

API tests use an isolated MongoDB database and controlled GitHub responses, without production secrets. The first run may download MongoDB. OAuth changes also need a real browser check of the provider round trip.

Describe the problem, the resulting behavior, and your testing in the PR. Link the issue if there is one. Include screenshots for visible changes, with personal information removed. CI runs these checks on PRs and pushes to `main`.

## Bug reports

Include the page, reproduction steps, expected and actual results, and browser. For search bugs, include the filter URL and time of failure. Remove credentials, cookies, and personal information from logs and screenshots.

Do not post exploitable security details in public. Use private vulnerability reporting if available. Otherwise ask the maintainer for a private contact channel without disclosing the vulnerability. See [the security review](SECURITY_REVIEW.md) for current coverage.

## License

Contributions are made under the project's [MIT license](LICENSE).
