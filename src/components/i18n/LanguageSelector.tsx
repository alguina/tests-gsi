"use client";

import { Select } from "@/components/ui/Select";
import { LOCALE_LABELS, LOCALES, type Locale } from "@/lib/i18n/locales";
import { useI18n } from "@/lib/i18n/useI18n";

export function LanguageSelector() {
  const { locale, setLocale, t } = useI18n();

  return (
    <label className="flex items-center gap-2 text-sm text-text-secondary">
      <span className="sr-only">{t("language.label")}</span>
      <Select
        aria-label={t("language.label")}
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        selectSize="sm"
      >
        {LOCALES.map((option) => (
          <option key={option} value={option}>
            {LOCALE_LABELS[option]}
          </option>
        ))}
      </Select>
    </label>
  );
}
