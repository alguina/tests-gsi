"use client";

import { createContext } from "react";
import type { Locale } from "@/lib/i18n/locales";
import type { TranslationParams } from "@/lib/i18n/types";

export type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: TranslationParams) => string;
};

export const I18nContext = createContext<I18nContextValue | null>(null);
