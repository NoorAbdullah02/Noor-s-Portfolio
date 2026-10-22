import { useEffect } from "react";
import { pingVisit } from "../lib/api";

// Fires once per browser tab session so a notification goes out when someone
// actually opens the site, without re-notifying on every internal re-render.
export default function useVisitNotifier() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("visit-pinged")) return;
      sessionStorage.setItem("visit-pinged", "1");
    } catch {
      // Private browsing / blocked storage — just skip the guard and still ping once.
    }

    pingVisit({
      path: window.location.pathname,
      referrer: document.referrer || "",
    }).catch(() => {});
  }, []);
}
