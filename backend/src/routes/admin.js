import { Router } from "express";
import { getVisits, getStats } from "../lib/visitStore.js";

const router = Router();

function requireAdmin(req, res, next) {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured) {
    return res.status(503).json({ message: "Admin panel isn't configured on this server yet." });
  }
  const header = req.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (token !== configured) {
    return res.status(401).json({ message: "Invalid credentials." });
  }
  next();
}

router.post("/login", (req, res) => {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured) {
    return res.status(503).json({ message: "Admin panel isn't configured on this server yet." });
  }
  const { password } = req.body ?? {};
  if (password !== configured) {
    return res.status(401).json({ message: "Incorrect password." });
  }
  res.json({ ok: true });
});

router.get("/visits", requireAdmin, (req, res) => {
  res.json({
    stats: getStats(),
    visits: getVisits({ limit: 300 }),
  });
});

export default router;
