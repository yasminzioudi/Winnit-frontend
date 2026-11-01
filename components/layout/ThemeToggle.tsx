"use client";

import React, { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useIsClient } from "@/hooks/useIsClient";

export function ThemeToggle({ className }: { className?: string }) {
  const isClient = useIsClient();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const currentTheme = isClient
    ? (document.documentElement.getAttribute("data-theme") as "light" | "dark") || theme
    : "light";

  const toggleTheme = () => {
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    try {
      localStorage.setItem("winnit_theme", nextTheme);
    } catch {
      // ignore
    }
  };

  if (!isClient) {
    return (
      <button
        type="button"
        className="w-9 h-9 rounded-full flex items-center justify-center text-muted hover:text-foreground hover:bg-surface-subtle transition-colors"
        aria-label="Changer de thème"
      >
        <Moon className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`w-9 h-9 rounded-full flex items-center justify-center text-muted hover:text-foreground hover:bg-surface-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime ${className || ""}`}
      aria-label={
        currentTheme === "dark" ? "Passer au mode clair" : "Passer au mode sombre"
      }
      title={currentTheme === "dark" ? "Mode clair" : "Mode sombre"}
    >
      {currentTheme === "dark" ? (
        <Sun className="w-4 h-4 text-warning-amber transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
}
