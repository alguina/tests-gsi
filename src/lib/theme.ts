export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "gsi-a2-theme";
export const THEME_CHANGE_EVENT = "gsi-a2-theme-change";

export function getCurrentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function applyThemePreference(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  window.dispatchEvent(new CustomEvent<Theme>(THEME_CHANGE_EVENT, { detail: theme }));
}
