# Contribution-Finder client

React + Vite, React Router, Tailwind CSS, Framer Motion, and React Context.

From this directory:

```sh
npm install
npm run dev
```

The development server runs on http://localhost:5173 and proxies `/api` to port 5000. For a separately hosted API, copy `.env.example` to `.env` and set `VITE_API_URL`. Values are public and compiled into the bundle; never add secrets here.

```sh
npm run build
npm run preview
```

The build is written to the repository's `dist/`. Configure your host to serve `index.html` for client routes. The API and client should use the same site in production for the strict refresh cookie. External font loading falls back to system sans-serif if unavailable.

Pages: home, browse, issue detail, login, signup, protected dashboard, protected profile, and 404. Search and filters are encoded in the URL. Access tokens stay in memory; refresh tokens are HttpOnly cookies. Motion respects the system reduced-motion preference.
