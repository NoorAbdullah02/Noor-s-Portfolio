import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiGithub, FiStar, FiGitBranch, FiExternalLink, FiRefreshCw } from "react-icons/fi";
import Section, { SectionHeading } from "./Section";
import { profile } from "../data/portfolioData";
import { fetchGithubRepos } from "../lib/api";

export default function GithubProjects() {
  const [repos, setRepos] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  const load = async () => {
    setStatus("loading");
    try {
      const data = await fetchGithubRepos(profile.githubUsername);
      setRepos(data);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Section id="github" className="bg-surface/30">
      <SectionHeading
        eyebrow="Live from GitHub"
        title="All My GitHub Repositories"
        subtitle={`Pulled live from github.com/${profile.githubUsername}`}
      />

      {status === "loading" && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass h-44 animate-pulse rounded-2xl" />
          ))}
        </div>
      )}

      {status === "error" && (
        <div className="glass mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl p-8 text-center">
          <p className="text-muted">Couldn't load repositories right now.</p>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-text hover:border-primary hover:text-primary"
          >
            <FiRefreshCw /> Retry
          </button>
          <a
            href={profile.social.github}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-primary underline"
          >
            View on GitHub instead
          </a>
        </div>
      )}

      {status === "ready" && (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {repos.map((repo, i) => (
              <motion.a
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: (i % 6) * 0.07 }}
                className="glass group flex flex-col rounded-2xl p-6 transition hover:-translate-y-1 hover:border-primary/60"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-text group-hover:text-primary">
                    {repo.name}
                  </h3>
                  <FiExternalLink className="shrink-0 text-muted" />
                </div>
                <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted">
                  {repo.description || "No description provided."}
                </p>
                <div className="mt-4 flex items-center gap-4 font-mono text-xs text-muted">
                  {repo.language && (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-primary to-primary-2" />
                      {repo.language}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <FiStar size={12} /> {repo.stargazers_count}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <FiGitBranch size={12} /> {repo.forks_count}
                  </span>
                </div>
              </motion.a>
            ))}
          </div>

          <div className="mt-10 text-center">
            <a
              href={profile.social.github}
              target="_blank"
              rel="noreferrer"
              className="btn-shine inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-2 px-6 py-3 text-sm font-semibold text-on-accent hover:opacity-90"
            >
              <FiGithub /> See full GitHub profile
            </a>
          </div>
        </>
      )}
    </Section>
  );
}
