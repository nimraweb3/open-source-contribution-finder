type Metadata = { language?: string; stars?: number };
const cache = new Map<string, { expires: number; value: Metadata }>();

// Metadata is optional: a repository lookup must never hide usable issue results.
export async function repositoryMetadata(
  repositories: string[], headers: Record<string, string>, fetcher: typeof fetch,
) {
  const result = new Map<string, Metadata>();
  const queue = [...new Set(repositories)];
  await Promise.all(Array.from({ length: Math.min(4, queue.length) }, async () => {
    for (let repository = queue.shift(); repository; repository = queue.shift()) {
      const cached = cache.get(repository);
      if (cached && cached.expires > Date.now()) {
        result.set(repository, cached.value);
        continue;
      }
      try {
        const response = await fetcher(`https://api.github.com/repos/${repository}`, {
          headers, signal: AbortSignal.timeout(3000),
        });
        if (!response.ok) continue;
        const info = await response.json();
        const value: Metadata = {
          ...(typeof info.language === "string" ? { language: info.language } : {}),
          ...(typeof info.stargazers_count === "number" ? { stars: info.stargazers_count } : {}),
        };
        if (cache.size >= 500) cache.delete(cache.keys().next().value!);
        cache.set(repository, { value, expires: Date.now() + 3600000 });
        result.set(repository, value);
      } catch { /* The issue itself remains available if enrichment times out. */ }
    }
  }));
  return result;
}
