"use client";

import { Moon, Sun } from "lucide-react";
import { getTheme, setTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  function toggleTheme() {
    const theme = getTheme();
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
  }

  return (
    <button className="icon-theme" type="button" onClick={toggleTheme} aria-label="Toggle dark mode">
      <Moon className="theme-icon-moon" />
      <Sun className="theme-icon-sun" />
    </button>
  );
}
