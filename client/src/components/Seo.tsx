import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { organizations } from "../../../server/api/services/organizations";

export const publicPaths = [
  "/",
  "/browse",
  "/gsoc",
  "/contribution-guide",
  ...organizations.map((org) => `/gsoc/${org.id}`),
];
export function metadata(path: string) {
  const org = organizations.find((item) => path === `/gsoc/${item.id}`);
  const titles: Record<string, string> = {
    "/": "Open Source Contribution Finder — Find GitHub Issues",
    "/browse": "Browse Open Source Issues by Language | Contribution Finder",
    "/gsoc":
      "GSoC 2026 Organizations & Contribution Guides | Contribution Finder",
    "/contribution-guide":
      "How to Make Your First Open Source Contribution | Contribution Finder",
    "/login": "Sign in | Contribution Finder",
    "/signup": "Create an account | Contribution Finder",
    "/dashboard": "Your saved issues | Contribution Finder",
    "/profile": "Your profile | Contribution Finder",
  };
  const descriptions: Record<string, string> = {
    "/": "Find open source contribution opportunities on GitHub. Search open issues by language, explore good first issues, and track your contributions.",
    "/browse":
      "Search open GitHub issues by programming language, technology, and development category. Find good first issues and help wanted tasks.",
    "/gsoc":
      "Explore a curated selection of Google Summer of Code 2026 organizations, technologies, repositories, and contribution guides.",
    "/contribution-guide":
      "Learn how to choose an open source project, find an available beginner issue, discuss your approach, and submit a focused pull request.",
  };
  return {
    title: org
      ? `${org.name} — GSoC 2026 Contributions | Contribution Finder`
      : titles[path] || "Contribution Finder",
    description:
      org?.description ||
      descriptions[path] ||
      "Find and track open source contributions.",
    canonicalPath: path === "/browse" ? "/" : path,
    indexable: publicPaths.includes(path),
  };
}
export default function Seo() {
  const { pathname } = useLocation();
  useEffect(() => {
    const data = metadata(pathname);
    const site = import.meta.env.VITE_SITE_URL?.replace(/\/$/, "");
    document.title = data.title;
    const setMeta = (
      attribute: "name" | "property",
      name: string,
      content: string,
    ) => {
      let tag = document.head.querySelector<HTMLMetaElement>(
        `meta[${attribute}="${name}"]`,
      );
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attribute, name);
        document.head.append(tag);
      }
      tag.content = content;
    };
    setMeta("name", "description", data.description);
    setMeta(
      "name",
      "robots",
      data.indexable && site && import.meta.env.VITE_NOINDEX !== "true"
        ? "index, follow"
        : "noindex, follow",
    );
    setMeta("property", "og:title", data.title);
    setMeta("property", "og:description", data.description);
    setMeta("property", "og:type", "website");
    setMeta("name", "twitter:card", "summary");
    setMeta("name", "twitter:title", data.title);
    setMeta("name", "twitter:description", data.description);
    const existing = document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (site && data.indexable) {
      const canonical = existing || document.createElement("link");
      canonical.rel = "canonical";
      canonical.href = site + data.canonicalPath;
      if (!existing) document.head.append(canonical);
      setMeta("property", "og:url", canonical.href);
    } else {
      existing?.remove();
      document.head.querySelector('meta[property="og:url"]')?.remove();
    }
  }, [pathname]);
  return null;
}
