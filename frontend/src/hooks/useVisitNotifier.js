import { useEffect } from "react";
import { pingVisit, sendVisitActivity } from "../lib/api";
import { getVisitorId } from "../lib/visitorId";

const SECTIONS = ["home", "about", "skills", "qualification", "projects", "github", "contact"];

const store = {
  get(key) {
    try { return sessionStorage.getItem(key); } catch { return null; }
  },
  set(key, value) {
    try { sessionStorage.setItem(key, value); } catch { /* storage unavailable */ }
  },
};

export default function useVisitNotifier() {
  useEffect(() => {
    let visitId = store.get("visit-id");
    let activeSince = document.visibilityState === "visible" ? Date.now() : null;
    let pendingSeconds = 0;
    const seen = new Set();
    let sentSections = 0;

    if (!store.get("visit-pinged")) {
      store.set("visit-pinged", "1");
      pingVisit({
        path: window.location.pathname,
        referrer: document.referrer || "",
        visitorId: getVisitorId(),
        screen: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        language: navigator.language || "",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      })
        .then((id) => {
          if (!id) return;
          visitId = id;
          store.set("visit-id", id);
        })
        .catch(() => {});
    }

    const flush = () => {
      if (activeSince) {
        pendingSeconds += (Date.now() - activeSince) / 1000;
        activeSince = document.visibilityState === "visible" ? Date.now() : null;
      }
      const hasNewSections = seen.size > sentSections;
      if (!visitId || (pendingSeconds < 2 && !hasNewSections)) return;
      sendVisitActivity(visitId, { seconds: Math.round(pendingSeconds), sections: [...seen] });
      pendingSeconds = 0;
      sentSections = seen.size;
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
      else activeSince = Date.now();
    };

    const observer = "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => entries.forEach((e) => e.isIntersecting && seen.add(e.target.id)),
          { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
        )
      : null;
    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el && observer) observer.observe(el);
    });

    const interval = setInterval(flush, 60000);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);

    return () => {
      flush();
      clearInterval(interval);
      observer?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
    };
  }, []);
}
