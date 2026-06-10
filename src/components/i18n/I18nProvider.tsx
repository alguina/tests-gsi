"use client";

import { useCallback, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { I18nContext } from "@/lib/i18n/context";
import { dictionaries } from "@/lib/i18n/getDictionary";
import {
  getLocaleSnapshot,
  getServerLocaleSnapshot,
  setLocale as setStoredLocale,
  subscribeToLocale,
} from "@/lib/i18n/localeStore";
import type { Locale } from "@/lib/i18n/locales";
import { translate } from "@/lib/i18n/translate";
import type { TranslationParams } from "@/lib/i18n/types";

type I18nProviderProps = {
  children: ReactNode;
};

export function I18nProvider({ children }: I18nProviderProps) {
  const locale = useSyncExternalStore(
    subscribeToLocale,
    getLocaleSnapshot,
    getServerLocaleSnapshot,
  );

  const setLocale = useCallback((nextLocale: Locale) => {
    setStoredLocale(nextLocale);
  }, []);

  const t = useCallback(
    (key: string, params?: TranslationParams) =>
      translate(locale, dictionaries, key, params),
    [locale],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, setLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
