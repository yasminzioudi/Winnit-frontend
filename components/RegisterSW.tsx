"use client";

import { useEffect } from "react";

export function RegisterSW() {
  useEffect(() => {
    // Only register service worker in production
    if (
      process.env.NODE_ENV === "production" &&
      typeof window !== "undefined" &&
      "serviceWorker" in navigator
    ) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch(() => {
          // Silent catch for offline / SW errors
        });
    }
  }, []);

  return null;
}
