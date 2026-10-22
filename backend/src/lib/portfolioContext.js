import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { getRepos } from "../routes/github.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_URL = pathToFileURL(path.join(__dirname, "../../../frontend/src/data/portfolioData.js")).href;

let dataPromise;
const loadData = () => (dataPromise ??= import(DATA_URL).catch((err) => {
  console.error("Couldn't load portfolio data for the AI assistant:", err.message);
  dataPromise = undefined;
  return null;
}));

const clean = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
const section = (title, lines) => (lines.length ? `\n## ${title}\n${lines.join("\n")}` : "");

function describePortfolio(d) {
  const p = d.profile || {};
  return [
    `# ${p.name}`,
    p.tagline && `Tagline: ${p.tagline}`,
    p.roles?.length && `Roles: ${p.roles.join(", ")}`,
    p.location && `Location: ${p.location}`,
    p.email && `Email: ${p.email}${p.altEmail ? ` (alternate: ${p.altEmail})` : ""}`,
    p.phones?.length && `Phone: ${p.phones.join(", ")}`,
    p.social && `Links: ${Object.entries(p.social).map(([k, v]) => `${k}: ${v}`).join(" | ")}`,
    p.summary && `Summary: ${clean(p.summary)}`,
    ...(p.about || []).map((a) => `About: ${clean(a)}`),
    section("Stats", (d.stats || []).map((s) => `- ${s.label}: ${s.value}+`)),
    section("Skills (self-rated proficiency)", (d.skills || []).map((s) => `- ${s.name}: ${s.level}% (${s.category})`)),
    section("Education", (d.education || []).map((e) => `- ${e.title} — ${e.place} (${e.time})`)),
    section("Experience", (d.experience || []).map((e) => `- ${e.title} — ${e.place} (${e.time})`)),
    section("Research papers", (d.research || []).map((r, i) =>
      `${i + 1}. "${r.title}" — ${r.venue}; ${r.type}; ${r.status}; Authors: ${r.authors}`)),
    section("Achievements", (d.achievements || []).map((a) => `- ${a.title.replace(/[^\p{L}\p{N}\s—\-:().,&']/gu, "").trim()}: ${clean(a.description)}`)),
    section("Featured projects", (d.featuredProjects || []).map((f) =>
      `- ${f.title}: ${clean(f.description)} [${(f.tags || []).join(", ")}]${f.github ? ` Code: ${f.github}` : ""}${f.demo ? ` Demo: ${f.demo}` : ""}`)),
    section("Services offered", (d.services || []).map((s) => `- ${s.title}: ${clean(s.description)}`)),
  ].filter(Boolean).join("\n");
}

function describeRepos(repos) {
  return section("Public GitHub repositories (live, github.com/NoorAbdullah02/<name>)", repos.slice(0, 10).map((r) =>
    `- ${r.name}${r.language ? ` (${r.language})` : ""}${r.description ? `: ${clean(r.description).slice(0, 90)}` : ""}`));
}

export async function portfolioFacts() {
  const data = await loadData();
  return data ? describePortfolio(data) : "";
}

const RULES = `
## How to answer
- You are the friendly AI assistant on Noor's portfolio website. Speak about Noor in the third person ("Noor", "he").
- Use ONLY the facts above. If something isn't covered, say you don't have that detail and suggest contacting Noor via the contact form or email. Never invent facts, dates, grades or numbers.
- Default to short answers (2–5 sentences or a compact bullet list). If the visitor asks for everything / full details / a complete overview, give a complete, well-organised answer with short headings and bullets.
- When asked about research, list all papers with their venue.
- You may use **bold**, *italic* and "- " bullet lists. Include links as plain URLs.
- For hiring or collaboration, point to the contact form on this page or the email.
- Reply in the same language the visitor writes in (English, Bengali, or Banglish).`;

export async function buildSystemPrompt() {
  const data = await loadData();
  if (!data) {
    return `You are the AI assistant on Sheikh Noor Abdullah's portfolio. Portfolio details are temporarily unavailable — answer briefly and suggest using the contact form.${RULES}`;
  }

  let repos = "";
  if (data.profile?.githubUsername) {
    try {
      repos = describeRepos(await getRepos(data.profile.githubUsername));
    } catch { /* GitHub unavailable — answer from portfolio data alone */ }
  }

  return `Below is everything published on Sheikh Noor Abdullah's portfolio website. Today's date: ${new Date().toDateString()}.\n\n${describePortfolio(data)}${repos}\n${RULES}`;
}
