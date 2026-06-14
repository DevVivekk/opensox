"use client";

import { useState, useLayoutEffect, useEffect } from "react";

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
  const theme =  saved && validThemes.has(saved as ThemeId) ? (saved as ThemeId) : 
  //fallback to device dark/light mode settings when theres no localstorage theme data
  window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
  return theme      
}

export default function BlogThemeSelector() {
  const [theme, setTheme] = useState<ThemeId>(getSavedTheme);

  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-blog-theme", theme);
    localStorage.setItem("blog-theme", theme);
    //no cleanup required here
  }, [theme]);

  //UseEffect to handle the system theme changes
  useEffect(() => {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const handleChange = () => {
    const systemTheme: ThemeId = media.matches ? "dark" : "light";
    setTheme(systemTheme);
  };

  media.addEventListener("change", handleChange);

  return () => {
    media.removeEventListener("change", handleChange);
  };
}, []);

  return (
    <select
      value={theme}
      onChange={(e) => {
        setTheme( e.target.value as ThemeId);
      }}
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
