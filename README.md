# Sheikh Noor Abdullah — Portfolio

A modern, full‑stack developer portfolio.

- **Frontend:** React + Vite + Tailwind CSS v4 + Framer Motion
- **Backend:** Node.js + Express — serves the API **and** the built frontend, so deploying the backend deploys the whole site
- **Live GitHub integration:** repositories are pulled live from the GitHub REST API through a small backend proxy (with caching, so the site never gets rate‑limited)
- **Working contact form:** posts to the backend, which emails you via SMTP (or just logs it locally if you haven't configured SMTP yet)

The old static HTML/Bootstrap site has been kept for reference in [`legacy-static-site/`](legacy-static-site).

## Project structure

```
Noor-s-Portfolio/
├─ frontend/        React + Vite app (src/, public/images, etc.)
├─ backend/         Express API + static file server
├─ legacy-static-site/   the original Bootstrap site, kept for reference
└─ package.json     root scripts that run both at once
```

## Getting started

Requires Node.js 18+ (20+ recommended).

```bash
# 1. install dependencies for the root, frontend and backend
npm run install:all

# 2. copy the backend env file and fill in anything you want (all optional for local dev)
cp backend/.env.example backend/.env

# 3. run both the API (http://localhost:5000) and the Vite dev server (http://localhost:5173)
npm run dev
```

Open **http://localhost:5173** — the Vite dev server proxies `/api/*` requests to the Express backend automatically (see `frontend/vite.config.js`).

### Environment variables (`backend/.env`)

| Variable | Purpose | Required? |
| --- | --- | --- |
| `PORT` | Port the Express server listens on | no (defaults to 5000) |
| `GITHUB_TOKEN` | A GitHub personal access token (no scopes needed) to raise the GitHub API rate limit | no, but recommended for production |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | SMTP credentials used to email you contact-form submissions | no — without it, submissions are just logged to the server console |
| `CONTACT_TO_EMAIL` | Where contact form emails should be delivered | no (defaults to `SMTP_USER`) |
| `CLIENT_ORIGIN` | Allowed CORS origin during local development | no (defaults to `http://localhost:5173`) |

To send real emails from the contact form with Gmail, create an [App Password](https://myaccount.google.com/apppasswords) and set:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=the-16-character-app-password
CONTACT_TO_EMAIL=sheikhnoorabdullah02@gmail.com
```

## Editing content

Almost everything on the page (name, bio, skills, education, experience, featured projects, socials, GitHub username) lives in one file:

**[`frontend/src/data/portfolioData.js`](frontend/src/data/portfolioData.js)**

Edit that file and the whole site updates — no need to touch the components.

## Building for production

```bash
npm run build     # builds frontend/dist
npm start         # builds the frontend, then starts the backend serving it on $PORT
```

Once built, a single Express process on one port serves both the API (`/api/...`) and the React app — there's nothing else to run.

## Deploying (one service, auto‑deploys both)

This is set up so that **deploying the backend deploys the frontend too.** Any Node host (Render, Railway, Fly.io, a VPS, etc.) works:

1. Push this repo to GitHub.
2. Create a new Web Service pointing at the repo.
3. **Build command:** `npm run install:all && npm run build`
4. **Start command:** `npm run serve` (or `npm start`, which also rebuilds)
5. Add the environment variables from the table above in the host's dashboard.
6. Deploy — the Express server detects `frontend/dist` and serves it automatically, alongside the `/api` routes.

No separate frontend hosting, no extra CORS configuration, no second deploy step.

## Scripts (root `package.json`)

| Script | What it does |
| --- | --- |
| `npm run install:all` | Installs dependencies in the root, `frontend/` and `backend/` |
| `npm run dev` | Runs the Express API and the Vite dev server together, with hot reload |
| `npm run build` | Builds the production frontend bundle into `frontend/dist` |
| `npm start` | Builds the frontend, then starts the backend (serves everything on one port) |
| `npm run serve` | Starts the backend only (use after an existing build) |
