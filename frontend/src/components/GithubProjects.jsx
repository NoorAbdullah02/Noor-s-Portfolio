import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiGithub, FiStar, FiGitBranch, FiArrowUpRight, FiRefreshCw, FiFolder } from "react-icons/fi";
import Section, { SectionHeading } from "./Section";
import { profile } from "../data/portfolioData";
import { fetchGithubRepos } from "../lib/api";
import { trackSpotlight } from "../lib/spotlight";

const EASE = [0.22, 1, 0.36, 1];

const LANGUAGE_COLORS = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5", "Jupyter Notebook": "#DA5B0B",
  "C++": "#f34b7d", C: "#555555", Java: "#b07219", HTML: "#e34c26", CSS: "#563d7c",
  Shell: "#89e051", Go: "#00ADD8", Rust: "#dea584", Kotlin: "#A97BFF", Dart: "#00B4AB", PHP: "#4F5D95",
};

function updatedAgo(iso) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days < 1) return "Updated today";
  if (days < 30) return `Updated ${days}d ago`;
  if (days < 365) return `Updated ${Math.floor(days / 30)}mo ago`;
  return `Updated ${Math.floor(days / 365)}y ago`;
}

const prettyName = (name) => name.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function GithubProjects() {
  const [repos, setRepos] = useState([]);
  const [status, setStatus] = useState("loading");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      setRepos(await fetchGithubRepos(profile.githubUsername));
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Section id="github" className="bg-surface/30">
      <SectionHeading
        eyebrow="Open Source"
        title="Live from GitHub"
        subtitle={`My latest public repositories, pulled live from github.com/${profile.githubUsername}`}
      />

      {status === "loading" && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-3xl border border-border bg-white/60" />
          ))}
        </div>
      )}

      {status === "error" && (
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-3xl border border-border bg-white/80 p-8 text-center">
          <p className="text-muted">Couldn't load repositories right now.</p>
          <button onClick={load} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-text hover:border-text/30">
            <FiRefreshCw /> Retry
          </button>
          <a href={profile.social.github} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary hover:underline">
            View on GitHub instead
          </a>
        </div>
      )}

      {status === "ready" && (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {repos.map((repo, i) => (
              <motion.a
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.07, ease: EASE }}
                onPointerMove={trackSpotlight}
                className="spotlight group flex flex-col rounded-3xl border border-border bg-white/80 p-6 shadow-sm transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-surface text-text/70 transition-colors group-hover:bg-text group-hover:text-white">
                    <FiFolder size={17} />
                  </span>
                  <FiArrowUpRight className="text-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
                <h3 className="mt-5 font-semibold text-text">{prettyName(repo.name)}</h3>
                {repo.description ? (
                  <p className="mt-1.5 line-clamp-2 flex-1 text-left text-sm leading-relaxed text-muted">{repo.description}</p>
                ) : (
                  <span className="flex-1" />
                )}
                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border/70 pt-4 text-xs text-muted">
                  {repo.language && (
                    <span className="inline-flex items-center gap-1.5 font-medium text-text/70">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: LANGUAGE_COLORS[repo.language] || "#8b8fa6" }} />
                      {repo.language}
                    </span>
                  )}
                  {repo.stargazers_count > 0 && <span className="inline-flex items-center gap-1"><FiStar size={12} /> {repo.stargazers_count}</span>}
                  {repo.forks_count > 0 && <span className="inline-flex items-center gap-1"><FiGitBranch size={12} /> {repo.forks_count}</span>}
                  <span className="ml-auto">{updatedAgo(repo.updated_at)}</span>
                </div>
              </motion.a>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <a
              href={profile.social.github}
              target="_blank"
              rel="noreferrer"
              className="btn-shine group inline-flex items-center gap-2.5 rounded-full bg-text px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-text/15"
            >
              <FiGithub size={16} /> See full GitHub profile
              <FiArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>
        </>
      )}
    </Section>
  );
}
