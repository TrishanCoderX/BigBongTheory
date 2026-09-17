"use client";

import { useEffect } from "react";

export default function VisitTracker() {
  useEffect(() => {
    fetch("/api/track-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: window.location.pathname }),
      keepalive: true,
    }).catch(() => {});
    // Empty deps: the (site) layout stays mounted across client-side
    // navigations in the App Router, so this fires once per real page
    // load/refresh — a fresh browser tab or hard reload — not once per
    // in-app route change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
