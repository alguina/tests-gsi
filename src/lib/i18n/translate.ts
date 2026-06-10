import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";
import type { Dictionary, TranslationParams } from "@/lib/i18n/types";

export function translate(
  locale: Locale,
  dictionaries: Record<Locale, Dictionary>,
  key: string,
  params?: TranslationParams,
): string {
  const template =
    dictionaries[locale][key] ??
    dictionaries[DEFAULT_LOCALE][key] ??
    key;

  if (!params) {
    return template;
  }

  return Object.entries(params).reduce(
    (result, [paramKey, paramValue]) =>
      result.replaceAll(`{${paramKey}}`, String(paramValue)),
    template,
  );
}
