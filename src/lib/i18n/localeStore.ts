import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  readStoredLocale,
  type Locale,
} from "@/lib/i18n/locales";

type Listener = () => void;

const listeners = new Set<Listener>();

let locale: Locale = DEFAULT_LOCALE;

function emitChange() {
  listeners.forEach((listener) => listener());
}

function syncDocumentLocale(nextLocale: Locale) {
  if (typeof document !== "undefined") {
    document.documentElement.lang = nextLocale;
  }
}

export function getLocaleSnapshot(): Locale {
  return locale;
}

export function getServerLocaleSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

export function subscribeToLocale(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function initializeLocaleFromStorage() {
  if (typeof window === "undefined") {
    return;
  }

  locale = readStoredLocale();
  syncDocumentLocale(locale);
}

export function setLocale(nextLocale: Locale) {
  locale = nextLocale;

  if (typeof window !== "undefined") {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
  }

  syncDocumentLocale(nextLocale);
  emitChange();
}

if (typeof window !== "undefined") {
  initializeLocaleFromStorage();
}
