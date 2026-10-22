import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import express from "express";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";

import githubRoutes from "./routes/github.js";
import contactRoutes from "./routes/contact.js";
import visitRoutes from "./routes/visit.js";
import adminRoutes from "./routes/admin.js";
import chatRoutes from "./routes/chat.js";
import { initDatabase, hasDatabase } from "./lib/db.js";
import { startBriefingScheduler } from "./lib/insights.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Trust exactly one hop (the hosting platform's own load balancer/proxy) so
// req.ip reflects the real client IP without letting clients spoof X-Forwarded-For.
app.set("trust proxy", 1);

const clientDist = path.join(__dirname, "../../frontend/dist");
// Serve the built frontend whenever it's present (production builds, or a
// local `npm run build`), regardless of how NODE_ENV happens to be set by
// the hosting platform — this is what makes "deploy the backend" also
// serve the latest frontend automatically.
const hasClientBuild = existsSync(path.join(clientDist, "index.html"));

app.use(compression());
app.use(express.json({ limit: "100kb" }));

if (!hasClientBuild) {
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
}

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many messages sent. Please try again later." },
});

const visitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again later." },
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 400,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please slow down." },
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many chat requests. Please wait a moment." },
});

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/github", githubRoutes);
app.use("/api/contact", contactLimiter, contactRoutes);
app.use("/api/visit", visitLimiter, visitRoutes);
app.use("/api/admin/login", adminLoginLimiter);
app.use("/api/admin", adminLimiter, adminRoutes);
app.use("/api/chat", chatLimiter, chatRoutes);

app.use("/api", (req, res) => res.status(404).json({ message: "Not found" }));

app.use("/api", (err, req, res, next) => {
  if (res.headersSent) return next(err);
  console.error(`API error on ${req.method} ${req.originalUrl}:`, err.message);
  res.status(err.status === 400 ? 400 : 500).json({ message: "Something went wrong on the server. Please try again." });
});

if (hasClientBuild) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} (${hasClientBuild ? "serving built frontend" : "API only — run the Vite dev server separately"})`);
  if (hasDatabase()) {
    initDatabase().catch((err) => console.error("Postgres connection failed:", err.message));
  } else {
    console.warn("DATABASE_URL not set — using local JSON files for storage.");
  }
  startBriefingScheduler();
});
