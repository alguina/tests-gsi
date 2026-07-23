"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/useI18n";
import { cn } from "@/lib/ui/cn";
import { controlStyles } from "@/lib/ui/tokens";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "gsi-a2-theme";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

function ThemeIcon({ dark }: { dark: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {dark ? (
        <path d="M13.2 10.1A5.7 5.7 0 0 1 5.9 2.8 5.7 5.7 0 1 0 13.2 10Z" />
      ) : (
        <>
          <circle cx="8" cy="8" r="2.5" />
          <path d="M8 1v1.2M8 13.8V15M1 8h1.2M13.8 8H15M3.05 3.05l.85.85M12.1 12.1l.85.85M12.95 3.05l-.85.85M3.9 12.1l-.85.85" />
        </>
      )}
    </svg>
  );
}

export function ThemeToggle() {
  const { t } = useI18n();
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const currentTheme =
      document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    setTheme(currentTheme);

    function handleStorage(event: StorageEvent) {
      if (
        event.key === THEME_STORAGE_KEY &&
        (event.newValue === "light" || event.newValue === "dark")
      ) {
        applyTheme(event.newValue);
        setTheme(event.newValue);
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  function toggleTheme() {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    setTheme(nextTheme);
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={
        isDark ? t("theme.switchToLight") : t("theme.switchToDark")
      }
      title={isDark ? t("theme.switchToLight") : t("theme.switchToDark")}
      onClick={toggleTheme}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-md border border-border bg-surface px-2.5 text-text-secondary transition hover:bg-surface-muted hover:text-text-primary",
        controlStyles.focusRing,
      )}
    >
      <ThemeIcon dark={isDark} />
      <span className="hidden text-xs sm:inline">
        {isDark ? t("theme.dark") : t("theme.light")}
      </span>
    </button>
  );
}
