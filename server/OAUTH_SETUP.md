# Enable Google and GitHub sign-in

The app includes real authorization-code flows. Provider buttons become available automatically when both credentials for that provider are set. No credentials are shipped in this repository and no provider identity is simulated.

OAuth registrations must be created in accounts you control. This is the only external setup the application cannot supply for you.

## Local configuration

Copy `server/.env.example` to `server/.env` if it does not exist. Preserve any existing values. Set:

```dotenv
CLIENT_URL=http://localhost:5173
API_URL=http://localhost:5000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

### Google

1. Open [Google Cloud Console](https://console.cloud.google.com/), select/create your project, and open Google Auth Platform.
2. Configure Branding and Audience. For a personal development project, choose an external audience and add your Google account as a test user while the app is in testing.
3. Create an OAuth client of type **Web application**.
4. Set the authorized redirect URI to **`http://localhost:5000/api/auth/oauth/google/callback`**. The server handles authorization; there is no browser client secret.
5. Copy the client ID and secret into the corresponding `server/.env` variables. Never put the secret in a `VITE_` variable or commit it.

See [Google's OpenID Connect documentation](https://developers.google.com/identity/openid-connect/openid-connect).

### GitHub

1. Open [GitHub OAuth Apps](https://github.com/settings/developers) and choose **New OAuth App**.
2. Set the application name to Contribution Finder and homepage URL to **`http://localhost:5173`**.
3. Set the authorization callback URL to **`http://localhost:5000/api/auth/oauth/github/callback`**.
4. Register the application, generate a client secret, and put the client ID and secret in `server/.env`.

See [GitHub's OAuth web flow documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps).

Restart the API and reload the login page. Use **Continue with Google** or **Continue with GitHub** for both registration and subsequent sign-in. Test logout, reload, and sign-in again with each real provider before deploying.

## Session and account behavior

- Authorization code + PKCE, one-time database-backed state bound to an HttpOnly browser cookie, ten-minute expiry, and Google ID-token signature/audience/issuer/nonce verification.
- GitHub requests only `read:user` and `user:email`; it uses a verified email address. Provider access tokens are discarded after identity lookup.
- App access tokens remain in memory. Rotating refresh tokens are stored as hashes in MongoDB and delivered in HttpOnly cookies. Tokens never appear in callback URLs.
- Existing accounts are not silently linked by email. If an email already belongs to another sign-in method, use that original method. Account linking is not implemented.
- One refresh session per account; another login replaces it. Access tokens expire after 15 minutes, refresh sessions after seven days. Logout revokes both access and refresh authorization immediately.
- Production requires HTTPS, matching provider callback registrations, strong distinct JWT secrets, and same-site client/API hosting (prefer a reverse proxy). Set `NODE_ENV=production`, `CLIENT_URL`, and `API_URL` to your real origins. Google may require verification for public availability depending on its current policies.

Automated tests validate the GitHub callback flow using isolated provider responses, state binding/replay rejection, and cookie session creation. They do not replace a real provider round trip with your registered credentials.
