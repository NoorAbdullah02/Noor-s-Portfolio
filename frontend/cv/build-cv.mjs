// Builds the CV from src/data/portfolioData.js and renders it to public/Sheikh-Noor-Abdullah-CV.pdf.
// Usage: npm run cv
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { execFileSync } from "child_process";
import path from "path";
import os from "os";
import { fileURLToPath, pathToFileURL } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const data = await import(pathToFileURL(path.join(here, "../src/data/portfolioData.js")).href);
const { profile, education, experience, research, achievements, featuredProjects, skills, cv } = data;

const htmlFile = path.join(here, "cv.html");
const pdfFile = path.join(here, "../public/Sheikh-Noor-Abdullah-CV.pdf");

const esc = (v) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const bare = (url) => String(url).replace(/^https?:\/\/(www\.)?/, "").replace(/\/+$/, "");
const phone = (p) => (/^0\d{10}$/.test(p) ? `+880 ${p.slice(1, 5)}-${p.slice(5)}` : p);

const TOOLS = new Set(["React", "Linux", "Git & GitHub"]);
const languages = skills.filter((s) => s.category === "language" && !TOOLS.has(s.name)).map((s) => s.name);
const tools = skills.filter((s) => s.category === "tool" || TOOLS.has(s.name)).map((s) => s.name);
const fields = [...(cv.extraFields || []), ...skills.filter((s) => s.category === "field").map((s) => s.name)];

const projects = [
  ...featuredProjects.filter((p) => p.cv).map((p) => ({ ...p.cv, github: p.github })),
  ...(cv.extraProjects || []),
].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

const cvAchievements = achievements.filter((a) => a.cv).map((a) => {
  const [title, ...rest] = a.cv.split(" — ");
  return { title, detail: rest.join(" — ") };
});

const boldName = (authors) => esc(authors).replace(esc(profile.name), `<b>${esc(profile.name)}</b>`);
const [firstLine, lastName] = (() => {
  const parts = profile.name.split(" ");
  return [parts.slice(0, -1).join(" "), parts.at(-1)];
})();

const icon = {
  pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
  github: '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>',
  linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
};
const contactRow = (svg, text, href) => `
      <div class="contact-row">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svg}</svg>
        <span>${href ? `<a href="${esc(href)}">${esc(text)}</a>` : esc(text)}</span>
      </div>`;
const chips = (items) => items.map((i) => `<span class="chip">${esc(i)}</span>`).join("");

const css = readFileSync(path.join(here, "cv.css"), "utf8");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(profile.name)} — CV</title>
<style>${css}</style>
</head>
<body>
<div class="page">
  <aside>
    <div class="photo"><img src="cv-photo.jpg" alt="${esc(profile.name)}"></div>

    <section>
      <h3>Contact</h3>${contactRow(icon.pin, profile.location)}${contactRow(icon.phone, phone(profile.phones[0]), `tel:${profile.phones[0]}`)}${contactRow(icon.mail, profile.email, `mailto:${profile.email}`)}${contactRow(icon.github, bare(profile.social.github), profile.social.github)}${contactRow(icon.linkedin, bare(profile.social.linkedin).replace("linkedin.com/", ""), profile.social.linkedin)}
    </section>

    <section>
      <h3>Education</h3>${education.map((e) => `
      <div class="edu"><b>${esc(e.title)}</b><span>${esc(e.place)}</span><i>${esc(e.time)}</i></div>`).join("")}
    </section>

    <section>
      <h3>Skills</h3>
      <div class="skill-group"><small>Languages</small><div class="chips">${chips(languages)}</div></div>
      <div class="skill-group"><small>Tools &amp; Web</small><div class="chips">${chips(tools)}</div></div>
      <div class="skill-group"><small>Fields</small><div class="chips">${chips(fields)}</div></div>
    </section>

    <section>
      <h3>Achievements</h3>${cvAchievements.map((a) => `
      <div class="award"><div><b>${esc(a.title)}</b>${a.detail ? ` <span>— ${esc(a.detail)}</span>` : ""}</div></div>`).join("")}
    </section>
  </aside>

  <main>
    <h1>${esc(firstLine)}<br><span>${esc(lastName)}</span></h1>
    <div class="role">${esc(cv.role)}</div>
    <p class="summary">${esc(cv.summary)}</p>

    <section>
      <h2>Research &amp; Publications</h2>${research.map((r, i) => `
      <div class="item pub">
        <span class="n">${i + 1}</span>
        <div class="title">${esc(r.title)}</div>
        <div class="sub">${esc(r.cvVenue || r.venue)} · ${esc(r.cvType || r.type)} <span class="tag">${/accept/i.test(r.status) ? "ACCEPTED" : esc(r.status).toUpperCase()}</span></div>
        ${r.authors && !/et al\.?$/.test(r.authors) ? `<div class="authors">${boldName(r.authors)}</div>` : ""}
      </div>`).join("")}
    </section>

    <section>
      <h2>Experience</h2>${experience.map((e) => `
      <div class="item">
        <div class="row"><span class="title">${esc(e.title)}</span><span class="when">${esc(e.time.replace(/ Experience$/i, ""))}</span></div>
        <div class="sub">${esc(e.place)}</div>
      </div>`).join("")}
    </section>

    <section>
      <h2>Projects</h2>${projects.map((p) => `
      <div class="item">
        <div class="row"><span class="title">${esc(p.title)}</span><span class="when">${esc(p.tech)}</span></div>
        <div class="desc">${esc(p.summary)}</div>
        ${p.github && !p.github.includes("/tree/") ? `<a class="link" href="${esc(p.github)}">${esc(bare(p.github))}</a>` : ""}
      </div>`).join("")}
    </section>
  </main>
</div>
</body>
</html>
`;

writeFileSync(htmlFile, html);
console.log(`Wrote ${path.relative(process.cwd(), htmlFile)}`);

const edgeCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);
const browser = edgeCandidates.find((p) => existsSync(p));
if (!browser) {
  console.error("No Edge/Chrome found — open cv/cv.html in a browser and print it to PDF manually.");
  process.exit(1);
}

const profileDir = path.join(os.tmpdir(), "cv-render-profile");
if (!existsSync(profileDir)) mkdirSync(profileDir, { recursive: true });
execFileSync(browser, [
  "--headless=new",
  "--disable-gpu",
  "--no-pdf-header-footer",
  "--allow-file-access-from-files",
  `--user-data-dir=${profileDir}`,
  `--print-to-pdf=${pdfFile}`,
  pathToFileURL(htmlFile).href,
], { stdio: "ignore" });

const pngFile = path.join(here, "../public/Sheikh-Noor-Abdullah-CV.png");
execFileSync(browser, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  "--allow-file-access-from-files",
  `--user-data-dir=${profileDir}`,
  "--window-size=794,1123",
  "--force-device-scale-factor=1.6",
  `--screenshot=${pngFile}`,
  pathToFileURL(htmlFile).href,
], { stdio: "ignore" });
console.log(`Wrote ${path.relative(process.cwd(), pngFile)} — ${Math.round(readFileSync(pngFile).length / 1024)} KB preview`);

const pdf = readFileSync(pdfFile, "latin1");
const pages = (pdf.match(/\/Type\s*\/Page(?!s)/g) || []).length;
console.log(`Wrote ${path.relative(process.cwd(), pdfFile)} — ${pages} page${pages === 1 ? "" : "s"}, ${Math.round(pdf.length / 1024)} KB`);
if (pages > 1) console.warn("Warning: the CV no longer fits on one page — shorten some entries in portfolioData.js (cv fields).");
