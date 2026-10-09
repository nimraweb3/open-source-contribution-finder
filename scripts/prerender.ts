import { createServer, loadEnv } from "vite";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";

const environment = {
  ...loadEnv("production", resolve("client"), "VITE_"),
  ...process.env,
};
const site = environment.VITE_SITE_URL?.replace(/\/$/, "") || "";
if (site) {
  const url = new URL(site);
  if (
    url.protocol !== "https:" ||
    url.origin !== site ||/
    
    url.username ||
    url.password
  )
    throw new Error(
      "VITE_SITE_URL must be a public HTTPS origin without a path.",
    );
}
if (process.env.VERCEL_ENV === "production" && !site)
  throw new Error(
    "Set VITE_SITE_URL to the production HTTPS origin before deploying.",
  );
const indexable =
  Boolean(site) &&
  environment.VITE_NOINDEX !== "true" &&
  (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production");
const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const template = await readFile("dist/index.html", "utf8");
const server = await createServer({
  root: resolve("client"),
  configFile: resolve("client/vite.config.js"),
  mode: "production",
  server: { middlewareMode: true },
  appType: "custom",
});
try {
  const { render, metadata, publicPaths } = await server.ssrLoadModule(
    "/src/entry-server.tsx",
  );
  const makeHtml = (path: string, body: string) => {
    const meta = metadata(path);
    const canonical = site && meta.indexable ? site + meta.canonicalPath : "";
    const head = `<title>${escape(meta.title)}</title>
<meta name="description" content="${escape(meta.description)}" />
<meta name="robots" content="${indexable && meta.indexable ? "index, follow" : "noindex, follow"}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Contribution Finder" />
<meta property="og:title" content="${escape(meta.title)}" />
<meta property="og:description" content="${escape(meta.description)}" />
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content="${escape(meta.title)}" />
<meta name="twitter:description" content="${escape(meta.description)}" />
${canonical ? `<link rel="canonical" href="${escape(canonical)}" /><meta property="og:url" content="${escape(canonical)}" />` : ""}`;
    return template
      .replace(/<title>[\s\S]*?<\/title>/, "")
      .replace(/<meta\s+name="description"[\s\S]*?\/>/, "")
      .replace("</head>", `${head}</head>`)
      .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
  };
  for (const path of [...publicPaths, "/login", "/signup", "/404"]) {
    const file = resolve(
      "dist",
      path === "/"
        ? "index.html"
        : path === "/404"
          ? "404.html"
          : `${path.slice(1)}/index.html`,
    );
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, makeHtml(path, render(path)));
  }
  await writeFile("dist/app.html", makeHtml("/private", ""));
  const paths: string[] = publicPaths.filter(
    (path: string) => path !== "/browse",
  );
  await writeFile(
    "dist/sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${indexable ? paths.map((path) => `<url><loc>${escape(site + path)}</loc></url>`).join("") : ""}</urlset>`,
  );
  await writeFile(
    "dist/robots.txt",
    indexable
      ? `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${site}/sitemap.xml\n`
      : "User-agent: *\nDisallow: /\n",
  );
  console.log(
    `Pre-rendered ${publicPaths.length} public routes. Search indexing ${indexable ? "enabled" : "disabled (set VITE_SITE_URL for production)"}.`,
  );
} finally {
  await server.close();
}
