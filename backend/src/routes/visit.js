import { Router } from "express";
import { sendMail } from "../lib/mailer.js";
import { addVisit } from "../lib/visitStore.js";

const router = Router();

const BOT_PATTERN = /bot|crawler|spider|slurp|bingpreview|facebookexternalhit|discordbot|uptime|curl|wget|python-requests|monitor/i;

router.post("/", async (req, res) => {
  const ip = (req.headers["x-forwarded-for"]?.split(",")[0] || req.ip || "unknown").trim();
  const userAgent = String(req.get("user-agent") || "unknown").slice(0, 300);
  const referrer = String(req.body?.referrer || req.get("referer") || "direct").slice(0, 300);
  const path = String(req.body?.path || "/").slice(0, 200);
  const isBot = BOT_PATTERN.test(userAgent);

  const record = addVisit({ ip, userAgent, referrer, path, isBot });

  const notificationsEnabled = process.env.ENABLE_VISIT_NOTIFICATIONS !== "false";

  if (notificationsEnabled && !isBot) {
    try {
      const result = await sendMail({
        subject: "New visitor on your portfolio",
        text: `Someone just opened your portfolio.\n\nPage: ${path}\nIP: ${ip}\nReferrer: ${referrer}\nBrowser: ${userAgent}\nTime: ${record.timestamp}`,
      });
      if (!result.sent) {
        console.log("New visit (SMTP not configured):", record);
      }
    } catch (err) {
      console.error("Failed to send visit notification email:", err.message);
    }
  }

  res.status(204).end();
});

export default router;
