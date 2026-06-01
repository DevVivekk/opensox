"use client";

import { useState, useEffect } from "react";

const themes = [
  { id: "dark", label: "Dark" },
  { id: "light", label: "Light" },
  { id: "sepia", label: "Sepia" },
  { id: "green", label: "Green" },
] as const;

type ThemeId = (typeof themes)[number]["id"];

const validThemes = new Set(themes.map((t) => t.id));

function getSavedTheme(): ThemeId {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem("blog-theme");
  return saved && validThemes.has(saved as ThemeId) ? (saved as ThemeId) : "dark";
}

export default function BlogThemeSelector() {
  const [theme, setTheme] = useState<ThemeId>(getSavedTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-blog-theme", theme);
    localStorage.setItem("blog-theme", theme);
    return () => {
      document.documentElement.removeAttribute("data-blog-theme");
    };
  }, [theme]);

  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value as ThemeId)}
      aria-label="Blog theme"
      className="blog-theme-select"
    >
      {themes.map((t) => (
        <option key={t.id} value={t.id}>
          {t.label}
        </option>
      ))}
    </select>
  );
}
