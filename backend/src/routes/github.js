import { Router } from "express";

const router = Router();

// In-memory cache to stay well under GitHub's unauthenticated rate limit.
const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

export async function getRepos(username) {
  const cacheKey = username.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) return cached.data;

  const headers = { Accept: "application/vnd.github+json", "User-Agent": "portfolio-app" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  try {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`,
      { headers, signal: AbortSignal.timeout(8000) }
    );
    if (!response.ok) {
      if (cached) return cached.data;
      const err = new Error("GitHub request failed");
      err.status = response.status;
      throw err;
    }

    const repos = await response.json();
    const data = repos
      .filter((r) => !r.fork && !r.private)
      .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 12)
      .map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        html_url: r.html_url,
        homepage: r.homepage,
        language: r.language,
        stargazers_count: r.stargazers_count,
        forks_count: r.forks_count,
        updated_at: r.updated_at,
        topics: r.topics,
      }));

    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (err) {
    if (cached) return cached.data;
    throw err;
  }
}

router.get("/:username/repos", async (req, res) => {
  try {
    res.json(await getRepos(req.params.username));
  } catch (err) {
    res.status(err.status || 502).json({ message: "Unable to reach GitHub right now." });
  }
});

export default router;
