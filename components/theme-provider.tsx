"use client";

import { useEffect } from "react";

const storageKey = "workflow_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    const theme = stored === "dark" || stored === "light" ? stored : "light";
    document.documentElement.dataset.theme = theme;
  }, []);

  return <>{children}</>;
}

export function setTheme(theme: "light" | "dark") {
  window.localStorage.setItem(storageKey, theme);
  document.documentElement.dataset.theme = theme;
}

export function getTheme() {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}
